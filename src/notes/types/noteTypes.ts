// src/notes/types/noteTypes.ts
import type { EntityType as GlobalEntityType } from '../../types';

// Core Entity Types (managed by the notes module itself, to be combined globally)
export type CoreEntityType = 'contact' | 'transaction' | 'task' | 'general';
export const coreEntityTypesArray: CoreEntityType[] = ['contact', 'transaction', 'task', 'general'];

// Note specific enums
export type NoteVisibility = 'private' | 'team' | 'public';
export const allNoteVisibilitiesArray: NoteVisibility[] = ['private', 'team', 'public'];

export type NoteType = 'general' | 'meeting' | 'call_log' | 'reminder' | 'internal_comment' | 'system_event';
export const allNoteTypesArray: NoteType[] = ['general', 'meeting', 'call_log', 'reminder', 'internal_comment', 'system_event'];

export interface UserReference {
  userId: string;
  displayName: string;
  avatarUrl?: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number; // in bytes
  url: string; // Could be a data URL or a path to stored file
  uploadedAt: string; // ISO Date String
}

export interface Note {
  id: string;
  entityType: GlobalEntityType; // Use the combined global EntityType
  entityId: string;
  author: UserReference;
  content: string;
  createdAt: string; // ISO Date String
  updatedAt: string; // ISO Date String
  visibility: NoteVisibility;
  pinned: boolean;
  tags?: string[];
  type: NoteType;
  mentionedUserIds?: string[];
  attachments?: Attachment[];
}
