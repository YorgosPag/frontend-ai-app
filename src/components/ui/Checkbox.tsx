// src/components/ui/Checkbox.tsx
import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelClassName?: string;
  checkboxClassName?: string;
  containerClassName?: string;
  'data-testid'?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, id, labelClassName = '', checkboxClassName = '', containerClassName = 'flex items-center', ...props }, ref) => {
    const baseCheckboxClasses = "h-4 w-4 text-purple-600 border-gray-500 rounded focus:ring-purple-500 transition-colors duration-150 ease-in-out"; // Added transition
    const baseLabelClasses = "ml-2 text-sm font-medium text-gray-300";

    return (
      <div className={containerClassName}>
        <input
          type="checkbox"
          id={id}
          className={`${baseCheckboxClasses} ${checkboxClassName}`}
          ref={ref}
          data-testid={props['data-testid'] || id || props.name}
          {...props}
        />
        {label && (
          <label htmlFor={id} className={`${baseLabelClasses} ${labelClassName}`}>
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
export default Checkbox;