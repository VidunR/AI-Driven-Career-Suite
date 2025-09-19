// Components/CVPicker.jsx
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { FileText, X, Check } from "lucide-react";

/** Dialog that matches your Confirm/Password modals */
export default function CVPicker({
  open,
  onClose,
  onConfirm,
  items = [],
  currentCVId = "",
}) {
  const [tempChoice, setTempChoice] = useState(currentCVId || "");

  useEffect(() => setTempChoice(currentCVId || ""), [currentCVId, open]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-background dark:bg-gray-900 text-white rounded-lg shadow-lg border border-gray-700 max-w-2xl w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Choose a CV for Job Suggestions</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* List */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {items.map((cv) => {
            const isSelected = tempChoice === cv.id;
            return (
              <button
                key={cv.id}
                onClick={() => setTempChoice(cv.id)}
                className={`w-full text-left rounded-lg border p-4 transition-all duration-200 ${
                  isSelected
                    ? "border-primary/60 bg-primary/5 shadow-md shadow-primary/10"
                    : "border-gray-700 hover:border-gray-600 hover:bg-gray-800/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-md transition-colors ${
                    isSelected ? "bg-primary/15 text-primary" : "bg-gray-800 text-gray-400"
                  }`}>
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{cv.name}</p>
                        {isSelected && (
                          <div className="flex items-center gap-1">
                            <Check className="h-4 w-4 text-primary" />
                            <Badge className="bg-primary/15 text-primary border-primary/30 text-xs">
                              Selected
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                    {cv.role && (
                      <p className="text-sm text-gray-400 mt-1">
                        {cv.role}{cv.experienceLevel ? ` • ${cv.experienceLevel}` : ""}
                      </p>
                    )}
                    {Array.isArray(cv.skills) && cv.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {cv.skills.slice(0, 5).map((s, i) => (
                          <Badge 
                            key={i} 
                            variant="outline" 
                            className={`text-xs ${
                              isSelected 
                                ? "border-primary/40 text-primary/90" 
                                : "border-gray-600 text-gray-300"
                            }`}
                          >
                            {s}
                          </Badge>
                        ))}
                        {cv.skills.length > 5 && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              isSelected 
                                ? "border-primary/40 text-primary/90" 
                                : "border-gray-600 text-gray-300"
                            }`}
                          >
                            +{cv.skills.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => {
              const chosen = items.find((c) => c.id === tempChoice);
              if (chosen) onConfirm(chosen);
            }}
            disabled={!tempChoice}
          >
            Use This CV
          </Button>
        </div>
      </div>
    </div>
  );
}