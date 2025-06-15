// src/components/skeletons/SkeletonContactListItem.tsx
import React from 'react';
import SkeletonAvatar from './SkeletonAvatar';
import SkeletonText from './SkeletonText';

const SkeletonContactListItem: React.FC = () => {
  return (
    <li className="px-3 py-3 mx-2 my-1 flex items-center space-x-3">
      <SkeletonAvatar sizeClasses="w-10 h-10" />
      <div className="flex-1 min-w-0 space-y-2">
        <SkeletonText width="w-3/4" height="h-3.5" />
        <SkeletonText width="w-1/2" height="h-3" />
      </div>
    </li>
  );
};

export default SkeletonContactListItem;