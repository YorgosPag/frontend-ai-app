// src/components/GlobalSearchResultsDropdown.tsx
import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
  size as floatingSize, // For matching width or setting max height
} from '@floating-ui/react-dom';
import { CSSTransition } from 'react-transition-group';
import { useUIStore } from '../stores/uiStore';
import type { Contact } from '../types';
import ScrollableContainer from './ScrollableContainer';
import Avatar from './Avatar';
import LogoDisplay from './LogoDisplay';
import Icon from './ui/Icon';
import { contactTypeTranslations, uiStrings } from '../config/translations';
import { usePortalContainer } from '../hooks/usePortalContainer';

interface GlobalSearchResultsDropdownProps {
  anchorRef: React.RefObject<HTMLDivElement>; // Ref to the search input container
}

const GlobalSearchResultsDropdown: React.FC<GlobalSearchResultsDropdownProps> = ({ anchorRef }) => {
  const searchTerm = useUIStore((state) => state.globalSearchTerm);
  const results = useUIStore((state) => state.globalSearchResults);
  const isFocused = useUIStore((state) => state.isGlobalSearchFocused);
  
  const setActiveView = useUIStore((state) => state.setActiveView);
  const setSelectedContactId = useUIStore((state) => state.setSelectedContactId);
  const setCurrentFormMode = useUIStore((state) => state.setCurrentFormMode);
  const clearGlobalSearch = useUIStore((state) => state.clearGlobalSearch);
  const setIsGlobalSearchFocused = useUIStore(state => state.setIsGlobalSearchFocused); // Get setter for focus

  const dropdownRef = useRef<HTMLDivElement>(null);
  const portalContainer = usePortalContainer();

  const { x, y, strategy, refs, middlewareData } = useFloating({
    elements: {
      reference: anchorRef.current,
    },
    placement: 'bottom-start',
    strategy: 'fixed', 
    middleware: [
      offset(4), 
      flip(),
      shift({ padding: 8 }),
      floatingSize({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            maxHeight: `calc(100vh - ${rects.reference.bottom}px - 30px)`, 
          });
        },
        padding: 8,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  useEffect(() => {
    if (dropdownRef.current) {
      refs.setFloating(dropdownRef.current);
    }
  }, [refs, dropdownRef, isFocused, searchTerm]);


  const isVisible = isFocused && searchTerm.trim().length > 0;

  // Effect to handle Escape key for closing the dropdown
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsGlobalSearchFocused(false); // This will trigger isVisible to false & hide dropdown
        // anchorRef.current?.querySelector('input')?.blur(); // Optionally blur the input
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, setIsGlobalSearchFocused, anchorRef]);


  const handleResultClick = (contact: Contact) => {
    setActiveView('contacts');
    setSelectedContactId(contact.id);
    setCurrentFormMode(null);
    clearGlobalSearch();
    setIsGlobalSearchFocused(false); // Explicitly set focus to false after selection
  };

  const renderContent = () => {
    if (!results) { 
      return null; 
    }
    if (results.length === 0) {
      return (
        <div className="p-4 text-sm text-gray-400 text-center">
          {uiStrings.contactSearchPlaceholder && uiStrings.contactSearchPlaceholder.includes('επαφής') 
            ? 'Δεν βρέθηκαν επαφές.' 
            : 'Δεν βρέθηκαν αποτελέσματα.'}
        </div>
      );
    }
    return (
      <ScrollableContainer axis="y" className="max-h-[calc(100vh-200px)] md:max-h-80">
        <ul role="listbox" aria-label="Search results" className="divide-y divide-slate-600"> {/* Added aria-label */}
          {results.map((contact, index) => {
            const displayName =
              contact.contactType === 'naturalPerson'
                ? `${contact.basicIdentity.firstName} ${contact.basicIdentity.lastName}`.trim()
                : contact.name;
            const shouldUseLogoDisplay = (contact.contactType === 'legalEntity' || contact.contactType === 'publicService') && contact.avatarUrl;
            const optionId = `search-result-${contact.id}-${index}`;

            return (
              <li key={contact.id} id={optionId}> {/* Add id to li if managing aria-activedescendant */}
                <button
                  role="option"
                  aria-selected="false" // For full keyboard nav, this would be dynamic
                  onClick={() => handleResultClick(contact)}
                  className="w-full text-left p-3 flex items-center space-x-3 hover:bg-slate-600 transition-colors duration-150 focus:outline-none focus:bg-slate-600"
                >
                  {shouldUseLogoDisplay ? (
                    <LogoDisplay
                      logoUrl={contact.avatarUrl!}
                      altText={displayName}
                      containerClasses="w-8 h-8 flex items-center justify-center overflow-hidden rounded-md flex-shrink-0"
                      maxWidthClass="max-w-8"
                      maxHeightClass="max-h-8"
                    />
                  ) : (
                    <Avatar
                      name={displayName}
                      avatarUrl={contact.avatarUrl}
                      sizeClasses="w-8 h-8 rounded-full flex-shrink-0"
                      textClasses="text-xs"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-100 truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {contact.email || contactTypeTranslations[contact.contactType]}
                    </p>
                  </div>
                   <Icon name="chevronDoubleRight" size="sm" className="text-gray-500 flex-shrink-0" />
                </button>
              </li>
            );
          })}
        </ul>
      </ScrollableContainer>
    );
  };
  
  const dropdownJsx = (
    <CSSTransition
      in={isVisible}
      nodeRef={dropdownRef}
      timeout={200}
      classNames={{
        enter: 'opacity-0 translate-y-2',
        enterActive: 'opacity-100 translate-y-0 transition-all duration-200 ease-out',
        exit: 'opacity-100 translate-y-0',
        exitActive: 'opacity-0 translate-y-2 transition-all duration-150 ease-in',
      }}
      unmountOnExit
    >
      <div
        ref={dropdownRef}
        style={{
          position: strategy,
          top: y ?? '',
          left: x ?? '',
          zIndex: 100, 
        }}
        className="bg-slate-700 rounded-md shadow-lg border border-slate-600 overflow-hidden"
        onMouseDown={(e) => e.preventDefault()}
      >
        {renderContent()}
      </div>
    </CSSTransition>
  );

  if (!portalContainer) return null; 

  return createPortal(dropdownJsx, portalContainer);
};

export default GlobalSearchResultsDropdown;