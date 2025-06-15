// src/components/ui/Textarea.tsx
import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  hasError?: boolean;
  hasWarning?: boolean; // New prop for warning state
  hasSuccess?: boolean; // New prop for success state
  'data-testid'?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', hasError, hasWarning, hasSuccess, ...props }, ref) => {
    const baseClasses = "font-[var(--font-sans)] text-[var(--font-size-sm)] w-full p-3 bg-gray-800 text-gray-200 border rounded-md focus:ring-2 placeholder-gray-500 resize-y transition-colors duration-150 ease-in-out"; // Added transition
    
    let statefulClasses = "border-gray-600 focus:ring-purple-500 focus:border-purple-500"; // Default
    if (hasError) {
      statefulClasses = "border-red-500 focus:ring-red-500 focus:border-red-500";
    } else if (hasWarning) {
      statefulClasses = "border-amber-500 focus:ring-amber-500 focus:border-amber-500";
    } else if (hasSuccess) {
      statefulClasses = "border-green-500 focus:ring-green-500 focus:border-green-500";
    }
    
    return (
      <textarea
        className={`${baseClasses} ${statefulClasses} ${className}`}
        ref={ref}
        data-testid={props['data-testid'] || props.id || props.name}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;