// src/crm/data/mockCrmData.ts
import type { ProjectType } from '../types/projectTypes';
import type { GroupType } from '../types/groupTypes';
import type { CompanyType } from '../types/companyTypes';
import type { BuildingType } from '../types/buildingTypes';
import type { FloorType } from '../types/floorTypes';
import type { PropertyType } from '../types/propertyTypes';
import type { PropertyAccessoryType } from '../types/propertyAccessoryTypes';
import type { PipelineStage, PipelineEntry } from '../types/pipelineTypes'; 
import type { Activity } from '../types/activityTypes'; 
import type { Document } from '../types/documentTypes';
import { generateUniqueId } from '../../utils/formUtils';
import { mockUsers } from '../../data/mocks/users'; // Import mockUsers for IDs

const now = new Date().toISOString();
const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();
const sixMonthsFromNow = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();
const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
const twoWeeksFromNow = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(); 
const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); 

const yannisId = mockUsers.find(u => u.username === 'yannis.p')?.id || 'user-001';
const mariaId = mockUsers.find(u => u.username === 'maria.k')?.id || 'user-002';
const adminId = mockUsers.find(u => u.username === 'admin_user')?.id || 'admin-001';


export const groupsDB: GroupType[] = [
  {
    id: 'group-realestate-dev',
    name: 'Όμιλος Ανάπτυξης Ακινήτων "Ορίζοντες"',
    description: 'Κορυφαίος όμιλος στον τομέα ανάπτυξης και διαχείρισης ακινήτων.',
    createdAt: oneYearAgo,
    updatedAt: now,
  },
];

export const companiesDB: CompanyType[] = [
  {
    id: 'comp-001',
    name: 'Ορίζοντες Κατασκευαστική Α.Ε.',
    groupId: 'group-realestate-dev',
    vatNumber: '123456789',
    taxOffice: 'ΦΑΕ Αθηνών',
    gemhNumber: '1234567890123',
    primaryAddress: {
      id: generateUniqueId(),
      street: 'Λεωφόρος Μεσογείων',
      number: '250',
      city: 'Αθήνα',
      postalCode: '15561',
      country: 'Ελλάδα',
      addressType: 'work',
      isPrimary: true,
    },
    website: 'https://orizontes-dev.gr',
    description: 'Η κύρια κατασκευαστική εταιρεία του ομίλου "Ορίζοντες".',
    createdAt: oneYearAgo,
    updatedAt: now,
  },
  {
    id: 'comp-002',
    name: 'Aρχιτεκτονικό Γραφείο "Δημιουργία"',
    description: 'Συνεργαζόμενο αρχιτεκτονικό γραφείο.',
    vatNumber: '987654321',
    taxOffice: 'Α\' Αθηνών',
    createdAt: sixMonthsAgo,
    updatedAt: threeMonthsAgo,
  },
  {
    id: 'comp-003',
    name: 'Mykonos Luxury Developments Ltd.',
    description: 'Εταιρεία ανάπτυξης πολυτελών ακινήτων στις Κυκλάδες.',
    vatNumber: '112233445',
    taxOffice: 'ΔΟΥ Μυκόνου',
    createdAt: sixMonthsAgo,
    updatedAt: now,
  }
];

export const projectsDB: ProjectType[] = [
  {
    id: 'proj-alpha-001',
    name: 'Κατοικίες "Ηλιαχτίδα Πάρνηθας"',
    projectCode: 'HLX01-PAR',
    description: 'Ανάπτυξη συγκροτήματος 10 σύγχρονων κατοικιών στους πρόποδες της Πάρνηθας, με έμφαση στην ενεργειακή απόδοση και την ποιότητα κατασκευής.',
    location: 'Πάρνηθα, Αττική',
    phase: 'construction',
    budget: 5000000,
    startDate: oneYearAgo,
    expectedEndDate: sixMonthsFromNow,
    companyId: 'comp-001',
    managerUserId: yannisId, // Yannis P.
    createdAt: oneYearAgo,
    updatedAt: now,
  },
  {
    id: 'proj-beta-002',
    name: 'Luxury Villas Mykonos "Aegean Blue"',
    projectCode: 'MYK-LUX-AB',
    description: 'Κατασκευή 5 πολυτελών βιλών στη Μύκονο με ιδιωτικές πισίνες και απεριόριστη θέα στο Αιγαίο.',
    location: 'Ελιά, Μύκονος',
    phase: 'design',
    budget: 15000000,
    companyId: 'comp-003',
    createdAt: now,
    updatedAt: now,
    managerUserId: mariaId, // Maria K.
  },
  {
    id: 'proj-gamma-003',
    name: 'Ανακαίνιση Γραφείων "City Hub"',
    projectCode: 'CITY-HUB-REN',
    description: 'Πλήρης ανακαίνιση και διαμόρφωση κτιρίου γραφείων στο κέντρο της πόλης.',
    location: 'Κέντρο Αθήνας',
    phase: 'completed',
    actualEndDate: threeMonthsAgo,
    companyId: 'comp-001',
    createdAt: oneYearAgo,
    updatedAt: threeMonthsAgo,
    managerUserId: adminId, // Admin User
  }
];

export const buildingsDB: BuildingType[] = [
  {
    id: 'build-parnitha-a',
    projectId: 'proj-alpha-001',
    name: 'Κτίριο Α - Ηλιαχτίδα Πάρνηθας',
    buildingCode: 'A',
    numberOfFloors: 3,
    constructionStartDate: sixMonthsAgo,
    createdAt: sixMonthsAgo,
    updatedAt: now,
  },
  {
    id: 'build-parnitha-b',
    projectId: 'proj-alpha-001',
    name: 'Κτίριο Β - Ηλιαχτίδα Πάρνηθας',
    buildingCode: 'B',
    numberOfFloors: 2,
    createdAt: threeMonthsAgo,
    updatedAt: now,
  },
];

export const floorsDB: FloorType[] = [
  {
    id: 'floor-parnitha-a-0',
    buildingId: 'build-parnitha-a',
    floorNumber: 0, // Ισόγειο
    description: 'Ισόγειο Κτιρίου Α',
    area: 120,
    createdAt: sixMonthsAgo,
    updatedAt: now,
  },
  {
    id: 'floor-parnitha-a-1',
    buildingId: 'build-parnitha-a',
    floorNumber: 1,
    description: '1ος Όροφος Κτιρίου Α',
    area: 100,
    createdAt: sixMonthsAgo,
    updatedAt: now,
  },
];

export const propertiesDB: PropertyType[] = [
  {
    id: 'prop-parnitha-a-g1',
    floorId: 'floor-parnitha-a-0',
    projectId: 'proj-alpha-001', 
    name: 'Διαμέρισμα Α-Γ1',
    propertyCode: 'Α-Γ1',
    kind: 'apartment',
    areaNet: 85,
    areaGross: 100,
    bedrooms: 2,
    bathrooms: 1,
    price: 250000,
    status: 'available',
    description: 'Ευρύχωρο διαμέρισμα ισογείου με κήπο.',
    createdAt: sixMonthsAgo,
    updatedAt: now,
  },
  {
    id: 'prop-parnitha-a-a1',
    floorId: 'floor-parnitha-a-1',
    projectId: 'proj-alpha-001',
    name: 'Μεζονέτα Α-Α1',
    propertyCode: 'Α-Α1',
    kind: 'maisonette',
    areaNet: 120,
    areaGross: 140,
    bedrooms: 3,
    bathrooms: 2,
    price: 380000,
    status: 'sold',
    description: 'Πολυτελής μεζονέτα 1ου ορόφου με θέα.',
    createdAt: sixMonthsAgo,
    updatedAt: threeMonthsAgo,
  },
];

export const propertyAccessoriesDB: PropertyAccessoryType[] = [
  {
    id: 'acc-parnitha-a-g1-p1',
    propertyId: 'prop-parnitha-a-g1',
    kind: 'parking_spot_closed',
    accessoryCode: 'P1',
    description: 'Κλειστή θέση στάθμευσης υπογείου.',
    price: 15000,
    status: 'available',
    createdAt: sixMonthsAgo,
    updatedAt: now,
  },
  {
    id: 'acc-parnitha-a-a1-s1',
    propertyId: 'prop-parnitha-a-a1',
    kind: 'storage_unit',
    accessoryCode: 'S1',
    description: 'Αποθήκη υπογείου 10τμ.',
    status: 'sold_with_property',
    createdAt: sixMonthsAgo,
    updatedAt: threeMonthsAgo,
  },
];

export const mockProjects = projectsDB;


export const pipelineStagesDB: PipelineStage[] = [
  { id: 'stage-new', name: 'Νέο Ενδιαφέρον', order: 1, description: 'Νέα εισερχόμενη ευκαιρία ή δυνητικός πελάτης.', createdAt: oneYearAgo, updatedAt: oneYearAgo },
  { id: 'stage-contacted', name: 'Επικοινωνήθηκε', order: 2, description: 'Έγινε η πρώτη επαφή με τον ενδιαφερόμενο.', createdAt: oneYearAgo, updatedAt: oneYearAgo },
  { id: 'stage-meeting', name: 'Ραντεβού/Παρουσίαση', order: 3, description: 'Προγραμματίστηκε ή έγινε ραντεβού/παρουσίαση.', createdAt: oneYearAgo, updatedAt: oneYearAgo },
  { id: 'stage-proposal', name: 'Προσφορά', order: 4, description: 'Έχει σταλεί προσφορά στον πελάτη.', createdAt: oneYearAgo, updatedAt: oneYearAgo },
  { id: 'stage-negotiation', name: 'Διαπραγμάτευση', order: 5, description: 'Σε φάση διαπραγμάτευσης όρων.', createdAt: oneYearAgo, updatedAt: oneYearAgo },
  { id: 'stage-won', name: 'Κερδισμένο', order: 6, description: 'Η συμφωνία έκλεισε επιτυχώς.', isSystemStage: true, createdAt: oneYearAgo, updatedAt: oneYearAgo },
  { id: 'stage-lost', name: 'Χαμένο', order: 7, description: 'Η συμφωνία δεν προχώρησε.', isSystemStage: true, createdAt: oneYearAgo, updatedAt: oneYearAgo },
];

export const pipelineEntriesDB: PipelineEntry[] = [
  {
    id: 'deal-001',
    dealName: 'Deal για Ηλιαχτίδα Α-Γ1 με Μ. Παπαδοπούλου',
    contactId: '1', 
    propertyId: 'prop-parnitha-a-g1',
    projectId: 'proj-alpha-001',
    stageId: 'stage-proposal',
    salespersonUserId: mariaId, // Maria K.
    amount: 250000,
    probability: 70,
    expectedCloseDate: oneWeekFromNow,
    createdAt: oneMonthAgo,
    updatedAt: oneWeekAgo,
    notes: 'Έδειξε έντονο ενδιαφέρον. Αναμένει απάντηση στην προσφορά.',
  },
  {
    id: 'deal-002',
    dealName: 'TEXNIKH A.E. - Ανακαίνιση City Hub',
    contactId: '2', 
    projectId: 'proj-gamma-003', 
    stageId: 'stage-won',
    salespersonUserId: yannisId, // Yannis P.
    amount: 1200000,
    probability: 100,
    expectedCloseDate: threeMonthsAgo,
    actualCloseDate: threeMonthsAgo,
    createdAt: sixMonthsAgo,
    updatedAt: threeMonthsAgo,
    notes: 'Ολοκληρώθηκε επιτυχώς.',
  },
  {
    id: 'deal-003',
    dealName: 'Ενδιαφέρον Γ. Ιωάννου για Mykonos Villa',
    contactId: '3', 
    projectId: 'proj-beta-002', 
    stageId: 'stage-contacted',
    salespersonUserId: mariaId, // Maria K.
    amount: 3000000, 
    probability: 20,
    expectedCloseDate: sixMonthsFromNow,
    createdAt: oneWeekAgo,
    updatedAt: now,
    notes: 'Πρώτη διερευνητική επαφή.',
  },
   {
    id: 'deal-004',
    dealName: 'Deal για Ηλιαχτίδα Α-Α1 (πριν πωληθεί) με Ε. Νικολάου',
    contactId: '6', 
    propertyId: 'prop-parnitha-a-a1', 
    projectId: 'proj-alpha-001',
    stageId: 'stage-lost', 
    salespersonUserId: yannisId, // Yannis P.
    amount: 370000,
    probability: 0,
    expectedCloseDate: oneMonthAgo,
    actualCloseDate: oneMonthAgo, 
    createdAt: sixMonthsAgo,
    updatedAt: oneMonthAgo,
    notes: 'Δεν προχώρησε, το ακίνητο πουλήθηκε σε άλλον.',
  },
   {
    id: 'deal-005',
    dealName: 'Προσφορά για γραφείο στο City Hub (TEXNIKH A.E.)',
    contactId: '2', 
    projectId: 'proj-gamma-003',
    stageId: 'stage-negotiation',
    salespersonUserId: adminId, // Admin User
    amount: 55000, 
    probability: 60,
    expectedCloseDate: twoWeeksFromNow,
    createdAt: oneWeekAgo,
    updatedAt: now,
    notes: 'Διαπραγμάτευση για τους όρους ενοικίασης γραφείου στο City Hub. Φαίνονται θετικοί.',
  },
];

export const activitiesDB: Activity[] = [
  {
    id: generateUniqueId(),
    category: 'communication',
    specificType: 'call_outgoing',
    title: 'Κλήση προς Μαρία Π. για Ηλιαχτίδα Πάρνηθας',
    description: 'Συζητήθηκαν οι λεπτομέρειες του διαμερίσματος Α-Γ1 και οι όροι της προσφοράς. Έδειξε ενδιαφέρον.',
    startTime: oneHourAgo,
    endTime: new Date(Date.now() - 1 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(), 
    durationSeconds: 15 * 60,
    outcome: 'needs_follow_up',
    userId: yannisId, 
    contactId: '1', 
    projectId: 'proj-alpha-001',
    propertyId: 'prop-parnitha-a-g1',
    dealId: 'deal-001',
    createdAt: oneHourAgo,
    updatedAt: oneHourAgo,
  },
  {
    id: generateUniqueId(),
    category: 'communication',
    specificType: 'email_sent',
    title: 'Email προς TEXNIKH A.E. - Προσφορά Ανακαίνισης City Hub',
    description: 'Απεστάλη η τελική προσφορά για την ανακαίνιση των γραφείων του City Hub.',
    startTime: twoHoursAgo,
    outcome: 'successful',
    userId: mariaId, 
    contactId: '2', 
    projectId: 'proj-gamma-003',
    dealId: 'deal-002',
    createdAt: twoHoursAgo,
    updatedAt: twoHoursAgo,
  },
  {
    id: generateUniqueId(),
    category: 'site_visit',
    specificType: 'site_inspection',
    title: 'Επίσκεψη στο έργο "Luxury Villas Mykonos"',
    description: 'Επιθεώρηση προόδου εργασιών και συντονισμός με την ομάδα κατασκευής.',
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), 
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(), 
    durationSeconds: 3 * 60 * 60,
    outcome: 'information_gathered',
    userId: mariaId, 
    projectId: 'proj-beta-002',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: generateUniqueId(),
    category: 'meeting',
    specificType: 'in_person_meeting',
    title: 'Συνάντηση με Γ. Ιωάννου για Mykonos Villas',
    description: 'Παρουσίαση των σχεδίων και των τιμών για τις βίλες. Έδειξε αρχικό ενδιαφέρον.',
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), 
    endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000).toISOString(), 
    durationSeconds: 1.5 * 60 * 60,
    outcome: 'pending',
    userId: adminId, 
    contactId: '3', 
    projectId: 'proj-beta-002',
    dealId: 'deal-003',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const documentsDB: Document[] = [
  {
    id: generateUniqueId(),
    fileName: 'Συμβόλαιο_Πώλησης_Α-Γ1.pdf',
    fileType: 'application/pdf',
    fileSize: 1024 * 512, // 512KB
    storagePath: '/projects/proj-alpha-001/properties/prop-parnitha-a-g1/contracts/Συμβόλαιο_Πώλησης_Α-Γ1.pdf',
    uploadedByUserId: yannisId,
    uploadedAt: oneMonthAgo,
    relatedEntityType: 'property',
    relatedEntityId: 'prop-parnitha-a-g1',
    documentCategory: 'contract',
    description: 'Υπογεγραμμένο συμβόλαιο πώλησης για το διαμέρισμα Α-Γ1.',
    updatedAt: oneMonthAgo,
    version: 1,
    tags: ['συμβόλαιο', 'πώληση', 'Ηλιαχτίδα Πάρνηθας']
  },
  {
    id: generateUniqueId(),
    fileName: 'Οικοδομική_Άδεια_HLX01-PAR.pdf',
    fileType: 'application/pdf',
    fileSize: 1024 * 1200, // 1.2MB
    storagePath: '/projects/proj-alpha-001/licenses/Οικοδομική_Άδεια_HLX01-PAR.pdf',
    uploadedByUserId: adminId,
    uploadedAt: sixMonthsAgo,
    relatedEntityType: 'project',
    relatedEntityId: 'proj-alpha-001',
    documentCategory: 'license',
    description: 'Η κύρια οικοδομική άδεια για το έργο "Ηλιαχτίδα Πάρνηθας".',
    updatedAt: sixMonthsAgo,
  },
  {
    id: generateUniqueId(),
    fileName: 'Κάτοψη_Κτιρίου_Α_Ηλιαχτίδα.dwg',
    fileType: 'image/vnd.dwg', 
    fileSize: 1024 * 2500, // 2.5MB
    storagePath: '/projects/proj-alpha-001/buildings/build-parnitha-a/blueprints/Κάτοψη_Κτιρίου_Α.dwg',
    uploadedByUserId: mariaId,
    uploadedAt: threeMonthsAgo,
    relatedEntityType: 'building',
    relatedEntityId: 'build-parnitha-a',
    documentCategory: 'blueprint',
    updatedAt: threeMonthsAgo,
  },
  {
    id: generateUniqueId(),
    fileName: 'Φωτογραφίες_Προόδου_Mykonos_Villas.zip',
    fileType: 'application/zip',
    fileSize: 1024 * 15000, // 15MB
    storagePath: '/projects/proj-beta-002/images/Φωτογραφίες_Προόδου_Mykonos_Villas.zip',
    uploadedByUserId: mariaId,
    uploadedAt: oneWeekAgo,
    relatedEntityType: 'project',
    relatedEntityId: 'proj-beta-002',
    documentCategory: 'archive',
    description: 'Συλλογή φωτογραφιών από την πρόοδο των εργασιών στις βίλες Μυκόνου.',
    updatedAt: oneWeekAgo,
    tags: ['φωτογραφίες', 'Μύκονος', 'πρόοδος']
  },
  {
    id: generateUniqueId(),
    fileName: 'Τιμολόγιο_Προς_TEXNIKH_AE_00123.pdf',
    fileType: 'application/pdf',
    fileSize: 1024 * 80, // 80KB
    storagePath: '/companies/comp-001/invoices/Τιμολόγιο_00123.pdf',
    uploadedByUserId: adminId,
    uploadedAt: now,
    relatedEntityType: 'company',
    relatedEntityId: 'comp-001', 
    documentCategory: 'invoice',
    description: 'Τιμολόγιο παροχής υπηρεσιών για την ανακαίνιση City Hub.',
    updatedAt: now,
  }
];