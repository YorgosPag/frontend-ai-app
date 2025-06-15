// src/components/ui/Icon.tsx
import React from 'react';
import type { IconName } from '../../types/iconTypes';
import * as Icons from '../icons'; // Import all icons from the central export

// Helper function to convert camelCase or kebab-case to PascalCase
const camelToPascal = (str: string): string => {
  // Replace kebab-case with camelCase first, then process
  const camelStr = str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  return camelStr.charAt(0).toUpperCase() + camelStr.slice(1);
};


interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'name' | 'size'> {
  name: IconName;
  size?: 'xs' | 'sm' | 'md' | 'lg' | string; // Added 'xs', predefined sizes or direct Tailwind class
  className?: string;
  'aria-label'?: string; // Explicitly include aria-label for clarity
}

const Icon: React.FC<IconProps> = ({
  name,
  size: sizeProp = 'md', // Default size
  className = '',
  'aria-label': ariaLabel,
  role = 'img', // Default role for non-interactive icons
  ...rest
}) => {
  // Convert the icon name (e.g., 'dashboard', 'usersGroup') to the component name (e.g., 'DashboardIcon', 'UsersGroupIcon')
  const pascalName = camelToPascal(name);
  const componentName = (pascalName + "Icon") as keyof typeof Icons;
  const IconComponent = Icons[componentName] as React.FC<React.SVGProps<SVGSVGElement>> | undefined;

  if (!IconComponent) {
    console.warn(`[Icon Component] Icon "${name}" (expected component: ${componentName}) not found.`);
    // Fallback to a placeholder or an empty span to avoid breaking the layout
    return <span className={`inline-block w-5 h-5 bg-red-500 rounded-full ${className}`} aria-label={`Error: Icon ${name} not found`} role="img" />;
  }

  let sizeClasses = '';
  if (typeof sizeProp === 'string') {
    switch (sizeProp) {
      case 'xs': // New size
        sizeClasses = 'w-3.5 h-3.5';
        break;
      case 'sm':
        sizeClasses = 'w-4 h-4';
        break;
      case 'md':
        sizeClasses = 'w-5 h-5';
        break;
      case 'lg':
        sizeClasses = 'w-6 h-6';
        break;
      default:
        // Assume it's a direct Tailwind class if not predefined
        sizeClasses = sizeProp;
    }
  }

  // Combine provided className with sizeClasses
  const combinedClassName = `${sizeClasses} ${className}`.trim();

  // Ensure fill and stroke are currentColor if not specified, to allow CSS color control
  const svgProps: React.SVGProps<SVGSVGElement> = {
    fill: rest.fill || 'none', // Default to none if not a filled icon
    stroke: rest.stroke || 'currentColor', // Default stroke to currentColor
    strokeWidth: rest.strokeWidth || 1.5, // Common strokeWidth, can be overridden
    ...rest, // Spread other SVG props
    className: combinedClassName,
    role: role,
    ...(ariaLabel ? { 'aria-label': ariaLabel } : {}), // Add aria-label if provided
  };
  
  const socialIconNames: IconName[] = ['facebook', 'instagram', 'x', 'tikTok', 'linkedIn', 'viber', 'whatsApp', 'telegram'];
  if (socialIconNames.includes(name) && !rest.fill) {
    svgProps.fill = 'currentColor'; 
  }


  return <IconComponent {...svgProps} />;
};

export default Icon;
