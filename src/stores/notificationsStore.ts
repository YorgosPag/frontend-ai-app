// src/stores/notificationsStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { AppNotification, AppNotificationKind } from '../types/notificationTypes'; // AppNotificationKind added
import { allAppNotificationKinds } from '../types/notificationTypes'; // Import the array
import { generateUniqueId } from '../utils/idUtils'; // Updated import
import { mockUsers } from '../data/mocks/users'; 

// Sample notifications for initial state (optional)
const sampleAppNotifications: AppNotification[] = [
  {
    id: generateUniqueId(),
    type: 'mention',
    title: 'Νέα Αναφορά',
    message: `Ο χρήστης @${mockUsers[0]?.username || 'user1'} σας ανέφερε σε μια σημείωση για την επαφή "ΤΕΧΝΙΚΗ ΚΑΤΑΣΚΕΥΑΣΤΙΚΗ Α.Ε.".`,
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    isRead: false,
    link: '/contacts/2', 
    relatedEntityId: '2',
    relatedEntityType: 'contact',
    icon: 'user', 
  },
  {
    id: generateUniqueId(),
    type: 'task_reminder',
    title: 'Υπενθύμιση Εργασίας',
    message: 'Η εργασία "Προετοιμασία παρουσίασης Q3" λήγει αύριο.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    isRead: true,
    icon: 'bell', 
    relatedEntityId: 'project-alpha', // Example
    relatedEntityType: 'task',   // Changed from 'project' to 'task' for consistency with EntityType
  },
  {
    id: generateUniqueId(),
    type: 'system_update',
    title: 'Ενημέρωση Συστήματος',
    message: 'Το σύστημα θα είναι εκτός λειτουργίας για συντήρηση την Κυριακή 03:00-05:00.',
    timestamp: new Date().toISOString(), // Now
    isRead: false,
    icon: 'settings', 
  },
  {
    id: generateUniqueId(),
    type: 'deadline_approaching',
    title: 'Λήξη Προθεσμίας',
    message: 'Η προθεσμία για την υποβολή της προσφοράς στο έργο "Νέα Γραφεία" είναι σε 2 ημέρες.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    isRead: false,
    icon: 'alertTriangle',
    relatedEntityId: 'project-beta',
    relatedEntityType: 'task', // Changed from 'project' to 'task' or another valid EntityType
  },
  {
    id: generateUniqueId(),
    type: 'entity_created',
    title: 'Νέα Επαφή Δημιουργήθηκε',
    message: `Η επαφή "Ελένη Νικολάου" δημιουργήθηκε από τον @${mockUsers.find(u => u.username === 'admin_user')?.username || 'admin_user'}.`,
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    isRead: false,
    icon: 'plus',
    relatedEntityId: '6', // Assuming '6' is Eleni Nikolaou's ID
    relatedEntityType: 'contact',
    link: '/contacts/6'
  },
  {
    id: generateUniqueId(),
    type: 'new_message',
    title: 'Νέο Μήνυμα (Mock)',
    message: 'Έχετε νέο μήνυμα από τον πελάτη "Δημήτρης Αντωνίου" σχετικά με την υπόθεση #123.',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
    isRead: false,
    icon: 'email',
    relatedEntityId: '8', // Dimitris Antoniou
    relatedEntityType: 'contact',
  },
  {
    id: generateUniqueId(),
    type: 'general_info',
    title: 'Ενημέρωση Πολιτικής Απορρήτου',
    message: 'Η πολιτική απορρήτου μας έχει ενημερωθεί. Παρακαλούμε διαβάστε τους νέους όρους.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    isRead: true,
    icon: 'info',
  },
   {
    id: generateUniqueId(),
    type: 'mention',
    title: 'Αναφορά σε Σχόλιο',
    message: `Ο χρήστης @${mockUsers[1]?.username || 'user2'} απάντησε στο σχόλιό σας για την εργασία "Ανάλυση Αγοράς".`,
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    isRead: false,
    icon: 'user', 
    relatedEntityId: 'task-market-analysis', // Example task ID
    relatedEntityType: 'task',
  },
  {
    id: generateUniqueId(),
    type: 'entity_updated',
    title: 'Ενημέρωση Στοιχείων Επαφής',
    message: `Τα στοιχεία της επαφής "ΤΕΧΝΙΚΗ ΚΑΤΑΣΚΕΥΑΣΤΙΚΗ Α.Ε." ενημερώθηκαν από @${mockUsers[3]?.username || 'user4'}.`,
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
    isRead: true,
    icon: 'edit',
    relatedEntityId: '2',
    relatedEntityType: 'contact',
    link: '/contacts/2'
  },
   {
    id: generateUniqueId(),
    type: 'task_reminder',
    title: 'Follow-up Κλήσης',
    message: 'Υπενθύμιση για follow-up της κλήσης με την "Μαρία Παπαδοπούλου".',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    isRead: false,
    icon: 'phone',
    relatedEntityId: '1',
    relatedEntityType: 'contact'
  }
];


interface NotificationsState {
  notifications: AppNotification[];
  isPanelOpen: boolean;
  notificationTypeSettings: Record<AppNotificationKind, boolean>; // <<< ΝΕΑ ΚΑΤΑΣΤΑΣΗ

  // Selectors
  unreadCount: () => number;
  sortedNotifications: () => AppNotification[];
  // Actions
  addNotification: (notificationData: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  togglePanel: () => void;
  setPanelOpen: (isOpen: boolean) => void;
  toggleNotificationTypeSetting: (kind: AppNotificationKind) => void; // <<< ΝΕΑ ACTION
}

const initialNotificationTypeSettings = allAppNotificationKinds.reduce((acc, kind) => {
  acc[kind] = true; // Default all to true
  return acc;
}, {} as Record<AppNotificationKind, boolean>);


export const useNotificationsStore = create<NotificationsState>()(
  immer((set, get) => ({
    notifications: sampleAppNotifications, 
    isPanelOpen: false,
    notificationTypeSettings: initialNotificationTypeSettings, // <<< ΑΡΧΙΚΟΠΟΙΗΣΗ

    // Selectors
    unreadCount: () => {
      const { notifications, notificationTypeSettings } = get();
      return notifications.filter(n => !n.isRead && notificationTypeSettings[n.type] !== false).length; // Check settings
    },
    sortedNotifications: () => {
      const { notifications, notificationTypeSettings } = get();
      const filteredByType = notifications.filter(n => notificationTypeSettings[n.type] !== false); // Check settings
      return [...filteredByType].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },

    // Actions
    addNotification: (notificationData) =>
      set((state) => {
        const newNotification: AppNotification = {
          id: generateUniqueId(),
          timestamp: new Date().toISOString(),
          isRead: false,
          ...notificationData,
        };
        state.notifications.unshift(newNotification); 
      }),
    markAsRead: (notificationId) =>
      set((state) => {
        const notification = state.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.isRead = true;
        }
      }),
    markAllAsRead: () =>
      set((state) => {
        const { notificationTypeSettings } = get();
        state.notifications.forEach(n => {
          if (notificationTypeSettings[n.type] !== false) { // Only mark read if type is enabled
             n.isRead = true;
          }
        });
      }),
    clearNotification: (notificationId) =>
      set((state) => {
        state.notifications = state.notifications.filter(n => n.id !== notificationId);
      }),
    clearAllNotifications: () =>
      set((state) => {
         const { notificationTypeSettings } = get();
        // Only clear notifications whose types are currently enabled by settings
        state.notifications = state.notifications.filter(n => notificationTypeSettings[n.type] === false);
      }),
    togglePanel: () =>
      set((state) => {
        state.isPanelOpen = !state.isPanelOpen;
      }),
    setPanelOpen: (isOpen) =>
      set((state) => {
        state.isPanelOpen = isOpen;
      }),
    toggleNotificationTypeSetting: (kind) => // <<< ΥΛΟΠΟΙΗΣΗ ΝΕΑΣ ACTION
      set((state) => {
        state.notificationTypeSettings[kind] = !state.notificationTypeSettings[kind];
      }),
  }))
);
