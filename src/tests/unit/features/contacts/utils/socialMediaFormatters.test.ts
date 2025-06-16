// src/tests/unit/features/contacts/utils/socialMediaFormatters.test.ts
import { parseSocialMediaLinks, formatSocialMediaText } from '../../../../../features/contacts/utils/socialMediaFormatters';
import type { SocialMediaLink } from '../../../../../types';

console.log("--- Running socialMediaFormatters.test.ts (Conceptual Tests) ---");

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
  };
  return self;
};

describe('socialMediaFormatters', () => {
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
      // Note: Relies on socialPlatformTranslations from the main app config
      const expected = 'Facebook:https://fb.com/user\nΙστοσελίδα:example.com';
      expect(formatSocialMediaText(links)).toBe(expected);
    });
  });
});

console.log("--- Finished socialMediaFormatters.test.ts ---");
export {}; // Ensure this file is treated as a module
