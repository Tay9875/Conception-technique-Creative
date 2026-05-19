export interface PreferencesState {
  dyslexicFont: boolean;
  fontSize: number;
  highContrast: boolean;
}

export interface PreferencesContextValue extends PreferencesState {
  setDyslexicFont: (value: boolean) => void;
  setFontSize: (value: number) => void;
  setHighContrast: (value: boolean) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  toggleDyslexicFont: () => void;
  toggleHighContrast: () => void;
}
