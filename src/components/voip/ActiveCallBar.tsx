// src/components/voip/ActiveCallBar.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useCallStore } from '../../voip/stores/useCallStore';
import { voipManagerInstance } from '../../voip/services/voipServiceInstance';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import Tooltip from '../ui/Tooltip';
import type { CallStatus } from '../../types';

const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (num: number) => num.toString().padStart(2, '0');

  if (h > 0) {
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  return `${pad(m)}:${pad(s)}`;
};

const ActiveCallBar: React.FC = () => {
  const selectedCallId = useCallStore(state => state.selectedCallIdForUI);
  const activeCalls = useCallStore(state => state.activeCalls);
  const callLog = useCallStore(state => state.callLog);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const activeCall = useMemo(() => {
    if (!selectedCallId) return null;
    return activeCalls.find(c => c.id === selectedCallId);
  }, [selectedCallId, activeCalls]);

  useEffect(() => {
    if (activeCall && activeCall.status === 'answered') {
      const timer = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeCall]);

  const durationSeconds = useMemo(() => {
    if (activeCall && activeCall.status === 'answered' && activeCall.connectedTime) {
      return Math.floor((currentTime - new Date(activeCall.connectedTime).getTime()) / 1000);
    }
    return activeCall?.durationSeconds ?? 0;
  }, [activeCall, currentTime]);

  if (!activeCall) {
    return null;
  }

  const { id, contactDisplayName, status, isMuted, isOnHold, from, to, direction } = activeCall;
  const displayName = contactDisplayName || (direction === 'inbound' ? from : to) || 'Άγνωστη Κλήση';

  const handleMuteToggle = async () => {
    await voipManagerInstance.muteCall(id, !isMuted);
  };

  const handleHoldToggle = async () => {
    await voipManagerInstance.holdCall(id, !isOnHold);
  };

  const handleEndCall = async () => {
    await voipManagerInstance.endCall(id);
  };
  
  const getStatusText = (currentStatus: CallStatus): string => {
    switch (currentStatus) {
      case 'ringing_outbound': return 'Κλήση...';
      case 'ringing_inbound': return 'Εισερχόμενη Κλήση...';
      case 'answered': return `Σε κλήση ${formatDuration(durationSeconds)}`;
      case 'on_hold': return `Σε αναμονή ${formatDuration(durationSeconds)}`;
      case 'connecting': return 'Σύνδεση...';
      case 'initiating': return 'Έναρξη κλήσης...';
      default: return currentStatus;
    }
  };

  return (
    <div 
      className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-xl bg-slate-800 text-white p-3 rounded-lg shadow-2xl border border-slate-700 flex items-center justify-between z-[200]"
      role="toolbar"
      aria-label="Γραμμή ελέγχου ενεργής κλήσης"
    >
      <div className="flex items-center space-x-3 overflow-hidden">
        <Icon name="phone" size="md" className="text-green-400 flex-shrink-0" />
        <div className="overflow-hidden">
          <p className="text-sm font-semibold truncate" title={displayName}>{displayName}</p>
          <p className="text-xs text-slate-400" aria-live="polite">{getStatusText(status)}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2 flex-shrink-0">
        <Tooltip content={isMuted ? "Κατάργηση σίγασης" : "Σίγαση"} position="top">
          <Button variant={isMuted ? "danger" : "ghost"} size="sm" onClick={handleMuteToggle} aria-pressed={isMuted}>
            <Icon name={isMuted ? "microphoneSlash" : "microphone"} size="sm" />
          </Button>
        </Tooltip>
        <Tooltip content={isOnHold ? "Επαναφορά κλήσης" : "Αναμονή"} position="top">
          <Button variant={isOnHold ? "primary" : "ghost"} size="sm" onClick={handleHoldToggle} aria-pressed={isOnHold}>
            <Icon name="pauseCircle" size="sm" />
          </Button>
        </Tooltip>
        <Tooltip content="Τερματισμός Κλήσης" position="top">
          <Button variant="danger" size="sm" onClick={handleEndCall}>
            <Icon name="phoneHangup" size="sm" />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

export default ActiveCallBar;