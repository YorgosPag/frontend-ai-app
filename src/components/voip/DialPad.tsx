
// src/components/voip/DialPad.tsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useVoipHandler } from '../../voip/hooks/useVoipHandler';
import { normalizePhoneNumberForStorage } from '../../utils/phoneUtils';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import type { ContactType } from '../../types'; // Import ContactType

const dialPadButtons = [
  '1', '2', '3',
  '4', '5', '6',
  '7', '8', '9',
  '*', '0', '#'
];

const DialPad: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const { startVoipCall, isVoipReady } = useVoipHandler();
  const [isCalling, setIsCalling] = useState(false);

  const handleDigitClick = (digit: string) => {
    setInputValue(prev => prev + digit);
  };

  const handleBackspace = () => {
    setInputValue(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setInputValue('');
  };

  const handleCall = async () => {
    if (!inputValue.trim()) {
      toast.error('Εισαγάγετε έναν αριθμό για κλήση.');
      return;
    }
    if (!isVoipReady) {
      toast.error('Το σύστημα VoIP δεν είναι έτοιμο.');
      return;
    }

    setIsCalling(true);
    const normalizedNumber = normalizePhoneNumberForStorage(inputValue);
    
    // For DialPad calls, contactContext is minimal as it's not from an existing contact.
    await startVoipCall(
      { 
        id: `dialpad-${Date.now()}`, // Temporary ID for the ContactPhoneNumber object
        number: normalizedNumber, 
        type: 'voip', // Generic type for dialpad calls
        protocols: ['voice'] 
      },
      { 
        contact: { // Nested contact object
            id: `dialpad-contact-${Date.now()}`, // Temporary contact ID
            displayName: normalizedNumber, // Use number as display name
            contactType: 'naturalPerson' as ContactType 
        },
        subject: 'Κλήση από Πληκτρολόγιο' // Pass generic subject
      }
    );
    setIsCalling(false);
    // Do not clear input after call attempt to allow retry/edit. User can clear manually.
  };

  return (
    <div className="max-w-xs mx-auto p-4 bg-slate-800 rounded-lg shadow-xl border border-slate-700">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value.replace(/[^0-9*#+]/g, ''))}
        placeholder="Εισαγάγετε αριθμό"
        className="w-full p-3 mb-4 text-center text-2xl bg-slate-700 text-gray-100 rounded-md border border-slate-600 focus:ring-purple-500 focus:border-purple-500 outline-none"
        aria-label="Εισαγωγή αριθμού τηλεφώνου"
      />
      <div className="grid grid-cols-3 gap-2 mb-4">
        {dialPadButtons.map((btn) => (
          <Button
            key={btn}
            onClick={() => handleDigitClick(btn)}
            variant="secondary"
            className="!text-xl !py-3 aspect-square !bg-slate-700 hover:!bg-slate-600"
            aria-label={`Πλήκτρο ${btn}`}
          >
            {btn}
          </Button>
        ))}
      </div>
      <div className="flex justify-between items-center mb-4">
        <Button
            variant="ghost"
            onClick={handleBackspace}
            className="!p-2 text-slate-400 hover:!text-slate-200"
            aria-label="Διαγραφή τελευταίου ψηφίου"
        >
            <Icon name="arrowUturnLeft" size="md" className="transform -scale-x-100" />
        </Button>
        <Button
            variant="ghost"
            onClick={handleClear}
            className="!p-2 text-slate-400 hover:!text-slate-200"
            aria-label="Εκκαθάριση εισαγωγής"
        >
            <Icon name="close" size="md" />
        </Button>
      </div>
      <Button
        onClick={handleCall}
        variant="primary"
        className="w-full !text-lg !py-3 !bg-green-600 hover:!bg-green-500"
        isLoading={isCalling}
        disabled={!isVoipReady || isCalling}
        leftIcon={<Icon name="phone" size="md" />}
      >
        Κλήση
      </Button>
      {!isVoipReady && (
        <p className="text-xs text-red-400 text-center mt-2">Το σύστημα VoIP δεν είναι διαθέσιμο.</p>
      )}
    </div>
  );
};

export default DialPad;