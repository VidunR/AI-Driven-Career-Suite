import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  FileText, 
  Star,
  Calendar,
  MoreVertical,
  Briefcase,
  User,
  Copy
} from 'lucide-react';
import { getCVs, createCV, deleteCV } from '../utils/supabase/client';
import { toast } from 'sonner';

export function CVManager({ user, accessToken, onNavigate }) {
  const [cvs, setCvs] = useState([
    {
      id: 1,
      title: 'Software Engineer Resume',
      template: 'Modern Professional',
      lastModified: '2024-01-15',
      status: 'active',
      jobsApplied: 5,
      views: 12,
      isDefault: true
    },
    {
      id: 2,
      title: 'Frontend Developer CV',
      template: 'Creative Designer',
      lastModified: '2024-01-10',
      status: 'draft',
      jobsApplied: 0,
      views: 3,
      isDefault: false
    },
    {
      id: 3,
      title: 'Full Stack Developer',
      template: 'Executive Suite',
      lastModified: '2024-01-08',
      status: 'archived',
      jobsApplied: 8,
      views: 25,
      isDefault: false
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredCVs = cvs.filter(cv => {
    const matchesSearch = cv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cv.template.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || cv.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-accent text-accent-foreground';
      case 'draft': return 'bg-muted text-muted-foreground';
      case 'archived': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleDeleteCV = (cvId) => {
    setCvs(prev => prev.filter(cv => cv.id !== cvId));
  };

  const handleDuplicateCV = (cv) => {
    const newCV = {
      ...cv,
      id: Math.max(...cvs.map(c => c.id)) + 1,
      title: `${cv.title} (Copy)`,
      lastModified: new Date().toISOString().split('T')[0],
      status: 'draft',
      jobsApplied: 0,
      views: 0,
      isDefault: false
    };
    setCvs(prev => [...prev, newCV]);
  };

  const handleSetDefault = (cvId) => {
    setCvs(prev => prev.map(cv => ({
      ...cv,
      isDefault: cv.id === cvId
    })));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">CV Manager</h1>
          <p className="text-muted-foreground">
            Manage your CVs and track their performance
          </p>
        </div>
        <Button onClick={() => onNavigate('cv-builder')} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create New CV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{cvs.length}</p>
                <p className="text-sm text-muted-foreground">Total CVs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {cvs.reduce((sum, cv) => sum + cv.jobsApplied, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Jobs Applied</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {cvs.reduce((sum, cv) => sum + cv.views, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Views</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {cvs.filter(cv => cv.status === 'active').length}
                </p>
                <p className="text-sm text-muted-foreground">Active CVs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search CVs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('all')}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filterStatus === 'active' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('active')}
            size="sm"
          >
            Active
          </Button>
          <Button
            variant={filterStatus === 'draft' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('draft')}
            size="sm"
          >
            Draft
          </Button>
          <Button
            variant={filterStatus === 'archived' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('archived')}
            size="sm"
          >
            Archived
          </Button>
        </div>
      </div>

      {/* CV Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCVs.map((cv) => (
          <Card key={cv.id} className="border-border hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {cv.title}
                    {cv.isDefault && (
                      <Badge variant="secondary" className="text-xs">
                        Default
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {cv.template}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(cv.status)} variant="secondary">
                  {cv.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span>{cv.jobsApplied} applications</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <span>{cv.views} views</span>
                </div>
              </div>

              {/* Last Modified */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Modified {cv.lastModified}</span>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => onNavigate('cv-builder')}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDuplicateCV(cv)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </Button>
                </div>

                {!cv.isDefault && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-primary"
                    onClick={() => handleSetDefault(cv.id)}
                  >
                    Set as Default
                  </Button>
                )}

                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDeleteCV(cv.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCVs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No CVs found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Create your first CV to get started.'}
          </p>
          <Button onClick={() => onNavigate('cv-builder')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First CV
          </Button>
        </div>
      )}
    </div>
  );
}