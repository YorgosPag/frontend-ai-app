// src/components/ui/AlertBanner.tsx
import React from 'react';
import type { AlertType } from '../../types';
// import Icon from './Icon'; // Θα προστεθεί σε επόμενη φάση
// import Button from './Button'; // Θα προστεθεί σε επόμενη φάση

interface AlertBannerProps {
  type: AlertType;
  message: string;
  title?: string;
  // icon?: React.ReactNode; // Θα προστεθεί σε επόμενη φάση
  // actions?: React.ReactNode; // Θα προστεθεί σε επόμενη φάση
  // onClose?: () => void; // Θα προστεθεί σε επόμενη φάση
  className?: string;
}

const AlertBanner: React.FC<AlertBannerProps> = ({
  type,
  message,
  title,
  className = '',
}) => {
  const baseClasses = 'p-4 border-l-4 rounded-md shadow-md';
  let typeBackgroundBorderClasses = '';
  let titleColorClass = 'text-white'; // Default title color for emphasis
  let messageColorClass = '';

  switch (type) {
    case 'info':
      typeBackgroundBorderClasses = 'bg-sky-800 border-sky-600';
      messageColorClass = 'text-sky-200';
      // titleColorClass is already text-white, good contrast on sky-800
      break;
    case 'success':
      typeBackgroundBorderClasses = 'bg-emerald-800 border-emerald-600';
      messageColorClass = 'text-emerald-200';
      // titleColorClass is text-white, good contrast on emerald-800
      break;
    case 'warning':
      typeBackgroundBorderClasses = 'bg-amber-700 border-amber-500';
      messageColorClass = 'text-amber-100'; // Amber 100 is quite light, good for message
      titleColorClass = 'text-white'; // White on amber-700 has good contrast
      break;
    case 'error':
      typeBackgroundBorderClasses = 'bg-red-800 border-red-600';
      messageColorClass = 'text-red-200';
      // titleColorClass is text-white, good contrast on red-800
      break;
    default: // Fallback, though AlertType should prevent this
      typeBackgroundBorderClasses = 'bg-gray-700 border-gray-500';
      messageColorClass = 'text-gray-200';
      titleColorClass = 'text-gray-50';
  }

  return (
    <div
      role="alert"
      className={`${baseClasses} ${typeBackgroundBorderClasses} ${className}`}
    >
      {/* Wrapper for text content to facilitate alignment with future icons/actions */}
      <div className="flex-grow">
        {title && (
          <h4 className={`text-md font-semibold mb-1 ${titleColorClass}`}>{title}</h4>
        )}
        <p className={`text-sm ${messageColorClass}`}>{message}</p>
      </div>
      {/* Placeholder for Icon - will be added in Phase 2.1.2 */}
      {/* Placeholder for Close Button - will be added in Phase 2.1.2 */}
      {/* Placeholder for Actions - will be added in Phase 2.1.2 */}
    </div>
  );
};

export default AlertBanner;