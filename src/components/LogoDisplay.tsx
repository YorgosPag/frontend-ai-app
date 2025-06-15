
// src/components/LogoDisplay.tsx
import React, { useState } from 'react';

interface LogoDisplayProps {
  logoUrl: string;
  altText: string;
  maxWidthClass?: string; 
  maxHeightClass?: string; 
  containerClasses?: string;
  className?: string; // Επιτρέπει τη μεταβίβαση επιπλέον γενικών κλάσεων στον περιέκτη
}

const LogoDisplay: React.FC<LogoDisplayProps> = ({
  logoUrl,
  altText,
  maxWidthClass = 'max-w-20', 
  maxHeightClass = 'max-h-16', 
  containerClasses = 'w-20 h-16 flex items-center justify-center overflow-hidden',
  className = '' // Προσθήκη του className στις props
}) => {
  const [hasError, setHasError] = useState(false);

  if (!logoUrl) {
    return null; 
  }
  
  // Συνδυασμός του containerClasses και του προαιρετικού className
  const combinedContainerClasses = `${containerClasses} ${className}`;

  if (hasError) {
    return (
      <div className={`${combinedContainerClasses} flex items-center justify-center`}> {/* Εφαρμογή συνδυασμένων κλάσεων */}
        <p className="text-xs text-red-400 text-center" aria-live="polite">
          Δεν φορτώθηκε: {altText ? altText.substring(0,15) : 'Λογότυπο'}...
        </p>
      </div>
    );
  }

  return (
    <div className={combinedContainerClasses}> {/* Εφαρμογή συνδυασμένων κλάσεων */}
      <img
        src={logoUrl}
        alt={altText}
        className={`${maxWidthClass} ${maxHeightClass} object-contain`}
        onError={() => {
          setHasError(true);
        }}
      />
    </div>
  );
};

export default LogoDisplay;