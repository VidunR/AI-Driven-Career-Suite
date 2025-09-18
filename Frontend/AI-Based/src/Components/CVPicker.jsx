// Components/CVPicker.jsx
import React, { useState, useMemo, useEffect } from "react";
import ReactDOM from "react-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Calendar, CheckCircle2, X } from "lucide-react";

/**
 * Glassmorphism modal CV picker rendered in a portal so layout is never constrained.
 *
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - onConfirm: (cv) => void
 * - items?: Array<{ id: string; name: string; modifiedDate: string; isDefault?: boolean }>
 */
export default function CVPicker({ open, onClose, onConfirm, items }) {
  const [selectedId, setSelectedId] = useState(null);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock background scroll while modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev || "";
    };
  }, [open]);

  const cvs = useMemo(
    () =>
      items?.length
        ? items
        : [
            { id: "cv-101", name: "Software Engineer – ATS v3", modifiedDate: "2025-08-30T10:05:00Z", isDefault: true },
            { id: "cv-102", name: "Frontend Focus – React/TS", modifiedDate: "2025-08-20T14:22:00Z" },
            { id: "cv-103", name: "Backend & DevOps Profile", modifiedDate: "2025-08-10T09:10:00Z" },
          ],
    [items]
  );

  const selectedCv = cvs.find((cv) => cv.id === selectedId) || null;

  if (!open) return null;

  // Modal tree rendered to body
  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop: dark + blur so foreground pops, page behind is dimmed */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Centered container (not constrained by app layout) */}
      <div className="relative w-[96vw] max-w-5xl mx-auto px-3 sm:px-6">
        {/* Glass panel: semi-opaque + strong blur; high contrast text in both themes */}
        <div
          className="
            relative overflow-hidden rounded-2xl shadow-2xl
            border border-white/10
            bg-gradient-to-br from-white/92 to-white/80 text-slate-900
            supports-[backdrop-filter]:bg-white/35 supports-[backdrop-filter]:backdrop-blur-2xl
            dark:from-slate-900/92 dark:to-slate-900/80 dark:text-slate-100
            dark:supports-[backdrop-filter]:bg-slate-900/45
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start sm:items-center justify-between gap-4 px-6 py-5 border-b border-white/10">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Choose a CV to Match Jobs</h2>
              <p className="text-sm opacity-85">
                Select which CV you want to use for tailoring and job matching.
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Grid of CV cards: tidy spacing, consistent sizing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {cvs.map((cv) => {
                const isActive = cv.id === selectedId;
                return (
                  <Card
                    key={cv.id}
                    className={`
                      transition-all cursor-pointer
                      border-border bg-background/80
                      supports-[backdrop-filter]:bg-background/60 supports-[backdrop-filter]:backdrop-blur
                      hover:shadow-lg
                      ${isActive ? "ring-2 ring-primary" : ""}
                    `}
                    onClick={() => setSelectedId(cv.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base sm:text-lg truncate">{cv.name}</CardTitle>
                          <CardDescription className="text-sm flex items-center gap-1 opacity-90">
                            <Calendar className="w-4 h-4" />
                            {new Date(cv.modifiedDate).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        {cv.isDefault && (
                          <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Default
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between pt-0">
                      <div className="text-sm opacity-85">
                        {isActive ? "Selected" : "Click to select"}
                      </div>
                      {isActive && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 mt-6">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={() => selectedCv && onConfirm(selectedCv)} disabled={!selectedCv}>
                Use This CV
              </Button>
            </div>
          </div>

          {/* subtle ring to define edges on blurred bg */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10" />
        </div>
      </div>
    </div>,
    document.body
  );
}
