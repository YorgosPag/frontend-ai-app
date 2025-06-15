// src/components/crm/ProjectCard.tsx
import React from 'react';
import type { ProjectType } from '../../crm/types/projectTypes';
import { projectPhaseTranslations } from '../../crm/types/projectTypes';
import { uiStrings, cardStrings } from '../../config/translations'; // cardStrings added
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import ContactNotesSection from '../notes/ContactNotesSection'; 
import DocumentList from './documents/DocumentList'; // <<< NEW IMPORT
import { useUserStore } from '../../user/stores/userStore'; 
import { useUIStore } from '../../stores/uiStore';
import type { MockUser } from '../../data/mocks/users';
import { hasPermission, PERMISSIONS } from '../../auth/permissions';


interface ProjectCardProps {
  project: ProjectType;
  currentUser: MockUser | null; // Add currentUser prop
  containerClassName?: string;
}

const DetailItem: React.FC<{ label: string; value?: string | number | null; iconName?: any; currency?: boolean }> = ({ label, value, iconName, currency }) => {
  if (value === null || value === undefined || value === '') return null;
  const displayValue = currency && typeof value === 'number' ? `${value.toLocaleString('el-GR')} €` : String(value);
  return (
    <div className="flex items-start text-xs text-gray-400 py-1">
      {iconName && <Icon name={iconName} size="xs" className="mr-2 mt-0.5 text-gray-500 flex-shrink-0" />}
      <span className="font-semibold w-36 flex-shrink-0">{label}:</span>
      <span className="text-gray-300 break-words">{displayValue}</span>
    </div>
  );
};

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  currentUser,
  containerClassName = "bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out font-[var(--font-sans)]"
}) => {
  const allUsers = useUserStore(state => state.availableUsers);
  const openActivityModal = useUIStore(state => state.openActivityModal);
  const openDocumentUploadModal = useUIStore(state => state.openDocumentUploadModal); // <<< NEW

  const manager = project.managerUserId ? allUsers.find(u => u.id === project.managerUserId) : null;

  const canCreateActivities = currentUser && hasPermission(currentUser.roles, PERMISSIONS.CREATE_ACTIVITIES);
  const canUploadDocuments = currentUser && hasPermission(currentUser.roles, PERMISSIONS.UPLOAD_DOCUMENTS);

  const handleAddActivityClick = () => {
    if (canCreateActivities) {
      openActivityModal({ entityId: project.id, entityType: 'project' });
    }
  };

  const handleUploadDocumentClick = () => { // <<< NEW
    if (canUploadDocuments) {
      openDocumentUploadModal({ entityId: project.id, entityType: 'project' });
    }
  };

  return (
    <div className={containerClassName}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-[var(--font-heading)] text-[var(--font-size-xl)] sm:text-[var(--font-size-2xl)] font-[var(--font-weight-bold)] text-purple-300">
            {project.name}
          </h3>
          <p className="text-[var(--font-size-xs)] text-gray-400">{uiStrings.projectCardTitle}</p>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          {canUploadDocuments && ( // <<< NEW
            <Button variant="secondary" size="sm" onClick={handleUploadDocumentClick} leftIcon={<Icon name="paperclip" size="sm"/>}>
              {uiStrings.addAttachmentsButton || "Επισύναψη Εγγράφου"}
            </Button>
          )}
          {canCreateActivities && (
            <Button variant="secondary" size="sm" onClick={handleAddActivityClick} leftIcon={<Icon name="plus" size="sm"/>}>
              {uiStrings.addActivityButtonLabel || "Προσθήκη Ενέργειας"}
            </Button>
          )}
        </div>
      </div>

      <div className="border-b border-slate-700 my-4"></div>

      <div>
        <h4 className="text-[var(--font-size-sm)] font-[var(--font-weight-semibold)] text-gray-300 mb-1">
          {uiStrings.projectDetailsSectionTitle}:
        </h4>
        <div className="pl-2 border-l-2 border-gray-700 space-y-0.5">
          <DetailItem label={uiStrings.projectCodeLabel} value={project.projectCode} iconName="cog" />
          <DetailItem label={uiStrings.projectLocationLabel} value={project.location} iconName="pin" />
          <DetailItem label={uiStrings.projectPhaseLabel} value={project.phase ? projectPhaseTranslations[project.phase] : undefined} iconName="chartBar" />
          <DetailItem label={uiStrings.projectBudgetLabel} value={project.budget} iconName="plus" currency />
          <DetailItem label={uiStrings.projectStartDateLabel} value={project.startDate ? new Date(project.startDate).toLocaleDateString('el-GR') : undefined} iconName="bell" />
          <DetailItem label={uiStrings.projectExpectedEndDateLabel} value={project.expectedEndDate ? new Date(project.expectedEndDate).toLocaleDateString('el-GR') : undefined} iconName="bell" />
          {project.actualEndDate && <DetailItem label={uiStrings.projectActualEndDateLabel} value={new Date(project.actualEndDate).toLocaleDateString('el-GR')} iconName="checkCircle" />}
          {manager && <DetailItem label={uiStrings.projectManagerLabel} value={manager.displayName} iconName="user" />}
           {project.description && (
            <div className="pt-1">
                <p className="text-xs font-semibold text-gray-400">{uiStrings.notesCardLabel}:</p>
                <p className="text-xs text-gray-300 whitespace-pre-wrap">{project.description}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Documents Section <<< NEW */}
      <div className="mt-3 pt-3 border-t border-slate-700">
        <h4 className="text-[var(--font-size-sm)] font-[var(--font-weight-semibold)] text-gray-300 mb-1.5">
            {cardStrings.attachmentsSectionTitle || "Έγγραφα Έργου"}:
        </h4>
        <DocumentList 
            entityId={project.id} 
            entityType="project" 
            currentUser={currentUser} 
        />
      </div>

      <ContactNotesSection
        entityId={project.id}
        entityType="project" 
        contactDisplayName={project.name} 
        isVoipReady={false} // Assuming VoIP is not directly used from project card for now
        anyOperationLoadingOverall={false} // Assuming no general loading state from ProjectCard itself
      />
    </div>
  );
};

export default ProjectCard;
