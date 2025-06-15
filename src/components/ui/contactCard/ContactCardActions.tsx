// src/components/ui/contactCard/ContactCardActions.tsx
import React from 'react';
import Tooltip from '../Tooltip';
import Icon from '../Icon';
import { uiStrings } from '../../../config/translations';

interface ContactCardActionsProps {
  onEditClick: () => void;
  onDeleteClick: () => void;
  anyOperationLoading: boolean;
}

const ContactCardActions: React.FC<ContactCardActionsProps> = ({
  onEditClick,
  onDeleteClick,
  anyOperationLoading,
}) => {
  return (
    <div className="flex items-center space-x-2 flex-shrink-0">
      <Tooltip
        content={uiStrings.editContactButton}
        position="top"
        offsetValue={8}
        animation="fade"
        animationDuration={150}
      >
        <button
          onClick={onEditClick}
          className="p-2 text-gray-400 hover:text-purple-400 transition-colors duration-150"
          aria-label={uiStrings.editContactButton}
          disabled={anyOperationLoading}
        >
          <Icon name="edit" size="md" />
        </button>
      </Tooltip>
      <Tooltip
        content={uiStrings.deleteContactButton}
        position="top"
        offsetValue={8}
        animation="fade"
        animationDuration={150}
      >
        <button
          onClick={onDeleteClick}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-150"
          aria-label={uiStrings.deleteContactButton}
          disabled={anyOperationLoading}
        >
          <Icon name="trash" size="md" />
        </button>
      </Tooltip>
    </div>
  );
};

export default ContactCardActions;
