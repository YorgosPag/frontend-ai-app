// src/components/ui/Select.tsx
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
  hasError?: boolean;
  hasWarning?: boolean; // New prop for warning state
  hasSuccess?: boolean; // New prop for success state
  'data-testid'?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', children, hasError, hasWarning, hasSuccess, ...props }, ref) => {
    const baseClasses = "font-[var(--font-sans)] text-[var(--font-size-sm)] w-full p-3 bg-gray-800 text-gray-200 border rounded-md focus:ring-2 placeholder-gray-500 transition-colors duration-150 ease-in-out"; // Added transition
    
    let statefulClasses = "border-gray-600 focus:ring-purple-500 focus:border-purple-500"; // Default
    if (hasError) {
      statefulClasses = "border-red-500 focus:ring-red-500 focus:border-red-500";
    } else if (hasWarning) {
      statefulClasses = "border-amber-500 focus:ring-amber-500 focus:border-amber-500";
    } else if (hasSuccess) {
      statefulClasses = "border-green-500 focus:ring-green-500 focus:border-green-500";
    }
        
    const selectSpecificClasses = "appearance-none bg-no-repeat bg-right pr-8";


    return (
      <div className="relative">
        <select
          className={`${baseClasses} ${statefulClasses} ${selectSpecificClasses} ${className}`}
          ref={ref}
          data-testid={props['data-testid'] || props.id || props.name}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;