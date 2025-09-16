// src/themes/cvThemes.js
export const DEFAULT_THEME_ID = "ocean";

export const PRESET_THEMES = [
  {
    id: "ocean",
    name: "Ocean",
    colors: {
      primary: "#2563EB",   // headings / borders (experience)
      success: "#10B981",   // education
      accent: "#F59E0B",    // achievements
      project: "#8B5CF6",   // projects
      text: "#1A1A1A",
      subtleText: "#6B7280",
      chipBg: "#F3F4F6",
      chipBorder: "#D1D5DB",
      paper: "#FFFFFF",
      divider: "#E5E7EB",
    },
  },
  {
    id: "ruby",
    name: "Ruby",
    colors: {
      primary: "#DC2626",
      success: "#059669",
      accent: "#FB923C",
      project: "#EA580C",
      text: "#111827",
      subtleText: "#6B7280",
      chipBg: "#FEF2F2",
      chipBorder: "#FECACA",
      paper: "#FFFFFF",
      divider: "#F3F4F6",
    },
  },
  {
    id: "forest",
    name: "Forest",
    colors: {
      primary: "#047857",
      success: "#10B981",
      accent: "#84CC16",
      project: "#0EA5E9",
      text: "#062B21",
      subtleText: "#4B5563",
      chipBg: "#ECFDF5",
      chipBorder: "#A7F3D0",
      paper: "#FFFFFF",
      divider: "#E5E7EB",
    },
  },
  {
    id: "mono",
    name: "Mono",
    colors: {
      primary: "#111827",
      success: "#374151",
      accent: "#6B7280",
      project: "#4B5563",
      text: "#111827",
      subtleText: "#6B7280",
      chipBg: "#F3F4F6",
      chipBorder: "#D1D5DB",
      paper: "#FFFFFF",
      divider: "#E5E7EB",
    },
  },
];

export function resolveTheme(themeOrId) {
  if (!themeOrId) {
    return PRESET_THEMES.find(t => t.id === DEFAULT_THEME_ID);
  }
  if (typeof themeOrId === "string") {
    return PRESET_THEMES.find(t => t.id === themeOrId) || PRESET_THEMES[0];
  }
  // Allow passing a fully custom theme object
  return themeOrId;
}
