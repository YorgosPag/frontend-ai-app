// src/utils/phoneUtils.ts
import React from 'react';
import type { ContactPhoneNumber, PhoneType, PhoneProtocol } from '../types';
// Icon-related imports are removed as JSX is no longer used here.

/**
 * Formats a phone number for display, including label, extension, and optionally protocol information as text.
 */
export const formatPhoneNumberForDisplay = (
  phoneNumber: ContactPhoneNumber,
  options?: { locale?: string; showProtocolIcons?: boolean } // showProtocolIcons will now show text
): string | React.ReactNode => { // Return type remains for compatibility, though it will always be string now
  let displayString = phoneNumber.number;

  if (phoneNumber.extension) {
    displayString += ` (εσωτ. ${phoneNumber.extension})`;
  }
  if (phoneNumber.label) {
    displayString += ` - ${phoneNumber.label}`;
  }

  if (options?.showProtocolIcons && phoneNumber.protocols && phoneNumber.protocols.length > 0) {
    const protocolStrings = phoneNumber.protocols.map((protocol: PhoneProtocol): string => {
      switch (protocol) {
        case 'whatsapp': return ' (WhatsApp)';
        case 'viber': return ' (Viber)';
        case 'telegram': return ' (Telegram)';
        case 'signal': return ' (Signal)';
        case 'sms': return ' (SMS)';
        case 'voice': return ''; // Often implied
        default:
          // This ensures that if new protocols are added, they are handled.
          const exhaustiveCheck: never = protocol;
          return ` (${exhaustiveCheck})`;
      }
    }).join('');

    if (protocolStrings.trim() !== '') {
      return displayString + protocolStrings;
    }
  }

  return displayString;
};

/**
 * Normalizes a phone number for storage, attempting to convert it to E.164-like format.
 * Primarily handles Greek numbers by default if countryCode is "+30".
 */
export const normalizePhoneNumberForStorage = (
  input: string,
  countryCode: string = "+30" // Default to Greece for this project's context
): string => {
  if (!input?.trim()) {
    return '';
  }

  // Remove common non-digit characters except '+' if it's at the beginning.
  let cleanedInput = input.trim().replace(/[\s\(\)-]/g, '');

  if (countryCode === "+30") { // Specific logic for Greece
    if (cleanedInput.startsWith("+30")) {
      // Already in good shape, just ensure no other non-digits
      return "+" + cleanedInput.substring(1).replace(/\D/g, '');
    }
    if (cleanedInput.startsWith("0030")) {
      return "+30" + cleanedInput.substring(4).replace(/\D/g, '');
    }
    const digitsOnly = cleanedInput.replace(/\D/g, '');
    if (digitsOnly.startsWith("30")) { // e.g. 3069...
        return "+" + digitsOnly;
    }
    if (digitsOnly.startsWith("69") || digitsOnly.startsWith("2")) { // Greek mobile or landline
      return "+30" + digitsOnly;
    }
    // If it's something else, return it cleaned but without forcing +30
    return cleanedInput;
  } else {
    // Generic approach for other country codes
    if (cleanedInput.startsWith(countryCode)) {
      return cleanedInput;
    }
    const digitsOnly = cleanedInput.replace(/\D/g, '');
    if (digitsOnly.startsWith(countryCode.substring(1))) { // e.g. number is "1..." and countryCode is "+1"
        return "+" + digitsOnly;
    }
    return countryCode + digitsOnly;
  }
};


/**
 * Generates a dialable link (tel:, viber://, etc.) for a phone number.
 */
export const getDialableLink = (
  phoneNumber: ContactPhoneNumber,
  specificProtocol?: PhoneProtocol
): string | null => {
  if (!phoneNumber.number) {
    return null;
  }

  // Use the stored number directly if it's already E.164, otherwise normalize
  // For links, E.164 without '+' is often needed for apps like WhatsApp/Viber
  const normalizedForAppLinks = phoneNumber.number.startsWith('+')
    ? phoneNumber.number.substring(1)
    : phoneNumber.number.replace(/\D/g, ''); // Fallback: strip non-digits

  const protocolToUse = specificProtocol || phoneNumber.protocols?.[0] || 'voice';

  switch (protocolToUse) {
    case 'voice':
      return `tel:${phoneNumber.number}`; // tel: protocol usually handles '+' correctly
    case 'sms':
      return `sms:${phoneNumber.number}`; // sms: protocol also usually handles '+'
    case 'whatsapp':
      return `https://wa.me/${normalizedForAppLinks}`;
    case 'viber':
      // Viber call link: viber://call?number=+NUMBER or viber://chat?number=NUMBER
      return `viber://chat?number=${normalizedForAppLinks}`;
    case 'telegram':
      // For Telegram, usernames are more common, but direct call/chat via number exists
      return `https://t.me/+${normalizedForAppLinks}`; // Assumes number includes country code
    case 'signal':
      // Signal protocol: sgnl://signal.me/#p/+<E.164_number_without_plus>
      // This is a common pattern, but verify with official Signal URI schemes if available.
      return `sgnl://signal.me/#p/${normalizedForAppLinks}`;
    default:
      // Fallback for unknown or unhandled protocols
      return `tel:${phoneNumber.number}`;
  }
};

/**
 * Finds a primary phone number from a list, optionally filtering by type and/or protocol.
 */
export const findPrimaryPhoneNumber = (
  phoneNumbers: ContactPhoneNumber[] | undefined,
  targetType?: PhoneType,
  targetProtocol?: PhoneProtocol
): ContactPhoneNumber | null => {
  if (!phoneNumbers || phoneNumbers.length === 0) {
    return null;
  }

  let candidates = phoneNumbers;

  if (targetType) {
    candidates = candidates.filter(pn => pn.type === targetType);
  }

  if (targetProtocol) {
    candidates = candidates.filter(pn => pn.protocols?.includes(targetProtocol));
  }

  const primary = candidates.find(pn => pn.isPrimary);
  if (primary) {
    return primary;
  }

  // If no primary is found for the specific criteria, return the first match (if any)
  return candidates.length > 0 ? candidates[0] : null;
};
