// src/pages/SettingsPage.tsx
import React from 'react';
import { uiStrings, notificationKindTranslations } from '../config/translations';
import { useNotificationsStore } from '../stores/notificationsStore';
import { allAppNotificationKinds, type AppNotificationKind } from '../types/notificationTypes';
import Toggle from '../components/ui/Toggle';

const SettingsPage: React.FC = () => {
  const notificationTypeSettings = useNotificationsStore(state => state.notificationTypeSettings);
  const toggleNotificationTypeSetting = useNotificationsStore(state => state.toggleNotificationTypeSetting);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="font-[var(--font-heading)] text-[var(--font-size-3xl)] font-[var(--font-weight-bold)] text-gray-200">
        {uiStrings.settingsTitle}
      </h1>

      <section aria-labelledby="notification-preferences-heading">
        <h2 
          id="notification-preferences-heading" 
          className="text-xl font-semibold text-purple-300 mb-3"
        >
          {uiStrings.notificationPreferencesTitle}
        </h2>
        <div className="bg-slate-800 p-4 rounded-lg shadow-md space-y-3">
          {allAppNotificationKinds.map((kind: AppNotificationKind) => (
            <div
              key={kind}
              className="flex justify-between items-center p-3 bg-slate-700 rounded-lg hover:bg-slate-650 transition-colors"
            >
              <span className="text-sm text-gray-200">
                {notificationKindTranslations[kind] || kind}
              </span>
              <Toggle
                id={`toggle-notification-${kind}`}
                checked={notificationTypeSettings[kind] ?? true} // Default to true if not set
                onChange={() => toggleNotificationTypeSetting(kind)}
                size="md"
                aria-label={`Εναλλαγή ειδοποιήσεων για ${notificationKindTranslations[kind] || kind}`}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Placeholder for other settings sections */}
      {/* 
      <section aria-labelledby="profile-settings-heading">
        <h2 id="profile-settings-heading" className="text-xl font-semibold text-purple-300 mb-3">
          Ρυθμίσεις Προφίλ
        </h2>
        <div className="bg-slate-800 p-4 rounded-lg shadow-md">
          <p className="text-gray-400">Οι ρυθμίσεις προφίλ θα εμφανιστούν εδώ.</p>
        </div>
      </section>

      <section aria-labelledby="app-settings-heading">
        <h2 id="app-settings-heading" className="text-xl font-semibold text-purple-300 mb-3">
          Ρυθμίσεις Εφαρμογής
        </h2>
        <div className="bg-slate-800 p-4 rounded-lg shadow-md">
          <p className="text-gray-400">Οι γενικές ρυθμίσεις της εφαρμογής θα εμφανιστούν εδώ.</p>
        </div>
      </section>
      */}
    </div>
  );
};
export default SettingsPage;