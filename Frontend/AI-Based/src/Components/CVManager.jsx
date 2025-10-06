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
  Plus,
  Star,
  FilePlus,
  Sparkles,
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

  // ----- Delete -----
  const handleDeleteCV = async (cvId) => {
    try {
      await axios.delete(`${API_BASE}/cvmanager/${cvId}`, {
        headers: { ...authHeaders() },
      });
      toast.success("CV deleted successfully.");
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

  // Set default CV
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
    e.target.value = "";
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
    form.append("file", file);
    form.append("cvName", file.name.replace(/\.[^.]+$/, ""));

    try {
      setIsUploading(true);
      await axios.post(`${API_BASE}/cvmanager/upload`, form, {
        headers: {
          ...authHeaders(),
        },
      });
      toast.success("CV uploaded successfully.");
      fetchCVs();
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
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground text-lg font-medium">Loading your CVs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="calm-bg">
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideInFromTop {
            from { opacity: 0; transform: translateY(-1rem); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slideInFromBottom {
            from { opacity: 0; transform: translateY(1rem); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slideInFromLeft {
            from { opacity: 0; transform: translateX(-1rem); }
            to { opacity: 1; transform: translateX(0); }
          }
          
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
          }
          
          .animate-slide-in-top {
            animation: slideInFromTop 0.6s ease-out forwards;
          }
          
          .animate-slide-in-bottom {
            animation: slideInFromBottom 0.6s ease-out forwards;
          }
          
          .animate-slide-in-left {
            animation: slideInFromLeft 0.6s ease-out forwards;
          }
          
          .animate-scale-in {
            animation: scaleIn 0.5s ease-out forwards;
          }
          
          .opacity-0 { opacity: 0; }
          
          .delay-100 { animation-delay: 0.1s; }
          .delay-200 { animation-delay: 0.2s; }
          .delay-300 { animation-delay: 0.3s; }
          .delay-400 { animation-delay: 0.4s; }
          .delay-500 { animation-delay: 0.5s; }
          
          .cv-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
          }
          
          .cv-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.1),
              transparent
            );
            transition: left 0.5s;
          }
          
          .cv-card:hover::before {
            left: 100%;
          }
          
          .cv-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          }

          .calm-bg {
            background: radial-gradient(1200px 600px at 0% 0%, rgba(34,211,238,0.08), transparent 60%),
                        radial-gradient(1000px 500px at 100% 20%, rgba(139,92,246,0.10), transparent 55%),
                        radial-gradient(900px 500px at 50% 100%, rgba(236,72,153,0.08), transparent 50%);
            min-height: 100vh;
          }
          
          .upload-area {
            transition: all 0.3s ease;
          }
          
          .upload-area:hover {
            transform: scale(1.02);
          }
          
          .modal-backdrop {
            animation: fadeIn 0.2s ease-out;
          }
          
          .modal-content {
            animation: scaleIn 0.3s ease-out;
          }
          
          .empty-state {
            animation: fadeIn 0.8s ease-out;
          }
        `}</style>

        {/* Header */}
        <div className="opacity-0 animate-slide-in-top">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-4xl font-bold">CV Manager</h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Manage and organize all your professional CVs in one place
              </p>
            </div>

            {/* Actions: Create + Upload */}
            <div className="flex items-center gap-3">
              <Button
                className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={() => navigate("/cv-builder")}
              >
                <Plus className="w-4 h-4" />
                Create New CV
              </Button>

              <Button
                variant="outline"
                className="flex items-center gap-2 upload-area hover:border-primary hover:text-primary"
                onClick={handleUploadClick}
                disabled={isUploading}
              >
                <Upload className="w-4 h-4" />
                {isUploading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                    Uploading...
                  </>
                ) : (
                  "Upload CV"
                )}
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
        </div>

        {/* Search */}
        <div className="opacity-0 animate-slide-in-top delay-100">
          <div className="relative max-w-md">
            <Input
              placeholder=" Search your CVs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base shadow-sm hover:shadow-md transition-shadow duration-300"
            />
          </div>
        </div>

        
        {/* CV Grid */}
        {filteredCVs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCVs.map((cv, index) => (
              <Card
                key={cv.cvId}
                className={`border-border cv-card opacity-0 animate-scale-in shadow-md`}
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-primary/10 rounded">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        {cv.isDefault && (
                          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-sm">
                            <Star className="w-3 h-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg truncate font-bold">
                        {cv.cvName || "Untitled CV"}
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground flex items-center gap-1.5 mt-2">
                        <Calendar className="w-3.5 h-3.5" />
                        {cv.modifiedDate
                          ? new Date(cv.modifiedDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "No date"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 flex items-center justify-center gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary transition-all duration-300"
                      onClick={() => handleView(cv)}
                    >
                      <Eye className="w-4 h-4" /> View
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 flex items-center justify-center text-destructive hover:bg-destructive/10 hover:border-destructive transition-all duration-300"
                      onClick={() => openDeleteConfirm(cv)}
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </Button>
                  </div>

                  {!cv.isDefault && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950 transition-all duration-300"
                      onClick={() => handleSetDefault(cv.cvId)}
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Set as Default
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="empty-state text-center py-16">
            <div className="max-w-md mx-auto space-y-6">
              <div className="relative">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <FilePlus className="w-12 h-12 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">
                  {searchTerm ? "No CVs found" : "No CVs yet"}
                </h3>
                <p className="text-muted-foreground text-lg">
                  {searchTerm
                    ? "Try adjusting your search terms."
                    : "Create your first professional CV to get started on your career journey."}
                </p>
              </div>
              {!searchTerm && (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    size="lg"
                    className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    onClick={() => navigate("/cv-builder")}
                  >
                    <Plus className="w-5 h-5" />
                    Create Your First CV
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 hover:border-primary hover:text-primary"
                    onClick={handleUploadClick}
                  >
                    <Upload className="w-5 h-5" />
                    Upload Existing CV
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Confirm Delete Modal */}
        {confirmOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop"
            role="dialog"
            aria-modal="true"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeDeleteConfirm}
            />
            <div className="relative bg-background rounded-2xl shadow-2xl border border-border max-w-md w-full mx-4 p-6 modal-content">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
                  Delete CV?
                </h2>
              </div>

              <p className="text-muted-foreground mb-4 text-base">
                You are about to permanently delete{" "}
                <span className="font-semibold text-foreground">
                  {confirmTarget.name}
                </span>
                .
              </p>

              <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg border border-red-200 dark:border-red-900 mb-6">
                <p className="text-sm text-red-800 dark:text-red-300 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  This action cannot be undone
                </p>
                <p className="text-sm text-red-700 dark:text-red-400 mt-2">
                  Once deleted, this CV will be permanently removed from your account.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={closeDeleteConfirm}
                  className="hover:bg-muted transition-all duration-300"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  onClick={confirmDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete CV
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CVManager;