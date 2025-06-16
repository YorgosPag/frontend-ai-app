// src/components/info/AddressDisplay.tsx
import React from 'react';
import type { Address } from '../../types';
import { uiStrings } from '../../config/translations'; // Για ετικέτες τύπου διεύθυνσης αν χρειαστεί

interface AddressDisplayProps {
  addresses?: Address[];
}

const AddressDisplay: React.FC<AddressDisplayProps> = React.memo(({ addresses }) => {
  if (!addresses || addresses.length === 0) {
    return <p className="text-xs text-gray-500 mt-1">{uiStrings.noAddresses}</p>;
  }

  return (
    <div className="mt-2">
      <h4 className="text-sm font-semibold text-gray-300 mb-1">{uiStrings.addressesSectionTitle}:</h4>
      {addresses.map((address, index) => (
        <div key={index} className="text-xs text-gray-400 mb-1 pl-2 border-l-2 border-gray-700">
          <p>
            {address.street} {address.number}, {address.postalCode} {address.city}
            {address.isPrimary && <span className="ml-1 text-purple-400" title={uiStrings.primaryAddressTooltip}>*</span>}
          </p>
          {(address.area || address.municipality || address.prefecture || address.country !== 'ΕΛΛΑΔΑ') && ( // Display more details if available or not default
            <p>
              {address.area && `${address.area}, `}
              {address.municipality && `${address.municipality}, `}
              {address.prefecture && `${address.prefecture}, `}
              {address.country}
            </p>
          )}
          {address.addressType && <p className="italic text-gray-500">({address.addressType})</p>}
        </div>
      ))}
    </div>
  );
});
AddressDisplay.displayName = 'AddressDisplay';
export default AddressDisplay;