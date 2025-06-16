// src/components/info/SocialMediaLinksDisplay.tsx
import React from 'react';
import type { SocialMediaLink, SocialPlatform } from '../../types';
import { socialPlatformTranslations, uiStrings } from '../../config/translations';
import Icon from '../ui/Icon';
import type { IconName } from '../../types/iconTypes';

interface SocialMediaLinksDisplayProps {
  links?: SocialMediaLink[];
}

const SocialMediaLinksDisplay: React.FC<SocialMediaLinksDisplayProps> = React.memo(({ links }) => {
  if (!links || links.length === 0) {
    return null;
  }

  const getIconForPlatform = (platform: SocialPlatform): React.ReactNode => {
    let iconName: IconName = 'user'; // default
    switch (platform) {
      case 'facebook': iconName = 'facebook'; break;
      case 'instagram': iconName = 'instagram'; break;
      case 'x': iconName = 'x'; break;
      case 'tiktok': iconName = 'tikTok'; break;
      case 'linkedin': iconName = 'linkedIn'; break;
      case 'website': iconName = 'website'; break;
      case 'otherSocial': iconName = 'user'; break;
      default:
        return <Icon name="user" size="md" />; // Fallback
    }
    return <Icon name={iconName} size="md" />;
  };

  const formatUrlForDisplay = (platform: SocialPlatform, url: string): string => {
    return url;
  }

  const getHref = (platform: SocialPlatform, url: string): string => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `http://${url}`;
    }
    return url;
  }


  return (
    <div className="mt-2">
      <h4 className="text-sm font-semibold text-gray-300 mb-1">{uiStrings.socialMediaCardLabel}:</h4>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {links.map((link, index) => (
          <a
            key={`${link.platform}-${index}-${link.url}`}
            href={getHref(link.platform, link.url)}
            target="_blank"
            rel="noopener noreferrer"
            title={`${socialPlatformTranslations[link.platform] || link.platform}: ${formatUrlForDisplay(link.platform, link.url)}`}
            className="flex items-center gap-1 text-gray-400 hover:text-purple-400 transition-colors duration-200"
            aria-label={`Σύνδεσμος για ${socialPlatformTranslations[link.platform] || link.platform}`}
          >
            {getIconForPlatform(link.platform)}
            <span className="text-xs sr-only">{socialPlatformTranslations[link.platform] || link.platform}</span>
          </a>
        ))}
      </div>
    </div>
  );
});
SocialMediaLinksDisplay.displayName = 'SocialMediaLinksDisplay';
export default SocialMediaLinksDisplay;