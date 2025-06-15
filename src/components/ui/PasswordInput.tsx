// src/components/ui/PasswordInput.tsx
import React, { useState } from 'react';
import Input from './Input';
import type { InputProps } from './Input'; // Import InputProps type
import Icon from './Icon';
import { uiStrings } from '../../config/translations'; // For aria-labels

interface PasswordInputProps extends Omit<InputProps, 'type' | 'endIcon'> {
  // endIcon is controlled internally, type is always 'password' or 'text'
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = () => {
      setShowPassword(!showPassword);
    };

    const iconName = showPassword ? 'eyeSlash' : 'eye';
    const ariaLabel = showPassword ? uiStrings.hidePasswordButtonLabel || "Hide password" : uiStrings.showPasswordButtonLabel || "Show password";

    const endIconContent = (
      <button
        type="button"
        onClick={toggleShowPassword}
        className="text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-500 rounded-md p-0.5"
        aria-label={ariaLabel}
      >
        <Icon name={iconName} size="sm" />
      </button>
    );

    return (
      <Input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        endIcon={endIconContent}
        className={className}
        {...props}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
export default PasswordInput;

// Add relevant uiStrings keys to translations if they don't exist
// uiStrings.showPasswordButtonLabel = "Show password";
// uiStrings.hidePasswordButtonLabel = "Hide password";