// src/voip/stores/useCallStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Call, VoipError, CallStatus } from '../types/callTypes';

interface CallState {
  activeCalls: Call[];
  callLog: Call[];
  isDialPadOpen: boolean;
  currentCallError: VoipError | null;
  selectedCallIdForUI: string | null; 
}

interface CallActions {
  addOrUpdateActiveCall: (call: Call) => void;
  removeActiveCall: (callId: string, finalStatus?: CallStatus, hangupReason?: Call['hangupReason']) => void; // Updated to accept final status
  clearActiveCalls: () => void;

  addEndedCallToLog: (call: Call) => void;
  updateCallInLog: (callId: string, updates: Partial<Omit<Call, 'id'>>) => void;
  clearCallLogError: (callId: string) => void;
  clearAllCallLogs: () => void;

  setDialPadOpen: (isOpen: boolean) => void;
  setCurrentCallError: (error: VoipError | null) => void;
  setSelectedCallIdForUI: (callId: string | null) => void;
}

const initialState: CallState = {
  activeCalls: [],
  callLog: [],
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

        // Ensure duration is calculated if endTime is present
        if (callToAddOrUpdate.endTime && callToAddOrUpdate.startTime && !callToAddOrUpdate.durationSeconds) {
            callToAddOrUpdate.durationSeconds = Math.round((new Date(callToAddOrUpdate.endTime).getTime() - new Date(callToAddOrUpdate.startTime).getTime()) / 1000);
        }
        
        if (existingIndex !== -1) {
          state.activeCalls[existingIndex] = { ...state.activeCalls[existingIndex], ...callToAddOrUpdate };
        } else {
          state.activeCalls.push(callToAddOrUpdate);
        }
        
        // If the call has a terminal status, move it to log and remove from active
        const terminalStatuses: CallStatus[] = ['disconnected', 'failed', 'missed', 'busy', 'voicemail'];
        if (terminalStatuses.includes(callToAddOrUpdate.status)) {
          const logIndex = state.callLog.findIndex(c => c.id === callToAddOrUpdate.id);
          if (logIndex !== -1) {
            state.callLog[logIndex] = { ...state.callLog[logIndex], ...callToAddOrUpdate };
          } else {
            state.callLog.unshift(callToAddOrUpdate);
          }
          state.activeCalls = state.activeCalls.filter(ac => ac.id !== callToAddOrUpdate.id);
          if (state.selectedCallIdForUI === callToAddOrUpdate.id) {
            state.selectedCallIdForUI = null; // Deselect if it was the active call
            state.isDialPadOpen = false; // Close dialpad if related call ended
          }
        } else if (state.activeCalls.length === 1 && !state.selectedCallIdForUI) {
            // If this is the only active call and nothing is selected, select it.
            state.selectedCallIdForUI = callToAddOrUpdate.id;
        }
      }),

    removeActiveCall: (callId, finalStatus, hangupReason) =>
      set((state) => {
        const callToRemoveIndex = state.activeCalls.findIndex((c) => c.id === callId);
        if (callToRemoveIndex !== -1) {
            const callToRemove = { ...state.activeCalls[callToRemoveIndex] };
            
            // Update with final status and reason if provided
            if (finalStatus) callToRemove.status = finalStatus;
            if (hangupReason) callToRemove.hangupReason = hangupReason;
            if (!callToRemove.endTime) callToRemove.endTime = new Date().toISOString();
            if (callToRemove.startTime && !callToRemove.durationSeconds) {
                 callToRemove.durationSeconds = Math.round((new Date(callToRemove.endTime).getTime() - new Date(callToRemove.startTime).getTime()) / 1000);
            }

            // Remove from active calls
            state.activeCalls.splice(callToRemoveIndex, 1);

            // Add/Update in callLog
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
             if (callToLog.endTime && callToLog.startTime && !callToLog.durationSeconds) {
                callToLog.durationSeconds = Math.round((new Date(callToLog.endTime).getTime() - new Date(callToLog.startTime).getTime()) / 1000);
            }

            const existingIndex = state.callLog.findIndex((c) => c.id === callToLog.id);
            if (existingIndex !== -1) {
                state.callLog[existingIndex] = { ...state.callLog[existingIndex], ...callToLog };
            } else {
                state.callLog.unshift(callToLog);
            }
            // Ensure it's removed from activeCalls if it was somehow still there
            state.activeCalls = state.activeCalls.filter(ac => ac.id !== callToLog.id);
        }),

    updateCallInLog: (callId, updates) =>
      set((state) => {
        const callIndex = state.callLog.findIndex((c) => c.id === callId);
        if (callIndex !== -1) {
          state.callLog[callIndex] = { ...state.callLog[callIndex], ...updates };
          if (updates.endTime && state.callLog[callIndex].startTime && !updates.durationSeconds) {
             state.callLog[callIndex].durationSeconds = Math.round((new Date(updates.endTime).getTime() - new Date(state.callLog[callIndex].startTime!).getTime()) / 1000);
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
        if (!callId) { // If deselecting, also close dialpad
            state.isDialPadOpen = false;
        }
      }),
  }))
);
