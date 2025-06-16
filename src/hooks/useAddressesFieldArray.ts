// src/hooks/useAddressesFieldArray.ts
import { useState, useCallback } from 'react';
import type { Address } from '../types';
import { generateUniqueId } from '../utils/idUtils';

interface UseAddressesFieldArrayReturn {
  addresses: Address[];
  addAddress: () => void;
  removeAddress: (index: number) => void;
  updateAddressField: (
    index: number,
    fieldName: keyof Address,
    fieldValue: any,
    fieldType?: string, // e.g., "checkbox"
    fieldChecked?: boolean
  ) => void;
  resetAddresses: (newAddresses: Address[]) => void;
}

const initializeAddressesState = (initialValues: Address[]): Address[] => {
    const valuesToProcess = initialValues.length > 0 ? initialValues : [
        {
            id: generateUniqueId(),
            street: '',
            number: '',
            city: '',
            postalCode: '',
            country: 'ΕΛΛΑΔΑ',
            addressType: 'home',
            isPrimary: true,
        }
    ];

    let hasPrimary = false;
    const processedValues = valuesToProcess.map(addr => {
        if (addr.isPrimary) hasPrimary = true;
        return { ...addr, id: addr.id || generateUniqueId() };
    });

    if (!hasPrimary && processedValues.length > 0) {
        processedValues[0].isPrimary = true;
    }
    return processedValues;
};


export const useAddressesFieldArray = (
  initialAddresses: Address[] = []
): UseAddressesFieldArrayReturn => {
  const [addresses, setAddresses] = useState<Address[]>(() => initializeAddressesState(initialAddresses));

  const addAddress = useCallback(() => {
    setAddresses(prev => [
      ...prev,
      {
        id: generateUniqueId(),
        street: '',
        number: '',
        city: '',
        postalCode: '',
        country: 'ΕΛΛΑΔΑ',
        addressType: 'home',
        isPrimary: prev.length === 0,
      },
    ]);
  }, []);

  const removeAddress = useCallback((indexToRemove: number) => {
    setAddresses(prev => {
      const wasPrimary = prev[indexToRemove]?.isPrimary;
      const newAddresses = prev.filter((_, i) => i !== indexToRemove);
      if (wasPrimary && newAddresses.length > 0 && !newAddresses.some(a => a.isPrimary)) {
        newAddresses[0].isPrimary = true;
      }
      return newAddresses;
    });
  }, []);

  const updateAddressField = useCallback(
    (
      index: number,
      fieldName: keyof Address,
      fieldValue: any,
      fieldType?: string,
      fieldChecked?: boolean
    ) => {
      setAddresses(prev => {
        let newAddresses = prev.map((item, i) => {
          if (i !== index) return item;

          const updatedItem = { ...item };
          if (fieldType === 'checkbox' && fieldName === 'isPrimary') {
            updatedItem.isPrimary = fieldChecked;
            // Η λογική isPrimary θα εφαρμοστεί σε δεύτερο πέρασμα
          } else {
            (updatedItem as any)[fieldName] = fieldValue;
          }
          return updatedItem;
        });
        
        // Εφαρμογή λογικής isPrimary
        if (fieldName === 'isPrimary' && fieldChecked) {
            newAddresses = newAddresses.map((addr, addrIndex) => ({
                ...addr,
                isPrimary: addrIndex === index,
            }));
        } else if (fieldName === 'isPrimary' && !fieldChecked) {
            const primaryExists = newAddresses.some(addr => addr.isPrimary);
            if(!primaryExists && newAddresses.length > 0){
                newAddresses[0].isPrimary = true;
            }
        }
        
        // Ensure at least one primary if list is not empty and no primary is set after an update that wasn't 'isPrimary'
        if (fieldName !== 'isPrimary' && newAddresses.length > 0 && !newAddresses.some(addr => addr.isPrimary)) {
            newAddresses[0].isPrimary = true;
        }

        return newAddresses;
      });
    },
    []
  );
  
  const resetAddresses = useCallback((newAddresses: Address[]) => {
    setAddresses(initializeAddressesState(newAddresses));
  }, []);


  return {
    addresses,
    addAddress,
    removeAddress,
    updateAddressField,
    resetAddresses,
  };
};