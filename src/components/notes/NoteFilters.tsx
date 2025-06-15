// src/components/notes/NoteFilters.tsx
import React from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import Tooltip from '../ui/Tooltip';
import { uiStrings } from '../../config/translations';

export interface FilterCriteria {
  showOnlyPinned: boolean;
  showOnlyMyNotes: boolean;
  filterByTag: string;
}

interface NoteFiltersProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  filterCriteria: FilterCriteria;
  onFilterCriteriaChange: (criteria: FilterCriteria) => void;
  onClearFilters: () => void;
  disabled: boolean;
}

const NoteFilters: React.FC<NoteFiltersProps> = ({
  searchTerm,
  onSearchTermChange,
  filterCriteria,
  onFilterCriteriaChange,
  onClearFilters,
  disabled,
}) => {
  const handlePinnedFilterToggle = () => {
    onFilterCriteriaChange({
      ...filterCriteria,
      showOnlyPinned: !filterCriteria.showOnlyPinned,
    });
  };

  const handleMyNotesFilterToggle = () => {
    onFilterCriteriaChange({
      ...filterCriteria,
      showOnlyMyNotes: !filterCriteria.showOnlyMyNotes,
    });
  };

  const handleTagFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterCriteriaChange({
      ...filterCriteria,
      filterByTag: e.target.value,
    });
  };
  
  const handleClearTagFilter = () => {
    onFilterCriteriaChange({
        ...filterCriteria,
        filterByTag: '',
      });
  }

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    filterCriteria.showOnlyPinned ||
    filterCriteria.showOnlyMyNotes ||
    filterCriteria.filterByTag.trim() !== '';

  return (
    <div className="mb-3 space-y-2 p-2 bg-slate-750 rounded-md">
      <Input
        type="search"
        placeholder={uiStrings.searchNotesPlaceholder}
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
        className="w-full text-xs !bg-slate-700"
        startIcon={<Icon name="search" size="sm" />}
        clearable
        onClear={() => onSearchTermChange('')}
        disabled={disabled}
        data-testid="note-search-input"
      />
      <div className="flex flex-wrap gap-2 items-center">
        <Button
          variant={filterCriteria.showOnlyPinned ? 'primary' : 'ghost'}
          size="sm"
          onClick={handlePinnedFilterToggle}
          className="text-xs"
          disabled={disabled}
          data-testid="pinned-filter-button"
        >
          {uiStrings.filterByPinnedButtonLabel}
        </Button>
        <Button
          variant={filterCriteria.showOnlyMyNotes ? 'primary' : 'ghost'}
          size="sm"
          onClick={handleMyNotesFilterToggle}
          className="text-xs"
          disabled={disabled}
          data-testid="my-notes-filter-button"
        >
          {uiStrings.filterByMyNotesButtonLabel}
        </Button>
        <Input
          type="text"
          placeholder={uiStrings.filterByTagPlaceholder}
          value={filterCriteria.filterByTag}
          onChange={handleTagFilterChange}
          className="flex-grow min-w-[120px] text-xs !bg-slate-700"
          clearable
          onClear={handleClearTagFilter}
          disabled={disabled}
          data-testid="tag-filter-input"
        />
        {hasActiveFilters && (
          <Tooltip content={uiStrings.clearNoteFiltersButtonLabel} position="top">
            <Button 
              variant="icon" 
              size="sm" 
              onClick={onClearFilters} 
              disabled={disabled}
              data-testid="clear-filters-button"
            >
              <Icon name="close" size="sm" />
            </Button>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default NoteFilters;