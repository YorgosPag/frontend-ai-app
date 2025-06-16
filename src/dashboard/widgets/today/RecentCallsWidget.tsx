// src/dashboard/widgets/today/RecentCallsWidget.tsx
import React, { useMemo } from 'react';
import type { DashboardWidgetConfig } from '../widgetBaseComponents'; // Updated import
import { useCallStore } from '../../../voip/stores/useCallStore';
import { useContactsStore } from '../../../stores/contactsStore';
import type { Call } from '../../../voip/types/callTypes';
import Icon from '../../../components/ui/Icon';
import type { IconName } from '../../../types/iconTypes';
import Tooltip from '../../../components/ui/Tooltip';

interface RecentCallsWidgetProps {
  config: DashboardWidgetConfig;
}

const formatCallDuration = (seconds?: number): string => {
  if (seconds === undefined || seconds < 0) return 'N/A';
  if (seconds === 0) return '0δ';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  if (h > 0) return `${h}ω ${m}λ ${s}δ`;
  if (m > 0) return `${m}λ ${s}δ`;
  return `${s}δ`;
};

const formatCallTimestamp = (isoString?: string): string => {
  if (!isoString) return 'Άγνωστο';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);

  if (diffSeconds < 5) return 'Μόλις τώρα';
  if (diffSeconds < 60) return `πριν ${diffSeconds}δ`;
  if (diffMinutes < 60) return `πριν ${diffMinutes}λ`;
  if (diffHours < 24) return `πριν ${diffHours}ώ`;
  if (now.toDateString() === date.toDateString()) return date.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });
  if (new Date(now.setDate(now.getDate() -1)).toDateString() === date.toDateString()) return `Χθες, ${date.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })}`;
  return date.toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

const RecentCallsWidget: React.FC<RecentCallsWidgetProps> = ({ config }) => {
  const callLog = useCallStore(state => state.callLog);
  const contacts = useContactsStore(state => state.contacts);

  const recentCallsToDisplay = useMemo(() => {
    return [...callLog]
      .sort((a, b) => new Date(b.startTime || 0).getTime() - new Date(a.startTime || 0).getTime())
      .slice(0, 3); // Show latest 3 calls
  }, [callLog]);

  const getPartyDisplay = (call: Call): { name: string; number: string } => {
    let partyName = "Άγνωστος";
    let partyNumber = "";

    if (call.direction === 'inbound') {
      partyNumber = call.from;
      if (call.contactId) {
        const contact = contacts.find(c => c.id === call.contactId);
        if (contact) {
            partyName = contact.contactType === 'naturalPerson' 
                ? `${contact.basicIdentity.firstName} ${contact.basicIdentity.lastName}`.trim()
                : contact.name;
        } else {
            partyName = call.contactDisplayName || `Επαφή (${call.contactId.slice(0,4)})`;
        }
      } else {
        partyName = call.contactDisplayName || `Άγνωστος Καλών`;
      }
    } else { // outbound
      partyNumber = call.to;
      if (call.contactId) {
        const contact = contacts.find(c => c.id === call.contactId);
         if (contact) {
            partyName = contact.contactType === 'naturalPerson' 
                ? `${contact.basicIdentity.firstName} ${contact.basicIdentity.lastName}`.trim()
                : contact.name;
        } else {
            partyName = call.contactDisplayName || `Επαφή (${call.contactId.slice(0,4)})`;
        }
      } else {
        partyName = call.contactDisplayName || `Άγνωστος Αριθμός`;
      }
    }
    return { name: partyName, number: partyNumber };
  };


  if (recentCallsToDisplay.length === 0) {
    return (
      <div className="p-2 text-base text-gray-400 flex items-center justify-center h-full">
        Δεν υπάρχουν πρόσφατες κλήσεις.
      </div>
    );
  }

  return (
    <div className="p-1 text-base text-gray-300 h-full">
      <ul className="space-y-1.5">
        {recentCallsToDisplay.map(call => {
          const { name: partyName, number: partyNumber } = getPartyDisplay(call);
          const directionText = call.direction === 'inbound' ? 'Εισερχόμενη' : 'Εξερχόμενη';
          const directionColor = call.direction === 'inbound' ? 'text-green-400' : 'text-sky-400';
          const timestampText = formatCallTimestamp(call.startTime);
          const durationText = formatCallDuration(call.durationSeconds);
          
          let statusIcon: IconName | null = null;
          let statusTooltip = '';
          let statusColor = '';

          if (call.status === 'missed') { 
            statusIcon = 'phoneHangup'; 
            statusTooltip = 'Αναπάντητη'; 
            statusColor = 'text-amber-400';
          } else if (call.status === 'failed') { 
            statusIcon = 'alertTriangle'; 
            statusTooltip = `Αποτυχία: ${call.errorMessage || 'Άγνωστος λόγος'}`; 
            statusColor = 'text-red-400';
          } else if (call.status === 'voicemail') {
            statusIcon = 'dialpad'; // Placeholder icon for voicemail
            statusTooltip = 'Προωθήθηκε στον τηλεφωνητή';
            statusColor = 'text-blue-400';
          } else if (call.status === 'busy') {
            statusIcon = 'phoneHangup'; // Using hangup, could be a different icon for busy
            statusTooltip = 'Κατειλημμένο';
            statusColor = 'text-orange-400';
          }


          return (
            <li key={call.id} className="p-1.5 bg-slate-600 rounded hover:bg-slate-550 transition-colors text-sm">
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center space-x-1.5">
                  <Icon 
                    name={call.direction === 'inbound' ? 'arrowUturnLeft' : 'arrowUturnLeft'} 
                    size="xs" 
                    className={`${directionColor} ${call.direction === 'outbound' ? 'transform -scale-x-100 rotate-180' : 'transform -scale-x-100'}`} 
                  />
                  <span className={`font-medium ${directionColor}`}>{directionText}</span>
                  {statusIcon && (
                    <Tooltip content={statusTooltip} position="top">
                       <button className="appearance-none bg-transparent border-none p-0 cursor-help">
                          <Icon name={statusIcon} size="xs" className={statusColor} />
                       </button>
                    </Tooltip>
                  )}
                </div>
                <span className="text-xs text-gray-400">{timestampText}</span>
              </div>
              <p className="font-normal text-gray-100 truncate" title={`${partyName} (${partyNumber})`}>
                {partyName} <span className="text-xs text-gray-400">({partyNumber})</span>
              </p>
              <div className="flex justify-between items-baseline">
                 <p className="text-xs text-gray-400">Διάρκεια: {durationText}</p>
                 {call.subject && <p className="text-xs text-purple-300 truncate ml-2" title={call.subject}>Θέμα: {call.subject}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RecentCallsWidget;
