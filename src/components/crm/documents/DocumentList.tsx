// src/components/crm/documents/DocumentList.tsx
import React, { useEffect, useState, useCallback } from 'react';
import type { Document } from '../../../crm/types/documentTypes';
import type { EntityType } from '../../../types';
import * as DocumentService from '../../../crm/services/document.service';
import DocumentListItem from './DocumentListItem'; // Updated import path
import { uiStrings } from '../../../config/translations';
import Icon from '../../ui/Icon';
import type { MockUser } from '../../../data/mocks/users';
import { hasPermission, PERMISSIONS } from '../../../auth/permissions';
import toast from 'react-hot-toast';


interface DocumentListProps {
  entityId: string;
  entityType: EntityType;
  currentUser: MockUser | null; // Add currentUser
}

const DocumentList: React.FC<DocumentListProps> = ({ entityId, entityType, currentUser }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocumentsCallback = useCallback(async () => {
    if (!currentUser) {
        setError("Απαιτείται σύνδεση χρήστη για την προβολή εγγράφων.");
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fetchedDocs = await DocumentService.fetchDocuments(currentUser, {
        relatedEntityId: entityId,
        relatedEntityType: entityType,
      });
      setDocuments(fetchedDocs);
    } catch (err: any) {
      console.error("Error fetching documents:", err);
      setError(err.message || "Σφάλμα κατά τη φόρτωση των εγγράφων.");
    } finally {
      setIsLoading(false);
    }
  }, [entityId, entityType, currentUser]);

  useEffect(() => {
    fetchDocumentsCallback();
  }, [fetchDocumentsCallback]);

  const handleDeleteDocument = async (documentId: string) => {
    if (!currentUser) {
        toast.error("Απαιτείται σύνδεση χρήστη.");
        return;
    }
    const docToDelete = documents.find(d => d.id === documentId);
    if (!docToDelete) return;

    const canDeleteAny = hasPermission(currentUser.roles, PERMISSIONS.DELETE_ANY_DOCUMENT_FILE) || hasPermission(currentUser.roles, PERMISSIONS.MANAGE_ANY_DOCUMENT_METADATA);
    const canDeleteOwn = hasPermission(currentUser.roles, PERMISSIONS.MANAGE_OWN_DOCUMENT_METADATA) && docToDelete.uploadedByUserId === currentUser.id;

    if (!canDeleteAny && !canDeleteOwn) {
        toast.error("Δεν έχετε δικαίωμα διαγραφής αυτού του εγγράφου.");
        return;
    }

    const confirmDelete = window.confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε το έγγραφο "${docToDelete.fileName}"`);
    if (confirmDelete) {
        try {
            await DocumentService.deleteDocumentMetadata(documentId, currentUser);
            toast.success("Το έγγραφο (metadata) διαγράφηκε.");
            setDocuments(prev => prev.filter(d => d.id !== documentId));
        } catch (err: any) {
            toast.error(err.message || "Σφάλμα κατά τη διαγραφή του εγγράφου.");
        }
    }
  };


  if (isLoading) {
    return <div className="p-2 text-xs text-gray-400"><Icon name="spinner" size="sm" className="mr-1" /> Φόρτωση εγγράφων...</div>;
  }

  if (error) {
    return <div className="p-2 text-xs text-red-400">{error}</div>;
  }

  if (documents.length === 0) {
    return <p className="text-xs text-gray-500 italic">{uiStrings.noAttachmentsYet}</p>;
  }

  return (
    <div className="space-y-2">
      {documents.map(doc => (
        <DocumentListItem 
            key={doc.id} 
            document={doc} 
            onDelete={() => handleDeleteDocument(doc.id)}
            canDelete={
                (currentUser && hasPermission(currentUser.roles, PERMISSIONS.DELETE_ANY_DOCUMENT_FILE)) ||
                (currentUser && hasPermission(currentUser.roles, PERMISSIONS.MANAGE_ANY_DOCUMENT_METADATA)) ||
                (currentUser && hasPermission(currentUser.roles, PERMISSIONS.MANAGE_OWN_DOCUMENT_METADATA) && doc.uploadedByUserId === currentUser.id)
            }
        />
      ))}
    </div>
  );
};

export default DocumentList;