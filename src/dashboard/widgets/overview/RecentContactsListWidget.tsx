// src/dashboard/widgets/overview/RecentContactsListWidget.tsx
import React, { useMemo } from 'react';
import type { DashboardWidgetConfig } from '../widgetBaseComponents'; // Updated import
import { useContactsStore } from '../../../stores/contactsStore';
import { useUIStore } from '../../../stores/uiStore';
import Avatar from '../../../components/Avatar';
import LogoDisplay from '../../../components/LogoDisplay';
import Icon from '../../../components/ui/Icon';
import { uiStrings } from '../../../config/translations';

interface RecentContactsListWidgetProps {
  config: DashboardWidgetConfig;
}

const formatRelativeTime = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  if (diffSeconds < 60) return `πριν ${diffSeconds}δ`;
  if (diffMinutes < 60) return `πριν ${diffMinutes}λ`;
  if (diffHours < 24) return `πριν ${diffHours}ώ`;
  if (diffDays === 1) return `Χθες`;
  if (diffDays < 7) return `πριν ${diffDays} ημέρες`;
  return date.toLocaleDateString('el-GR', { day: '2-digit', month: 'short' });
};

const RecentContactsListWidget: React.FC<RecentContactsListWidgetProps> = ({ config }) => {
  const allContacts = useContactsStore(state => state.contacts);
  const setActiveView = useUIStore(state => state.setActiveView);
  const setSelectedContactId = useUIStore(state => state.setSelectedContactId);
  const setCurrentFormMode = useUIStore(state => state.setCurrentFormMode);

  const recentContacts = useMemo(() => {
    return [...allContacts]
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [allContacts]);

  const handleContactClick = (contactId: string) => {
    setActiveView('contacts');
    setSelectedContactId(contactId);
    setCurrentFormMode(null);
  };

  if (recentContacts.length === 0) {
    return (
      <div className="p-2 text-base text-gray-400 flex items-center justify-center h-full"> {/* text-sm to text-base */}
        {uiStrings.noContactsYet || 'Δεν υπάρχουν επαφές.'}
      </div>
    );
  }

  return (
    <div className="p-1 text-base text-gray-300 h-full"> {/* text-sm to text-base */}
      <ul className="space-y-1.5">
        {recentContacts.map(contact => {
          const displayName = contact.contactType === 'naturalPerson'
            ? `${contact.basicIdentity.firstName} ${contact.basicIdentity.lastName}`.trim()
            : contact.name;
          
          const shouldUseLogoDisplay = (contact.contactType === 'legalEntity' || contact.contactType === 'publicService') && contact.avatarUrl;
          const lastUpdatedTimestamp = contact.updatedAt || contact.createdAt;

          return (
            <li key={contact.id}>
              <button
                onClick={() => handleContactClick(contact.id)}
                className="w-full text-left p-1.5 bg-slate-600 rounded hover:bg-slate-550 transition-colors duration-150 flex items-center space-x-2 focus:outline-none focus:ring-1 focus:ring-purple-400"
                aria-label={`Προβολή ${displayName}`}
              >
                {shouldUseLogoDisplay ? (
                  <LogoDisplay
                    logoUrl={contact.avatarUrl!}
                    altText={displayName}
                    containerClasses="w-9 h-9 flex items-center justify-center overflow-hidden rounded-md flex-shrink-0" // w-8 h-8 to w-9 h-9
                    maxWidthClass="max-w-9" // max-w-8 to max-w-9
                    maxHeightClass="max-h-9" // max-h-8 to max-h-9
                  />
                ) : (
                  <Avatar
                    name={displayName}
                    avatarUrl={contact.avatarUrl}
                    sizeClasses="w-9 h-9 rounded-full flex-shrink-0" // w-8 h-8 to w-9 h-9
                    textClasses="text-sm" // text-xs to text-sm
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-100 truncate text-base" title={displayName}> {/* text-sm to text-base */}
                    {displayName}
                  </p>
                  {lastUpdatedTimestamp && (
                     <p className="text-sm text-gray-400"> {/* text-xs to text-sm */}
                        Ενημερώθηκε: {formatRelativeTime(lastUpdatedTimestamp)}
                     </p>
                  )}
                </div>
                <Icon name="chevronDoubleRight" size="sm" className="text-gray-500 flex-shrink-0 opacity-70" /> {/* size xs to sm */}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RecentContactsListWidget;
