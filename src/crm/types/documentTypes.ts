// src/crm/types/documentTypes.ts

import type { EntityType } from '../../types'; // Ensure this path is correct

export type DocumentCategory =
  | 'contract'          // Συμβόλαιο
  | 'license'           // Άδεια (π.χ. οικοδομική)
  | 'technical_report'  // Τεχνική Έκθεση
  | 'blueprint'         // Αρχιτεκτονικό Σχέδιο
  | 'invoice'           // Τιμολόγιο
  | 'receipt'           // Απόδειξη
  | 'presentation'      // Παρουσίαση
  | 'image'             // Εικόνα
  | 'video'             // Βίντεο
  | 'audio'             // Ηχητικό αρχείο
  | 'spreadsheet'       // Λογιστικό φύλλο
  | 'text_document'     // Γενικό έγγραφο κειμένου
  | 'archive'           // Συμπιεσμένο αρχείο (zip, rar)
  | 'legal_document'    // Νομικό έγγραφο (γενικό)
  | 'identity_document' // Έγγραφο ταυτοποίησης (π.χ. ταυτότητα, διαβατήριο)
  | 'property_title'    // Τίτλος ιδιοκτησίας
  | 'other';            // Άλλο

export const documentCategoryTranslations: Record<DocumentCategory, string> = {
  contract: 'Συμβόλαιο',
  license: 'Άδεια',
  technical_report: 'Τεχνική Έκθεση',
  blueprint: 'Αρχιτεκτονικό Σχέδιο',
  invoice: 'Τιμολόγιο',
  receipt: 'Απόδειξη',
  presentation: 'Παρουσίαση',
  image: 'Εικόνα',
  video: 'Βίντεο',
  audio: 'Ηχητικό αρχείο',
  spreadsheet: 'Λογιστικό Φύλλο',
  text_document: 'Έγγραφο Κειμένου',
  archive: 'Συμπιεσμένο Αρχείο',
  legal_document: 'Νομικό Έγγραφο',
  identity_document: 'Έγγραφο Ταυτοποίησης',
  property_title: 'Τίτλος Ιδιοκτησίας',
  other: 'Άλλο',
};

export const zodAllDocumentCategoriesArray = Object.keys(documentCategoryTranslations) as [DocumentCategory, ...DocumentCategory[]];


export interface Document {
  id: string; // UUID
  fileName: string;
  fileType: string; // MIME type
  fileSize: number; // in bytes
  storagePath: string; // Path in the storage system (e.g., Supabase Storage path)
  
  uploadedByUserId: string; // FK to User.id
  uploadedAt: string; // ISO Date String
  
  relatedEntityType: EntityType; // Type of entity this document is related to
  relatedEntityId: string; // ID of the related entity
  
  documentCategory: DocumentCategory;
  description?: string;
  
  version?: number; // For simple versioning
  tags?: string[];
  
  updatedAt: string; // ISO Date String, for metadata updates
  // Potential future fields:
  // isArchived?: boolean;
  // expiresAt?: string; // ISO Date String
  // customMetadata?: Record<string, any>;
}
