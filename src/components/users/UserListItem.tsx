// src/components/users/UserListItem.tsx
import React from 'react';
import type { MockUser } from '../../data/mocks/users'; // Assuming MockUser type is defined here
import Avatar from '../Avatar';
import { uiStrings } from '../../config/translations'; // For potential future use (e.g., aria-labels)

interface UserListItemProps {
  user: MockUser;
  // Add any other props like onSelect, isSelected if needed in the future
}

const UserListItem: React.FC<UserListItemProps> = ({ user }) => {
  return (
    <li
      className="p-3 bg-slate-700 rounded-lg shadow-sm hover:bg-slate-650 transition-colors duration-150 flex items-center space-x-3"
      // Consider adding button role and keyboard interaction if these items become selectable
    >
      <Avatar
        name={user.displayName}
        avatarUrl={user.avatarUrl}
        sizeClasses="w-10 h-10 rounded-full flex-shrink-0"
        textClasses="text-sm"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-100 truncate" title={user.displayName}>
          {user.displayName}
        </p>
        <p className="text-xs text-gray-400 truncate" title={`@${user.username}`}>
          @{user.username}
        </p>
      </div>
      {/* Placeholder for actions or status indicators if needed in the future */}
      {/* e.g., <span className="text-xs text-green-400">Active</span> */}
    </li>
  );
};

export default UserListItem;