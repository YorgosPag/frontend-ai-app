// src/data/mocks/users.ts
import type { AppRole } from '../../auth/roles'; // Ensure AppRole is imported
import { ROLES } from '../../auth/roles'; // Import ROLES for assignment

export interface MockUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  roles: AppRole[]; // Added roles property
}

export const mockUsers: MockUser[] = [
  { 
    id: 'user-001', 
    username: 'yannis.p', 
    displayName: 'Γιάννης Παπαδόπουλος', 
    avatarUrl: 'https://picsum.photos/seed/yannis/40',
    roles: [ROLES.EMPLOYEE, ROLES.CONSULTANT] 
  },
  { 
    id: 'user-002', 
    username: 'maria.k', 
    displayName: 'Μαρία Καλογεροπούλου', 
    avatarUrl: 'https://picsum.photos/seed/maria_k/40',
    roles: [ROLES.MANAGER, ROLES.BUYER] 
  },
  { 
    id: 'user-003', 
    username: 'costas.g', 
    displayName: 'Κώστας Γεωργίου',
    roles: [ROLES.EMPLOYEE] 
  },
  { 
    id: 'user-004', 
    username: 'eleni.v', 
    displayName: 'Ελένη Βασιλείου', 
    avatarUrl: 'https://picsum.photos/seed/eleni/40',
    roles: [ROLES.SUPPLIER, ROLES.CUSTOMER] 
  },
  { 
    id: 'user-005', 
    username: 'system_bot', 
    displayName: 'System Bot',
    roles: [ROLES.OBSERVER] // System bots might have observer roles
  },
  { 
    id: 'admin-001', 
    username: 'admin_user', 
    displayName: 'Administrator',
    avatarUrl: 'https://picsum.photos/seed/admin_user/40', // Added avatar for admin
    roles: [ROLES.ADMIN] 
  },
  { 
    id: 'user-006', 
    username: 'nikos.a', 
    displayName: 'Νίκος Αλεξίου', 
    avatarUrl: 'https://picsum.photos/seed/nikos/40',
    roles: [ROLES.EXTERNAL_VENDOR, ROLES.PARTNER] 
  },
  { 
    id: 'user-007', 
    username: 'sofia.d', 
    displayName: 'Σοφία Δημητρίου',
    roles: [ROLES.LAND_OWNER] 
  },
  { 
    id: 'admin_system', 
    username: 'admin_system', 
    displayName: 'System Admin (Workflow)', 
    avatarUrl: 'https://picsum.photos/seed/sysadmin/40',
    roles: [ROLES.ADMIN, ROLES.OBSERVER] // System Admin might also be an observer of some areas
  },
  {
    id: 'user-008-viewer',
    username: 'viewer.only',
    displayName: 'Read Only User',
    roles: [ROLES.OBSERVER]
  },
  {
    id: 'user-009-basic',
    username: 'basic.employee',
    displayName: 'Basic Employee',
    avatarUrl: 'https://picsum.photos/seed/basic_emp/40',
    roles: [ROLES.EMPLOYEE]
  }
];
