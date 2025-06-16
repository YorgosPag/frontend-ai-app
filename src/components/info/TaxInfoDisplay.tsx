// src/components/info/TaxInfoDisplay.tsx
import React from 'react';
import type { BaseContact } from '../../types';
import { uiStrings } from '../../config/translations';

interface TaxInfoDisplayProps {
  taxInfo?: BaseContact['taxInfo'];
}

const TaxInfoDisplay: React.FC<TaxInfoDisplayProps> = React.memo(({ taxInfo }) => {
  if (!taxInfo || (!taxInfo.afm && !taxInfo.doy)) {
    return null;
  }

  return (
    <div className="mt-2">
        <h4 className="text-sm font-semibold text-gray-300 mb-0.5">{uiStrings.taxInfoCardLabel}:</h4>
        <div className="pl-2 border-l-2 border-gray-700 space-y-0.5 text-xs text-gray-400">
            {taxInfo.afm && <p>ΑΦΜ: {taxInfo.afm}</p>}
            {taxInfo.doy && <p>ΔΟΥ: {taxInfo.doy}</p>}
        </div>
    </div>
  );
});
TaxInfoDisplay.displayName = 'TaxInfoDisplay';
export default TaxInfoDisplay;