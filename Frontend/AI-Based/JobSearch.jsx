import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import {
  Search,
  MapPin,
  Calendar,
  Building,
  Clock,
  Heart,
  Sparkles,
  FileText,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import CVPicker from './CVPicker';

export default function JobSearch({ user, accessToken }) {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [savedJobsOnly, setSavedJobsOnly] = useState(false);
  const [isBootLoading, setIsBootLoading] = useState(true);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // CV modal + state
  const [showCVModal, setShowCVModal] = useState(false);
  const [selectedCV, setSelectedCV] = useState(null);
  const [cvs, setCvs] = useState([]);
  const [cvsLoading, setCvsLoading] = useState(true);

  // backend keywords (from Python output)
  const [backendQuery, setBackendQuery] = useState('');
  const [backendCountry, setBackendCountry] = useState('');

  const ANY_TYPE = 'any-type';
  const ANY_LEVEL = 'any-level';

  // ----- Auth helpers -----
  const token = useMemo(
    () => accessToken || localStorage.getItem('jwtToken') || '',
    [accessToken]
  );
  const authHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  // ----- Helpers -----
  const summarize = (txt, maxLen = 220) => {
    if (!txt) return '';
    const t = String(txt).replace(/\s+/g, ' ').trim();
    return t.length > maxLen ? `${t.slice(0, maxLen)}…` : t;
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return '—';
    }
  };

  const toDisplayJob = (raw) => {
    const company = raw.hiring_organization_name || 'Unknown company';
    const location = raw.country || '—';
    const postedDate = raw.published_at ? new Date(raw.published_at).toISOString() : null;

    return {
      id: raw.id || crypto.randomUUID(),
      title: raw.title || 'Untitled role',
      company,
      location,
      type: (raw.employment_type || '').toLowerCase(),
      level: '',
      salary: null,
      description: raw.description || '',
      requirements: [],
      benefits: [],
      postedDate,
      skills: [],
      remote: false,
      saved: false,
      url: raw.url || null,
      __raw: raw
    };
  };

  // =============================
  // Load CVs on mount
  // =============================
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setCvsLoading(true);

        if (!token) {
          toast.error('No auth token found. Please sign in again.');
          if (!cancelled) setCvs([]);
          return;
        }

        const res = await axios.get('http://localhost:5000/jobsearch', { headers: authHeaders });
        const list = Array.isArray(res.data) ? res.data : [];

        const mapped = list.map((cv) => ({
          id: String(cv.cvId),
          name: cv.cvName,
          filepath: cv.cvFilepath,
          userId: cv.userId
        }));

        if (!cancelled) {
          setCvs(mapped);
          if (mapped.length > 0) setShowCVModal(true);
        }
      } catch (err) {
        console.error('GET /jobsearch (CVs) failed:', err);
        toast.error('Failed to load your CVs');
        if (!cancelled) setCvs([]);
      } finally {
        if (!cancelled) {
          setCvsLoading(false);
          setIsBootLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, authHeaders]);

  // =============================
  // Fetch jobs when a CV is chosen
  // =============================
  const fetchJobsForCV = async (cvId) => {
    if (!cvId) return;
    setIsLoadingJobs(true);
    setJobs([]);
    setFilteredJobs([]);
    setSelectedJob(null);

    try {
      const res = await axios.post(
        'http://localhost:5000/jobsearch',
        { cvId: Number(cvId) }, // backend expects { cvId }
        { headers: { 'Content-Type': 'application/json', ...authHeaders } }
      );

      // Expected: { keywords: { q, country, ... }, jobs: [...] }
      const payload = res.data || {};
      const keywords = payload.keywords || payload.search_params || {};
      const rawJobs = Array.isArray(payload.jobs) ? payload.jobs : [];

      // Save keywords and prefill filters
      const q = keywords.q || '';
      const country = keywords.country || '';
      setBackendQuery(q);
      setBackendCountry(country);
      setSearchQuery(q);
      setLocationFilter(country);

      const mapped = rawJobs.map(toDisplayJob);
      setJobs(mapped);
      setFilteredJobs(mapped);
      setSelectedJob(mapped[0] || null);

      if (mapped.length === 0) {
        toast.message('No jobs found for this CV yet.');
      } else {
        toast.success(`Found ${mapped.length} job${mapped.length > 1 ? 's' : ''}`);
      }
    } catch (err) {
      console.error('POST /jobsearch (extract jobs) failed:', err);
      toast.error('Failed to extract jobs from the selected CV');
    } finally {
      setIsLoadingJobs(false);
    }
  };

  // =============================
  // Filtering
  // =============================
  useEffect(() => {
    let filtered = jobs;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((job) => {
        const hay = [job.title, job.company, job.location, job.description].filter(Boolean);
        return hay.some((h) => String(h).toLowerCase().includes(q));
      });
    }

    if (locationFilter) {
      const loc = locationFilter.toLowerCase();
      filtered = filtered.filter((job) => String(job.location || '').toLowerCase().includes(loc));
    }

    if (typeFilter && typeFilter !== ANY_TYPE) {
      filtered = filtered.filter((job) => job.type === typeFilter);
    }

    if (levelFilter && levelFilter !== ANY_LEVEL) {
      // Level isn't available from API; keep hook for future
      filtered = filtered.filter(() => true);
    }

    if (remoteOnly) {
      filtered = filtered.filter((job) => job.remote === true);
    }

    if (savedJobsOnly) {
      filtered = filtered.filter((job) => job.saved);
    }

    setFilteredJobs(filtered);
  }, [searchQuery, locationFilter, typeFilter, levelFilter, remoteOnly, savedJobsOnly, jobs]);

  // =============================
  // Save toggle (local)
  // =============================
  const toggleSaveJob = (jobId) => {
    setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, saved: !job.saved } : job)));
    toast.success('Job saved state updated');
  };

  // =============================
  // UI helpers
  // =============================
  const getJobTypeColor = (type) => {
    switch (type) {
      case 'full-time':
      case 'permanent':
        return 'bg-green-100 text-green-800';
      case 'part-time':
        return 'bg-blue-100 text-blue-800';
      case 'contract':
        return 'bg-orange-100 text-orange-800';
      case 'remote':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isBootLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading your CVs…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background">
      {/* CV Picker Modal */}
      <CVPicker
        open={showCVModal}
        items={cvs}
        currentCVId={selectedCV?.id}
        onClose={() => setShowCVModal(false)}
        onConfirm={(cv) => {
          setSelectedCV(cv);
          setShowCVModal(false);
          toast.success(`Using "${cv.name}" to suggest jobs`);
          fetchJobsForCV(cv.id);
          console.log(cv, cv.id)
        }}
      />

      {/* Sidebar */}
      <aside className="w-80 shrink-0 border-r border-border bg-muted/10 overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Search & Filters</h2>

            {/* Backend search context */}
            {(backendQuery || backendCountry) && (
              <div className="rounded-lg border border-border/60 bg-background/60 p-3 space-y-2">
                <p className="text-xs text-muted-foreground">Search context from your CV</p>
                <div className="flex flex-wrap gap-2">
                  {backendQuery && (
                    <Badge className="bg-primary/10 text-primary border-primary/30">Role: {backendQuery}</Badge>
                  )}
                  {backendCountry && (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">Country: {backendCountry}</Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Text search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Job Title / Company</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Country filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Country</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="e.g., Singapore"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Job Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Job Type</label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY_TYPE}>All Types</SelectItem>
                <SelectItem value="permanent">Permanent</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="temporary">Temporary</SelectItem>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Experience Level (placeholder for future) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Experience Level</label>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY_LEVEL}>All Levels</SelectItem>
                <SelectItem value="entry">Entry</SelectItem>
                <SelectItem value="mid">Mid</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
                <SelectItem value="lead">Lead/Principal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="remote" checked={remoteOnly} onCheckedChange={(v) => setRemoteOnly(Boolean(v))} />
              <label htmlFor="remote" className="text-sm">Remote only</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="saved" checked={savedJobsOnly} onCheckedChange={(v) => setSavedJobsOnly(Boolean(v))} />
              <label htmlFor="saved" className="text-sm">Saved jobs only</label>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery(backendQuery || '');
                setLocationFilter(backendCountry || '');
                setTypeFilter('');
                setLevelFilter('');
                setRemoteOnly(false);
                setSavedJobsOnly(false);
              }}
              className="w-full"
            >
              Reset to CV Context
            </Button>

            <Button
              variant="default"
              className="w-full"
              onClick={() => setShowCVModal(true)}
              disabled={cvsLoading || cvs.length === 0}
              title={cvsLoading ? 'Loading your CVs…' : cvs.length === 0 ? 'No CVs found' : 'Open CV selector'}
            >
              <FileText className="h-4 w-4 mr-2" />
              {selectedCV ? 'Change CV' : 'Select CV'}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <main className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-2">
        {/* List column */}
        <section className="min-h-0 overflow-y-auto border-r border-border">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Job Search</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Suggestions powered by your selected CV
                </p>
              </div>
              <Badge variant="secondary">{filteredJobs.length} jobs</Badge>
            </div>

            {/* Current CV + context */}
            <div className="flex items-center justify-between">
              {selectedCV ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-primary/10 text-primary border-primary/30">
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                    Using CV: {selectedCV.name}
                  </Badge>
                  {backendQuery && <Badge variant="outline">Role: {backendQuery}</Badge>}
                  {backendCountry && <Badge variant="outline">Country: {backendCountry}</Badge>}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Choose a CV to get personalized suggestions</div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCVModal(true)}
                disabled={cvsLoading || cvs.length === 0}
              >
                <FileText className="h-4 w-4 mr-2" />
                {selectedCV ? 'Change CV' : 'Select CV'}
              </Button>
            </div>

            {isLoadingJobs && (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            <div className="space-y-4">
              {!isLoadingJobs && filteredJobs.map((job) => (
                <Card
                  key={job.id}
                  className={`cursor-pointer transition-colors hover:bg-accent/50 ${selectedJob?.id === job.id ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedJob(job)}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2">
                          <h3 className="font-semibold text-lg truncate">{job.title}</h3>
                          {job.type && (
                            <Badge className={`capitalize ${getJobTypeColor(job.type)}`}>{job.type}</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground flex items-center gap-1 mt-1">
                          <Building className="h-4 w-4 shrink-0" />
                          <span className="truncate">{job.company}</span>
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveJob(job.id);
                          }}
                          title={job.saved ? 'Unsave' : 'Save'}
                        >
                          <Heart className={`h-4 w-4 ${job.saved ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                        {job.url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(job.url, '_blank', 'noopener,noreferrer');
                            }}
                            title="Open original job posting"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDate(job.postedDate)}
                      </span>
                    </div>

                    {/* Summary */}
                    <p className="text-sm text-muted-foreground">
                      {summarize(job.description, 240)}
                    </p>
                  </CardContent>
                </Card>
              ))}

              {!isLoadingJobs && filteredJobs.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No jobs found matching your criteria.</p>
                  <p className="text-sm text-muted-foreground mt-2">Try adjusting filters or pick a different CV.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Details column */}
        <section className="min-h-0 overflow-y-auto">
          {selectedJob ? (
            <div className="p-6 space-y-6">
              {/* Header card */}
              <div className="bg-muted/10 border border-border rounded-xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h1 className="text-2xl font-bold leading-tight">{selectedJob.title}</h1>
                    <p className="text-lg text-muted-foreground flex items-center gap-2 mt-1">
                      <Building className="h-5 w-5 shrink-0" />
                      <span className="truncate">{selectedJob.company}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {selectedJob.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Posted {formatDate(selectedJob.postedDate)}
                      </span>
                      {selectedJob.type && (
                        <Badge className={`capitalize ${getJobTypeColor(selectedJob.type)}`}>{selectedJob.type}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" onClick={() => toggleSaveJob(selectedJob.id)}>
                      <Heart className={`h-4 w-4 mr-2 ${selectedJob.saved ? 'fill-red-500 text-red-500' : ''}`} />
                      {selectedJob.saved ? 'Saved' : 'Save'}
                    </Button>
                    <Button
                      onClick={() => selectedJob.url && window.open(selectedJob.url, '_blank', 'noopener,noreferrer')}
                      disabled={!selectedJob.url}
                      title={selectedJob.url ? 'Open original job posting' : 'No external URL available'}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Job Post
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Job Description */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Job Description</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedJob.description || '—'}
                </p>
              </div>

              {/* Optional sections (kept for future data) */}
              {selectedJob.requirements?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Requirements</h3>
                  <ul className="space-y-2">
                    {selectedJob.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-muted-foreground">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedJob.skills?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedJob.benefits?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Benefits</h3>
                  <ul className="space-y-2">
                    {selectedJob.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-accent mt-1">✓</span>
                        <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-6">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-medium text-muted-foreground">Select a job to view details</h3>
                <p className="text-muted-foreground">Choose a job from the list to see full details and open the original posting.</p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}