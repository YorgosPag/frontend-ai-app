// src/components/skeletons/SkeletonAvatar.tsx
import React from 'react';

interface SkeletonAvatarProps {
  sizeClasses?: string; // e.g., 'w-10 h-10'
  className?: string;
}

const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({
  sizeClasses = 'w-10 h-10',
  className = '',
}) => {
  return (
    <div
      className={`animate-pulse bg-slate-700 rounded-full ${sizeClasses} ${className}`}
    />
  );
};

export default SkeletonAvatar;