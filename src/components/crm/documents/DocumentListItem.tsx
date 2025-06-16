// src/components/crm/documents/DocumentListItem.tsx
import React from 'react';
import type { Document } from '../../../crm/types/documentTypes';
import { documentCategoryTranslations, uiStrings, cardStrings } from '../../../config/translations';
import Icon from '../../ui/Icon';
import type { IconName } from '../../../types/iconTypes';
import Button from '../../ui/Button';
import Tooltip from '../../ui/Tooltip';

interface DocumentListItemProps {
  document: Document;
  onDelete: (documentId: string) => void;
  canDelete: boolean;
}

const getFileTypeIconName = (fileType: string): IconName => {
  if (fileType.startsWith('image/')) return 'fileImage';
  if (fileType === 'application/pdf') return 'filePdf';
  if (fileType.includes('wordprocessingml') || fileType === 'application/msword') return 'fileText'; // Corrected line
  if (fileType === 'text/plain') return 'fileText';
  if (['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/x-tar'].includes(fileType)) return 'fileArchive';
  return 'fileGeneric';
};

const DocumentListItem: React.FC<DocumentListItemProps> = ({ document, onDelete, canDelete }) => {
  const fileSizeKB = (document.fileSize / 1024).toFixed(1);
  const categoryDisplay = documentCategoryTranslations[document.documentCategory] || document.documentCategory;
  const uploadedDate = new Date(document.uploadedAt).toLocaleDateString('el-GR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // For mock purposes, as storagePath is just a string. In a real scenario, this would be a download link.
  const handleDownloadClick = () => {
    // In a real app, this might trigger a download via window.location.href or a fetch request
    // For now, just logging or alerting.
    console.log(`Mock download requested for: ${document.fileName} from ${document.storagePath}`);
    alert(`Θα ξεκινούσε η λήψη του: ${document.fileName}`);
  };

  return (
    <div className="flex items-center justify-between p-2 bg-slate-700 hover:bg-slate-650 rounded-md shadow-sm transition-colors duration-150">
      <div className="flex items-center space-x-3 min-w-0">
        <Icon name={getFileTypeIconName(document.fileType)} size="md" className="text-gray-400 flex-shrink-0" />
        <div className="min-w-0">
          <a
            href={document.storagePath} // This would be a real download link in a real app
            onClick={(e) => { e.preventDefault(); handleDownloadClick(); }} // Mock download behavior
            className="text-sm font-medium text-purple-300 hover:underline truncate block"
            title={document.fileName}
          >
            {document.fileName}
          </a>
          <p className="text-xs text-gray-400 truncate" title={`${categoryDisplay} - ${fileSizeKB} KB - ${uploadedDate}`}>
            {categoryDisplay} - {fileSizeKB} KB - {uiStrings.uploadedOnLabel} {uploadedDate}
          </p>
          {document.description && <p className="text-xs text-gray-500 mt-0.5 truncate" title={document.description}>{document.description}</p>}
        </div>
      </div>
      <div className="flex-shrink-0">
        {canDelete && (
          <Tooltip content={cardStrings.deleteNoteButtonTooltip || "Διαγραφή Εγγράφου"} position="top">
            <Button
              variant="icon"
              size="sm"
              onClick={() => onDelete(document.id)}
              className="!p-1 text-gray-500 hover:text-red-400"
              aria-label={`Διαγραφή εγγράφου ${document.fileName}`}
            >
              <Icon name="trash" size="sm" />
            </Button>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default DocumentListItem;