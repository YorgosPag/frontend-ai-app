// src/hooks/usePhoneNumbersFieldArray.ts
import { useState, useCallback } from 'react';
import type { ContactPhoneNumber, PhoneType, PhoneProtocol, VoIPIntegrationDetails } from '../types';
import { generateUniqueId } from '../utils/formUtils';

interface UsePhoneNumbersFieldArrayReturn {
  phoneNumbers: ContactPhoneNumber[];
  addPhoneNumber: () => void;
  removePhoneNumber: (index: number) => void;
  updatePhoneNumberField: (
    index: number,
    fieldName: string, // Can be nested like "voipIntegrationDetails.systemName"
    fieldValue: any,
    fieldType?: string, // e.g., "checkbox"
    fieldChecked?: boolean
  ) => void;
  resetPhoneNumbers: (newPhoneNumbers: ContactPhoneNumber[]) => void;
}

const initializePhoneNumbersState = (initialValues: ContactPhoneNumber[]): ContactPhoneNumber[] => {
  const valuesToProcess = initialValues.length > 0 ? initialValues : [
    {
      id: generateUniqueId(),
      number: '',
      type: 'mobile' as PhoneType,
      isPrimary: true,
      protocols: ['voice'] as PhoneProtocol[],
    }
  ];

  let hasPrimary = false;
  const processedValues = valuesToProcess.map(pn => {
    if (pn.isPrimary) hasPrimary = true;
    return { ...pn, id: pn.id || generateUniqueId() };
  });

  if (!hasPrimary && processedValues.length > 0) {
    processedValues[0].isPrimary = true;
  }
  return processedValues;
};


export const usePhoneNumbersFieldArray = (
  initialPhoneNumbers: ContactPhoneNumber[] = []
): UsePhoneNumbersFieldArrayReturn => {
  const [phoneNumbers, setPhoneNumbers] = useState<ContactPhoneNumber[]>(() => initializePhoneNumbersState(initialPhoneNumbers));

  const addPhoneNumber = useCallback(() => {
    setPhoneNumbers(prev => {
      const newPhone = {
        id: generateUniqueId(),
        number: '',
        type: 'mobile' as PhoneType,
        isPrimary: prev.length === 0,
        protocols: ['voice'] as PhoneProtocol[],
      };
      return [...prev, newPhone];
    });
  }, []);

  const removePhoneNumber = useCallback((indexToRemove: number) => {
    setPhoneNumbers(prev => {
      const wasPrimary = prev[indexToRemove]?.isPrimary;
      const newPhoneNumbers = prev.filter((_, i) => i !== indexToRemove);
      if (wasPrimary && newPhoneNumbers.length > 0 && !newPhoneNumbers.some(p => p.isPrimary)) {
        newPhoneNumbers[0].isPrimary = true;
      }
      return newPhoneNumbers;
    });
  }, []);

  const updatePhoneNumberField = useCallback(
    (
      index: number,
      fieldName: string,
      fieldValue: any,
      fieldType?: string,
      fieldChecked?: boolean
    ) => {
      setPhoneNumbers(prev => {
        let newPhoneNumbers = prev.map((item, i) => {
          if (i !== index) return item;

          const updatedItem = JSON.parse(JSON.stringify(item)) as ContactPhoneNumber;

          if (fieldName.startsWith("voipIntegrationDetails.")) {
            const subField = fieldName.split('.')[1] as keyof VoIPIntegrationDetails;
            if (!updatedItem.voipIntegrationDetails) {
              updatedItem.voipIntegrationDetails = {};
            }
            if (fieldType === 'checkbox') {
                 (updatedItem.voipIntegrationDetails as any)[subField] = fieldChecked;
            } else {
                 (updatedItem.voipIntegrationDetails as any)[subField] = fieldValue;
            }
          } else {
            const directField = fieldName as keyof Omit<ContactPhoneNumber, 'voipIntegrationDetails'>;
            if (fieldType === 'checkbox' && directField === 'isPrimary') {
              updatedItem.isPrimary = fieldChecked;
              // Η λογική για το isPrimary θα εφαρμοστεί σε δεύτερο πέρασμα
            } else if (directField === 'protocols') { // Protocols are handled via checkbox group typically
              const protocolValue = fieldValue as PhoneProtocol;
              if (!updatedItem.protocols) updatedItem.protocols = [];
              
              if (fieldChecked) { // Add protocol
                if (!updatedItem.protocols.includes(protocolValue)) {
                  updatedItem.protocols.push(protocolValue);
                }
              } else { // Remove protocol
                updatedItem.protocols = updatedItem.protocols.filter(p => p !== protocolValue);
              }
            }
             else {
              (updatedItem as any)[directField] = fieldValue;
            }
          }
          return updatedItem;
        });

        // Εφαρμογή λογικής isPrimary
        if (fieldName === 'isPrimary' && fieldChecked) {
          newPhoneNumbers = newPhoneNumbers.map((pn, pnIndex) => ({
            ...pn,
            isPrimary: pnIndex === index,
          }));
        } else if (fieldName === 'isPrimary' && !fieldChecked) {
            const primaryExists = newPhoneNumbers.some(pn => pn.isPrimary);
            if(!primaryExists && newPhoneNumbers.length > 0){
                newPhoneNumbers[0].isPrimary = true;
            }
        }
        
        // Ensure at least one primary if list is not empty and no primary is set after an update that wasn't 'isPrimary'
        if (fieldName !== 'isPrimary' && newPhoneNumbers.length > 0 && !newPhoneNumbers.some(pn => pn.isPrimary)) {
            newPhoneNumbers[0].isPrimary = true;
        }


        return newPhoneNumbers;
      });
    },
    []
  );
  
  const resetPhoneNumbers = useCallback((newPhoneNumbers: ContactPhoneNumber[]) => {
    setPhoneNumbers(initializePhoneNumbersState(newPhoneNumbers));
  }, []);

  return {
    phoneNumbers,
    addPhoneNumber,
    removePhoneNumber,
    updatePhoneNumberField,
    resetPhoneNumbers,
  };
};