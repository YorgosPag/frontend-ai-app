
// src/components/info/PropertyAttributesDisplay.tsx
import React from 'react';
import type { NaturalPersonContact } from '../../types';
import { uiStrings } from '../../config/translations';

interface PropertyAttributesDisplayProps {
  contact: NaturalPersonContact;
}

const AttributeItem: React.FC<{ label: string; checked?: boolean }> = ({ label, checked }) => {
  if (checked === undefined) return null; // Don't render if not explicitly set
  return (
    <p className={`text-xs ${checked ? 'text-green-400' : 'text-red-400'}`}>
      <span className="font-semibold">{label}:</span> {checked ? 'Ναι' : 'Όχι'}
    </p>
  );
};


const PropertyAttributesDisplay: React.FC<PropertyAttributesDisplayProps> = ({ contact }) => {
  const { propertyAttributes } = contact;

  if (!propertyAttributes || 
      (propertyAttributes.isPropertyOwner === undefined &&
       propertyAttributes.isLandParcelOwner === undefined &&
       propertyAttributes.isTenant === undefined &&
       propertyAttributes.isProspectiveBuyer === undefined &&
       propertyAttributes.isProspectiveSeller === undefined)) {
    return null;
  }
  
  const hasAnyAttribute = Object.values(propertyAttributes).some(val => val !== undefined);
  if (!hasAnyAttribute) return null;


  return (
    <div className="mt-2">
      <h4 className="text-sm font-semibold text-gray-300 mb-1">{uiStrings.propertyAttributesSectionTitle}:</h4>
      <div className="pl-2 border-l-2 border-gray-700 space-y-0.5">
        <AttributeItem label={uiStrings.isPropertyOwnerLabel} checked={propertyAttributes.isPropertyOwner} />
        <AttributeItem label={uiStrings.isLandParcelOwnerLabel} checked={propertyAttributes.isLandParcelOwner} />
        <AttributeItem label={uiStrings.isTenantLabel} checked={propertyAttributes.isTenant} />
        <AttributeItem label={uiStrings.isProspectiveBuyerLabel} checked={propertyAttributes.isProspectiveBuyer} />
        <AttributeItem label={uiStrings.isProspectiveSellerLabel} checked={propertyAttributes.isProspectiveSeller} />
      </div>
    </div>
  );
};

export default PropertyAttributesDisplay;