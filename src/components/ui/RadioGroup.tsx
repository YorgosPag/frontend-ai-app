// src/components/ui/RadioGroup.tsx
import React, { useId } from 'react';
import Radio from './Radio'; // Assuming Radio.tsx is in the same directory

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  name: string;
  selectedValue?: string;
  onChange?: (selectedValue: string) => void;
  options: RadioOption[]; // Options are now mandatory for this design
  groupLabel?: string;
  disabled?: boolean; // Disables all radio buttons in the group
  orientation?: 'horizontal' | 'vertical';
  className?: string; // For the fieldset or div wrapper
  groupLabelClassName?: string; // For the legend or div label
  optionContainerClassName?: string; // For the div wrapping each Radio component
  'data-testid'?: string;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  selectedValue,
  onChange,
  options,
  groupLabel,
  disabled = false,
  orientation = 'vertical',
  className = '',
  groupLabelClassName = '',
  optionContainerClassName = '',
  'data-testid': dataTestId,
}) => {
  const autoGroupId = useId();
  const legendId = groupLabel ? `${autoGroupId}-legend` : undefined;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };

  const layoutClasses = orientation === 'horizontal' ? 'flex flex-wrap gap-x-4 gap-y-2' : 'space-y-2';

  const WrapperComponent = groupLabel ? 'fieldset' : 'div';
  const wrapperProps: any = groupLabel
    ? {
        'aria-labelledby': legendId,
        role: 'radiogroup',
        className: `border-0 p-0 m-0 ${className}`, // Reset fieldset default styles
      }
    : {
        role: 'radiogroup', // Still good for accessibility even without visible label
        className: className,
      };
  
  if (dataTestId) {
    wrapperProps['data-testid'] = dataTestId;
  }


  return (
    <WrapperComponent {...wrapperProps}>
      {groupLabel && (
        <legend
          id={legendId}
          className={`font-[var(--font-sans)] block text-[var(--font-size-sm)] font-[var(--font-weight-medium)] text-gray-300 mb-2 ${groupLabelClassName}`}
        >
          {groupLabel}
        </legend>
      )}
      <div className={layoutClasses}>
        {options.map((option, index) => (
          <div key={`${name}-${option.value}-${index}`} className={optionContainerClassName}>
            <Radio
              id={`${name}-${option.value}-id-${index}`} // Ensure unique ID for each radio
              name={name}
              value={option.value}
              label={option.label}
              checked={selectedValue === option.value}
              onChange={handleChange}
              disabled={disabled || option.disabled}
              data-testid={`${dataTestId ? dataTestId + '-' : ''}${option.value}-radio`}
            />
          </div>
        ))}
      </div>
    </WrapperComponent>
  );
};

RadioGroup.displayName = 'RadioGroup';
export default RadioGroup;