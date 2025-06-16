// src/automation/actionHandlers/createNoteHandler.ts
import type { TriggerEventData } from '../workflowTypes';
import { getNestedValue, processTemplateString } from '../utils';
import { createNote as createNoteService } from '../../notes/services/note.service';
import type { NoteType, NoteVisibility, Attachment } from '../../notes/types/noteTypes';
import type { EntityType } from '../../types';
import { useNotesStore } from '../../notes/stores/notesStore';

export async function handleCreateNoteAction(
  params: Record<string, any>,
  eventData: TriggerEventData,
  ruleName: string
): Promise<void> {
  const baseLogMessage = `[ActionExecutor][Rule: "${ruleName}"] Action: CREATE_NOTE`;
  const targetEntityIdField = params.targetEntityIdField as string | undefined;
  const entityType = params.entityType as EntityType | undefined;
  const contentTemplate = params.contentTemplate as string | undefined;
  const noteTypeParam = params.noteType as NoteType | undefined;
  const visibility = params.visibility as NoteVisibility | undefined;
  const authorDisplayName = params.authorDisplayName as string | undefined;
  const tags = params.tags as string[] | undefined;
  const isPinned = params.isPinned as boolean | undefined;
  const attachments = params.attachments as Attachment[] | undefined;

  if (targetEntityIdField && entityType && contentTemplate && authorDisplayName) {
    const entityId = getNestedValue(eventData, targetEntityIdField) as string | undefined;
    if (entityId) {
      const finalContent = processTemplateString(contentTemplate, eventData);
      try {
        const newNoteFromService = await createNoteService({
          entityId,
          entityType,
          content: finalContent,
          authorDisplayName,
          type: noteTypeParam || 'general',
          visibility: visibility || 'team',
          tags: tags || [],
          pinned: isPinned || false,
          attachments: attachments || [],
        });
        useNotesStore.getState().addNote(newNoteFromService); // Ensure store is updated if service doesn't do it
        console.log(baseLogMessage + ` | SUCCESS: Note created for entity '${entityType}:${entityId}'. Note ID: ${newNoteFromService.id}`);
      } catch (e) {
        console.error(baseLogMessage + ` | FAILED to create note for entity '${entityType}:${entityId}':`, e);
      }
    } else {
      console.warn(baseLogMessage + ` | SKIPPED: Entity ID not found in eventData using field '${targetEntityIdField}'.`);
    }
  } else {
    console.warn(baseLogMessage + ` | SKIPPED: Missing required params for CREATE_NOTE.`);
  }
}
