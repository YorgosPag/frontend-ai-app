
// src/components/filters/ContactFilterControls.tsx
import React from 'react';
import type { ContactType, Role } from '../../types';
import { uiStrings, contactTypeTranslations, roleTranslations } from '../../config/translations';
import Checkbox from '../ui/Checkbox';
import Button from '../ui/Button';
import ScrollableContainer from '../ScrollableContainer';

export interface ActiveContactFilters {
  types: ContactType[];
  roles: Role[];
}

interface ContactFilterControlsProps {
  activeFilters: ActiveContactFilters;
  onFilterChange: (filterName: keyof ActiveContactFilters, value: ContactType | Role, checked: boolean) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  disabled?: boolean;
}

const ContactFilterControls: React.FC<ContactFilterControlsProps> = ({
  activeFilters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  disabled,
}) => {
  const allContactTypesArray = Object.keys(contactTypeTranslations) as ContactType[];
  const allRolesArray = Object.keys(roleTranslations) as Role[];

  return (
    <div className="p-3 bg-slate-700 rounded-md w-64 sm:w-72 text-sm">
      <ScrollableContainer axis="y" className="max-h-60 pr-1">
        {/* Contact Types Filter */}
        <fieldset className="mb-3">
          <legend className="font-semibold text-gray-200 mb-1.5 text-xs">
            {uiStrings.filterByTypeLabel}
          </legend>
          <div className="space-y-1">
            {allContactTypesArray.map((type) => (
              <Checkbox
                key={type}
                id={`filter-type-${type}`}
                label={contactTypeTranslations[type]}
                checked={activeFilters.types.includes(type)}
                onChange={(e) => onFilterChange('types', type, e.target.checked)}
                disabled={disabled}
                labelClassName="text-xs"
              />
            ))}
          </div>
        </fieldset>

        {/* Roles Filter */}
        <fieldset>
          <legend className="font-semibold text-gray-200 mb-1.5 text-xs">
            {uiStrings.filterByRoleLabel}
          </legend>
          <div className="space-y-1">
            {allRolesArray.map((role) => (
              <Checkbox
                key={role}
                id={`filter-role-${role}`}
                label={roleTranslations[role]}
                checked={activeFilters.roles.includes(role)}
                onChange={(e) => onFilterChange('roles', role, e.target.checked)}
                disabled={disabled}
                labelClassName="text-xs"
              />
            ))}
          </div>
        </fieldset>
      </ScrollableContainer>

      {/* Action Buttons */}
      <div className="mt-3 pt-3 border-t border-slate-600 flex justify-end space-x-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onClearFilters}
          disabled={disabled || (activeFilters.types.length === 0 && activeFilters.roles.length === 0)}
          className="text-xs"
        >
          {uiStrings.clearFiltersButton}
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onApplyFilters}
          disabled={disabled}
          className="text-xs"
        >
          {uiStrings.applyFiltersButton}
        </Button>
      </div>
    </div>
  );
};

export default ContactFilterControls;