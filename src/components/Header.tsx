// src/components/Header.tsx
import React, { useRef, useState } from 'react';
import { uiStrings } from '../config/translations';
import Input from './ui/Input'; 
import Icon from './ui/Icon'; 
import Button from './ui/Button'; 
import Popover from './ui/Popover'; // Added for user dropdown
import Avatar from './Avatar'; // Added for user avatar
import { useUIStore } from '../stores/uiStore';
import { useUserStore } from '../user/stores/userStore'; // Added userStore import
import GlobalSearchResultsDropdown from './GlobalSearchResultsDropdown';
import NotificationBell from './notifications/NotificationBell'; 
import NotificationPanel from './notifications/NotificationPanel'; 
import ScrollableContainer from './ScrollableContainer';

interface HeaderProps {
  title: string;
  onToggleMockCall?: () => void; // Made optional
}

const Header: React.FC<HeaderProps> = ({ title, onToggleMockCall }) => {
  const globalSearchTerm = useUIStore(state => state.globalSearchTerm);
  const setGlobalSearchTerm = useUIStore(state => state.setGlobalSearchTerm);
  const setIsGlobalSearchFocused = useUIStore(state => state.setIsGlobalSearchFocused);
  const clearGlobalSearch = useUIStore(state => state.clearGlobalSearch);
  
  const currentUser = useUserStore(state => state.currentUser);
  const availableUsers = useUserStore(state => state.availableUsers);
  const setCurrentUser = useUserStore(state => state.setCurrentUser);

  const searchInputContainerRef = useRef<HTMLDivElement>(null); 
  const searchInputActualRef = useRef<HTMLInputElement>(null); 
  const notificationBellRef = useRef<HTMLButtonElement>(null); 
  const userProfileButtonRef = useRef<HTMLButtonElement>(null); // Ref for user profile button

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalSearchTerm(e.target.value);
  };

  const handleSearchFocus = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setIsGlobalSearchFocused(true);
  };

  const handleSearchBlur = () => {
    blurTimeoutRef.current = setTimeout(() => {
      setIsGlobalSearchFocused(false);
    }, 150); 
  };

  const handleClearSearch = () => {
    clearGlobalSearch();
    searchInputActualRef.current?.focus(); 
  };

  const handleSwitchUser = (userId: string) => {
    setCurrentUser(userId);
    setIsUserDropdownOpen(false); // Close dropdown after selection
  };

  return (
    <div className="bg-slate-800 p-4 border-b border-slate-700 flex items-center justify-between shadow-md h-14 flex-shrink-0 relative rounded-bl-lg">
      <h1 className="font-[var(--font-heading)] text-[var(--font-size-xl)] font-[var(--font-weight-bold)] text-gray-200">{title}</h1>
      
      <div className="flex items-center space-x-3 sm:space-x-4">
        {onToggleMockCall && ( // Conditionally render the mock call button
          <Button
            variant="secondary"
            size="sm"
            onClick={onToggleMockCall}
            className="!py-1 !px-2 text-xs !bg-amber-600 hover:!bg-amber-500"
            title={uiStrings.devToggleMockCallButton}
          >
            {uiStrings.devToggleMockCallButton}
          </Button>
        )}

        <div className="relative w-48 sm:w-64 md:w-80" ref={searchInputContainerRef}>
          <Input
            ref={searchInputActualRef} 
            type="search"
            placeholder={uiStrings.globalSearchPlaceholder}
            className="py-2 pr-4 w-full !bg-slate-700 text-sm" 
            aria-label={uiStrings.globalSearchPlaceholder}
            startIcon={<Icon name="search" size="sm" className="text-gray-400" />}
            value={globalSearchTerm}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            clearable
            onClear={handleClearSearch}
            data-testid="global-search-input"
          />
          <GlobalSearchResultsDropdown
            anchorRef={searchInputContainerRef} 
          />
        </div>
        
        <NotificationBell ref={notificationBellRef} />
        <NotificationPanel anchorRef={notificationBellRef} />

        {/* User Profile Dropdown */}
        <div className="relative">
          <Button
            ref={userProfileButtonRef}
            variant="icon"
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            aria-label="Μενού Χρήστη"
            aria-haspopup="true"
            aria-expanded={isUserDropdownOpen}
            className="!p-0 rounded-full focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            <Avatar 
              name={currentUser?.displayName || 'User'} 
              avatarUrl={currentUser?.avatarUrl}
              sizeClasses="w-8 h-8 rounded-full"
              textClasses="text-xs"
              borderClasses="border-slate-600"
            />
          </Button>
          {userProfileButtonRef.current && (
            <Popover
              isOpen={isUserDropdownOpen}
              setIsOpen={setIsUserDropdownOpen}
              triggerRef={userProfileButtonRef}
              placement="bottom-end"
              offsetValue={8}
              className="bg-slate-700 border border-slate-600 rounded-md shadow-xl z-[120] w-64"
              id="user-profile-popover"
              ariaLabel="User actions and account switching"
            >
              <div className="p-3">
                {currentUser && (
                  <div className="mb-3 pb-3 border-b border-slate-600">
                    <p className="text-sm font-medium text-gray-100 truncate">{currentUser.displayName}</p>
                    <p className="text-xs text-gray-400 truncate">@{currentUser.username}</p>
                  </div>
                )}
                <p className="text-xs text-gray-300 mb-1 font-semibold">Εναλλαγή Λογαριασμού:</p>
                <ScrollableContainer axis="y" className="max-h-48">
                  <ul className="space-y-1">
                    {availableUsers.map(user => (
                      <li key={user.id}>
                        <button
                          onClick={() => handleSwitchUser(user.id)}
                          className={`w-full text-left px-2 py-1.5 rounded-md text-xs flex items-center space-x-2
                                      ${currentUser?.id === user.id 
                                        ? 'bg-purple-600 text-white' 
                                        : 'text-gray-300 hover:bg-slate-600'
                                      }`}
                        >
                           <Avatar name={user.displayName} avatarUrl={user.avatarUrl} sizeClasses="w-5 h-5" textClasses="text-[10px]" />
                           <span>{user.displayName}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </ScrollableContainer>
                {/* Add other actions like "Logout" here in a real app */}
              </div>
            </Popover>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;