// src/components/info/phone/ContactPhoneDisplayList.tsx
import React from 'react';
import type { ContactPhoneNumber, PhoneProtocol } from '../../../types';
import type { UIStringsType } from '../../../config/translations';
import { phoneTypeTranslations } from '../../../config/translations';
import { getDialableLink } from '../../../utils/phoneUtils';
import Icon from '../../ui/Icon';
import Tooltip from '../../ui/Tooltip';
import type { IconName } from '../../../types/iconTypes';

interface ContactPhoneDisplayListProps {
  phoneNumbers: ContactPhoneNumber[];
  uiStrings: UIStringsType;
  className?: string;
  onStartCall?: (phoneNumber: ContactPhoneNumber) => void; // Νέα prop
}

const ContactPhoneDisplayList: React.FC<ContactPhoneDisplayListProps> = React.memo(({
  phoneNumbers,
  uiStrings,
  className = '',
  onStartCall, // Νέα prop
}) => {
  if (!phoneNumbers || phoneNumbers.length === 0) {
    return (
      <div className={`flex items-center text-gray-400 text-sm ${className}`}>
        <Icon name="phone" size="sm" className="mr-2 text-gray-500 flex-shrink-0" />
        <span className="text-gray-500 text-xs">{uiStrings.noPhone}</span>
      </div>
    );
  }

  const getProtocolIconAndTooltip = (protocol: PhoneProtocol): { iconName: IconName; tooltip: string } => {
    switch (protocol) {
      case 'voice':
        return { iconName: 'phone', tooltip: uiStrings.tooltipCall || 'Call' };
      case 'sms':
        return { iconName: 'email', tooltip: uiStrings.tooltipSms || 'Send SMS' }; // Using email as placeholder for message
      case 'whatsapp':
        return { iconName: 'whatsApp', tooltip: uiStrings.tooltipWhatsApp || 'WhatsApp' };
      case 'viber':
        return { iconName: 'viber', tooltip: uiStrings.tooltipViber || 'Viber' };
      case 'telegram':
        return { iconName: 'telegram', tooltip: uiStrings.tooltipTelegram || 'Telegram' };
      case 'signal':
        return { iconName: 'phone', tooltip: uiStrings.tooltipSignal || 'Signal' }; // Using phone as placeholder
      default:
        return { iconName: 'phone', tooltip: protocol };
    }
  };

  return (
    <ul className={`space-y-1.5 ${className}`}>
      {phoneNumbers.map((pn) => {
        const mainDialLink = getDialableLink(pn, 'voice');
        const translatedType = phoneTypeTranslations[pn.type] || pn.type;
        const canDialViaSystem = pn.voipIntegrationDetails?.canDialViaSystem === true;

        return (
          <li key={pn.id} className="text-sm text-gray-300">
            <div className="flex items-center space-x-2">
              {pn.isPrimary && (
                <Tooltip content={uiStrings.primaryPhoneTooltip || 'Primary Phone'} position="top" offsetValue={4}>
                  <span className="text-purple-400 text-xs font-semibold">*</span>
                </Tooltip>
              )}
              {mainDialLink ? (
                <a
                  href={mainDialLink}
                  className="hover:underline text-green-300 break-all"
                  title={`${uiStrings.phoneTypeLabel}: ${translatedType}, ${pn.number}`}
                >
                  {pn.number}
                </a>
              ) : (
                <span className="text-green-300 break-all">{pn.number}</span>
              )}
              <span className="text-xs text-gray-500">({translatedType})</span>
              {onStartCall && canDialViaSystem && (
                <Tooltip content={`Κλήση VoIP (${pn.number})`} position="top" offsetValue={4}>
                  <button
                    onClick={() => onStartCall(pn)}
                    className="p-0.5 text-purple-400 hover:text-purple-300 transition-colors duration-150"
                    aria-label={`VoIP κλήση ${pn.number}`}
                  >
                    <Icon name="phone" size="xs" />
                  </button>
                </Tooltip>
              )}
            </div>

            {(pn.label || pn.extension) && (
              <div className="pl-4 text-xs text-gray-400">
                {pn.label && <span>{pn.label}</span>}
                {pn.label && pn.extension && <span className="mx-1">-</span>}
                {pn.extension && <span>{uiStrings.extensionLabel || 'Ext.'}: {pn.extension}</span>}
              </div>
            )}
            
            {pn.protocols && pn.protocols.length > 0 && (
              <div className="pl-4 mt-0.5 flex items-center space-x-2.5">
                {pn.protocols.map((protocol) => {
                  const { iconName, tooltip } = getProtocolIconAndTooltip(protocol);
                  const protocolLink = getDialableLink(pn, protocol);
                  
                  if (!protocolLink || protocol === 'voice') return null; // Don't show separate voice icon if main link is voice

                  return (
                    <Tooltip key={protocol} content={tooltip} position="bottom" offsetValue={6}>
                      <a
                        href={protocolLink}
                        target={protocol === 'whatsapp' || protocol === 'telegram' || protocol === 'viber' ? '_blank' : undefined}
                        rel={protocol === 'whatsapp' || protocol === 'telegram' || protocol === 'viber' ? 'noopener noreferrer' : undefined}
                        className="text-gray-400 hover:text-purple-300 transition-colors duration-150"
                        aria-label={`${tooltip} ${pn.number}`}
                      >
                        <Icon name={iconName} size="xs" />
                      </a>
                    </Tooltip>
                  );
                })}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
});
ContactPhoneDisplayList.displayName = 'ContactPhoneDisplayList';
export default ContactPhoneDisplayList;