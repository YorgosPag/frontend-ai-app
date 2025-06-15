// src/voip/stores/useCallStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Call, VoipError, CallStatus } from '../types/callTypes';
import { generateUniqueId } from '../../utils/formUtils'; // For mock data

interface CallState {
  activeCalls: Call[];
  callLog: Call[];
  isDialPadOpen: boolean;
  currentCallError: VoipError | null;
  selectedCallIdForUI: string | null; 
}

interface CallActions {
  addOrUpdateActiveCall: (call: Call) => void;
  removeActiveCall: (callId: string, finalStatus?: CallStatus, hangupReason?: Call['hangupReason']) => void; 
  clearActiveCalls: () => void;

  addEndedCallToLog: (call: Call) => void;
  updateCallInLog: (callId: string, updates: Partial<Omit<Call, 'id'>>) => void;
  clearCallLogError: (callId: string) => void;
  clearAllCallLogs: () => void;

  setDialPadOpen: (isOpen: boolean) => void;
  setCurrentCallError: (error: VoipError | null) => void;
  setSelectedCallIdForUI: (callId: string | null) => void;
}

// More diverse mock call log data
const mockCallLogData: Call[] = [
  {
    id: generateUniqueId(),
    from: '6971234567', // Known contact (Γιώργος Ιωάννου from initialContacts)
    to: 'my_mock_line',
    status: 'disconnected',
    direction: 'inbound',
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(), // 5 min duration
    durationSeconds: 300, // 5 minutes
    contactId: '3', // Γιώργος Ιωάννου
    contactDisplayName: 'Γιώργος Ιωάννου',
    voipSystem: 'mock',
    subject: 'Συζήτηση για Project Alpha',
    hangupReason: 'remote_hangup',
  },
  {
    id: generateUniqueId(),
    from: 'my_mock_line',
    to: '2109876543', // Known contact (TEXNIKH A.E.)
    status: 'disconnected',
    direction: 'outbound',
    startTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    endTime: new Date(Date.now() - 1 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(), // 10 min duration
    durationSeconds: 600, // 10 minutes
    contactId: '2', // TEXNIKH A.E.
    contactDisplayName: 'ΤΕΧΝΙΚΗ ΚΑΤΑΣΚΕΥΑΣΤΙΚΗ Α.Ε.',
    voipSystem: 'mock',
    hangupReason: 'local_hangup',
  },
  {
    id: generateUniqueId(),
    from: '6900000001', // Unknown caller
    to: 'my_mock_line',
    status: 'missed',
    direction: 'inbound',
    startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    endTime: new Date(Date.now() - 30 * 60 * 1000 + 30 * 1000).toISOString(), // 30 sec (missed)
    durationSeconds: 0, // Missed call, no active duration
    voipSystem: 'mock',
    hangupReason: 'missed',
  },
  {
    id: generateUniqueId(),
    from: 'my_mock_line',
    to: '6911223344', // Unknown number (dialed out)
    status: 'failed',
    direction: 'outbound',
    startTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    endTime: new Date(Date.now() - 15 * 60 * 1000 + 10 * 1000).toISOString(), // 10 sec (failed attempt)
    durationSeconds: 0, // Failed call, no active duration
    voipSystem: 'mock',
    errorMessage: 'Ο αριθμός δεν απαντά',
    hangupReason: 'call_failed',
  },
   {
    id: generateUniqueId(),
    from: 'my_mock_line',
    to: '2101234567', // Known contact (Μαρία Παπαδοπούλου)
    status: 'disconnected',
    direction: 'outbound',
    startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 120 * 1000).toISOString(), // 2 min duration
    durationSeconds: 120, 
    contactId: '1',
    contactDisplayName: 'Μαρία Παπαδοπούλου',
    voipSystem: 'mock',
    subject: 'Ερώτηση για ακίνητο',
    hangupReason: 'local_hangup',
  }
];

const initialState: CallState = {
  activeCalls: [],
  callLog: mockCallLogData, // <<< USE MOCK DATA
  isDialPadOpen: false,
  currentCallError: null,
  selectedCallIdForUI: null,
};

export const useCallStore = create<CallState & CallActions>()(
  immer((set, get) => ({
    ...initialState,

    addOrUpdateActiveCall: (call) =>
      set((state) => {
        const existingIndex = state.activeCalls.findIndex((c) => c.id === call.id);
        let callToAddOrUpdate = { ...call };

        if (callToAddOrUpdate.endTime && callToAddOrUpdate.startTime && callToAddOrUpdate.durationSeconds === undefined) {
            callToAddOrUpdate.durationSeconds = Math.max(0, Math.round((new Date(callToAddOrUpdate.endTime).getTime() - new Date(callToAddOrUpdate.startTime).getTime()) / 1000));
        }
        
        if (existingIndex !== -1) {
          state.activeCalls[existingIndex] = { ...state.activeCalls[existingIndex], ...callToAddOrUpdate };
        } else {
          state.activeCalls.push(callToAddOrUpdate);
        }
        
        const terminalStatuses: CallStatus[] = ['disconnected', 'failed', 'missed', 'busy', 'voicemail'];
        if (terminalStatuses.includes(callToAddOrUpdate.status)) {
          const logIndex = state.callLog.findIndex(c => c.id === callToAddOrUpdate.id);
          if (logIndex !== -1) {
            state.callLog[logIndex] = { ...state.callLog[logIndex], ...callToAddOrUpdate };
          } else {
            state.callLog.unshift(callToAddOrUpdate); // Add to start of log
          }
          state.activeCalls = state.activeCalls.filter(ac => ac.id !== callToAddOrUpdate.id);
          if (state.selectedCallIdForUI === callToAddOrUpdate.id) {
            state.selectedCallIdForUI = null; 
            state.isDialPadOpen = false; 
          }
        } else if (state.activeCalls.length === 1 && !state.selectedCallIdForUI) {
            state.selectedCallIdForUI = callToAddOrUpdate.id;
        }
      }),

    removeActiveCall: (callId, finalStatus, hangupReason) =>
      set((state) => {
        const callToRemoveIndex = state.activeCalls.findIndex((c) => c.id === callId);
        if (callToRemoveIndex !== -1) {
            const callToRemove = { ...state.activeCalls[callToRemoveIndex] };
            
            if (finalStatus) callToRemove.status = finalStatus;
            if (hangupReason) callToRemove.hangupReason = hangupReason;
            if (!callToRemove.endTime) callToRemove.endTime = new Date().toISOString();
            if (callToRemove.startTime && callToRemove.endTime && callToRemove.durationSeconds === undefined) {
                 callToRemove.durationSeconds = Math.max(0, Math.round((new Date(callToRemove.endTime).getTime() - new Date(callToRemove.startTime).getTime()) / 1000));
            }

            state.activeCalls.splice(callToRemoveIndex, 1);

            const logIndex = state.callLog.findIndex(c => c.id === callToRemove.id);
            if (logIndex !== -1) {
                state.callLog[logIndex] = { ...state.callLog[logIndex], ...callToRemove };
            } else {
                state.callLog.unshift(callToRemove);
            }

            if (state.selectedCallIdForUI === callId) {
                state.selectedCallIdForUI = state.activeCalls.length > 0 ? state.activeCalls[0].id : null;
                state.isDialPadOpen = false;
            }
        }
      }),

    clearActiveCalls: () =>
      set((state) => {
        state.activeCalls = [];
        state.selectedCallIdForUI = null;
        state.isDialPadOpen = false;
      }),

    addEndedCallToLog: (call) =>
        set((state) => {
            let callToLog = { ...call };
             if (callToLog.endTime && callToLog.startTime && callToLog.durationSeconds === undefined) {
                callToLog.durationSeconds = Math.max(0, Math.round((new Date(callToLog.endTime).getTime() - new Date(callToLog.startTime).getTime()) / 1000));
            }

            const existingIndex = state.callLog.findIndex((c) => c.id === callToLog.id);
            if (existingIndex !== -1) {
                state.callLog[existingIndex] = { ...state.callLog[existingIndex], ...callToLog };
            } else {
                state.callLog.unshift(callToLog); // Add to start of log
            }
            state.activeCalls = state.activeCalls.filter(ac => ac.id !== callToLog.id);
        }),

    updateCallInLog: (callId, updates) =>
      set((state) => {
        const callIndex = state.callLog.findIndex((c) => c.id === callId);
        if (callIndex !== -1) {
          state.callLog[callIndex] = { ...state.callLog[callIndex], ...updates };
          if (updates.endTime && state.callLog[callIndex].startTime && updates.durationSeconds === undefined) {
             state.callLog[callIndex].durationSeconds = Math.max(0, Math.round((new Date(updates.endTime).getTime() - new Date(state.callLog[callIndex].startTime!).getTime()) / 1000));
          }
        }
      }),

    clearCallLogError: (callId: string) =>
      set((state) => {
        const callIndex = state.callLog.findIndex((c) => c.id === callId);
        if (callIndex !== -1 && state.callLog[callIndex].errorMessage) {
          state.callLog[callIndex].errorMessage = undefined;
        }
      }),

    clearAllCallLogs: () =>
      set((state) => {
        state.callLog = [];
      }),

    setDialPadOpen: (isOpen) =>
      set((state) => {
        state.isDialPadOpen = isOpen;
      }),
    setCurrentCallError: (error) =>
      set((state) => {
        state.currentCallError = error;
      }),
    setSelectedCallIdForUI: (callId) =>
      set((state) => {
        state.selectedCallIdForUI = callId;
        if (!callId) { 
            state.isDialPadOpen = false;
        }
      }),
  }))
);