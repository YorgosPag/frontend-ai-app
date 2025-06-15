// src/components/crm/documents/DocumentUploadForm.tsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import type { Document, DocumentCategory } from '../../../crm/types/documentTypes';
import { documentCategoryTranslations, zodAllDocumentCategoriesArray } from '../../../crm/types/documentTypes';
import * as DocumentService from '../../../crm/services/document.service';
import { uiStrings, formStrings } from '../../../config/translations';
import Button from '../../ui/Button';
import FormFieldWrapper from '../../ui/FormFieldWrapper';
import Input from '../../ui/Input';
import Textarea from '../../ui/Textarea';
import Select from '../../ui/Select';
import type { EntityType } from '../../../types';
import type { MockUser } from '../../../data/mocks/users'; // For currentUser prop

interface DocumentUploadFormProps {
  entityId: string;
  entityType: EntityType;
  currentUser: MockUser | null; // Add currentUser prop
  onUploadSuccess: (document: Document) => void;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB example limit

const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({
  entityId,
  entityType,
  currentUser,
  onUploadSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DocumentCategory>(zodAllDocumentCategoriesArray[0]);
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string[] | undefined>>({});

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`Το αρχείο υπερβαίνει το μέγιστο επιτρεπτό μέγεθος (${MAX_FILE_SIZE_BYTES / (1024*1024)}MB).`);
        event.target.value = ''; // Clear the input
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setFormErrors(prev => ({ ...prev, file: undefined }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile) {
      setFormErrors({ file: ["Παρακαλώ επιλέξτε ένα αρχείο."] });
      return;
    }
    if (!currentUser) {
      toast.error("Απαιτείται σύνδεση χρήστη για τη μεταφόρτωση.");
      return;
    }

    setIsLoading(true);
    setFormErrors({});

    // Simulate storage path (in a real app, this would come from backend after upload)
    const mockStoragePath = `/${entityType}/${entityId}/${selectedFile.name}`;

    const documentData: Omit<Document, 'id' | 'uploadedAt' | 'updatedAt'> = {
      fileName: selectedFile.name,
      fileType: selectedFile.type,
      fileSize: selectedFile.size,
      storagePath: mockStoragePath, // Placeholder
      uploadedByUserId: currentUser.id, // Use current user's ID
      relatedEntityType: entityType,
      relatedEntityId: entityId,
      documentCategory: category,
      description: description.trim() || undefined,
      tags: tags.split(',').map(t => t.trim()).filter(t => t) || undefined,
      // version will be handled by backend or default to 1
    };

    try {
      // In a real app, you'd upload the file first, then create metadata.
      // For mock, we just create metadata.
      const newDocument = await DocumentService.createDocumentMetadata(documentData, currentUser);
      toast.success('Το έγγραφο (metadata) δημιουργήθηκε με επιτυχία.');
      onUploadSuccess(newDocument);
      // Reset form
      setSelectedFile(null);
      setDescription('');
      setCategory(zodAllDocumentCategoriesArray[0]);
      setTags('');
      // Clear file input visually
      const fileInput = document.getElementById('document-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      toast.error(error.message || 'Σφάλμα κατά τη δημιουργία metadata εγγράφου.');
      if (error.fieldErrors) {
        setFormErrors(error.fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <FormFieldWrapper label="Αρχείο" htmlFor="document-file-input" required validationError={formErrors.file}>
        <Input
          type="file"
          id="document-file-input"
          onChange={handleFileChange}
          disabled={isLoading}
          className="!p-2"
        />
      </FormFieldWrapper>

      <FormFieldWrapper label={formStrings.documentCategoryLabel || "Κατηγορία Εγγράφου"} htmlFor="documentCategory" required validationError={formErrors.documentCategory}>
        <Select
          id="documentCategory"
          name="documentCategory"
          value={category}
          onChange={(e) => setCategory(e.target.value as DocumentCategory)}
          disabled={isLoading}
        >
          {zodAllDocumentCategoriesArray.map(cat => (
            <option key={cat} value={cat}>{documentCategoryTranslations[cat] || cat}</option>
          ))}
        </Select>
      </FormFieldWrapper>

      <FormFieldWrapper label={formStrings.descriptionLabel || "Περιγραφή"} htmlFor="description" validationError={formErrors.description}>
        <Textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          disabled={isLoading}
          placeholder="Προαιρετική περιγραφή για το έγγραφο"
        />
      </FormFieldWrapper>

      <FormFieldWrapper label={formStrings.tagsLabel || "Ετικέτες (χωρισμένες με κόμμα)"} htmlFor="tags" validationError={formErrors.tags}>
        <Input
          type="text"
          id="tags"
          name="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          disabled={isLoading}
          placeholder="π.χ. σημαντικό, προσφορά, 2024"
        />
      </FormFieldWrapper>
      
      {formErrors._form && (
         <p className="text-xs text-red-400 mt-1">{formErrors._form.join(', ')}</p>
      )}

      <div className="flex justify-end pt-2">
        <Button type="submit" variant="primary" isLoading={isLoading} disabled={!selectedFile || isLoading}>
          Μεταφόρτωση & Αποθήκευση Metadata
        </Button>
      </div>
    </form>
  );
};

export default DocumentUploadForm;
