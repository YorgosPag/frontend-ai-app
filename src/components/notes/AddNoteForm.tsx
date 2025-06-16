// src/components/notes/AddNoteForm.tsx
import React, { useState, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';

import Tooltip from '../ui/Tooltip';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import Select from '../ui/Select';
import FormFieldWrapper from '../ui/FormFieldWrapper';
import MentionTextarea from '../ui/MentionTextarea';

import type { Note, NoteType, NoteVisibility, Attachment } from '../../notes/types/noteTypes';
import type { EntityType } from '../../types'; // <<< CORRECTED IMPORT
import type { IconName } from '../../types/iconTypes';
import { allNoteTypesArray, allNoteVisibilitiesArray } from '../../notes/types/noteTypes'; // <<< CORRECTED IMPORT
import { uiStrings, noteTypeTranslations, noteVisibilityTranslations } from '../../config/translations';
import { mockUsers } from '../../data/mocks/users';
import { generateUniqueId } from '../../utils/idUtils'; // Updated import

const MAX_ATTACHMENT_SIZE_MB = 2;
const MAX_ATTACHMENTS_COUNT = 3;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

interface AddNoteFormProps {
  entityId: string;
  entityType: EntityType;
  contactDisplayName: string;
  isVoipReady: boolean;
  isLoadingAddNoteProp: boolean; // Renamed to avoid conflict if internal loading state was named similarly
  disabledByParent: boolean; // General disabled state from parent
  handleAddNote: (
    entityId: string,
    entityType: EntityType,
    content: string,
    authorDisplayName: string,
    contactDisplayName: string,
    optionalDetails?: {
      visibility?: NoteVisibility;
      pinned?: boolean;
      type?: NoteType;
      tags?: string[];
      mentionedUserIds?: string[];
      attachments?: Attachment[];
    }
  ) => Promise<Note | null>;
}

const AddNoteForm: React.FC<AddNoteFormProps> = React.memo(({
  entityId,
  entityType,
  contactDisplayName,
  isVoipReady,
  isLoadingAddNoteProp,
  disabledByParent,
  handleAddNote,
}) => {
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteMentionedUserIds, setNewNoteMentionedUserIds] = useState<string[]>([]);
  const [newNoteSelectedFiles, setNewNoteSelectedFiles] = useState<File[]>([]);
  const [selectedNoteType, setSelectedNoteType] = useState<NoteType>('general');
  const [selectedNoteVisibility, setSelectedNoteVisibility] = useState<NoteVisibility>('team');

  const newNoteFileInputRef = useRef<HTMLInputElement>(null);

  const manualNoteTypes = useMemo(() =>
    allNoteTypesArray.filter(type => type !== 'system_event')
  , []);

  const handleNewNoteFileSelectLocal = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(event.target.files || []); // Explicitly type as File[]
    if (!files.length) return;

    if (newNoteSelectedFiles.length + files.length > MAX_ATTACHMENTS_COUNT) {
      toast.error(uiStrings.maxFilesError(MAX_ATTACHMENTS_COUNT));
      if (newNoteFileInputRef.current) newNoteFileInputRef.current.value = "";
      return;
    }

    let totalSize = newNoteSelectedFiles.reduce((acc, file) => acc + file.size, 0);
    const validNewFiles: File[] = [];
    for (const file of files) { // file is now correctly typed as File
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast.error(`${uiStrings.fileTypeError}: ${file.name}`);
        continue;
      }
      if (totalSize + file.size > MAX_ATTACHMENT_SIZE_MB * 1024 * 1024) {
        toast.error(uiStrings.maxFileSizeError(MAX_ATTACHMENT_SIZE_MB));
        break;
      }
      totalSize += file.size;
      validNewFiles.push(file);
    }
    setNewNoteSelectedFiles(prev => [...prev, ...validNewFiles]);
    if (newNoteFileInputRef.current) newNoteFileInputRef.current.value = "";
  };

  const handleRemoveNewSelectedFileLocal = (index: number) => {
    setNewNoteSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processFilesToAttachmentsLocal = async (files: File[]): Promise<Attachment[]> => { // files parameter is now File[]
    const attachmentPromises = files.map((file: File) => { // file is now File
      return new Promise<Attachment | null>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            id: generateUniqueId(),
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            url: e.target?.result as string,
            uploadedAt: new Date().toISOString(),
          });
        };
        reader.onerror = (e) => {
          console.error("File read error for new note:", e);
          toast.error(`${uiStrings.fileReadError}: ${file.name}`);
          resolve(null);
        };
        reader.readAsDataURL(file);
      });
    });
    const results = await Promise.all(attachmentPromises);
    return results.filter((att): att is Attachment => att !== null);
  };

  const getFileTypeIconNameLocal = (fileType: string): IconName => {
    if (fileType.startsWith('image/')) return 'fileImage';
    if (fileType === 'application/pdf') return 'filePdf';
    if (fileType.includes('wordprocessingml') || fileType === 'application/msword') return 'fileText';
    if (fileType === 'text/plain') return 'fileText';
    if (['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/x-tar'].includes(fileType)) return 'fileArchive';
    return 'fileGeneric';
  };

  const handleFormSubmit = async () => {
    if (!newNoteText.trim()) return;
    const currentUserName = "Εγώ"; // Placeholder, in a real app, this would come from auth context

    const processedNewAttachments = await processFilesToAttachmentsLocal(newNoteSelectedFiles);

    const newNoteData = await handleAddNote(
      entityId,
      entityType,
      newNoteText.trim(),
      currentUserName,
      contactDisplayName,
      {
        type: selectedNoteType,
        visibility: selectedNoteVisibility,
        mentionedUserIds: newNoteMentionedUserIds,
        attachments: processedNewAttachments,
      }
    );
    if (newNoteData) {
      // Reset form state
      setNewNoteText('');
      setNewNoteMentionedUserIds([]);
      setNewNoteSelectedFiles([]);
      setSelectedNoteType('general');
      setSelectedNoteVisibility('team');
      if (newNoteFileInputRef.current) newNoteFileInputRef.current.value = "";
    }
  };

  const isFormDisabled = isLoadingAddNoteProp || disabledByParent;

  return (
    <div className="mt-2 space-y-2">
      <MentionTextarea
        value={newNoteText}
        onChange={setNewNoteText}
        onMentionsResolved={setNewNoteMentionedUserIds}
        mentionUsers={mockUsers}
        placeholder={uiStrings.newNotePlaceholder || "Πληκτρολογήστε τη σημείωσή σας..."}
        rows={2}
        textareaClassName="w-full text-xs"
        disabled={isFormDisabled}
        data-testid="new-note-textarea"
      />
      <div className="mt-2 space-y-1">
        {newNoteSelectedFiles.length > 0 && (
          <p className="text-xs font-medium text-gray-400">{uiStrings.selectedFilesTitle}</p>
        )}
        {newNoteSelectedFiles.map((file, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs p-1 bg-slate-600 rounded">
            <div className="flex items-center space-x-1">
              <Icon name={getFileTypeIconNameLocal(file.type)} size="xs" />
              <span className="truncate max-w-[150px] sm:max-w-xs" title={file.name}>{file.name}</span>
              <span className="text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
            <Tooltip content={uiStrings.removeAttachmentTooltip}>
              <Button variant="icon" size="sm" onClick={() => handleRemoveNewSelectedFileLocal(idx)} disabled={isFormDisabled} className="!p-0.5">
                <Icon name="close" size="xs" />
              </Button>
            </Tooltip>
          </div>
        ))}
        <input
          type="file"
          multiple
          ref={newNoteFileInputRef}
          onChange={handleNewNoteFileSelectLocal}
          className="hidden"
          accept={ALLOWED_FILE_TYPES.join(',')}
          disabled={isFormDisabled}
        />
        <Button
          type="button"
          variant="link"
          size="sm"
          leftIcon={<Icon name="paperclip" size="xs" />}
          onClick={() => newNoteFileInputRef.current?.click()}
          disabled={isFormDisabled || newNoteSelectedFiles.length >= MAX_ATTACHMENTS_COUNT}
          className="!p-1 text-xs"
        >
          {uiStrings.addAttachmentsButton}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
        <FormFieldWrapper
          label={uiStrings.noteTypeLabel}
          htmlFor={`new-note-type-${entityId}`}
          className="mb-0 flex-1"
        >
          <Select
            id={`new-note-type-${entityId}`}
            name="newNoteType"
            value={selectedNoteType}
            onChange={(e) => setSelectedNoteType(e.target.value as NoteType)}
            disabled={isFormDisabled}
            className="w-full text-xs"
          >
            {manualNoteTypes.map(typeKey => (
              <option key={typeKey} value={typeKey}>
                {noteTypeTranslations[typeKey] || typeKey}
              </option>
            ))}
          </Select>
        </FormFieldWrapper>

        <FormFieldWrapper
          label={uiStrings.noteVisibilityLabel}
          htmlFor={`new-note-visibility-${entityId}`}
          className="mb-0 flex-1"
        >
          <Select
            id={`new-note-visibility-${entityId}`}
            name="newNoteVisibility"
            value={selectedNoteVisibility}
            onChange={(e) => setSelectedNoteVisibility(e.target.value as NoteVisibility)}
            disabled={isFormDisabled}
            className="w-full text-xs"
          >
            {(allNoteVisibilitiesArray).map(visibilityKey => (
              <option key={visibilityKey} value={visibilityKey}>
                {noteVisibilityTranslations[visibilityKey] || visibilityKey}
              </option>
            ))}
          </Select>
        </FormFieldWrapper>
      </div>
      <Button
        onClick={handleFormSubmit}
        variant="secondary"
        size="sm"
        className="mt-2"
        disabled={!newNoteText.trim() || !isVoipReady || isFormDisabled} // also check isVoipReady here
        isLoading={isLoadingAddNoteProp}
      >
        {uiStrings.addNoteButton || "Προσθήκη Σημείωσης"}
      </Button>
    </div>
  );
});
AddNoteForm.displayName = 'AddNoteForm';
export default AddNoteForm;
