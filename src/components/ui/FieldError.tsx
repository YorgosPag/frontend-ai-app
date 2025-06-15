// src/components/ui/FieldError.tsx
import React from 'react';

interface FieldErrorProps {
  errors?: string[] | string;
  className?: string;
}

const FieldError: React.FC<FieldErrorProps> = ({ errors, className = '' }) => {
  if (!errors || (Array.isArray(errors) && errors.length === 0)) {
    return null;
  }

  const errorMessages = Array.isArray(errors) ? errors : [errors];

  return (
    <div className={`mt-1 text-xs text-red-400 ${className}`} role="alert">
      {errorMessages.map((error, index) => (
        <p key={index}>{error}</p>
      ))}
    </div>
  );
};

export default FieldError;