// src/components/ui/contactCard/ContactInfoDisplay.tsx
import React from 'react';
import toast from 'react-hot-toast';
import type { Contact, ContactPhoneNumber, Role } from '../../../types';
import { uiStrings, roleTranslations } from '../../../config/translations';
import Icon from '../../ui/Icon';
import ContactPhoneDisplayList from '../../info/phone/ContactPhoneDisplayList';
import TaxInfoDisplay from '../../info/TaxInfoDisplay';
import SocialMediaLinksDisplay from '../../info/SocialMediaLinksDisplay';
import AddressDisplay from '../../info/AddressDisplay';
import IdentityInfoDisplay from '../../info/IdentityInfoDisplay';
import ProfessionalInfoDisplay from '../../info/ProfessionalInfoDisplay';
import PropertyAttributesDisplay from '../../info/PropertyAttributesDisplay';
import LegalEntityInfoDisplay from '../../info/LegalEntityInfoDisplay';
import PublicServiceInfoDisplay from '../../info/PublicServiceInfoDisplay';
import { useContactsStore } from '../../../stores/contactsStore';

interface ContactInfoDisplayProps {
  contact: Contact;
  onStartCall?: (phoneNumber: ContactPhoneNumber) => void;
}

const ContactInfoDisplay: React.FC<ContactInfoDisplayProps> = React.memo(({ contact, onStartCall }) => {
  const addRoleToContact = useContactsStore(state => state.addRoleToContact);

  const handleSuggestedCategoryClick = (category: string) => {
    const isValidRole = Object.keys(roleTranslations).includes(category);

    if (isValidRole) {
      addRoleToContact(contact.id, category as Role);
      toast.success(uiStrings.aiCategoryAddSuccess(roleTranslations[category as Role] || category));
    } else {
      toast(uiStrings.aiCategoryNotStandardRole(category), { icon: 'ℹ️' });
    }
  };

  return (
    <div className="space-y-1">
      <h4 className="text-[var(--font-size-sm)] font-[var(--font-weight-semibold)] text-gray-300 mb-1 mt-2">
        {uiStrings.contactInfoSectionTitle}:
      </h4>
      <div className="pl-2 border-l-2 border-gray-700 space-y-1">
        <p className="flex items-center text-gray-300 text-[var(--font-size-sm)]">
          <Icon name="email" size="sm" className="mr-2 text-blue-400 flex-shrink-0" />
          {contact.email ? (
            <a
              href={`mailto:${contact.email}`}
              className="hover:underline text-blue-300 break-all"
              title={`${uiStrings.emailLabel}: ${contact.email}`}
            >
              {contact.email}
            </a>
          ) : (
            <span className="text-gray-500 text-[var(--font-size-xs)]"> {uiStrings.noEmail} </span>
          )}
        </p>
        <ContactPhoneDisplayList
          phoneNumbers={contact.contactPhoneNumbers || []}
          uiStrings={uiStrings}
          className="py-1"
          onStartCall={onStartCall}
        />
      </div>

      {contact.contactType === 'naturalPerson' && (
        <>
          <IdentityInfoDisplay contact={contact} />
          <ProfessionalInfoDisplay contact={contact} />
          <PropertyAttributesDisplay contact={contact} />
        </>
      )}
      {contact.contactType === 'legalEntity' && <LegalEntityInfoDisplay contact={contact} />}
      {contact.contactType === 'publicService' && <PublicServiceInfoDisplay contact={contact} />}

      <TaxInfoDisplay taxInfo={contact.taxInfo} />
      <AddressDisplay addresses={contact.addresses} />
      <SocialMediaLinksDisplay links={contact.socialMediaLinks} />

      {/* Display AI Suggested Categories */}
      {contact.suggestedCategories && contact.suggestedCategories.length > 0 && (
        <div className="mt-2">
          <h4 className="text-[var(--font-size-sm)] font-[var(--font-weight-semibold)] text-gray-300 mb-1 flex items-center">
            <Icon name="sparkles" size="sm" className="mr-1.5 text-yellow-400 flex-shrink-0" />
            {uiStrings?.aiSuggestedCategoriesCardLabel || "AI Προτεινόμενες Κατηγορίες"}:
          </h4>
          <div className="pl-2 border-l-2 border-gray-700 space-y-0.5">
            <div className="flex flex-wrap gap-1.5">
              {contact.suggestedCategories.map((category, index) => {
                const isStandardRole = Object.keys(roleTranslations).includes(category);
                const buttonStyle = isStandardRole
                  ? "bg-green-700 hover:bg-green-600 text-green-100"
                  : "bg-slate-600 hover:bg-slate-500 text-gray-200";
                const buttonTitle = isStandardRole
                  ? `Προσθήκη του ρόλου '${roleTranslations[category as Role] || category}'`
                  : `Η κατηγορία '${category}' δεν είναι τυπικός ρόλος`;

                return (
                  <button
                    key={index}
                    onClick={() => handleSuggestedCategoryClick(category)}
                    className={`text-xs px-2 py-0.5 rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center space-x-1 ${buttonStyle}`}
                    title={buttonTitle}
                  >
                    {isStandardRole && <Icon name="plus" size="xs" className="opacity-70" />}
                    <span>{isStandardRole ? (roleTranslations[category as Role] || category) : category}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
ContactInfoDisplay.displayName = 'ContactInfoDisplay';
export default ContactInfoDisplay;