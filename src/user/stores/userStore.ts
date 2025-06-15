// src/user/stores/userStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { MockUser } from '../../data/mocks/users'; // Adjust path as needed
import { mockUsers } from '../../data/mocks/users'; // Adjust path as needed
import type { AppRole } from '../../auth/roles';

interface UserState {
  currentUser: MockUser | null;
  availableUsers: MockUser[];
  userRoles: AppRole[]; // Roles of the current user
}

interface UserActions {
  initializeUsers: () => void;
  setCurrentUser: (userId: string) => void;
}

export const useUserStore = create<UserState & UserActions>()(
  immer((set) => ({
    currentUser: null,
    availableUsers: [],
    userRoles: [],

    initializeUsers: () => {
      const firstUser = mockUsers.length > 0 ? mockUsers[0] : null;
      set((state) => {
        state.availableUsers = mockUsers;
        state.currentUser = firstUser;
        state.userRoles = firstUser?.roles || [];
      });
      if (firstUser) {
        console.log(`[UserStore] Initialized with user: ${firstUser.displayName}`);
      } else {
        console.warn('[UserStore] Initialized with no users.');
      }
    },

    setCurrentUser: (userId) => {
      set((state) => {
        const userToSet = state.availableUsers.find(u => u.id === userId);
        if (userToSet) {
          state.currentUser = userToSet;
          state.userRoles = userToSet.roles || [];
          console.log(`[UserStore] Current user set to: ${userToSet.displayName} with roles: ${userToSet.roles.join(', ')}`);
        } else {
          console.warn(`[UserStore] User with ID ${userId} not found.`);
        }
      });
    },
  }))
);

// Optional: Selector to get current user roles easily
export const useCurrentUserRoles = (): AppRole[] => {
  return useUserStore((state) => state.userRoles);
};
