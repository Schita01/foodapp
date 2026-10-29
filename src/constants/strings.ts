/**
 * Centralised UI copy. Kept in one place so an i18n layer (English + Georgian)
 * can replace these later without touching screens. Layouts must tolerate
 * longer Georgian translations.
 */
export const strings = {
  // Exact shared copy required by the spec.
  genericError: "Could not load data. Please try again.",
  tryAgain: "Try again",

  appName: "RescueBite",
  tagline: "Rescue good food near you",

  // Common actions
  continue: "Continue",
  skip: "Skip",
  next: "Next",
  back: "Back",
  cancel: "Cancel",
  save: "Save",
  done: "Done",
  close: "Close",
  getStarted: "Get started",
  changeLocation: "Change location",
  updateApp: "Update app",
  clearFilters: "Clear filters",
  clearAll: "Clear all",
  notifyMe: "Notify me",
  getDirections: "Get directions",
  contactSupport: "Contact support",

  // CTA flavour
  rescueCta: "Rescue before it's gone",
  browseNearby: "Browse nearby",
};

export type Strings = typeof strings;
