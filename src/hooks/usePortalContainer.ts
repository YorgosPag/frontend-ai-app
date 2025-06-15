// src/hooks/usePortalContainer.ts
import { useEffect, useState } from 'react';

const DEFAULT_PORTAL_ID = 'tooltip-portal-root';

export const usePortalContainer = (portalId: string = DEFAULT_PORTAL_ID): HTMLElement | null => {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let portalRoot = document.getElementById(portalId);
    if (!portalRoot) {
      portalRoot = document.createElement('div');
      portalRoot.setAttribute('id', portalId);
      // Style to ensure it doesn't interfere with layout unless it has content.
      // portalRoot.style.position = 'absolute';
      // portalRoot.style.left = '0';
      // portalRoot.style.top = '0';
      // portalRoot.style.width = '0'; // Effectively hidden unless content gives it size
      // portalRoot.style.height = '0';
      // portalRoot.style.overflow = 'visible'; // Allow floating elements to escape
      // A high z-index might be set here if all portals should be above most things,
      // but individual components (like Tooltip, Modal) usually manage their own z-index.
      document.body.appendChild(portalRoot);
    }
    setContainer(portalRoot);

    // Optional: Cleanup if the portal container should be removed when no components are using this specific ID.
    // This is complex to manage correctly without a ref count or similar system for a shared portal ID.
    // For now, portals persist once created.
    // return () => {
    //   if (portalRoot && portalRoot.childElementCount === 0 && portalId !== DEFAULT_PORTAL_ID) {
    //     // Example: remove if empty and not the default tooltip portal
    //     // This logic needs to be robust to avoid removing a portal still in use by another component instance
    //     // document.body.removeChild(portalRoot);
    //   }
    // };
  }, [portalId]);

  return container;
};
