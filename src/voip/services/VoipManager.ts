// src/voip/services/VoipManager.ts
import type {
    IVoipAdapter, CallSession, VoipError, AdapterEventName,
    StatusChangeEventPayload, DisconnectedEventPayload, ErrorEventPayload, IncomingCallEventPayload
} from '../types/adapterTypes';
import type { ContactPhoneNumber, Contact, NoteType, EntityType, NoteVisibility } from '../../types';
import type { Call, CallStatus, CallHangupReason } from '../types/callTypes';
import { useCallStore } from '../stores/useCallStore';
import { useNotesStore } from '../../notes/stores/notesStore'; // Για καταγραφή κλήσεων
import { uiStrings } from '../../config/translations'; // Για μηνύματα
import * as NoteService from '../../notes/services/note.service'; // Import the note service

export class VoipManager {
    private adapters: IVoipAdapter[] = [];
    private activeAdapterForSession: Map<string, IVoipAdapter> = new Map(); // Map sessionId to its adapter

    constructor() {
        // Singleton instance, constructor logic might be limited or handled by an init method.
    }

    public async registerAdapter(adapter: IVoipAdapter): Promise<void> {
        if (this.adapters.find(a => a.systemName === adapter.systemName)) {
            console.warn(`[VoipManager] Adapter "${adapter.systemName}" is already registered.`);
            return;
        }

        if (await adapter.isConfigured()) {
            this.adapters.push(adapter);
            adapter.on('adapterDisconnected', (payload) => this.handleAdapterGlobalEvent(adapter.systemName, 'adapterDisconnected', payload));
            adapter.on('error', (payload) => this.handleAdapterGlobalEvent(adapter.systemName, 'error', payload as ErrorEventPayload));
            adapter.on('incomingCall', (payload) => this.handleIncomingCall(payload as IncomingCallEventPayload, adapter));
            console.log(`[VoipManager] Adapter "${adapter.systemName}" registered.`);
        } else {
            console.warn(`[VoipManager] Adapter "${adapter.systemName}" is not configured.`);
        }
    }

    private handleAdapterGlobalEvent(adapterName: string, eventName: string, payload: any) {
        console.warn(`[VoipManager] Global event "${eventName}" from adapter "${adapterName}":`, payload);
        if (eventName === 'error' && payload.errorCode) {
             useCallStore.getState().setCurrentCallError(payload as VoipError);
        }
    }

    private bindSessionEvents(session: CallSession, adapter: IVoipAdapter) {
        const statusChangeHandler = (payload: StatusChangeEventPayload) => {
            if (payload.sessionId === session.sessionId) {
                this.handleSessionStatusChange(payload, adapter);
            }
        };
        const disconnectedHandler = (payload: DisconnectedEventPayload) => {
            if (payload.sessionId === session.sessionId) {
                this.handleSessionDisconnected(payload, adapter);
                adapter.off('statusChange', statusChangeHandler);
                adapter.off('disconnected', disconnectedHandler);
                adapter.off('error', errorHandlerForSession);
            }
        };
        const errorHandlerForSession = (payload: ErrorEventPayload) => {
             if (payload.sessionId === session.sessionId) {
                this.handleSessionError(payload, adapter);
             }
        };

        adapter.on('statusChange', statusChangeHandler);
        adapter.on('disconnected', disconnectedHandler);
        adapter.on('error', errorHandlerForSession);
    }


    private handleIncomingCall(payload: IncomingCallEventPayload, adapter: IVoipAdapter) {
        console.log(`[VoipManager] Incoming call event from ${adapter.systemName}:`, payload);
        const { sessionId, from, to, callDetails } = payload;

        const incomingCall: Call = {
            id: sessionId,
            from,
            to,
            status: 'ringing_inbound',
            direction: 'inbound',
            startTime: new Date().toISOString(),
            voipSystem: adapter.systemName,
            voipCallSid: sessionId,
            contactDisplayName: callDetails?.contactDisplayName || from,
            contactId: callDetails?.contactId,
            subject: callDetails?.subject, // <<< INCLUDE SUBJECT
            ...callDetails,
        };
        useCallStore.getState().addOrUpdateActiveCall(incomingCall);
        useCallStore.getState().setSelectedCallIdForUI(sessionId);
        this.activeAdapterForSession.set(sessionId, adapter);

        const callSessionForBinding: CallSession = {
            sessionId,
            callId: incomingCall.id,
            status: incomingCall.status,
            startTime: incomingCall.startTime,
            voipSystem: adapter.systemName,
            lastStatusUpdate: new Date().toISOString(),
            targetNumber: from,
            direction: 'inbound',
            from: incomingCall.from,
            to: incomingCall.to,
            subject: incomingCall.subject, // <<< INCLUDE SUBJECT
        };
        this.bindSessionEvents(callSessionForBinding, adapter);
    }

    private selectAdapter(contactPhoneNumber?: ContactPhoneNumber, preferredSystem?: string): IVoipAdapter | null {
        if (preferredSystem) {
            const adapter = this.adapters.find(a => a.systemName === preferredSystem && a.isConfigured());
            if (adapter) return adapter;
        }
        if (contactPhoneNumber?.voipIntegrationDetails?.systemName) {
            const details = contactPhoneNumber.voipIntegrationDetails;
            if (details.canDialViaSystem === false) return null;
            const adapter = this.adapters.find(a => a.systemName === details.systemName && a.isConfigured());
            if (adapter) return adapter;
        }
        return this.adapters.find(a => a.isConfigured()) || null;
    }

    public async startCall(
        targetNumber: string,
        callContextInput?: { // Renamed for clarity
            contactPhoneNumber?: ContactPhoneNumber;
            contact?: Pick<Contact, 'id' | 'contactType'> & { displayName: string; };
            subject?: string; // <<< ADDED SUBJECT HERE
        },
        preferredSystem?: string
    ): Promise<CallSession | VoipError> {
        const adapter = this.selectAdapter(callContextInput?.contactPhoneNumber, preferredSystem);
        if (!adapter) {
            return { errorCode: 'NO_ADAPTER_AVAILABLE', message: uiStrings.genericErrorNotification || 'No VoIP adapter.', timestamp: new Date().toISOString() };
        }

        try {
            const sessionOrError = await adapter.initiateCall(targetNumber, {
                contact: callContextInput?.contact,
                subject: callContextInput?.subject // <<< PASS SUBJECT TO ADAPTER
            });
            if ('sessionId' in sessionOrError) {
                this.activeAdapterForSession.set(sessionOrError.sessionId, adapter);
                this.bindSessionEvents(sessionOrError, adapter);
                const call: Call = {
                    id: sessionOrError.sessionId,
                    from: sessionOrError.from || 'my_mock_line',
                    to: sessionOrError.to,
                    status: sessionOrError.status,
                    direction: 'outbound',
                    startTime: sessionOrError.startTime,
                    contactId: callContextInput?.contact?.id,
                    contactDisplayName: callContextInput?.contact?.displayName || targetNumber,
                    subject: callContextInput?.subject, // <<< INCLUDE SUBJECT
                    voipSystem: adapter.systemName,
                    voipCallSid: sessionOrError.sessionId,
                };
                useCallStore.getState().addOrUpdateActiveCall(call);
                useCallStore.getState().setSelectedCallIdForUI(call.id);
                return sessionOrError;
            }
            return sessionOrError;
        } catch (err: any) {
            return { errorCode: 'ADAPTER_EXCEPTION', message: err.message || 'Adapter call initiation failed.', details: err, timestamp: new Date().toISOString() };
        }
    }

    public async answerCall(sessionId: string): Promise<void | VoipError> {
        const adapter = this.activeAdapterForSession.get(sessionId);
        if (!adapter) return { errorCode: 'SESSION_ADAPTER_NOT_FOUND', message: `Adapter for session ${sessionId} not found.`, timestamp: new Date().toISOString() };
        return adapter.answerCall(sessionId);
    }

    public async rejectCall(sessionId: string): Promise<void | VoipError> {
        const adapter = this.activeAdapterForSession.get(sessionId);
        if (!adapter) return { errorCode: 'SESSION_ADAPTER_NOT_FOUND', message: `Adapter for session ${sessionId} not found.`, timestamp: new Date().toISOString() };
        return adapter.rejectCall(sessionId);
    }

    public async endCall(sessionId: string): Promise<void | VoipError> {
        const adapter = this.activeAdapterForSession.get(sessionId);
        if (!adapter) {
            const callInLog = useCallStore.getState().callLog.find(c => c.id === sessionId);
            if (callInLog) {
                 console.warn(`[VoipManager] endCall for session ${sessionId} - call already in log.`);
                 return;
            }
            return { errorCode: 'SESSION_ADAPTER_NOT_FOUND', message: `Adapter for session ${sessionId} not found.`, timestamp: new Date().toISOString() };
        }
        return adapter.endCall(sessionId);
    }

    public async muteCall(sessionId: string, mute: boolean): Promise<void | VoipError> {
        const adapter = this.activeAdapterForSession.get(sessionId);
        if (!adapter) return { errorCode: 'SESSION_ADAPTER_NOT_FOUND', message: `Adapter for session ${sessionId} not found.`, timestamp: new Date().toISOString() };
        const result = await adapter.muteCall(sessionId, mute);
        if (!result || !('errorCode' in result)) {
            useCallStore.getState().addOrUpdateActiveCall({ id: sessionId, isMuted: mute } as Call);
        }
        return result;
    }

    public async holdCall(sessionId: string, hold: boolean): Promise<void | VoipError> {
        const adapter = this.activeAdapterForSession.get(sessionId);
        if (!adapter) return { errorCode: 'SESSION_ADAPTER_NOT_FOUND', message: `Adapter for session ${sessionId} not found.`, timestamp: new Date().toISOString() };
        return adapter.holdCall(sessionId, hold);
    }

    public async sendDTMF(sessionId: string, tone: string): Promise<void | VoipError> {
        const adapter = this.activeAdapterForSession.get(sessionId);
        if (!adapter) return { errorCode: 'SESSION_ADAPTER_NOT_FOUND', message: `Adapter for session ${sessionId} not found.`, timestamp: new Date().toISOString() };
        return adapter.sendDTMF(sessionId, tone);
    }

    private handleSessionStatusChange(payload: StatusChangeEventPayload, adapter: IVoipAdapter) {
        console.log(`[VoipManager] Status change for session ${payload.sessionId} via ${adapter.systemName}:`, payload);
        const callStore = useCallStore.getState();
        const existingCall = callStore.activeCalls.find(c => c.id === payload.sessionId) || callStore.callLog.find(c => c.id === payload.sessionId);

        let callDataFromEvent = payload.call;
        if (!callDataFromEvent && existingCall) {
            callDataFromEvent = {
                ...existingCall,
                status: payload.status,
                voipSystem: adapter.systemName,
                voipCallSid: payload.sessionId,
            };
        } else if (!callDataFromEvent && !existingCall) {
             console.warn(`[VoipManager] Received statusChange for unknown session ${payload.sessionId}. Creating minimal call object.`);
             callDataFromEvent = {
                id: payload.sessionId,
                status: payload.status,
                direction: 'outbound',
                from: 'unknown',
                to: 'unknown',
                startTime: new Date().toISOString(),
                voipSystem: adapter.systemName,
                voipCallSid: payload.sessionId,
             } as Call;
        }

        if (callDataFromEvent) {
            if (payload.status === 'answered' && !callDataFromEvent.connectedTime) {
                callDataFromEvent.connectedTime = new Date().toISOString();
            }
            callDataFromEvent.isOnHold = payload.status === 'on_hold';
            callStore.addOrUpdateActiveCall(callDataFromEvent);
        }
    }

    private handleSessionDisconnected(payload: DisconnectedEventPayload, adapter: IVoipAdapter) {
        console.log(`[VoipManager] Disconnected event for session ${payload.sessionId} via ${adapter.systemName}:`, payload);
        const callStore = useCallStore.getState();
        const callToEnd = callStore.activeCalls.find(c => c.id === payload.sessionId) || callStore.callLog.find(c => c.id === payload.sessionId);

        let finalCallData = payload.call;

        if (!finalCallData && callToEnd) {
            finalCallData = {
                ...callToEnd,
                status: 'disconnected',
                hangupReason: payload.reason,
                endTime: new Date().toISOString(),
            };
        } else if (!finalCallData && !callToEnd) {
             console.warn(`[VoipManager] Received disconnected for unknown session ${payload.sessionId}. Logging minimal call.`);
             finalCallData = {
                id: payload.sessionId,
                status: 'disconnected',
                hangupReason: payload.reason,
                direction: 'outbound',
                from: 'unknown',
                to: 'unknown',
                startTime: new Date(Date.now() - 10000).toISOString(),
                endTime: new Date().toISOString(),
                voipSystem: adapter.systemName,
                voipCallSid: payload.sessionId,
             } as Call;
        }

        if (finalCallData) {
            if (!finalCallData.endTime) finalCallData.endTime = new Date().toISOString();
            if (finalCallData.startTime && finalCallData.endTime && finalCallData.durationSeconds === undefined) { // Recalculate duration based on final endTime
                 finalCallData.durationSeconds = Math.max(0, Math.round((new Date(finalCallData.endTime).getTime() - new Date(finalCallData.startTime).getTime()) / 1000));
            }
            callStore.addEndedCallToLog(finalCallData);
            this.logCallAsNote(finalCallData).catch(error => {
                console.error("[VoipManager] Error logging call as note:", error);
            });
        }

        this.activeAdapterForSession.delete(payload.sessionId);
    }

    private handleSessionError(payload: ErrorEventPayload, adapter: IVoipAdapter) {
        console.error(`[VoipManager] Error event for session ${payload.sessionId} via ${adapter.systemName}: Code: ${payload.errorCode}, Message: ${payload.message}, Details: ${JSON.stringify(payload.details)}`);
        const callStore = useCallStore.getState();
        if (payload.sessionId) {
            const existingCall = callStore.activeCalls.find(c => c.id === payload.sessionId);
            if (existingCall) {
                const updatedCall: Call = {
                    ...existingCall,
                    status: 'failed',
                    errorMessage: payload.message,
                    hangupReason: 'call_failed',
                    endTime: new Date().toISOString(),
                };
                 if (updatedCall.startTime && updatedCall.endTime && updatedCall.durationSeconds === undefined) { // Recalculate duration
                    updatedCall.durationSeconds = Math.max(0, Math.round((new Date(updatedCall.endTime).getTime() - new Date(updatedCall.startTime).getTime()) / 1000));
                }
                callStore.addEndedCallToLog(updatedCall);
                this.logCallAsNote(updatedCall).catch(error => {
                    console.error("[VoipManager] Error logging call as note after session error:", error);
                });
            } else {
                const errorCall : Call = {
                    id: payload.sessionId,
                    status: 'failed',
                    errorMessage: payload.message,
                    hangupReason: 'call_failed',
                    direction: 'outbound',
                    from: 'unknown',
                    to: 'unknown',
                    startTime: payload.timestamp || new Date().toISOString(),
                    endTime: new Date().toISOString(),
                    voipSystem: adapter.systemName,
                    voipCallSid: payload.sessionId,
                };
                 if (errorCall.startTime && errorCall.endTime && errorCall.durationSeconds === undefined) { // Recalculate duration
                   errorCall.durationSeconds = Math.max(0, Math.round((new Date(errorCall.endTime).getTime() - new Date(errorCall.startTime).getTime()) / 1000));
                }
                callStore.addEndedCallToLog(errorCall);
                this.logCallAsNote(errorCall).catch(error => {
                    console.error("[VoipManager] Error logging error call as note:", error);
                });
            }
            this.activeAdapterForSession.delete(payload.sessionId);
        } else {
            callStore.setCurrentCallError(payload);
        }
    }

    private async logCallAsNote(call: Call) {
        if (!call.contactId) {
            console.warn(`[VoipManager] Cannot log call note for call ${call.id} without a contactId.`);
            return;
        }
        const { addNote: addNoteToStore } = useNotesStore.getState(); // Correct store interaction
        const callDuration = call.durationSeconds !== undefined ? `${Math.floor(call.durationSeconds / 60)}λ ${call.durationSeconds % 60}δ` : 'N/A';

        let noteContent = `Καταγραφή Κλήσης (${call.direction === 'inbound' ? 'Εισερχόμενη' : 'Εξερχόμενη'}):\n`;
        noteContent += `Προς/Από: ${call.direction === 'inbound' ? call.from : call.to} (${call.contactDisplayName || 'Άγνωστος'})\n`;
        if (call.subject) noteContent += `Θέμα: ${call.subject}\n`; // <<< ADD SUBJECT TO NOTE
        noteContent += `Κατάσταση: ${call.status}\n`;
        if (call.hangupReason) noteContent += `Λόγος Τερματισμού: ${call.hangupReason}\n`;
        noteContent += `Διάρκεια: ${callDuration}\n`;
        noteContent += `Σύστημα: ${call.voipSystem}\n`;
        noteContent += `ID Κλήσης Συστήματος: ${call.voipCallSid || call.id}\n`;
        if (call.errorMessage) noteContent += `Σφάλμα: ${call.errorMessage}\n`;
        noteContent += `Timestamp: ${new Date(call.endTime || call.startTime || Date.now()).toLocaleString('el-GR')}`;

        const currentAppUserDisplayName = "System User";

        const noteDetailsForService = {
            entityId: call.contactId,
            entityType: 'contact' as EntityType,
            content: noteContent,
            authorDisplayName: currentAppUserDisplayName, // This is the key
            type: 'call_log' as NoteType,
            visibility: 'team' as NoteVisibility,
        };

        try {
            // Call the service, which then calls the store's addNote method
            // (which in turn creates the full Note object including author UserReference)
            const newNoteFromService = await NoteService.createNote(noteDetailsForService);
            // The note is already added to the store by the service's internal call to the store's addNote.
            // If createNote from service returned the note, we could use it here, but it's already in store.
            // The workflow event will be triggered from useNotesStore.addNote if it's called from the service or a hook.
            // If NoteService.createNote calls useNotesStore.getState().addNote, then workflow is handled.
            // Let's ensure NoteService.createNote correctly leads to store update AND event dispatch.
            // For now, assuming NoteService.createNote *results* in the note being added to the store,
            // and that the store's addNote method (or a hook around it) handles the workflow event.
            // Here we just ensure the note is created.

            console.log(`[VoipManager] Call ${call.id} logged as note for contact ${call.contactId}. Note ID: ${newNoteFromService.id}`);
        } catch (error) {
            console.error(`[VoipManager] Failed to create or log note for call ${call.id}:`, error);
        }
    }

    public getAdapters(): IVoipAdapter[] {
        return this.adapters.filter(a => a.isConfigured());
    }
}
