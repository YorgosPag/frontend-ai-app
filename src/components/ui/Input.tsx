// src/components/ui/Input.tsx
import React, { useState } from 'react';
import Icon from './Icon'; // Ensure Icon is imported, especially for CloseIcon

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  hasError?: boolean;
  hasWarning?: boolean; // New prop for warning state
  hasSuccess?: boolean; // New prop for success state
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  clearable?: boolean; // New prop for clear button
  onClear?: () => void; // Callback for clear button
  'data-testid'?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className = '', 
    type = 'text', 
    hasError, 
    hasWarning,
    hasSuccess,
    startIcon, 
    endIcon, 
    clearable,
    onClear,
    value, // Value is needed to determine if clear button should show
    onFocus,
    onBlur,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const showClearButton = clearable && value && (isFocused || isHovered);

    let currentEndIcon = endIcon;
    let effectiveEndIconPadding = "pr-3"; // Default padding if only text or startIcon

    if (showClearButton && endIcon) {
      effectiveEndIconPadding = "pr-16"; // Space for clear button and endIcon
    } else if (showClearButton) {
      effectiveEndIconPadding = "pr-10"; // Space for clear button only
    } else if (endIcon) {
      effectiveEndIconPadding = "pr-10"; // Space for endIcon only
    }
    
    let dynamicPaddingClasses = `py-3 ${startIcon ? 'pl-10' : 'pl-3'} ${effectiveEndIconPadding}`;

    const commonInputClasses = "font-[var(--font-sans)] text-[var(--font-size-sm)] w-full bg-gray-800 text-gray-200 border rounded-md placeholder-gray-500 transition-colors duration-150 ease-in-out"; // Added transition
    
    let statefulClasses = "border-gray-600 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"; // Default
    if (hasError) {
      statefulClasses = "border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500";
    } else if (hasWarning) {
      statefulClasses = "border-amber-500 focus:ring-1 focus:ring-amber-500 focus:border-amber-500";
    } else if (hasSuccess) {
      statefulClasses = "border-green-500 focus:ring-1 focus:ring-green-500 focus:border-green-500";
    }

    const combinedInputClasses = `${commonInputClasses} ${dynamicPaddingClasses} ${statefulClasses} ${className}`;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (onFocus) onFocus(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (onBlur) onBlur(e);
    };
    
    const handleClearClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault(); 
      if (onClear) {
        onClear();
      }
      if (typeof ref === 'object' && ref?.current) {
        ref.current.focus();
      }
    };

    return (
      <div 
        className="relative w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {startIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            {startIcon}
          </div>
        )}
        <input
          type={type}
          className={combinedInputClasses}
          ref={ref}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          data-testid={props['data-testid'] || props.id || props.name}
          {...props}
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          {showClearButton && (
            <button
              type="button"
              onClick={handleClearClick}
              className={`p-1 mr-2 text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-full`}
              aria-label="Clear input"
              tabIndex={-1} 
            >
              <Icon name="close" size="sm" />
            </button>
          )}
          {currentEndIcon && (
            <div className="flex items-center pr-3 text-gray-400">
              {currentEndIcon}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;