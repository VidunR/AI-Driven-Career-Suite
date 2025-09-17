import React, { useState, useEffect } from "react";
import { PRESET_THEMES, DEFAULT_THEME_ID } from "../themes/cvThemes";
import { Label } from "./UI/label";
import { Button } from "./UI/button";

export default function ThemePicker({ theme, onChange }) {
  const [custom, setCustom] = useState({
    primary: theme.colors.primary,
    success: theme.colors.success,
    accent: theme.colors.accent,
    project: theme.colors.project,
  });

  useEffect(() => {
    if (!theme?.colors) return;
    setCustom({
      primary: theme.colors.primary,
      success: theme.colors.success,
      accent: theme.colors.accent,
      project: theme.colors.project,
    });
  }, [theme]);

  const handlePreset = (preset) => {
    setCustom({
      primary: preset.colors.primary,
      success: preset.colors.success,
      accent: preset.colors.accent,
      project: preset.colors.project,
    });
    onChange(preset);
  };

  const updateCustom = (field, value) => {
    const next = { ...custom, [field]: value };
    setCustom(next);
    onChange({
      id: "custom",
      name: "Custom",
      colors: {
        ...theme.colors,
        ...next,
      },
    });
  };

  const defaultPreset =
    PRESET_THEMES.find((t) => t.id === DEFAULT_THEME_ID) || PRESET_THEMES[0];

  return (
    <div className="w-full rounded-xl border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">CV Theme</h3>
        <span className="text-xs text-muted-foreground">
          Pick a preset or tweak colors
        </span>
      </div>

      

      {/* Custom pickers */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <Label>Work Experience</Label>
          <input
            type="color"
            value={custom.primary}
            onChange={(e) => updateCustom("primary", e.target.value)}
            className="mt-2 h-10 w-full cursor-pointer rounded border bg-transparent p-1"
          />
        </div>
        <div className="space-y-1">
          <Label>Education</Label>
          <input
            type="color"
            value={custom.success}
            onChange={(e) => updateCustom("success", e.target.value)}
            className="mt-2 h-10 w-full cursor-pointer rounded border bg-transparent p-1"
          />
        </div>
        <div className="space-y-1">
          <Label>Projects</Label>
          <input
            type="color"
            value={custom.accent}
            onChange={(e) => updateCustom("accent", e.target.value)}
            className="mt-2 h-10 w-full cursor-pointer rounded border bg-transparent p-1"
          />
        </div>
        <div className="space-y-1">
          <Label>Achievements</Label>
          <input
            type="color"
            value={custom.project}
            onChange={(e) => updateCustom("project", e.target.value)}
            className="mt-2 h-10 w-full cursor-pointer rounded border bg-transparent p-1"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => handlePreset(defaultPreset)}
        >
          Reset to Default
        </Button>
      </div>
    </div>
  );
}
