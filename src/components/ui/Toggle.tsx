// src/components/ui/Toggle.tsx
import React, { useId } from 'react';

type ToggleSize = 'sm' | 'md' | 'lg';

interface ToggleProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  labelPosition?: 'left' | 'right';
  size?: ToggleSize;
  onColor?: string;
  offColor?: string;
  knobColor?: string;
  className?: string;
  labelClassName?: string;
  switchClassName?: string;
  knobClassName?: string;
  'data-testid'?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  id: providedId,
  checked,
  onChange,
  disabled = false,
  label,
  labelPosition = 'right',
  size = 'md',
  onColor = 'bg-purple-600',
  offColor = 'bg-gray-600 dark:bg-gray-500',
  knobColor = 'bg-white',
  className = '',
  labelClassName = 'text-sm text-gray-300 select-none',
  switchClassName = '',
  knobClassName = '',
  'data-testid': dataTestId,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
}) => {
  const autoId = useId();
  const toggleId = providedId || autoId;

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  // Size configurations for track and knob
  let trackWidth, trackHeight, knobSize, knobTranslate;
  switch (size) {
    case 'sm':
      trackWidth = 'w-9'; 
      trackHeight = 'h-5'; 
      knobSize = 'h-4 w-4'; 
      knobTranslate = checked ? 'translate-x-4' : 'translate-x-0.5'; 
      break;
    case 'lg':
      trackWidth = 'w-14'; 
      trackHeight = 'h-8'; 
      knobSize = 'h-6 w-6'; 
      knobTranslate = checked ? 'translate-x-6' : 'translate-x-1';  
      break;
    case 'md':
    default:
      trackWidth = 'w-11'; 
      trackHeight = 'h-6'; 
      knobSize = 'h-5 w-5'; 
      knobTranslate = checked ? 'translate-x-5' : 'translate-x-0.5'; 
      break;
  }

  const switchBaseClasses = `relative inline-flex flex-shrink-0 ${trackHeight} ${trackWidth} border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-800 shadow-inner`; // MODIFIED: Added shadow-inner
  const switchColor = checked ? onColor : offColor;

  const knobBaseClasses = `pointer-events-none inline-block ${knobSize} ${knobColor} rounded-full shadow-lg transform ring-0 transition ease-in-out duration-200`; // Has shadow-lg

  const finalLabelClassName = `${labelClassName} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;

  const ToggleSwitch = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      aria-label={ariaLabel && !label ? ariaLabel : undefined}
      aria-labelledby={ariaLabelledby || (label ? `${toggleId}-label` : undefined)}
      id={toggleId}
      data-testid={dataTestId}
      onClick={handleToggle}
      disabled={disabled}
      className={`
        ${switchBaseClasses}
        ${switchColor}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${switchClassName}
      `}
    >
      <span
        aria-hidden="true"
        className={`
          ${knobBaseClasses}
          ${knobTranslate}
          ${knobClassName}
        `}
      />
    </button>
  );

  return (
    <div className={`flex items-center ${className}`}>
      {label && labelPosition === 'left' && (
        <span id={`${toggleId}-label`} onClick={handleToggle} className={`mr-3 ${finalLabelClassName}`}>
          {label}
        </span>
      )}
      {ToggleSwitch}
      {label && labelPosition === 'right' && (
        <span id={`${toggleId}-label`} onClick={handleToggle} className={`ml-3 ${finalLabelClassName}`}>
          {label}
        </span>
      )}
    </div>
  );
};

Toggle.displayName = 'Toggle';
export default Toggle;
