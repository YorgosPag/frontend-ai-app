// src/components/ui/Button.tsx
import React from 'react';
import SpinnerIcon from '../icons/SpinnerIcon';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'link' | 'icon';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode; // Made children optional
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  type, // Destructure type prop
  ...props
}, ref) => {
  const baseClasses = "font-[var(--font-sans)] font-[var(--font-weight-semibold)] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-opacity-75 transition-all duration-200 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";
  // Note: focus:ring-offset-slate-800 assumes buttons are often on a slate-800 like background. Adjust if context varies significantly.

  const variantClasses: Record<ButtonVariant, string> = {
    primary: "bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500",
    secondary: "bg-gray-600 hover:bg-gray-500 text-gray-200 focus:ring-gray-400",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    ghost: "bg-transparent hover:bg-slate-700 text-gray-300 focus:ring-slate-500 border border-slate-600 hover:border-slate-500",
    link: "bg-transparent hover:text-purple-400 text-purple-300 underline p-0 focus:ring-purple-500",
    icon: "bg-transparent hover:bg-slate-700 text-gray-400 hover:text-purple-400 focus:ring-purple-500 p-1.5",
  };

  const sizeClasses: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-[var(--font-size-xs)]",
    md: "px-4 py-2 text-[var(--font-size-sm)]",
    lg: "px-6 py-3 text-[var(--font-size-base)]",
  };
  
  const iconOnlySizeClasses: Record<ButtonSize, string> = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-2.5",
  };
  
  const isIconOnly = !children && (leftIcon || rightIcon) && variant === 'icon';
  const currentSizeClasses = isIconOnly ? iconOnlySizeClasses[size] : sizeClasses[size];

  const buttonType = type || 'button'; // Default to 'button' if no type is provided

  return (
    <button
      ref={ref}
      type={buttonType} // Apply the determined type
      className={`${baseClasses} ${variantClasses[variant]} ${currentSizeClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <SpinnerIcon className={`w-5 h-5 ${children || leftIcon || rightIcon ? 'mr-2' : ''}`} />}
      {leftIcon && !isLoading && <span className={children ? "mr-2" : ""}>{leftIcon}</span>}
      {children}
      {rightIcon && !isLoading && <span className={children ? "ml-2" : ""}>{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;