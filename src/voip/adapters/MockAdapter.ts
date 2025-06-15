// src/voip/adapters/MockAdapter.ts
import type { 
  IVoipAdapter, CallSession, VoipError, AdapterEventName,
  StatusChangeEventPayload, DisconnectedEventPayload, ErrorEventPayload, IncomingCallEventPayload
} from '../types/adapterTypes';
import type { CallStatus, CallHangupReason, Call } from '../types/callTypes';
import type { Contact } from '../../types';
import { generateUniqueId } from '../../utils/formUtils';

interface MockSessionData {
  session: CallSession;
  timers: number[];
  answeredRemotely?: boolean; 
}

export class MockAdapter implements IVoipAdapter {
  public readonly systemName: string = 'mock';
  private activeSessions: Map<string, MockSessionData> = new Map();
  private listeners: Map<AdapterEventName, Array<(payload: any) => void>> = new Map();
  private isAdapterConnected: boolean = false;

  constructor(private config?: { simulateDelayMs?: number }) {
    console.log('[MockAdapter] Initialized.');
    this.config = { simulateDelayMs: 500, ...config };
  }

  private get delay(): number { return this.config?.simulateDelayMs || 500; }

  private emit(event: AdapterEventName, payload: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(payload);
        } catch (error) {
          console.error(`[MockAdapter] Error in listener for event "${event}":`, error);
        }
      });
    }
  }

  public on(event: AdapterEventName, listener: (payload: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(listener);
  }

  public off(event: AdapterEventName, listener: (payload: any) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      this.listeners.set(event, eventListeners.filter(l => l !== listener));
    }
  }

  public async isConfigured(): Promise<boolean> {
    console.log('[MockAdapter] isConfigured called');
    return true;
  }

  public async connect(): Promise<void | VoipError> {
    console.log('[MockAdapter] connect called');
    if (this.isAdapterConnected) {
      console.warn('[MockAdapter] Already connected.');
      return;
    }
    await new Promise(resolve => setTimeout(resolve, this.delay / 2));
    this.isAdapterConnected = true;
    this.emit('connected', { systemName: this.systemName });
    console.log('[MockAdapter] Successfully connected.');
    return Promise.resolve();
  }

  public async disconnect(): Promise<void | VoipError> {
    console.log('[MockAdapter] disconnect called');
    if (!this.isAdapterConnected) {
      console.warn('[MockAdapter] Already disconnected.');
      return;
    }
    this.activeSessions.forEach(sessionData => {
      sessionData.timers.forEach(clearTimeout);
    });
    this.activeSessions.clear();
    this.isAdapterConnected = false;
    this.emit('adapterDisconnected', { systemName: this.systemName });
    console.log('[MockAdapter] Successfully disconnected and cleared active sessions.');
    return Promise.resolve();
  }

  private updateSessionStatus(sessionId: string, newStatus: CallStatus, callDataUpdates?: Partial<Call>): void {
    const sessionData = this.activeSessions.get(sessionId);
    if (sessionData) {
      sessionData.session.status = newStatus;
      sessionData.session.lastStatusUpdate = new Date().toISOString();
      if (newStatus === 'answered' && !sessionData.session.connectedTime) {
        sessionData.session.connectedTime = new Date().toISOString();
      }
      if (callDataUpdates) {
         Object.assign(sessionData.session, callDataUpdates as Partial<CallSession>);
      }

      const payload: StatusChangeEventPayload = { 
        sessionId, 
        status: newStatus,
        call: this.mapSessionToCall(sessionData.session) 
      };
      this.emit('statusChange', payload);
      console.log(`[MockAdapter] Session ${sessionId} status changed to ${newStatus}.`);
    }
  }
  
  private mapSessionToCall(session: CallSession): Call {
    const durationSeconds = session.endTime && session.startTime 
        ? Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000) 
        : undefined;

    return {
        id: session.sessionId, 
        from: session.from,
        to: session.to,
        status: session.status,
        direction: session.direction,
        startTime: session.startTime,
        connectedTime: session.connectedTime,
        endTime: session.endTime,
        durationSeconds: durationSeconds,
        voipSystem: this.systemName,
        voipCallSid: session.sessionId,
        subject: session.subject, // <<< MAP SUBJECT
        isMuted: false, 
        isOnHold: session.status === 'on_hold',
        errorMessage: session.error?.message,
        hangupReason: session.status === 'failed' ? 'call_failed' : (session.status === 'disconnected' ? 'unknown' : undefined)
    };
}


  public async initiateCall(
    targetNumber: string,
    callContext?: {
        contact?: Pick<Contact, 'id' | 'contactType'> & { displayName: string; };
        subject?: string;
    }
  ): Promise<CallSession | VoipError> {
    if (!this.isAdapterConnected) {
      const error: VoipError = { errorCode: 'NOT_CONNECTED', message: 'MockAdapter is not connected.', timestamp: new Date().toISOString() };
      this.emit('error', { ...error, eventType: 'initiateCallError' } as ErrorEventPayload);
      return error;
    }
    console.log(`[MockAdapter] initiateCall to ${targetNumber}`, callContext || '');
    const sessionId = `mock_out_${generateUniqueId()}`;
    const now = new Date().toISOString();
    
    const initialSession: CallSession = {
      sessionId,
      status: 'initiating',
      startTime: now,
      lastStatusUpdate: now,
      voipSystem: this.systemName,
      targetNumber,
      from: 'my_mock_line', 
      to: targetNumber,
      direction: 'outbound',
      subject: callContext?.subject, // <<< STORE SUBJECT
    };
    
    const sessionTimers: number[] = [];
    this.activeSessions.set(sessionId, { session: initialSession, timers: sessionTimers });
    this.updateSessionStatus(sessionId, 'initiating');

    sessionTimers.push(setTimeout(() => {
      if (!this.activeSessions.has(sessionId)) return;
      this.updateSessionStatus(sessionId, 'ringing_outbound');

      sessionTimers.push(setTimeout(() => {
        if (!this.activeSessions.has(sessionId)) return;
        this.updateSessionStatus(sessionId, 'answered');
        
        // Simulate call duration and hangup
        const callDurationMs = (5 + Math.random() * 25) * 1000; // 5 to 30 seconds
        sessionTimers.push(setTimeout(() => {
            if (!this.activeSessions.has(sessionId)) return;
            this.endCall(sessionId); // This will set endTime and calculate duration
        }, callDurationMs) as unknown as number);

      }, this.delay * (2 + Math.random())) as unknown as number); 
    }, this.delay * (1 + Math.random())) as unknown as number);

    return initialSession;
  }

  public async answerCall(sessionId: string): Promise<void | VoipError> {
    const sessionData = this.activeSessions.get(sessionId);
    if (!sessionData || sessionData.session.direction !== 'inbound') {
      const error: VoipError = { errorCode: 'SESSION_NOT_FOUND_OR_NOT_INBOUND', message: `Inbound session ${sessionId} not found or not suitable for answering.`, timestamp: new Date().toISOString() };
      this.emit('error', { ...error, sessionId, eventType: 'answerCallError' } as ErrorEventPayload);
      return error;
    }
    if (sessionData.session.status !== 'ringing_inbound') {
      const error: VoipError = { errorCode: 'CALL_NOT_RINGING', message: `Inbound session ${sessionId} is not in ringing state. Current: ${sessionData.session.status}`, timestamp: new Date().toISOString() };
      this.emit('error', { ...error, sessionId, eventType: 'answerCallError' } as ErrorEventPayload);
      return error;
    }
    
    sessionData.timers.forEach(clearTimeout); 
    sessionData.timers.length = 0;

    this.updateSessionStatus(sessionId, 'answered');
    sessionData.answeredRemotely = true; 
    console.log(`[MockAdapter] Inbound call ${sessionId} answered by user.`);

    // Simulate call duration and hangup for answered incoming call
    const callDurationMs = (5 + Math.random() * 25) * 1000;
    sessionData.timers.push(setTimeout(() => {
        if (!this.activeSessions.has(sessionId)) return;
        this.endCall(sessionId);
    }, callDurationMs) as unknown as number);

    return Promise.resolve();
  }

  public async rejectCall(sessionId: string): Promise<void | VoipError> {
    const sessionData = this.activeSessions.get(sessionId);
     if (!sessionData || sessionData.session.direction !== 'inbound') {
      const error: VoipError = { errorCode: 'SESSION_NOT_FOUND_OR_NOT_INBOUND', message: `Inbound session ${sessionId} not found or not suitable for rejecting.`, timestamp: new Date().toISOString() };
      this.emit('error', { ...error, sessionId, eventType: 'rejectCallError' } as ErrorEventPayload);
      return error;
    }
     if (sessionData.session.status !== 'ringing_inbound') {
      const error: VoipError = { errorCode: 'CALL_NOT_RINGING', message: `Inbound session ${sessionId} is not in ringing state for rejection. Current: ${sessionData.session.status}`, timestamp: new Date().toISOString() };
      this.emit('error', { ...error, sessionId, eventType: 'rejectCallError' } as ErrorEventPayload);
      return error;
    }

    sessionData.timers.forEach(clearTimeout);
    sessionData.timers.length = 0;
    
    sessionData.session.endTime = new Date().toISOString(); // Set endTime before status update
    this.updateSessionStatus(sessionId, 'missed'); // 'missed' might be better than 'disconnected' for a rejected call
    
    const payload: DisconnectedEventPayload = { 
        sessionId, 
        reason: 'call_rejected',
        call: this.mapSessionToCall(sessionData.session)
    };
    this.emit('disconnected', payload);
    this.activeSessions.delete(sessionId);
    console.log(`[MockAdapter] Inbound call ${sessionId} rejected by user.`);
    return Promise.resolve();
  }

  public async endCall(sessionId: string): Promise<void | VoipError> {
    const sessionData = this.activeSessions.get(sessionId);
    if (!sessionData) {
      const error: VoipError = { errorCode: 'SESSION_NOT_FOUND', message: `Session ${sessionId} not found for ending.`, timestamp: new Date().toISOString() };
      this.emit('error', { ...error, sessionId, eventType: 'endCallError' } as ErrorEventPayload);
      return error;
    }

    sessionData.timers.forEach(clearTimeout);
    sessionData.session.endTime = new Date().toISOString(); // Set endTime before status update
    this.updateSessionStatus(sessionId, 'disconnected');
    
    let hangupReason: CallHangupReason = 'local_hangup';
    if (sessionData.session.direction === 'inbound' && !sessionData.answeredRemotely) {
      hangupReason = 'missed';
    }

    const payload: DisconnectedEventPayload = { 
        sessionId, 
        reason: hangupReason,
        call: this.mapSessionToCall(sessionData.session) // mapSessionToCall will calculate durationSeconds
    };
    this.emit('disconnected', payload);
    this.activeSessions.delete(sessionId);
    console.log(`[MockAdapter] Session ${sessionId} ended.`);
    return Promise.resolve();
  }

  public async getCallStatus(sessionId: string): Promise<CallStatus | VoipError> {
    const sessionData = this.activeSessions.get(sessionId);
    if (!sessionData) {
      const error: VoipError = { errorCode: 'SESSION_NOT_FOUND', message: `Session ${sessionId} not found for getCallStatus.`, timestamp: new Date().toISOString() };
      return error;
    }
    return sessionData.session.status;
  }

  public async muteCall(sessionId: string, mute: boolean): Promise<void | VoipError> {
    const sessionData = this.activeSessions.get(sessionId);
    if (!sessionData || sessionData.session.status !== 'answered') {
       const error: VoipError = { errorCode: 'CALL_NOT_ACTIVE', message: `Session ${sessionId} not active for mute/unmute.`, timestamp: new Date().toISOString() };
       this.emit('error', { ...error, sessionId, eventType: 'muteCallError'} as ErrorEventPayload);
       return error;
    }
    console.log(`[MockAdapter] Session ${sessionId} ${mute ? 'muted' : 'unmuted'}.`);
    // In a real adapter, you'd update the Call object in the store too.
    // For MockAdapter, the VoipManager listens to 'statusChange' which includes the Call object.
    // However, mute is not a CallStatus. We might need a separate 'callUpdated' event or handle in VoipManager.
    // For now, this is just a log.
    return Promise.resolve();
  }

  public async holdCall(sessionId: string, hold: boolean): Promise<void | VoipError> {
    const sessionData = this.activeSessions.get(sessionId);
    if (!sessionData || (sessionData.session.status !== 'answered' && sessionData.session.status !== 'on_hold')) {
      const error: VoipError = { errorCode: 'CALL_NOT_ACTIVE', message: `Session ${sessionId} not in a state to be held/unheld. Current: ${sessionData.session.status}`, timestamp: new Date().toISOString() };
      this.emit('error', { ...error, sessionId, eventType: 'holdCallError'} as ErrorEventPayload);
      return error;
    }
    this.updateSessionStatus(sessionId, hold ? 'on_hold' : 'answered');
    console.log(`[MockAdapter] Session ${sessionId} ${hold ? 'held' : 'unheld'}.`);
    return Promise.resolve();
  }

  public async sendDTMF(sessionId: string, tone: string): Promise<void | VoipError> {
    const sessionData = this.activeSessions.get(sessionId);
    if (!sessionData || sessionData.session.status !== 'answered') {
      const error: VoipError = { errorCode: 'CALL_NOT_ACTIVE', message: `Session ${sessionId} not active for DTMF.`, timestamp: new Date().toISOString() };
      this.emit('error', { ...error, sessionId, eventType: 'sendDTMFError'} as ErrorEventPayload);
      return error;
    }
    console.log(`[MockAdapter] Session ${sessionId} sending DTMF: ${tone}.`);
    return Promise.resolve();
  }

  public simulateIncomingCall(
    fromNumber: string, 
    toNumber: string = 'mock_user_line_123',
    subject?: string // <<< ADDED SUBJECT PARAMETER
  ): CallSession {
    if (!this.isAdapterConnected) {
      console.error('[MockAdapter] Cannot simulate incoming call: Adapter not connected.');
      throw new Error('Adapter not connected, cannot simulate incoming call.');
    }
    const sessionId = `mock_in_${generateUniqueId()}`;
    const now = new Date().toISOString();
    
    const incomingSession: CallSession = {
      sessionId,
      status: 'ringing_inbound',
      startTime: now,
      lastStatusUpdate: now,
      voipSystem: this.systemName,
      targetNumber: fromNumber, 
      from: fromNumber,
      to: toNumber,
      direction: 'inbound',
      subject: subject, // <<< STORE SUBJECT
    };
    
    const sessionTimers: number[] = [];
    this.activeSessions.set(sessionId, { session: incomingSession, timers: sessionTimers, answeredRemotely: false });

    const eventPayload: IncomingCallEventPayload = { 
        sessionId, 
        from: fromNumber, 
        to: toNumber, 
        callDetails: { contactDisplayName: fromNumber, subject: subject } // <<< PASS SUBJECT IN CALLDETAILS
    };
    this.emit('incomingCall', eventPayload);
    this.updateSessionStatus(sessionId, 'ringing_inbound'); 

    sessionTimers.push(setTimeout(() => {
      const current = this.activeSessions.get(sessionId);
      if (current && current.session.status === 'ringing_inbound' && !current.answeredRemotely) {
        console.log(`[MockAdapter] Simulating missed call for ${sessionId}`);
        current.session.endTime = new Date().toISOString(); // Set endTime before status update
        this.updateSessionStatus(sessionId, 'missed');
        
        const disconnectedPayload: DisconnectedEventPayload = { 
            sessionId, 
            reason: 'missed', 
            call: this.mapSessionToCall(current.session)
        };
        this.emit('disconnected', disconnectedPayload);
        this.activeSessions.delete(sessionId);
      }
    }, 15000 + Math.random() * 5000) as unknown as number);

    return incomingSession;
  }
}