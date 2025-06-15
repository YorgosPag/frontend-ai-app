// src/components/ui/FormFieldWrapper.tsx
import React, { useId } from 'react';
import Label from './Label';
import FieldError from './FieldError';

interface FormFieldWrapperProps {
  label: string;
  htmlFor: string; // Will also be used as the input's id
  required?: boolean;
  helperText?: React.ReactNode;
  validationError?: string | string[] | null;
  hasWarning?: boolean; // New prop for warning state
  hasSuccess?: boolean; // New prop for success state
  children: React.ReactElement; // Expect a single input-like child
  className?: string;
  labelClassName?: string;
  helperTextClassName?: string;
  errorContainerClassName?: string; 
}

const FormFieldWrapper: React.FC<FormFieldWrapperProps> = ({
  label,
  htmlFor,
  required,
  helperText,
  validationError,
  hasWarning,
  hasSuccess,
  children,
  className = '',
  labelClassName = '',
  helperTextClassName = 'text-xs text-gray-400 mt-1',
  errorContainerClassName = 'mt-1',
}) => {
  const baseId = useId();
  const helperTextId = helperText ? `${htmlFor}-${baseId}-helper` : undefined;
  const errorTextId = validationError ? `${htmlFor}-${baseId}-error` : undefined;

  let describedBy = '';
  if (helperTextId) describedBy += helperTextId;
  if (errorTextId) describedBy += ` ${errorTextId}`;
  describedBy = describedBy.trim();

  const childInput = React.Children.only(children);

  // Determine state props to pass to child
  const childStateProps: any = {};
  const isError = !!validationError;

  if (Object.prototype.hasOwnProperty.call(childInput.props, 'hasError')) {
    childStateProps.hasError = isError;
  }
  if (Object.prototype.hasOwnProperty.call(childInput.props, 'hasWarning')) {
    childStateProps.hasWarning = !isError && hasWarning; // Warning only if no error
  }
  if (Object.prototype.hasOwnProperty.call(childInput.props, 'hasSuccess')) {
    childStateProps.hasSuccess = !isError && !hasWarning && hasSuccess; // Success only if no error or warning
  }


  const clonedInput = React.cloneElement(
    childInput as React.ReactElement<any>, 
    {
      id: htmlFor,
      'aria-describedby': describedBy || undefined,
      'aria-invalid': isError,
      ...childStateProps,
    }
  );

  return (
    <div className={`mb-4 ${className}`}>
      <Label htmlFor={htmlFor} required={required} className={labelClassName}>
        {label}
      </Label>
      <div className="mt-1">
        {clonedInput}
      </div>
      {helperText && (
        <p id={helperTextId} className={helperTextClassName}>
          {helperText}
        </p>
      )}
      {validationError && (
        <div id={errorTextId} className={errorContainerClassName} role="alert">
          <FieldError errors={validationError} />
        </div>
      )}
    </div>
  );
};

FormFieldWrapper.displayName = 'FormFieldWrapper';
export default FormFieldWrapper;