// src/components/skeletons/SkeletonText.tsx
import React from 'react';

interface SkeletonTextProps {
  className?: string;
  width?: string; // e.g., 'w-3/4', 'w-20'
  lines?: number;
  height?: string; // e.g., 'h-4', 'h-6'
}

const SkeletonText: React.FC<SkeletonTextProps> = ({ className = '', width = 'w-full', lines = 1, height = 'h-4' }) => {
  return (
    <>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-slate-700 rounded ${width} ${height} ${lines > 1 && index < lines - 1 ? 'mb-2' : ''} ${className}`}
        />
      ))}
    </>
  );
};

export default SkeletonText;