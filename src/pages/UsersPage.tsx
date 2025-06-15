// src/pages/UsersPage.tsx
import React from 'react';
import { uiStrings } from '../config/translations';
import { mockUsers } from '../data/mocks/users'; // Import mock users
import UserListItem from '../components/users/UserListItem'; // Import the new component

const UsersPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 space-y-4">
      <h1 className="font-[var(--font-heading)] text-[var(--font-size-3xl)] font-[var(--font-weight-bold)] text-gray-200">
        {uiStrings.usersTitle}
      </h1>

      {mockUsers.length > 0 ? (
        <ul className="space-y-3">
          {mockUsers.map(user => (
            <UserListItem key={user.id} user={user} />
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">Δεν βρέθηκαν χρήστες.</p>
      )}
    </div>
  );
};
export default UsersPage;