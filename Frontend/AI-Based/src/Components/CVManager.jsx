// Frontend/AI-Based/src/Components/CVManager.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Calendar,
  FileText,
  Eye,
  Trash2,
  Upload,
  AlertTriangle,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const API_BASE = "http://localhost:5000";

function authHeaders() {
  const token = localStorage.getItem("jwtToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function CVManager() {
  const navigate = useNavigate();
  const [cvs, setCvs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // delete confirm modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState({ id: null, name: "" });

  // hidden file input for Upload
  const fileInputRef = useRef(null);

  // ----- Load list -----
  const fetchCVs = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/cvmanager`, {
        headers: { ...authHeaders() },
      });
      setCvs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching CVs:", err);
      toast.error("Failed to load CVs.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCVs();
  }, []);

  // ----- Delete (no window.confirm; modal handles confirmation) -----
  const handleDeleteCV = async (cvId) => {
    try {
      await axios.delete(`${API_BASE}/cvmanager/${cvId}`, {
        headers: { ...authHeaders() },
      });
      toast.success("CV deleted.");
      setCvs((prev) => prev.filter((c) => c.cvId !== cvId));
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete CV.");
    }
  };

  const openDeleteConfirm = (cv) => {
    setConfirmTarget({ id: cv.cvId, name: cv.cvName || "this CV" });
    setConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setConfirmOpen(false);
    setConfirmTarget({ id: null, name: "" });
  };

  const confirmDelete = async () => {
    const id = confirmTarget.id;
    closeDeleteConfirm();
    if (id) await handleDeleteCV(id);
  };

  // (Optional: local “default” toggle only)
  const handleSetDefault = (cvId) => {
    setCvs((prev) =>
      prev.map((cv) => ({
        ...cv,
        isDefault: cv.cvId === cvId,
      }))
    );
    toast.success("Default CV updated.");
  };

  // ----- Upload -----
  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    const lower = file.name.toLowerCase();
    const ok =
      lower.endsWith(".pdf") ||
      lower.endsWith(".doc") ||
      lower.endsWith(".docx");
    if (!ok) {
      toast.error("Only .pdf, .doc, .docx files are allowed.");
      return;
    }

    const form = new FormData();
    form.append("file", file); // backend multer expects field "file"
    form.append("cvName", file.name.replace(/\.[^.]+$/, ""));

    try {
      setIsUploading(true);
      await axios.post(`${API_BASE}/cvmanager/upload`, form, {
        headers: {
          ...authHeaders(),
          // Let the browser set correct boundary
        },
      });
      toast.success("CV uploaded successfully.");
      fetchCVs(); // reload list
    } catch (err) {
      console.error("Upload failed:", err);
      const msg =
        err?.response?.data?.error || err?.message || "Upload failed.";
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  // ----- Preview (View) -----
  const handleView = async (cv) => {
    try {
      const res = await axios.get(`${API_BASE}/cvmanager/${cv.cvId}`, {
        headers: { ...authHeaders() },
      });

      const { cvFilepath } = res.data;

      if (!cvFilepath) {
        toast.error("No file found for this CV.");
        return;
      }

      // build full path to the file
      const href = `${API_BASE}/${cvFilepath}`;
      window.open(href, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.log(err);
      toast.error("Error fetching CV details.");
    }
  };

  const filteredCVs = cvs.filter((cv) =>
    (cv.cvName || "")
      .toString()
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading CVs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">CV Manager</h1>
          <p className="text-muted-foreground">
            Manage your CVs and track them easily
          </p>
        </div>

        {/* Actions: Create + Upload */}
        <div className="flex items-center gap-2">
          <Button
            className="flex items-center gap-2"
            onClick={() => navigate("/cv-builder")}
          >
            Create New CV
          </Button>

          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleUploadClick}
            disabled={isUploading}
          >
            <Upload className="w-4 h-4" />
            {isUploading ? "Uploading..." : "Upload CV"}
          </Button>

          {/* Hidden input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search CVs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* CV Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCVs.map((cv) => (
          <Card
            key={cv.cvId}
            className="border-border hover:shadow-lg transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">
                    {cv.cvName || "CV"}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {cv.modifiedDate
                      ? new Date(cv.modifiedDate).toLocaleDateString()
                      : "—"}
                  </CardDescription>
                </div>

                {cv.isDefault && (
                  <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/20">
                    Default
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 flex items-center justify-center gap-2"
                  onClick={() => handleView(cv)}
                >
                  <Eye className="w-4 h-4" /> View
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 flex items-center justify-center text-destructive hover:text-destructive gap-2"
                  onClick={() => openDeleteConfirm(cv)}
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </Button>
              </div>

              {!cv.isDefault && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full text-primary"
                  onClick={() => handleSetDefault(cv.cvId)}
                >
                  Set as Default
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCVs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No CVs found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? "Try adjusting your search."
              : "Create your first CV to get started."}
          </p>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeDeleteConfirm}
          />
          <div className="relative bg-background dark:bg-gray-900 text-white rounded-lg shadow-lg border border-gray-700 max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
                Delete CV?
              </h2>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You are about to permanently delete{" "}
              <span className="font-medium">{confirmTarget.name}</span>.
            </p>

            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-200 dark:border-red-800 mb-6">
              <p className="text-sm text-red-800 dark:text-red-300 font-medium">
                ⚠️ This action is irreversible
              </p>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                Once deleted, your CV will be permanently deleted.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeDeleteConfirm}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CVManager;
