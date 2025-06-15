// src/components/ui/Radio.tsx
import React, { useId } from 'react';

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  // id is inherited via InputHTMLAttributes, but we make it explicit for label association logic
  // name is inherited
  // value is inherited
  label: string;
  // checked is inherited
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void; // Standard HTML onchange
  // disabled is inherited
  className?: string; // For the outermost div wrapper
  labelClassName?: string;
  radioWrapperClassName?: string; // For the styled span that looks like a radio
  radioDotClassName?: string; // For the inner dot of the styled radio
  'data-testid'?: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      id: providedId,
      name,
      value,
      label,
      checked,
      onChange,
      disabled,
      className = '',
      labelClassName = '',
      radioWrapperClassName = '',
      radioDotClassName = '',
      'data-testid': dataTestId,
      ...rest
    },
    ref
  ) => {
    const autoId = useId();
    const inputId = providedId || autoId;

    const baseRadioWrapperClasses =
      'w-5 h-5 mr-2 rounded-full border-2 flex items-center justify-center transition-colors duration-150 flex-shrink-0';
    const checkedRadioWrapperClasses = 'border-purple-600 bg-purple-600';
    const uncheckedRadioWrapperClasses = 'border-gray-400 dark:border-gray-600 hover:border-purple-500';
    const disabledRadioWrapperClasses = 'opacity-50 border-gray-500';

    const baseRadioDotClasses = 'w-2 h-2 rounded-full bg-white transition-opacity duration-150';
    const checkedRadioDotClasses = 'opacity-100';
    const uncheckedRadioDotClasses = 'opacity-0';

    return (
      <div className={`flex items-center ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${className}`}>
        <input
          type="radio"
          id={inputId}
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          ref={ref}
          className="sr-only" // Visually hidden, but accessible
          data-testid={dataTestId || `${name}-${value}-input`}
          aria-checked={checked}
          aria-disabled={disabled}
          {...rest}
        />
        <label
          htmlFor={inputId}
          className={`flex items-center ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${labelClassName}`}
        >
          <span
            className={`
              ${baseRadioWrapperClasses}
              ${checked ? checkedRadioWrapperClasses : uncheckedRadioWrapperClasses}
              ${disabled ? disabledRadioWrapperClasses : ''}
              ${radioWrapperClassName}
            `}
            aria-hidden="true" // The actual input is announced
          >
            <span
              className={`
                ${baseRadioDotClasses}
                ${checked ? checkedRadioDotClasses : uncheckedRadioDotClasses}
                ${radioDotClassName}
              `}
            />
          </span>
          <span className="text-sm text-gray-300 dark:text-gray-200 select-none">
            {label}
          </span>
        </label>
      </div>
    );
  }
);

Radio.displayName = 'Radio';
export default Radio;