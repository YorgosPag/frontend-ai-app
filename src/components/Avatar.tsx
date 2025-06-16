

// src/components/Avatar.tsx
import React from 'react';

interface AvatarProps {
  name: string; // The name to display or derive initials from
  avatarUrl?: string;
  sizeClasses?: string;
  textClasses?: string;
  borderClasses?: string;
  initialsBgClasses?: string;
  className?: string;
}

const getInitialsFromName = (name: string): string => {
  if (!name) return '?';
  const names = name.trim().split(/\s+/).filter(Boolean); // Filter out empty strings from multiple spaces

  if (names.length === 0) return '?';

  if (names.length === 1) {
    const singleName = names[0];
    if (singleName.length === 1) return singleName.charAt(0).toUpperCase();
    // For single word, try to get two letters if possible, otherwise one.
    return singleName.substring(0, Math.min(singleName.length, 2)).toUpperCase();
  }
  
  // More than 1 name part (e.g., "John Doe" -> "JD", "Alpha Beta Gamma" -> "AG")
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

const Avatar: React.FC<AvatarProps> = ({
  name,
  avatarUrl,
  sizeClasses = 'w-16 h-16 rounded-full',
  textClasses = 'text-xl sm:text-2xl',
  borderClasses = 'border-2 border-gray-600',
  initialsBgClasses = 'bg-gray-700',
  className = ''
}) => {
  const initials = getInitialsFromName(name);

  // Combine sizeClasses and className for the root element of both img and div
  const combinedRootClasses = `${sizeClasses} object-cover ${borderClasses} ${className}`;
  const combinedInitialsContainerClasses = `${sizeClasses} ${initialsBgClasses} flex items-center justify-center text-white font-semibold ${borderClasses} ${textClasses} ${className}`;

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name || 'Avatar'}
        className={combinedRootClasses} // Applied combined classes
        onError={(e) => {
          // Fallback to initials if image fails to load by hiding the image
          // A more robust solution might involve setting state to re-render initials
          (e.target as HTMLImageElement).style.display = 'none'; 
          // Ideally, we'd render the initials div here, but that requires state.
          // For now, if image errors, nothing from this component shows for that image.
          // To show initials on error, the component would need to manage an error state.
        }}
      />
    );
  }

  return (
    <div
      className={combinedInitialsContainerClasses} // Applied combined classes
      aria-label={name ? `Avatar for ${name}` : 'User initials'}
      title={name}
    >
      {initials}
    </div>
  );
};

export default Avatar;