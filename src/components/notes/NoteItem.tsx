// src/components/notes/NoteItem.tsx
import React, { useState, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';

import Tooltip from '../ui/Tooltip';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import MentionTextarea from '../ui/MentionTextarea';
import Input from '../ui/Input'; // <<< ΝΕΑ ΕΙΣΑΓΩΓΗ

import type { Note, Attachment } from '../../notes/types/noteTypes';
import type { IconName } from '../../types/iconTypes';
import { uiStrings, noteTypeTranslations, noteVisibilityTranslations } from '../../config/translations';
import { mockUsers } from '../../data/mocks/users';
import { generateUniqueId } from '../../utils/idUtils'; // Updated import

const MAX_ATTACHMENT_SIZE_MB_EDIT = 2;
const MAX_ATTACHMENTS_COUNT_EDIT = 3;
const ALLOWED_FILE_TYPES_EDIT = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

interface NoteItemProps {
  note: Note;
  contactDisplayName: string;
  onUpdateNote: (noteId: string, contactDisplayName: string, updates: Partial<Omit<Note, 'id' | 'entityId' | 'entityType' | 'createdAt' | 'author'>>) => Promise<Note | null>;
  onDeleteNote: (noteId: string) => Promise<boolean>;
  onTogglePinNote: (note: Note) => Promise<void>;
  anyOperationLoading: boolean; // General loading state from parent
}

const NoteItem: React.FC<NoteItemProps> = React.memo(({
  note,
  contactDisplayName,
  onUpdateNote,
  onDeleteNote,
  onTogglePinNote,
  anyOperationLoading,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(note.content);
  const [editMentionedUserIds, setEditMentionedUserIds] = useState<string[]>(note.mentionedUserIds || []);
  const [editSelectedFiles, setEditSelectedFiles] = useState<File[]>([]);
  const [currentAttachments, setCurrentAttachments] = useState<Attachment[]>(note.attachments || []);
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const [attachmentSearchTerm, setAttachmentSearchTerm] = useState(''); // <<< ΝΕΟ STATE

  const editFileInputRef = useRef<HTMLInputElement>(null);

  const handleStartEdit = () => {
    setEditText(note.content);
    setEditMentionedUserIds(note.mentionedUserIds || []);
    setCurrentAttachments(note.attachments || []);
    setEditSelectedFiles([]);
    setAttachmentSearchTerm(''); // Reset search on edit start
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setAttachmentSearchTerm(''); // Reset search on cancel
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
            url: e.target?.result as string, // Base64 string
            uploadedAt: new Date().toISOString(),
          });
        };
        reader.onerror = (readError) => {
          console.error("File read error in NoteItem:", readError);
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


  const handleEditFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(event.target.files || []); // Explicitly type as File[]
    if (!files.length) return;

    const totalProspectiveCount = currentAttachments.length + editSelectedFiles.length + files.length;

    if (totalProspectiveCount > MAX_ATTACHMENTS_COUNT_EDIT) {
      toast.error(uiStrings.maxFilesError(MAX_ATTACHMENTS_COUNT_EDIT));
      if(editFileInputRef.current) editFileInputRef.current.value = "";
      return;
    }

    let totalSize = currentAttachments.reduce((acc, att) => acc + att.fileSize, 0) +
                    editSelectedFiles.reduce((acc, file) => acc + file.size, 0);

    const validNewFiles: File[] = [];
    for (const file of files) { // file is now File
      if (!ALLOWED_FILE_TYPES_EDIT.includes(file.type)) {
        toast.error(`${uiStrings.fileTypeError}: ${file.name}`);
        continue;
      }
      if (totalSize + file.size > MAX_ATTACHMENT_SIZE_MB_EDIT * 1024 * 1024) {
        toast.error(uiStrings.maxFileSizeError(MAX_ATTACHMENT_SIZE_MB_EDIT));
        break;
      }
      totalSize += file.size;
      validNewFiles.push(file);
    }
    setEditSelectedFiles(prev => [...prev, ...validNewFiles]);
    if(editFileInputRef.current) editFileInputRef.current.value = "";
  };

  const handleRemoveEditSelectedFile = (index: number) => {
    setEditSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveCurrentAttachment = (attachmentId: string) => {
    setCurrentAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    setIsLoadingSave(true);

    const processedNewAttachments = await processFilesToAttachmentsLocal(editSelectedFiles);
    const finalAttachments = [...currentAttachments, ...processedNewAttachments];

    const updatedNote = await onUpdateNote(note.id, contactDisplayName, {
      content: editText.trim(),
      mentionedUserIds: editMentionedUserIds,
      attachments: finalAttachments,
    });
    setIsLoadingSave(false);
    if (updatedNote) {
      setIsEditing(false);
      setAttachmentSearchTerm(''); // Reset search on save
    }
  };

  const renderNoteContentWithMentionsLocal = (noteContent: string, mentionedUserIds?: string[]): string => {
    if (!mentionedUserIds || mentionedUserIds.length === 0) {
      return noteContent;
    }
    let processedContent = noteContent;
    mentionedUserIds.forEach(userId => {
      const user = mockUsers.find(u => u.id === userId);
      if (user) {
        const mentionRegex = new RegExp(`(?<!\\S)@${user.username}(?!\\S)`, 'g');
        processedContent = processedContent.replace(mentionRegex, `**@${user.username}**`);
      }
    });
    return processedContent;
  };

  const isThisNoteLoading = isLoadingSave || anyOperationLoading;

  // Λογική φιλτραρίσματος συνημμένων για την προβολή
  const displayedAttachments = useMemo(() => {
    if (!note.attachments) return [];
    if (!attachmentSearchTerm.trim()) return note.attachments;
    return note.attachments.filter(att =>
      att.fileName.toLowerCase().includes(attachmentSearchTerm.toLowerCase())
    );
  }, [note.attachments, attachmentSearchTerm]);


  if (isEditing) {
    return (
      <div className={`text-[var(--font-size-xs)] text-gray-300 bg-slate-750 p-2 rounded-md shadow ${note.pinned ? 'border-l-2 border-purple-500' : ''} space-y-2`}>
        <MentionTextarea
          value={editText}
          onChange={setEditText}
          onMentionsResolved={setEditMentionedUserIds}
          mentionUsers={mockUsers}
          placeholder={uiStrings.newNotePlaceholder || "Επεξεργασία σημείωσης..."}
          rows={3}
          textareaClassName="w-full text-xs"
          hasError={!editText.trim()}
          disabled={isThisNoteLoading}
        />
        <div className="mt-2 space-y-1">
          {(currentAttachments.length > 0 || editSelectedFiles.length > 0) && (
            <p className="text-xs font-medium text-gray-400">{uiStrings.selectedFilesTitle}</p>
          )}
          {currentAttachments.map((att) => (
            <div key={att.id} className="flex items-center justify-between text-xs p-1 bg-slate-600 rounded">
              <div className="flex items-center space-x-1">
                <Icon name={getFileTypeIconNameLocal(att.fileType)} size="xs" />
                <span className="truncate max-w-[150px] sm:max-w-xs" title={att.fileName}>{att.fileName}</span>
                <span className="text-gray-400">({(att.fileSize / 1024).toFixed(1)} KB)</span>
              </div>
              <Tooltip content={uiStrings.removeAttachmentTooltip}>
                <Button variant="icon" size="sm" onClick={() => handleRemoveCurrentAttachment(att.id)} disabled={isThisNoteLoading} className="!p-0.5">
                  <Icon name="close" size="xs" />
                </Button>
              </Tooltip>
            </div>
          ))}
          {editSelectedFiles.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs p-1 bg-slate-600 rounded">
              <div className="flex items-center space-x-1">
                <Icon name={getFileTypeIconNameLocal(file.type)} size="xs" />
                <span className="truncate max-w-[150px] sm:max-w-xs" title={file.name}>{file.name}</span>
                <span className="text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
              <Tooltip content={uiStrings.removeAttachmentTooltip}>
                <Button variant="icon" size="sm" onClick={() => handleRemoveEditSelectedFile(idx)} disabled={isThisNoteLoading} className="!p-0.5">
                  <Icon name="close" size="xs" />
                </Button>
              </Tooltip>
            </div>
          ))}
          <input
            type="file"
            multiple
            ref={editFileInputRef}
            onChange={handleEditFileSelect}
            className="hidden"
            accept={ALLOWED_FILE_TYPES_EDIT.join(',')}
          />
          <Button
            type="button"
            variant="link"
            size="sm"
            leftIcon={<Icon name="paperclip" size="xs" />}
            onClick={() => editFileInputRef.current?.click()}
            disabled={isThisNoteLoading || (currentAttachments.length + editSelectedFiles.length >= MAX_ATTACHMENTS_COUNT_EDIT)}
            className="!p-1 text-xs"
          >
            {uiStrings.addAttachmentsButton}
          </Button>
        </div>
        <div className="flex items-center justify-end space-x-2">
          <Button onClick={handleCancelEdit} variant="secondary" size="sm" disabled={isThisNoteLoading}>
            {uiStrings.cancelNoteEditButton || "Άκυρο"}
          </Button>
          <Button onClick={handleSaveEdit} variant="primary" size="sm" disabled={!editText.trim() || isThisNoteLoading} isLoading={isLoadingSave}>
            {uiStrings.saveNoteChangesButton || "Αποθήκευση"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`text-[var(--font-size-xs)] text-gray-300 bg-slate-750 p-2 rounded-md shadow ${note.pinned ? 'border-l-2 border-purple-500' : ''}`}>
      <div className="markdown-content whitespace-pre-wrap break-words">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {renderNoteContentWithMentionsLocal(note.content, note.mentionedUserIds)}
        </ReactMarkdown>
      </div>
      {note.attachments && note.attachments.length > 0 && (
        <div className="mt-2 pt-1 border-t border-slate-600">
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs font-semibold text-gray-400">{uiStrings.attachmentsSectionTitle}</p>
            {note.attachments.length > 1 && ( // Εμφάνιση αναζήτησης μόνο αν υπάρχουν >1 συνημμένα
                 <Input
                    type="search"
                    placeholder={uiStrings.searchAttachmentsPlaceholder || "Αναζήτηση..."}
                    value={attachmentSearchTerm}
                    onChange={(e) => setAttachmentSearchTerm(e.target.value)}
                    className="!py-0.5 !px-1.5 text-xs !bg-slate-700 max-w-[150px]"
                    startIcon={<Icon name="search" size="xs" />}
                    clearable
                    onClear={() => setAttachmentSearchTerm('')}
                    disabled={anyOperationLoading}
                  />
            )}
          </div>

          {displayedAttachments.length > 0 ? (
            <div className="space-y-1">
              {displayedAttachments.map(att => (
                <a
                  key={att.id}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={!att.fileType.startsWith('image/') && att.fileType !== 'application/pdf' ? att.fileName : undefined}
                  className="flex items-center space-x-1.5 p-1 bg-slate-700 hover:bg-slate-600 rounded text-xs group"
                  title={`${att.fileName} (${(att.fileSize / 1024).toFixed(1)}KB)`}
                >
                  <Icon name={getFileTypeIconNameLocal(att.fileType)} size="xs" className="text-gray-400 group-hover:text-purple-300" />
                  <span className="text-gray-300 group-hover:text-purple-300 truncate max-w-[180px] sm:max-w-sm">{att.fileName}</span>
                  <span className="text-gray-500">({(att.fileSize / 1024).toFixed(1)}KB)</span>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">
              {attachmentSearchTerm ? uiStrings.noAttachmentsMatchSearch : uiStrings.noAttachmentsYet}
            </p>
          )}
        </div>
      )}
      <div className="flex justify-between items-center mt-1">
        <p className="text-[var(--font-size-xs)] text-gray-500 flex flex-wrap items-center gap-x-1">
          <span className="font-medium">{note.author.displayName}</span>
          <span>- {new Date(note.createdAt).toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          <span className="text-gray-400">({noteTypeTranslations[note.type] || note.type})</span>
          <span className="text-sky-400">[{noteVisibilityTranslations[note.visibility] || note.visibility}]</span>
          {note.updatedAt !== note.createdAt && (
            <span className="italic" title={`Επεξεργάστηκε: ${new Date(note.updatedAt).toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`}>
              (επεξεργ.)
            </span>
          )}
        </p>
        <div className="flex items-center space-x-1 flex-shrink-0">
          <Tooltip content={note.pinned ? uiStrings.unpinNoteButtonTooltip : uiStrings.pinNoteButtonTooltip} position="top">
            <button
              onClick={() => onTogglePinNote(note)}
              className={`p-0.5 transition-colors ${note.pinned ? 'text-purple-400 hover:text-purple-300' : 'text-gray-500 hover:text-purple-400'}`}
              aria-label={note.pinned ? uiStrings.unpinNoteButtonTooltip : uiStrings.pinNoteButtonTooltip}
              disabled={anyOperationLoading}
            >
              <Icon name={note.pinned ? 'pin' : 'pinOutline'} size="xs" />
            </button>
          </Tooltip>
          <Tooltip content={uiStrings.editNoteButtonTooltip} position="top">
            <button
              onClick={handleStartEdit}
              className="text-gray-500 hover:text-purple-400 transition-colors p-0.5"
              aria-label={uiStrings.editNoteButtonTooltip}
              disabled={anyOperationLoading}
            >
              <Icon name="edit" size="xs" />
            </button>
          </Tooltip>
          <Tooltip content={uiStrings.deleteNoteButtonTooltip} position="top">
            <button
              onClick={() => onDeleteNote(note.id)}
              className="text-gray-500 hover:text-red-400 transition-colors p-0.5"
              aria-label={uiStrings.deleteNoteButtonTooltip}
              disabled={anyOperationLoading}
            >
              <Icon name="trash" size="xs" />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
});

NoteItem.displayName = 'NoteItem';
export default NoteItem;