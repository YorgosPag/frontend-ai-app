// src/tests/unit/formUtils.test.ts
import { 
  generateUniqueId, 
  getInitialFormState, 
  parseSocialMediaLinks, 
  formatSocialMediaText, 
  initializeFormStateFromContact,
  prepareContactDataForSubmission
} from '../../utils/formUtils';
import type { ContactFormState } from '../../hooks/useContactForm';
import type { Contact, NaturalPersonContact, LegalEntityContact, PublicServiceContact, SocialMediaLink, ContactType, NaturalPersonBasicIdentity, ProfessionalInfo, Note, EntityType } from '../../types';
import { uiStrings } from '../../config/translations';

console.log("--- Running formUtils.test.ts (Conceptual Tests) ---");

// Helper to simulate describe/it blocks
const describe = (description: string, fn: () => void) => {
  console.log(`\nDESCRIBE: ${description}`);
  fn();
};

const it = (description: string, fn: () => Promise<void> | void) => {
  console.log(`  IT: ${description}`);
  try {
    const result = fn();
    if (result instanceof Promise) {
      result.catch(err => console.error(`    ERROR IN ASYNC TEST: ${err.message}`, err.fieldErrors || err));
    }
  } catch (err: any) {
    console.error(`    ERROR IN TEST: ${err.message}`, err.fieldErrors || err);
  }
};

// Helper for conceptual assertions
const expect = (actual: any) => {
  const self = {
    _not: false,
    get not() {
      self._not = !self._not;
      return self;
    },
    toBe: (expected: any) => {
      const condition = actual === expected;
      if (self._not ? condition : !condition) console.warn(`    ASSERTION FAILED${self._not ? " (NOT)" : ""}: Expected ${actual} ${self._not ? "not " : ""}to be ${expected}`);
      else console.log(`    ASSERTION PASSED${self._not ? " (NOT)" : ""}: ${actual} ${self._not ? "not " : ""}=== ${expected}`);
      self._not = false; // Reset for next assertion
    },
    toEqual: (expected: any) => { // For deep equality
      const condition = JSON.stringify(actual) === JSON.stringify(expected);
      if (self._not ? condition : !condition) console.warn(`    ASSERTION FAILED (toEqual)${self._not ? " (NOT)" : ""}: Expected ${JSON.stringify(actual)} ${self._not ? "not " : ""}to equal ${JSON.stringify(expected)}`);
      else console.log(`    ASSERTION PASSED (toEqual)${self._not ? " (NOT)" : ""}`);
      self._not = false;
    },
    toBeDefined: () => {
      const condition = actual !== undefined && actual !== null;
      if (self._not ? condition : !condition) console.warn(`    ASSERTION FAILED${self._not ? " (NOT)" : ""}: Expected value ${self._not ? "not " : ""}to be defined, got ${actual}`);
      else console.log(`    ASSERTION PASSED${self._not ? " (NOT)" : ""}: Value is ${self._not ? "not " : ""}defined (${JSON.stringify(actual)})`);
      self._not = false;
    },
    toBeNull: () => {
      const condition = actual === null;
      if (self._not ? condition : !condition) console.warn(`    ASSERTION FAILED${self._not ? " (NOT)" : ""}: Expected ${actual} ${self._not ? "not " : ""}to be null`);
      else console.log(`    ASSERTION PASSED${self._not ? " (NOT)" : ""}: Value is ${self._not ? "not " : ""}null`);
      self._not = false;
    },
    toHaveLength: (expectedLength: number) => {
      const condition = actual && typeof actual.length === 'number' && actual.length === expectedLength;
      if (self._not ? condition : !condition) console.warn(`    ASSERTION FAILED${self._not ? " (NOT)" : ""}: Expected length ${self._not ? "not " : ""}to be ${expectedLength}, got ${actual?.length}`);
      else console.log(`    ASSERTION PASSED${self._not ? " (NOT)" : ""}: Has ${self._not ? "not " : ""}length ${expectedLength}`);
      self._not = false;
    },
    arrayContaining: (subset: any[]) => {
      const condition = Array.isArray(actual) && subset.every(item => actual.some(actualItem => JSON.stringify(actualItem) === JSON.stringify(item)));
      if (self._not ? condition : !condition) {
          console.warn(`    ASSERTION FAILED (arrayContaining)${self._not ? " (NOT)" : ""}: Expected array ${JSON.stringify(actual)} ${self._not ? "not " : ""}to contain subset ${JSON.stringify(subset)}`);
      } else {
          console.log(`    ASSERTION PASSED (arrayContaining)${self._not ? " (NOT)" : ""}`);
      }
      self._not = false;
    },
    objectContaining: (subset: object) => {
      let pass = true;
      if (!actual || typeof actual !== 'object') {
        pass = false;
      } else {
        for (const key in subset) {
          if (!(key in actual) || JSON.stringify((actual as any)[key]) !== JSON.stringify((subset as any)[key])) {
            pass = false;
            break;
          }
        }
      }
      const condition = pass;
      if (self._not ? condition : !condition) console.warn(`    ASSERTION FAILED (objectContaining)${self._not ? " (NOT)" : ""}: Expected ${JSON.stringify(actual)} ${self._not ? "not " : ""}to contain ${JSON.stringify(subset)}`);
      else console.log(`    ASSERTION PASSED (objectContaining)${self._not ? " (NOT)" : ""}`);
      self._not = false;
    },
  };
  return self;
};


describe('formUtils', () => {
  describe('generateUniqueId', () => {
    it('should return a string', () => {
      const id = generateUniqueId();
      expect(typeof id).toBe('string');
    });

    it('should return different IDs on subsequent calls', () => {
      const id1 = generateUniqueId();
      const id2 = generateUniqueId();
      expect(id1).not.toBe(id2); // High probability of being different
      console.log(`    Generated IDs: ${id1}, ${id2}`);
    });
  });

  describe('getInitialFormState', () => {
    it('should return correct initial state for naturalPerson', () => {
      const state = getInitialFormState('naturalPerson');
      expect(state.contactType).toBe('naturalPerson');
      expect(state.basicIdentity).toEqual({ firstName: '', lastName: '', nickname: '' });
      expect(state.contactPhoneNumbers).toHaveLength(1);
      expect(state.contactPhoneNumbers[0].isPrimary).toBe(true);
      expect(state.addresses).toHaveLength(1);
      expect(state.addresses[0].isPrimary).toBe(true);
      expect(state.addresses[0].country).toBe('ΕΛΛΑΔΑ');
      // expect(state.notes).toEqual([]); // ContactFormState does not have 'notes'
    });

    it('should return correct initial state for legalEntity', () => {
      const state = getInitialFormState('legalEntity');
      expect(state.contactType).toBe('legalEntity');
      expect(state.name).toBe('');
      expect(state.brandName).toBe('');
      // expect(state.notes).toEqual([]); // ContactFormState does not have 'notes'
    });

    it('should return correct initial state for publicService', () => {
      const state = getInitialFormState('publicService');
      expect(state.contactType).toBe('publicService');
      expect(state.name).toBe('');
      expect(state.serviceType).toBe('');
      // expect(state.notes).toEqual([]); // ContactFormState does not have 'notes'
    });
  });

  describe('parseSocialMediaLinks', () => {
    it('should return an empty array for empty or undefined input', () => {
      expect(parseSocialMediaLinks(undefined)).toEqual([]);
      expect(parseSocialMediaLinks('')).toEqual([]);
      expect(parseSocialMediaLinks('   ')).toEqual([]);
    });

    it('should parse valid social media links', () => {
      const text = 'Facebook:https://fb.com/user\nwebsite: example.com\n X : @twitterUser  ';
      const expected: SocialMediaLink[] = [
        { platform: 'facebook', url: 'https://fb.com/user' },
        { platform: 'website', url: 'example.com' },
        { platform: 'x', url: '@twitterUser' },
      ];
      expect(parseSocialMediaLinks(text)).toEqual(expected);
    });

    it('should ignore lines without a colon or empty URLs', () => {
      const text = 'Facebook:https://fb.com/user\nInstagram\nTikTok:';
      const expected: SocialMediaLink[] = [
        { platform: 'facebook', url: 'https://fb.com/user' },
      ];
      expect(parseSocialMediaLinks(text)).toEqual(expected);
    });

    it('should handle different casings for platform keys', () => {
        const text = 'facebook:fb.com/user\nLINKEDIN:linkedin.com/in/user';
        const expected: SocialMediaLink[] = [
          { platform: 'facebook', url: 'fb.com/user' },
          { platform: 'linkedin', url: 'linkedin.com/in/user' },
        ];
        expect(parseSocialMediaLinks(text)).toEqual(expected);
      });
  });

  describe('formatSocialMediaText', () => {
    it('should return an empty string for empty or undefined links', () => {
      expect(formatSocialMediaText(undefined)).toBe('');
      expect(formatSocialMediaText([])).toBe('');
    });

    it('should format social media links into text', () => {
      const links: SocialMediaLink[] = [
        { platform: 'facebook', url: 'https://fb.com/user' },
        { platform: 'website', url: 'example.com' },
      ];
      // Note: Relies on socialPlatformTranslations
      const expected = 'Facebook:https://fb.com/user\nΙστοσελίδα:example.com';
      expect(formatSocialMediaText(links)).toBe(expected);
    });
  });

  describe('initializeFormStateFromContact', () => {
    const naturalPersonContact: NaturalPersonContact = {
      id: 'np1',
      contactType: 'naturalPerson',
      basicIdentity: { firstName: 'Test', lastName: 'User' },
      email: 'test@example.com',
      roles: ['buyer'],
      // notes are not part of ContactFormState from Contact object directly
      socialMediaLinks: [{ platform: 'website', url: 'example.org' }],
      contactPhoneNumbers: [{id: generateUniqueId(), number: '12345', type: 'mobile', isPrimary: true, protocols:['voice']}],
      addresses: [{id: generateUniqueId(), street: 'Main St', number: '1', city: 'Testville', postalCode: '12345', country: 'ΕΛΛΑΔΑ', isPrimary: true}]
    };

    it('should correctly initialize form state from a NaturalPersonContact', () => {
      const formState = initializeFormStateFromContact(naturalPersonContact);
      expect(formState.contactType).toBe('naturalPerson');
      expect(formState.basicIdentity?.firstName).toBe('Test');
      expect(formState.email).toBe('test@example.com');
      expect(formState.socialMediaText).toBe('Ιστοσελίδα:example.org');
      expect(formState.contactPhoneNumbers[0].number).toBe('12345');
      expect(formState.addresses[0].street).toBe('Main St');
    });

    const legalEntityContact: LegalEntityContact = {
      id: 'le1',
      contactType: 'legalEntity',
      name: 'Test Corp',
      email: 'corp@example.com',
      roles: ['supplier'],
      brandName: 'TestBrand',
      contactPhoneNumbers: [],
      addresses: []
    };

    it('should correctly initialize form state from a LegalEntityContact', () => {
      const formState = initializeFormStateFromContact(legalEntityContact);
      expect(formState.contactType).toBe('legalEntity');
      expect(formState.name).toBe('Test Corp');
      expect(formState.brandName).toBe('TestBrand');
      expect(formState.contactPhoneNumbers).toHaveLength(1); // Default entry
    });
    
     it('should provide default phone and address if contact has none', () => {
      const contactWithoutPhoneAddress: LegalEntityContact = {
        id: 'np2',
        contactType: 'legalEntity',
        name: 'No PA Inc.',
        email: 'nopa@example.com',
        roles: [],
        // contactPhoneNumbers and addresses are undefined or empty
      };
      const formState = initializeFormStateFromContact(contactWithoutPhoneAddress);
      expect(formState.contactPhoneNumbers).toHaveLength(1);
      expect(formState.contactPhoneNumbers[0].isPrimary).toBe(true);
      expect(formState.addresses).toHaveLength(1);
      expect(formState.addresses[0].isPrimary).toBe(true);
    });
  });

  describe('prepareContactDataForSubmission', () => {
    const baseNaturalPersonFormState: ContactFormState = {
      contactType: 'naturalPerson',
      basicIdentity: { firstName: 'Valid', lastName: 'User' },
      email: 'valid@example.com',
      roles: ['buyer'],
      // notes: [], // Not part of ContactFormState
      contactPhoneNumbers: [{ id: 'pn1', number: '1234567890', type: 'mobile', isPrimary: true, protocols: ['voice'] }],
      addresses: [{ id: 'ad1', street: 'Valid St', number: '10', city: 'Valid City', postalCode: '12345', country: 'ΕΛΛΑΔΑ', isPrimary: true }],
      socialMediaText: 'website:https://example.com',
      formErrors: null,
    };

    type NaturalPersonData = Omit<NaturalPersonContact, 'id'>;
    type LegalEntityData = Omit<LegalEntityContact, 'id'>;


    it('should return validated data for a valid natural person form state (and notes should be undefined)', async () => {
      const { data, errors } = await prepareContactDataForSubmission(baseNaturalPersonFormState);
      expect(errors).toBeNull();
      expect(data).toBeDefined();
      if (data) { 
        expect(data.contactType).toBe('naturalPerson');
        if (data.contactType === 'naturalPerson') {
          expect((data as NaturalPersonData).basicIdentity.firstName).toBe('Valid');
        }
        expect(data.socialMediaLinks).toEqual([{ platform: 'website', url: 'https://example.com' }]);
        expect(data.notes).toBe(undefined); // Crucial: notes should not be part of submitted contact data
      }
    });

    it('should return errors for an invalid natural person form state (missing name)', async () => {
      const invalidState: ContactFormState = {
        ...baseNaturalPersonFormState,
        basicIdentity: { firstName: '', lastName: '' }, // Invalid
      };
      const { data, errors } = await prepareContactDataForSubmission(invalidState);
      expect(data).toBeNull();
      expect(errors).toBeDefined();
      expect(errors?.['basicIdentity.firstName']).toBeDefined();
      expect(errors?.['basicIdentity.lastName']).toBeDefined();
      console.log('    Validation errors for missing name:', errors);
    });

    it('should return errors for an invalid email', async () => {
      const invalidState: ContactFormState = {
        ...baseNaturalPersonFormState,
        email: 'not-an-email',
      };
      const { data, errors } = await prepareContactDataForSubmission(invalidState);
      expect(data).toBeNull();
      expect(errors).toBeDefined();
      expect(errors?.email).toBeDefined();
      console.log('    Validation errors for invalid email:', errors);
    });
    
    it('should correctly clean optional fields (e.g. empty AFM/DOY should be undefined)', async () => {
        const stateWithEmptyOptional: ContactFormState = {
            ...baseNaturalPersonFormState,
            taxInfo: { afm: '   ', doy: '  ' }, 
            professionalInfo: { profession: '  ' } 
        };
        const { data, errors } = await prepareContactDataForSubmission(stateWithEmptyOptional);
        expect(errors).toBeNull(); 
        expect(data).toBeDefined();
        if (data) { 
            expect(data.taxInfo).toBe(undefined);
            expect(data.notes).toBe(undefined); 
            if (data.contactType === 'naturalPerson') {
                 expect((data as NaturalPersonData).professionalInfo).toBe(undefined); 
            }
        }
    });

    it('should filter out empty phone numbers and addresses before validation', async () => {
        const stateWithEmptyEntries: ContactFormState = {
            ...baseNaturalPersonFormState,
            contactPhoneNumbers: [
                { id: 'pn1', number: '1234567890', type: 'mobile', isPrimary: true, protocols: ['voice'] },
                { id: 'pn2', number: '  ', type: 'landline', protocols: ['voice'] } 
            ],
            addresses: [
                { id: 'ad1', street: 'Valid St', number: '10', city: 'Valid City', postalCode: '12345', country: 'ΕΛΛΑΔΑ', isPrimary: true },
                { id: 'ad2', street: '  ', number: ' ', city: ' ', postalCode: ' ', country: ' ' } 
            ]
        };
        const { data, errors } = await prepareContactDataForSubmission(stateWithEmptyEntries);
        expect(errors).toBeNull();
        expect(data).toBeDefined();
        if (data) { 
            expect(data.contactPhoneNumbers).toHaveLength(1);
            if (data.contactPhoneNumbers) {
                 expect(data.contactPhoneNumbers[0].number).toBe('1234567890');
            }
            expect(data.addresses).toHaveLength(1);
            if (data.addresses) {
                expect(data.addresses[0].street).toBe('Valid St');
            }
        }
    });

    const baseLegalEntityFormState: ContactFormState = {
        contactType: 'legalEntity',
        name: 'Valid Corp',
        email: 'corp@example.com',
        roles: ['supplier'],
        // notes: [], // Not part of ContactFormState
        contactPhoneNumbers: [{ id: 'pn1', number: '0987654321', type: 'workLandline', isPrimary: true, protocols: ['voice'] }],
        addresses: [{ id: 'ad1', street: 'Corp Ave', number: '100', city: 'Business City', postalCode: '54321', country: 'ΕΛΛΑΔΑ', isPrimary: true }],
        formErrors: null, // Added to match ContactFormState
    };

    it('should return validated data for a valid legal entity form state', async () => {
        const { data, errors } = await prepareContactDataForSubmission(baseLegalEntityFormState);
        expect(errors).toBeNull();
        expect(data).toBeDefined();
        if (data) { 
            expect(data.contactType).toBe('legalEntity');
            if (data.contactType === 'legalEntity') {
                expect((data as LegalEntityData).name).toBe('Valid Corp');
            }
            expect(data.notes).toBe(undefined);
        }
    });

    it('should return errors for an invalid legal entity form state (missing name)', async () => {
        const invalidState: ContactFormState = {
            ...baseLegalEntityFormState,
            name: '', // Invalid
        };
        const { data, errors } = await prepareContactDataForSubmission(invalidState);
        expect(data).toBeNull();
        expect(errors).toBeDefined();
        expect(errors?.name).toBeDefined();
        console.log('    Validation errors for missing legal entity name:', errors);
    });
  });
});

console.log("--- Finished formUtils.test.ts ---");
export {}; // Ensure this file is treated as a module