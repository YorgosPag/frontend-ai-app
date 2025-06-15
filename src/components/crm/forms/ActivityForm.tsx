// src/components/crm/forms/ActivityForm.tsx
import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import type { Activity, ActivityCategory, ActivitySpecificType, ActivityOutcome } from '../../../crm/types/activityTypes';
import { 
    activityCategoryTranslations, 
    activitySpecificTypeTranslations, 
    activityOutcomeTranslations,
    zodAllActivityCategoriesArray,
    zodAllActivitySpecificTypesArray,
    zodAllActivityOutcomesArray
} from '../../../crm/types/activityTypes';
import { activityTypeMappings } from '../../../crm/types/activityTypeMappings';
import * as ActivityService from '../../../crm/services/activity.service';
import { uiStrings, formStrings } from '../../../config/translations';
import Button from '../../ui/Button';
import FormFieldWrapper from '../../ui/FormFieldWrapper';
import Input from '../../ui/Input';
import Textarea from '../../ui/Textarea';
import Select from '../../ui/Select';
import type { EntityType } from '../../../types';
import { useUserStore } from '../../../user/stores/userStore';
import type { MockUser } from '../../../data/mocks/users';


interface ActivityFormProps {
  onSaveSuccess: (activity: Activity) => void;
  onCancel: () => void;
  initialData?: Partial<Activity>;
  contextEntityId?: string;
  contextEntityType?: EntityType;
  currentUser: MockUser | null; // Added currentUser prop
}

const ActivityForm: React.FC<ActivityFormProps> = ({ 
    onSaveSuccess, 
    onCancel, 
    initialData = {},
    contextEntityId,
    contextEntityType,
    currentUser 
}) => {
  const [formData, setFormData] = useState<Partial<Activity>>({
    title: '',
    category: zodAllActivityCategoriesArray[0],
    specificType: activityTypeMappings[zodAllActivityCategoriesArray[0]][0],
    description: '',
    startTime: new Date().toISOString().substring(0, 16), 
    endTime: '',
    outcome: undefined, 
    contactId: '',
    projectId: '',
    propertyId: '',
    dealId: '',
    userId: currentUser?.id || '', // Default to current user if creating
    ...initialData,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string[] | undefined>>({});
  // currentUser is now passed as a prop

  useEffect(() => {
    if (contextEntityType && contextEntityId) {
      if (contextEntityType === 'project') {
        setFormData(prev => ({ ...prev, projectId: contextEntityId }));
      } else if (contextEntityType === 'contact') {
        setFormData(prev => ({ ...prev, contactId: contextEntityId }));
      }
    }
    if (currentUser && !initialData.id) { // If creating a new activity, set userId to current user
        setFormData(prev => ({ ...prev, userId: currentUser.id }));
    }
  }, [contextEntityId, contextEntityType, currentUser, initialData.id]);

  const availableSpecificTypes = useMemo(() => {
    return activityTypeMappings[formData.category || zodAllActivityCategoriesArray[0]] || [];
  }, [formData.category]);

  useEffect(() => {
    if (formData.category && !availableSpecificTypes.includes(formData.specificType as ActivitySpecificType)) {
      setFormData(prev => ({ ...prev, specificType: availableSpecificTypes[0] }));
    }
  }, [formData.category, availableSpecificTypes, formData.specificType]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({...prev, [name]: undefined }));
    }
    if (name === 'category') { 
        const newCategory = value as ActivityCategory;
        const newSpecificTypes = activityTypeMappings[newCategory] || [];
        setFormData(prev => ({ ...prev, category: newCategory, specificType: newSpecificTypes[0] || zodAllActivitySpecificTypesArray[0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) { // currentUser check
        toast.error("Δεν βρέθηκε συνδεδεμένος χρήστης. Αποτυχία αποθήκευσης.");
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    setFormErrors({});

    const dataToSave: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'> = {
        title: formData.title || '',
        category: formData.category || zodAllActivityCategoriesArray[0],
        specificType: formData.specificType || availableSpecificTypes[0],
        startTime: formData.startTime ? new Date(formData.startTime).toISOString() : new Date().toISOString(),
        userId: formData.userId || currentUser.id, // Ensure userId is set, fallback to current user
        description: formData.description || undefined,
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : undefined,
        outcome: formData.outcome || undefined,
        contactId: formData.contactId || undefined,
        projectId: formData.projectId || undefined,
        propertyId: formData.propertyId || undefined,
        dealId: formData.dealId || undefined,
    };

    try {
      // Create or Update logic based on initialData.id
      let savedActivity: Activity | null = null;
      if (initialData.id) { // Update existing
        // The ActivityService.updateActivity will need to accept requestingUser
        savedActivity = await ActivityService.updateActivity(initialData.id, dataToSave, currentUser);
      } else { // Create new
        // Pass currentUser to createActivity service method
        savedActivity = await ActivityService.createActivity(dataToSave, currentUser);
      }

      if (savedActivity) {
        toast.success(uiStrings.saveSuccessNotification || 'Η ενέργεια αποθηκεύτηκε!');
        onSaveSuccess(savedActivity);
      } else {
        // This case might happen if update returns null (e.g. not found), though create should always return or throw
        toast.error(uiStrings.genericErrorNotification);
      }
    } catch (error: any) {
      toast.error(error.message || uiStrings.genericErrorNotification);
      if (error.fieldErrors) {
        setFormErrors(error.fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <FormFieldWrapper label={formStrings.activityTitleLabel || "Τίτλος Ενέργειας"} htmlFor="title" required validationError={formErrors.title}>
        <Input name="title" value={formData.title || ''} onChange={handleChange} disabled={isLoading} />
      </FormFieldWrapper>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormFieldWrapper label={formStrings.activityCategoryLabel || "Κατηγορία"} htmlFor="category" required validationError={formErrors.category}>
          <Select name="category" value={formData.category} onChange={handleChange} disabled={isLoading}>
            {zodAllActivityCategoriesArray.map(cat => (
              <option key={cat} value={cat}>{activityCategoryTranslations[cat] || cat}</option>
            ))}
          </Select>
        </FormFieldWrapper>
        <FormFieldWrapper label={formStrings.activitySpecificTypeLabel || "Εξειδικευμένος Τύπος"} htmlFor="specificType" required validationError={formErrors.specificType}>
          <Select name="specificType" value={formData.specificType} onChange={handleChange} disabled={isLoading || availableSpecificTypes.length === 0}>
            {availableSpecificTypes.map(type => (
              <option key={type} value={type}>{activitySpecificTypeTranslations[type as ActivitySpecificType] || type}</option>
            ))}
          </Select>
        </FormFieldWrapper>
      </div>

      <FormFieldWrapper label={formStrings.descriptionLabel || "Περιγραφή"} htmlFor="description" validationError={formErrors.description}>
        <Textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3} disabled={isLoading} />
      </FormFieldWrapper>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormFieldWrapper label={formStrings.startTimeLabel || "Ώρα Έναρξης"} htmlFor="startTime" required validationError={formErrors.startTime}>
            <Input type="datetime-local" name="startTime" value={formData.startTime || ''} onChange={handleChange} disabled={isLoading} />
        </FormFieldWrapper>
        <FormFieldWrapper label={formStrings.endTimeLabel || "Ώρα Λήξης"} htmlFor="endTime" validationError={formErrors.endTime}>
            <Input type="datetime-local" name="endTime" value={formData.endTime || ''} onChange={handleChange} disabled={isLoading} />
        </FormFieldWrapper>
      </div>
      
       <FormFieldWrapper label={formStrings.activityOutcomeLabel || "Αποτέλεσμα"} htmlFor="outcome" validationError={formErrors.outcome}>
          <Select name="outcome" value={formData.outcome || ''} onChange={handleChange} disabled={isLoading}>
            <option value="">{uiStrings.selectPlaceholder || 'Επιλέξτε...'}</option>
            {zodAllActivityOutcomesArray.map(out => (
              <option key={out} value={out}>{activityOutcomeTranslations[out] || out}</option>
            ))}
          </Select>
        </FormFieldWrapper>

      <fieldset className="border border-gray-700 p-3 rounded-md mt-4 space-y-2">
        <legend className="text-gray-300 px-1 text-sm">{formStrings.relatedEntitiesLabel || "Συσχετιζόμενες Οντότητες"}</legend>
        <FormFieldWrapper label={formStrings.relatedContactLabel || "Επαφή"} htmlFor="contactId" validationError={formErrors.contactId}>
            <Input name="contactId" value={formData.contactId || ''} onChange={handleChange} placeholder="ID Επαφής" disabled={isLoading}/>
        </FormFieldWrapper>
        <FormFieldWrapper label={formStrings.relatedProjectLabel || "Έργο"} htmlFor="projectId" validationError={formErrors.projectId}>
            <Input name="projectId" value={formData.projectId || ''} onChange={handleChange} placeholder="ID Έργου" disabled={isLoading || !!(contextEntityType === 'project' && contextEntityId)}/>
        </FormFieldWrapper>
      </fieldset>

      <div className="flex justify-end space-x-3 pt-3 border-t border-gray-700">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          {uiStrings.cancelButton}
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>
          {formStrings.saveActivityButton || "Αποθήκευση Ενέργειας"}
        </Button>
      </div>
    </form>
  );
};

export default ActivityForm;
