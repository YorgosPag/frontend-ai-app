
// src/components/ui/MentionTextarea.tsx
import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import type { MockUser } from '../../data/mocks/users';
import Textarea from './Textarea';
import Avatar from '../Avatar';
import ScrollableContainer from '../ScrollableContainer';
import Button from './Button'; // Για τη γραμμή εργαλείων
import Icon from './Icon';   // Για τα εικονίδια της γραμμής εργαλείων
import Tooltip from './Tooltip'; // Για τα tooltips της γραμμής εργαλείων
import { uiStrings } from '../../config/translations';

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onMentionsResolved: (mentionedUserIds: string[]) => void;
  mentionUsers: MockUser[];
  placeholder?: string;
  rows?: number;
  className?: string;
  textareaClassName?: string;
  hasError?: boolean;
  disabled?: boolean;
  'data-testid'?: string; // Added data-testid prop
}

const MENTION_TRIGGER = '@';
const MAX_SUGGESTIONS = 5;

const FormattingToolbar: React.FC<{
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onValueChange: (newValue: string, newCursorPos?: number) => void;
  disabled?: boolean;
}> = ({ textareaRef, onValueChange, disabled }) => {

  const applyFormat = (syntaxStart: string, syntaxEnd: string = syntaxStart) => {
    if (!textareaRef.current) return;
    const { value, selectionStart, selectionEnd } = textareaRef.current;
    const selectedText = value.substring(selectionStart, selectionEnd);
    const newText = `${value.substring(0, selectionStart)}${syntaxStart}${selectedText}${syntaxEnd}${value.substring(selectionEnd)}`;
    onValueChange(newText, selectionStart + syntaxStart.length + selectedText.length + syntaxEnd.length);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const applyListFormat = (prefix: string) => {
    if (!textareaRef.current) return;
    const { value, selectionStart } = textareaRef.current;
    // Find the start of the current line
    let lineStart = selectionStart;
    while (lineStart > 0 && value[lineStart - 1] !== '\n') {
      lineStart--;
    }
    const newText = `${value.substring(0, lineStart)}${prefix}${value.substring(lineStart)}`;
    onValueChange(newText, selectionStart + prefix.length);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const toolbarButtons = [
    { name: 'formatBold', tooltip: uiStrings.tooltipBold, action: () => applyFormat('**', '**'), icon: 'formatBold' },
    { name: 'formatItalic', tooltip: uiStrings.tooltipItalic, action: () => applyFormat('*', '*'), icon: 'formatItalic' },
    { name: 'listBullet', tooltip: uiStrings.tooltipUnorderedList, action: () => applyListFormat('- '), icon: 'listBullet' },
    { name: 'queueList', tooltip: uiStrings.tooltipOrderedList, action: () => applyListFormat('1. '), icon: 'queueList' },
  ] as const;


  return (
    <div className="flex items-center space-x-1 p-1 bg-slate-700 border border-slate-600 rounded-t-md">
      {toolbarButtons.map(btn => (
        <Tooltip key={btn.name} content={btn.tooltip} position="top" offsetValue={4}>
          <Button
            variant="icon"
            size="sm"
            onClick={btn.action}
            disabled={disabled}
            className="!p-1 text-gray-300 hover:text-purple-300"
            aria-label={btn.tooltip}
          >
            <Icon name={btn.icon} size="sm" />
          </Button>
        </Tooltip>
      ))}
    </div>
  );
};


const MentionTextarea: React.FC<MentionTextareaProps> = ({
  value,
  onChange,
  onMentionsResolved,
  mentionUsers,
  placeholder,
  rows = 3,
  className = '',
  textareaClassName = '',
  hasError,
  disabled,
  'data-testid': dataTestId,
}) => {
  const [mentionQuery, setMentionQuery] = useState('');
  const [suggestions, setSuggestions] = useState<MockUser[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [currentMentions, setCurrentMentions] = useState<Set<string>>(new Set());

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);
  const lastMentionPositionRef = useRef<number | null>(null);
  const listboxId = useId() + '-mention-suggestions-listbox';


  useEffect(() => {
    if (mentionQuery) {
      const filtered = mentionUsers
        .filter(user =>
          user.username.toLowerCase().includes(mentionQuery.toLowerCase()) ||
          user.displayName.toLowerCase().includes(mentionQuery.toLowerCase())
        )
        .slice(0, MAX_SUGGESTIONS);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setActiveSuggestionIndex(0);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  }, [mentionQuery, mentionUsers]);

  const handleTextChangeInternal = (text: string, newCursorPos?: number) => {
    onChange(text);

    const cursorPos = newCursorPos ?? textareaRef.current?.selectionStart ?? text.length;
    let query = '';
    let mentionTriggerPos = -1;

    for (let i = cursorPos - 1; i >= 0; i--) {
      if (text[i] === MENTION_TRIGGER && (i === 0 || /\s/.test(text[i-1]))) {
        const potentialQuery = text.substring(i + 1, cursorPos);
        if (!/\s/.test(potentialQuery)) { // Ensure no spaces within the @query part
            query = potentialQuery;
            mentionTriggerPos = i;
            lastMentionPositionRef.current = i;
        } else { // Space found within @query, so it's not a valid mention query start
            mentionTriggerPos = -1; // Reset if we hit a space
        }
        break; 
      }
      if (/\s/.test(text[i])) { // Stop if we hit whitespace before finding '@'
        break;
      }
    }
    
    if (mentionTriggerPos !== -1) {
        setMentionQuery(query);
    } else {
        setShowSuggestions(false);
        setMentionQuery('');
        lastMentionPositionRef.current = null;
    }
    resolveMentionsFromText(text);
    
    if (newCursorPos !== undefined && textareaRef.current) {
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 0);
    }
  };
  
  const handleTextChangeFromEvent = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleTextChangeInternal(e.target.value);
  };


  const resolveMentionsFromText = useCallback((text: string) => {
    const newMentionedIds = new Set<string>();
    const mentionRegex = /@([a-zA-Z0-9_.-]+)/g;
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      const username = match[1];
      const user = mentionUsers.find(u => u.username === username);
      if (user) {
        newMentionedIds.add(user.id);
      }
    }
    setCurrentMentions(newMentionedIds);
    onMentionsResolved(Array.from(newMentionedIds));
  }, [mentionUsers, onMentionsResolved]);

  useEffect(() => {
    resolveMentionsFromText(value);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const selectSuggestion = (user: MockUser) => {
    if (textareaRef.current && lastMentionPositionRef.current !== null) {
      const currentText = value;
      const cursorPos = textareaRef.current.selectionStart;
      
      const textBeforeMention = currentText.substring(0, lastMentionPositionRef.current);
      // Find the end of the current query. If selectionStart is further than triggerPos + query.length, use that.
      // This is simplified; a more robust solution might track the exact query range.
      // For now, we assume the cursor is at the end of the query or immediately after.
      const textAfterCursorOriginal = currentText.substring(cursorPos);
      
      const newText = `${textBeforeMention}${MENTION_TRIGGER}${user.username} ${textAfterCursorOriginal}`;
      const newCursorPosAfterInsert = (textBeforeMention + MENTION_TRIGGER + user.username + " ").length;
      
      handleTextChangeInternal(newText, newCursorPosAfterInsert); 

      currentMentions.add(user.id);
      setCurrentMentions(new Set(currentMentions));
      onMentionsResolved(Array.from(currentMentions));

      setShowSuggestions(false);
      setMentionQuery('');
      lastMentionPositionRef.current = null;
      setTimeout(() => textareaRef.current?.focus(), 0); // Ensure focus returns
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestionIndex(prev => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        selectSuggestion(suggestions[activeSuggestionIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowSuggestions(false);
      }
    }
  };

  useEffect(() => {
    if (showSuggestions && suggestionsRef.current && suggestionsRef.current.children[activeSuggestionIndex]) {
      suggestionsRef.current.children[activeSuggestionIndex].scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [activeSuggestionIndex, showSuggestions]);

  let currentActiveDescendantId: string | undefined = undefined;
  if (showSuggestions && suggestions.length > 0 && activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
    const activeUser = suggestions[activeSuggestionIndex];
    if (activeUser && activeUser.id !== undefined) {
      currentActiveDescendantId = `mention-suggestion-${activeUser.id}-${activeSuggestionIndex}`;
    }
  }

  return (
    <div className={`relative ${className}`}>
      <FormattingToolbar textareaRef={textareaRef} onValueChange={handleTextChangeInternal} disabled={disabled} />
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChangeFromEvent}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className={`${textareaClassName} !rounded-t-none`}
        hasError={hasError}
        disabled={disabled}
        data-testid={dataTestId || "mention-textarea"}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showSuggestions}
        aria-controls={showSuggestions ? listboxId : undefined}
        aria-activedescendant={currentActiveDescendantId}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div 
            className="absolute z-10 mt-1 w-full bg-slate-700 border border-slate-600 rounded-md shadow-lg max-h-48 overflow-y-auto"
        >
          <ScrollableContainer axis="y" className="max-h-48">
            <ul ref={suggestionsRef} role="listbox" id={listboxId} aria-label="Προτάσεις αναφοράς">
              {suggestions.map((user, index) => (
                <li
                  key={user.id}
                  id={`mention-suggestion-${user.id}-${index}`}
                  role="option"
                  aria-selected={index === activeSuggestionIndex}
                  className={`p-2 hover:bg-slate-600 cursor-pointer flex items-center space-x-2
                              ${index === activeSuggestionIndex ? 'bg-slate-600' : ''}`}
                  onMouseDown={(e) => e.preventDefault()} // Prevents textarea blur on click
                  onClick={() => selectSuggestion(user)}
                >
                  <Avatar name={user.displayName} avatarUrl={user.avatarUrl} sizeClasses="w-6 h-6" textClasses="text-xs" />
                  <span className="text-sm text-gray-200">{user.displayName}</span>
                  <span className="text-xs text-gray-400">@{user.username}</span>
                </li>
              ))}
            </ul>
          </ScrollableContainer>
        </div>
      )}
      {showSuggestions && suggestions.length === 0 && mentionQuery.length > 0 && (
         <div className="absolute z-10 mt-1 w-full bg-slate-700 border border-slate-600 rounded-md shadow-lg p-2 text-sm text-gray-400">
           {uiStrings.noMentionMatches || "No users found"}
         </div>
      )}
    </div>
  );
};

export default MentionTextarea;
