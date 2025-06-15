// src/components/ui/NumberInput.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Button from './Button';
import Icon from './Icon';
import { uiStrings } from '../../config/translations';

export interface NumberInputProps {
  id?: string;
  name?: string;
  value?: number | null;
  onChange: (value: number | null, name?: string) => void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  hasError?: boolean;
  hasWarning?: boolean;
  hasSuccess?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'data-testid'?: string;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
}

const formatNumber = (num: number | null | undefined, precision: number): string => {
  if (num === null || num === undefined || isNaN(num)) {
    return '';
  }
  return num.toFixed(precision);
};

const parseNumber = (str: string): number | null => {
  if (str.trim() === '' || str === '-') return null;
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
};

const clamp = (value: number, min?: number, max?: number): number => {
  let clampedValue = value;
  if (min !== undefined) {
    clampedValue = Math.max(clampedValue, min);
  }
  if (max !== undefined) {
    clampedValue = Math.min(clampedValue, max);
  }
  return clampedValue;
};

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      id,
      name,
      value: propValue,
      onChange,
      min,
      max,
      step = 1,
      precision = 0,
      disabled = false,
      readOnly = false,
      placeholder,
      className = '',
      inputClassName = '',
      buttonClassName = '',
      hasError,
      hasWarning,
      hasSuccess,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      'data-testid': dataTestId,
      onFocus: propOnFocus, 
      onBlur: propOnBlur,   
      ...restInputProps
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState<string>(formatNumber(propValue, precision));
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null); 

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    useEffect(() => {
      const currentNumericValue = parseNumber(inputValue);
      if (propValue !== currentNumericValue || (propValue === null && inputValue !== '')) {
         setInputValue(formatNumber(propValue, precision));
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [propValue, precision]);

    const handleValueCommit = useCallback((currentStrVal: string) => {
      let num = parseNumber(currentStrVal);
      if (num !== null) {
        num = clamp(num, min, max);
        num = parseFloat(num.toFixed(precision)); 
      }
      
      setInputValue(formatNumber(num, precision));
      
      if (num !== propValue || (num === null && propValue !== null) || (num !== null && propValue === null) ) {
        onChange(num, name);
      }
    }, [min, max, precision, onChange, name, propValue]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val === '' || val === '-' || /^-?\d*\.?\d*$/.test(val)) {
        setInputValue(val);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      handleValueCommit(inputValue);
      if (propOnBlur) { 
        propOnBlur(e);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (propOnFocus) { 
        propOnFocus(e);
      }
    };
    
    const adjustValue = (adjustment: number) => {
      if (disabled || readOnly) return;
      
      let currentValue = parseNumber(inputValue);
      if (currentValue === null) {
        if (adjustment > 0) { 
            currentValue = (min !== undefined && min > 0) ? min : 0;
        } else { 
            currentValue = (max !== undefined && max < 0) ? max : 0;
            if (currentValue === 0 && min !== undefined) currentValue = min; 
            else if (currentValue === 0) currentValue = 0; 
        }
      }

      let newValue = (currentValue || 0) + adjustment;
      newValue = clamp(newValue, min, max);
      newValue = parseFloat(newValue.toFixed(precision));
      
      setInputValue(formatNumber(newValue, precision));
      if (newValue !== propValue) {
        onChange(newValue, name);
      }
      inputRef.current?.focus();
    };

    const handleIncrement = () => adjustValue(step);
    const handleDecrement = () => adjustValue(-step);

    let borderClasses = "border-gray-600 focus-within:ring-purple-500 focus-within:border-purple-500";
    if (hasError) {
      borderClasses = "border-red-500 focus-within:ring-red-500 focus-within:border-red-500";
    } else if (hasWarning) {
      borderClasses = "border-amber-500 focus-within:ring-amber-500 focus-within:border-amber-500";
    } else if (hasSuccess) {
      borderClasses = "border-green-500 focus-within:ring-green-500 focus-within:border-green-500";
    }
    
    const wrapperBaseClasses = "flex items-center border rounded-md transition-colors duration-150 ease-in-out focus-within:ring-1 focus-within:ring-offset-2 focus-within:ring-offset-gray-800"; // Added ring-offset
    const finalWrapperClasses = `${wrapperBaseClasses} ${borderClasses} ${disabled || readOnly ? 'bg-gray-700 opacity-70' : 'bg-gray-800'} ${className}`;
    const inputBaseClasses = "w-full appearance-none bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none text-center";
    const inputPadding = "py-2.5 px-2"; 

    return (
      <div
        className={finalWrapperClasses}
        data-testid={dataTestId || (id ? `${id}-wrapper` : undefined)}
        role="spinbutton"
        aria-valuenow={propValue ?? undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-disabled={disabled}
        aria-readonly={readOnly}
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleDecrement}
          disabled={disabled || readOnly || (propValue !== null && propValue !== undefined && min !== undefined && propValue <= min)}
          className={`!p-2 !border-0 !shadow-none hover:!bg-gray-700 ${buttonClassName}`}
          aria-label={uiStrings.decrementButtonLabel || "Decrement"}
          tabIndex={-1}
        >
          <Icon name="minus" size="sm" />
        </Button>
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          id={id}
          name={name}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur} 
          onFocus={handleFocus} 
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          className={`${inputBaseClasses} ${inputPadding} ${inputClassName}`}
          autoComplete="off"
          {...restInputProps} 
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleIncrement}
          disabled={disabled || readOnly || (propValue !== null && propValue !== undefined && max !== undefined && propValue >= max)}
          className={`!p-2 !border-0 !shadow-none hover:!bg-gray-700 ${buttonClassName}`}
          aria-label={uiStrings.incrementButtonLabel || "Increment"}
          tabIndex={-1}
        >
          <Icon name="plus" size="sm" />
        </Button>
      </div>
    );
  }
);

NumberInput.displayName = 'NumberInput';
export default NumberInput;