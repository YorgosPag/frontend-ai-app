// src/components/ui/Label.tsx
import React from 'react';

interface LabelProps<T extends React.ElementType = 'label'> {
  children: React.ReactNode;
  className?: string;
  required?: boolean;
  as?: T;
  // Include other props that might be specific to the 'as' component or label
  // For example, htmlFor for 'label'
  htmlFor?: string;
}

// Ensure that props specific to the 'as' component are correctly typed
// This uses a generic approach. For more complex components, you might need React.ComponentPropsWithoutRef<T>
const Label = <T extends React.ElementType = 'label'>({
  children,
  className = '',
  required,
  as,
  ...props
}: LabelProps<T> & Omit<React.ComponentPropsWithoutRef<T>, keyof LabelProps<T>>): React.ReactElement => {
  const Component = as || 'label';
  const baseClasses = "font-[var(--font-sans)] block text-[var(--font-size-sm)] font-[var(--font-weight-medium)] text-gray-300 mb-1";

  return (
    <Component className={`${baseClasses} ${className}`} {...props}>
      {children}
      {required && <span className="text-red-400 ml-1">*</span>}
    </Component>
  );
};

export default Label;