// src/components/ui/contactCard/contactCardUtils.ts
import type { Contact } from '../../../types';
import { contactTypeTranslations, roleTranslations } from '../../../config/translations';

export interface ContactDisplayDetails {
  displayName: string;
  nicknameDisplay: string;
  translatedContactType: string;
  translatedRoles: string;
  shouldUseLogoDisplay: boolean;
}

export function getContactDisplayDetails(contact: Contact): ContactDisplayDetails {
  const displayName = contact.contactType === 'naturalPerson'
    ? `${contact.basicIdentity.firstName} ${contact.basicIdentity.lastName}`.trim()
    : contact.name;

  const nicknameDisplay = contact.contactType === 'naturalPerson' && contact.basicIdentity.nickname
    ? ` (${contact.basicIdentity.nickname})`
    : '';

  const translatedContactType = contactTypeTranslations[contact.contactType] || contact.contactType;
  
  const translatedRoles = contact.roles && contact.roles.length > 0
    ? contact.roles.map(role => roleTranslations[role] || role).join(', ')
    : '';

  const shouldUseLogoDisplay = (contact.contactType === 'legalEntity' || contact.contactType === 'publicService') && !!contact.avatarUrl;

  return {
    displayName,
    nicknameDisplay,
    translatedContactType,
    translatedRoles,
    shouldUseLogoDisplay,
  };
}
