// src/config/initialData.ts
import type { Contact, Note, UserReference, EntityType } from '../types'; // EntityType added for explicit casting
import { generateUniqueId } from '../utils/idUtils'; // Updated import path
import { mockUsers } from '../data/mocks/users'; // Import mockUsers

const now = new Date().toISOString();
const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString();
const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();
const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();
const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

// Helper to create UserReference from MockUser
const createUserRef = (username: string, fallbackDisplayName: string, fallbackUserIdSuffix: string): UserReference => {
  const user = mockUsers.find(u => u.username === username);
  if (user) {
    return { userId: user.id, displayName: user.displayName, avatarUrl: user.avatarUrl };
  }
  return { userId: `fallback-${fallbackUserIdSuffix}-${generateUniqueId().slice(0,5)}`, displayName: fallbackDisplayName, avatarUrl: undefined };
};

const mockUserSystemRef = createUserRef('system_bot', 'System Bot', 'system');
const mockUserYannisRef = createUserRef('yannis.p', 'Γιάννης Π.', 'yannis');
const mockUserAdminRef = createUserRef('admin_user', 'Admin User', 'admin');
const mockUserMariaRef = createUserRef('maria.k', 'Μαρία Κ.', 'maria');
const mockUserNikosRef = createUserRef('nikos.a', 'Νίκος Α.', 'nikos');
const mockUserSofiaRef = createUserRef('sofia.d', 'Σοφία Δ.', 'sofia');


export const initialContacts: Contact[] = [
  {
    id: '1',
    contactType: 'naturalPerson',
    basicIdentity: { firstName: 'Μαρία', lastName: 'Παπαδοπούλου', nickname: "Μαίρη" },
    email: 'maria.papadopoulou@example.gr',
    contactPhoneNumbers: [{ id: generateUniqueId(), number: '2101234567', type: 'landline', isPrimary: true, protocols: ['voice'], label: 'Σταθερό Οικίας' }],
    avatarUrl: 'https://picsum.photos/seed/maria/200',
    roles: ['buyer', 'consultant'],
    createdAt: threeDaysAgo,
    updatedAt: thirtyMinutesAgo, 
  },
  {
    id: '2',
    contactType: 'legalEntity',
    name: 'ΤΕΧΝΙΚΗ ΚΑΤΑΣΚΕΥΑΣΤΙΚΗ Α.Ε.',
    brandName: 'TEXNIKH A.E.',
    email: 'info@texnikh-ae.gr',
    contactPhoneNumbers: [{ id: generateUniqueId(), number: '2109876543', type: 'workLandline', isPrimary: true, protocols: ['voice'], label: 'Κεντρικά Γραφεία' }],
    avatarUrl: 'https://picsum.photos/seed/texnikh/200', 
    roles: ['supplier', 'landOwner'],
    taxInfo: { afm: '098765432', doy: 'ΦΑΕ ΑΘΗΝΩΝ'},
    createdAt: fiveDaysAgo,
    updatedAt: oneDayAgo,
  },
  {
    id: '3',
    contactType: 'naturalPerson',
    basicIdentity: { firstName: 'Γιώργος', lastName: 'Ιωάννου' },
    email: 'g.ioannou@example.com',
    contactPhoneNumbers: [
        { id: generateUniqueId(), number: '6971234567', type: 'mobile', isPrimary: true, protocols: ['voice', 'sms', 'whatsapp'], label: 'Κινητό' },
        { id: generateUniqueId(), number: '2105551234', type: 'workLandline', protocols: ['voice'], label: 'Γραφείο' }
    ],
    roles: ['employee'],
    professionalInfo: { companyName: 'Μεγάλη Εταιρεία Συμβούλων', jobTitle: 'Πωλήσεις', profession: 'Σύμβουλος Πωλήσεων'},
    addresses: [{id: generateUniqueId(), street: 'Λεωφόρος Κηφισίας', number: '120', city: 'Αθήνα', postalCode: '11526', country: 'ΕΛΛΑΔΑ', addressType: 'work', isPrimary: true}],
    createdAt: oneDayAgo,
    updatedAt: oneHourAgo,
  },
  {
    id: '4',
    contactType: 'publicService',
    name: 'Πολεοδομία Αθηνών',
    serviceType: 'Πολεοδομικός Σχεδιασμός',
    directorate: 'Διεύθυνση Πολεοδομίας',
    email: 'poleodomia@cityofathens.gr',
    contactPhoneNumbers: [{ id: generateUniqueId(), number: '2105277000', type: 'workLandline', isPrimary: true, protocols: ['voice'] }],
    avatarUrl: 'https://picsum.photos/seed/poleodomia/200',
    roles: ['other'],
    addresses: [{id: generateUniqueId(), street: 'Αθηνάς', number: '63', city: 'Αθήνα', postalCode: '10552', country: 'ΕΛΛΑΔΑ', addressType: 'work', isPrimary: true}],
    createdAt: now, 
    updatedAt: fiveMinutesAgo,
  },
  {
    id: '5',
    contactType: 'legalEntity',
    name: 'ΕΛΤΑ Courier Κεντρικά',
    companyType: 'Ταχυμεταφορές',
    email: 'support@elta-courier.gr',
    contactPhoneNumbers: [{id: generateUniqueId(), number: '11120', type: 'workLandline', isPrimary: true, protocols: ['voice'], label: 'Εξυπηρέτηση Πελατών'}],
    roles: ['supplier'],
    createdAt: fourDaysAgo,
    updatedAt: twoHoursAgo, 
  },
  {
    id: '6',
    contactType: 'naturalPerson',
    basicIdentity: { firstName: 'Ελένη', lastName: 'Νικολάου' },
    email: 'eleni.nik@example.net',
    contactPhoneNumbers: [{ id: generateUniqueId(), number: '6988765432', type: 'mobile', isPrimary: true, protocols: ['voice', 'viber'], label: 'Προσωπικό Κινητό' }],
    roles: ['customer', 'consultant'],
    createdAt: oneWeekAgo,
    updatedAt: oneWeekAgo,
  },
  {
    id: '7',
    contactType: 'legalEntity',
    name: 'Νομική Υπηρεσία "ΔΙΚΑΙΟΝ"',
    companyType: 'Δικηγορικό Γραφείο',
    email: 'info@dikaion.law',
    roles: ['consultant'],
    createdAt: twoDaysAgo,
    updatedAt: twoDaysAgo,
    avatarUrl: 'https://picsum.photos/seed/dikaion/200',
  },
  {
    id: '8',
    contactType: 'naturalPerson',
    basicIdentity: { firstName: 'Δημήτρης', lastName: 'Αντωνίου' },
    email: 'dimitris.a@webmail.com',
    roles: ['admin', 'employee'],
    professionalInfo: { jobTitle: 'System Administrator'},
    createdAt: fiveDaysAgo,
    updatedAt: threeDaysAgo,
  }
];


export const initialNotes: Note[] = [
  {
    id: generateUniqueId(),
    entityType: 'contact' as EntityType, 
    entityId: '1',
    author: mockUserSystemRef,
    content: 'Ενδιαφέρεται για νέα ακίνητα στην Αττική. Έγινε επικοινωνία 10/10. Αναμένεται follow-up. Πολύ σημαντική επαφή, πιθανόν για μεγάλη επένδυση. Χρειάζεται προσοχή και άμεση εξυπηρέτηση. Urgent: Να ελεγχθεί η διαθεσιμότητα των ακινήτων που συζητήθηκαν.',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), 
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    visibility: 'team',
    pinned: true,
    type: 'general',
    tags: ['ενδιαφέρον', 'ακίνητα_αττική', 'επένδυση']
  },
  {
    id: generateUniqueId(),
    entityType: 'contact' as EntityType,
    entityId: '1',
    author: mockUserYannisRef,
    content: 'Προγραμματίστηκε συνάντηση για την επόμενη εβδομάδα. Συζητήθηκαν οι προτιμήσεις της για διαμερίσματα 2 υπνοδωματίων. @maria.k μπορείς να ετοιμάσεις τις σχετικές παρουσιάσεις;',
    createdAt: new Date(Date.now() - 86400000).toISOString(), 
    updatedAt: thirtyMinutesAgo, 
    visibility: 'private',
    pinned: false,
    type: 'meeting',
    tags: ['follow-up', 'συνάντηση'],
    mentionedUserIds: [mockUserMariaRef.userId] // Use userId from the UserReference object
  },
  {
    id: generateUniqueId(),
    entityType: 'contact' as EntityType,
    entityId: '2',
    author: mockUserAdminRef,
    content: 'Κύριος προμηθευτής δομικών υλικών και εξοπλισμού. Πολύ καλή συνεργασία. Επίκειται ανανέωση συμβολαίου. Critical: Να μην ξεχαστεί η ημερομηνία λήξης!',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), 
    updatedAt: oneDayAgo, 
    visibility: 'team',
    pinned: true,
    type: 'general',
    tags: ['προμηθευτής', 'υλικά', 'συμβόλαιο']
  },
   {
    id: generateUniqueId(),
    entityType: 'contact' as EntityType,
    entityId: '4',
    author: mockUserSystemRef,
    content: 'Κατατέθηκε αίτηση για άδεια ΧΧΧΧΧ. Αναμονή απάντησης. Ο @admin_user παρακολουθεί την εξέλιξη.',
    createdAt: now,
    updatedAt: fiveMinutesAgo,
    visibility: 'team',
    pinned: false,
    type: 'internal_comment',
    tags: ['πολεοδομία', 'άδεια'],
    mentionedUserIds: [mockUserAdminRef.userId]
  },
  {
    id: generateUniqueId(),
    entityType: 'contact' as EntityType,
    entityId: '3', // Γιώργος Ιωάννου
    author: mockUserMariaRef,
    content: 'Τηλεφωνική επικοινωνία με τον Γιώργο. Συζητήσαμε τις λεπτομέρειες του project "Alpha". Φάνηκε θετικός και πρόθυμος να βοηθήσει. Είπε ότι θα στείλει τα σχετικά έγγραφα μέχρι αύριο. Θα κάνω follow-up το απόγευμα της Παρασκευής αν δεν έχω νέα.',
    createdAt: twoHoursAgo,
    updatedAt: twoHoursAgo,
    visibility: 'team',
    pinned: false,
    type: 'call_log',
    tags: ['project_alpha', 'follow_up_needed']
  },
  {
    id: generateUniqueId(),
    entityType: 'contact' as EntityType,
    entityId: '5', // ΕΛΤΑ Courier
    author: mockUserNikosRef,
    content: 'Επικοινωνία με ΕΛΤΑ για καθυστέρηση αποστολής. Critical: Το δέμα για την επαφή "ΤΕΧΝΙΚΗ ΚΑΤΑΣΚΕΥΑΣΤΙΚΗ Α.Ε." έπρεπε να έχει παραδοθεί χθες. Είπαν θα το ελέγξουν. @yannis.p ενημέρωσε τον πελάτη.',
    createdAt: oneHourAgo,
    updatedAt: oneHourAgo,
    visibility: 'team',
    pinned: true,
    type: 'general',
    tags: ['καθυστέρηση', 'ΕΛΤΑ', 'urgent'],
    mentionedUserIds: [mockUserYannisRef.userId]
  },
  {
    id: generateUniqueId(),
    entityType: 'contact' as EntityType,
    entityId: '6', // Ελένη Νικολάου
    author: mockUserSofiaRef,
    content: 'Συνάντηση με την κα. Νικολάου για τις επενδυτικές της προτάσεις. Έδειξε ενδιαφέρον για ακίνητα στην Κρήτη. Θα της στείλω περισσότερες πληροφορίες. Η συζήτηση ήταν πολύ εποικοδομητική και φάνηκε να κατανοεί πλήρως τις ευκαιρίες που παρουσιάζονται. Ζήτησε επίσης πληροφορίες για τις νομικές διαδικασίες, οπότε θα πρέπει να συντονιστώ με το νομικό τμήμα. Αυτό το κείμενο είναι αρκετά μεγάλο για να δοκιμάσει τη λειτουργία σύνοψης AI.',
    createdAt: oneDayAgo,
    updatedAt: oneDayAgo,
    visibility: 'team',
    pinned: false,
    type: 'meeting',
    tags: ['επένδυση', 'Κρήτη', 'follow_up']
  },
  {
    id: generateUniqueId(),
    entityType: 'contact' as EntityType,
    entityId: '7', // Νομική Υπηρεσία "ΔΙΚΑΙΟΝ"
    author: mockUserAdminRef,
    content: 'Τηλεφωνική κλήση με Νομική Υπηρεσία "ΔΙΚΑΙΟΝ". Συζητήθηκαν τα νομικά ζητήματα για το έργο "Omega". Όλα φαίνονται να προχωρούν ομαλά. Παραμένει η εκκρεμότητα της υπογραφής του συμφωνητικού Χ. @nikos.a έχεις εικόνα πότε θα γίνει αυτό;',
    createdAt: thirtyMinutesAgo,
    updatedAt: thirtyMinutesAgo,
    visibility: 'team',
    pinned: false,
    type: 'call_log',
    tags: ['νομικά', 'project_omega'],
    mentionedUserIds: [mockUserNikosRef.userId]
  }
];