import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, FileText, Eye, Trash2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export function CVManager({ user, onNavigate }) {
  const navigate = useNavigate();
  const [cvs, setCvs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCVs = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("jwtToken");
        const res = await axios.get("http://localhost:5000/cvmanager", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCvs(res.data);
      } catch (err) {
        console.error("Error fetching CVs:", err);
        toast.error("Failed to load CVs.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCVs();
  }, []);

  const handleDeleteCV = (cvId) => {
    if (window.confirm("Are you sure you want to delete this CV?")) {
      setCvs(prev => prev.filter(cv => cv.cvId !== cvId));
      toast.success("CV deleted successfully.");
    }
  };

  const handleSetDefault = (cvId) => {
    setCvs(prev =>
      prev.map(cv => ({
        ...cv,
        isDefault: cv.cvId === cvId,
      }))
    );
    toast.success("Default CV updated.");
  };

  const filteredCVs = cvs.filter(cv =>
    cv.cvName.toLowerCase().includes(searchTerm.toLowerCase())
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
        <Button className="flex items-center gap-2" onClick={() => navigate('/cv-builder')}>
          Create New CV
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search CVs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* CV Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCVs.map(cv => (
          <Card key={cv.cvId} className="border-border hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{cv.cvName}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(cv.modifiedDate).toLocaleDateString()}
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
                  onClick={() => window.open(cv.cvFilepath, "_blank")}
                >
                  <Eye className="w-4 h-4" /> View
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 flex items-center justify-center text-destructive hover:text-destructive gap-2"
                  onClick={() => handleDeleteCV(cv.cvId)}
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
            {searchTerm ? 'Try adjusting your search.' : 'Create your first CV to get started.'}
          </p>
        </div>
      )}
    </div>
  );
}
