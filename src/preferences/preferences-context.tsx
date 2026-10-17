import { createContext, useContext, useState, type ReactNode } from "react";

import type { PreferencesDraft } from "@/types/preferences";

type PreferencesContextValue = {
  preferences: PreferencesDraft;
  updatePreferences: (changes: PreferencesDraft) => void;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<PreferencesDraft>({});

  function updatePreferences(changes: PreferencesDraft) {
    setPreferences((current) => ({ ...current, ...changes }));
  }

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used inside PreferencesProvider");
  }
  return context;
}
