// src/features/contacts/utils/socialMediaFormatters.ts
import type { SocialMediaLink, SocialPlatform } from '../../../types';
import { socialPlatformTranslations } from '../../../config/translations';

export const parseSocialMediaLinks = (text: string | undefined): SocialMediaLink[] => {
    if (!text?.trim()) return [];
    return text.split('\n')
      .map(line => line.trim())
      .filter(line => line.includes(':'))
      .map(line => {
        const [platformStr, ...urlParts] = line.split(':');
        const url = urlParts.join(':').trim();
        const platformKey = platformStr.trim().toLowerCase();
        
        const platform = (Object.keys(socialPlatformTranslations) as SocialPlatform[]).find(
          key => socialPlatformTranslations[key].toLowerCase() === platformKey || key.toLowerCase() === platformKey
        );

        if (platform && url) {
            return { platform, url };
        }
        return null;
      })
      .filter((link): link is SocialMediaLink => link !== null);
};

export const formatSocialMediaText = (links: SocialMediaLink[] | undefined): string => {
  if (!links || links.length === 0) return '';
  return links.map(link => `${socialPlatformTranslations[link.platform] || link.platform}:${link.url}`).join('\n');
};
