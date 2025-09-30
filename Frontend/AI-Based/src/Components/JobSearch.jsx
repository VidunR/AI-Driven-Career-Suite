import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import {
  Search,
  MapPin,
  Calendar,
  Building,
  Clock,
  Heart,
  Sparkles,
  FileText,
  ExternalLink,
  SearchCheck
} from 'lucide-react';
import { toast } from 'sonner';
import CVPicker from './CVPicker';
import JobDetailsModal from './JobDetailsModal';

const AnimationStyles = () => (
  <style>{`
    @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
    @keyframes slideInFromTop { from { opacity: 0; transform: translateY(-1rem) } to { opacity: 1; transform: translateY(0) } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.97) } to { opacity: 1; transform: scale(1) } }
    @keyframes float { 0%,100% { transform: translateY(0px) } 50% { transform: translateY(-8px) } }

    .animate-fade-in { animation: fadeIn .6s ease-out forwards }
    .animate-slide-in-top { animation: slideInFromTop .6s ease-out forwards }
    .animate-scale-in { animation: scaleIn .45s ease-out forwards }
    .animate-float { animation: float 3s ease-in-out infinite }

    .calm-bg {
      background: radial-gradient(1200px 600px at 0% 0%, rgba(34,211,238,0.08), transparent 60%),
                  radial-gradient(1000px 500px at 100% 20%, rgba(139,92,246,0.10), transparent 55%),
                  radial-gradient(900px 500px at 50% 100%, rgba(236,72,153,0.08), transparent 50%);
    }
    .glass {
      background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03));
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.08);
    }
    .action-card { transition: transform .35s cubic-bezier(.22,.61,.36,1), box-shadow .35s, background .35s; }
    .action-card:hover { transform: translateY(-4px) }
    .sticky-header {
      position: sticky; top: 0; z-index: 10;
      backdrop-filter: blur(6px);
      background: linear-gradient(180deg, rgba(0,0,0,0.04), transparent);
    }
    .gradient-title {
      background: linear-gradient(135deg, #8b5cf6 0%, #22d3ee 50%, #ec4899 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  `}</style>
);

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

  // ----- Auth helpers (UNCHANGED) -----
  const token = useMemo(
    () => accessToken || localStorage.getItem('jwtToken') || '',
    [accessToken]
  );
  const authHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  // ----- Helpers (UNCHANGED) -----
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

  // Load CVs on mount (UNCHANGED)
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

    return () => { cancelled = true; };
  }, [token, authHeaders]);

  // Fetch jobs when a CV is chosen (UNCHANGED)
  const fetchJobsForCV = async (cvId) => {
    if (!cvId) return;
    setIsLoadingJobs(true);
    setJobs([]);
    setFilteredJobs([]);
    setSelectedJob(null);

    try {
      const res = await axios.post(
        'http://localhost:5000/jobsearch',
        { cvId: Number(cvId) },
        { headers: { 'Content-Type': 'application/json', ...authHeaders } }
      );

      const payload = res.data || {};
      const keywords = payload.keywords || payload.search_params || {};
      const rawJobs = Array.isArray(payload.jobs) ? payload.jobs : [];

      const q = keywords.q || '';
      const country = keywords.country || '';
      setBackendQuery(q);
      setBackendCountry(country);
      setSearchQuery(q);
      setLocationFilter(country);

      const mapped = rawJobs.map(toDisplayJob);
      setJobs(mapped);
      setFilteredJobs(mapped);
      setSelectedJob(null);

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

  const keywordSearch = async ()=> {
  try{
    setIsLoadingJobs(true);
    const results = await axios.post('http://localhost:5000/jobsearch/search',
      { jobTitle: searchQuery,
        country: locationFilter
      },
      { headers: authHeaders });

    console.log(results);
    const payload = results.data || {};
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
    setSelectedJob(null);

    if (mapped.length === 0) {
      toast.message('No jobs found for this CV yet.');
    } else {
      toast.success(`Found ${mapped.length} job${mapped.length > 1 ? 's' : ''}`);
    }
    
  }
  catch(err){
    console.error('POST /jobsearch (extract jobs) failed:', err);
    toast.error('Failed to extract jobs from the selected CV');
  } finally {
    setIsLoadingJobs(false);
  }
}

  // Filtering (UNCHANGED)
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

  useEffect(() => {
    if (selectedJob) {
      const updatedJob = jobs.find(j => j.id === selectedJob.id);
      if (updatedJob && updatedJob.saved !== selectedJob.saved) {
        setSelectedJob(updatedJob);
      }
    }
  }, [jobs, selectedJob]);

  // Save toggle (UNCHANGED)
  const toggleSaveJob = (jobId) => {
    setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, saved: !job.saved } : job)));
    toast.success('Job saved state updated');
  };
  

  // UI helpers (UNCHANGED)
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
      <div className="flex items-center justify-center h-screen calm-bg">
        <AnimationStyles />
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading your CVs…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AnimationStyles />

      {/* Full-height layout; sidebar is sticky + non-scroll; main scrolls */}
      <div className="h-screen flex calm-bg overflow-hidden">
        {/* CV Picker Modal (UNCHANGED) */}
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

        {/* Sidebar: sticky, not scrollable */}
        <aside className="w-[21rem] shrink-0 border-r border-border/60 bg-background/60 backdrop-blur-sm h-screen sticky top-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-2 justify-center">
              <Sparkles className="w-5 h-5 text-primary animate-float" />
              <h2 className="text-lg font-semibold gradient-title">Search & Filters</h2>
            </div>
          </div>

          <div className="p-6 pt-2 space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Title / Company</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/70"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Country</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="e.g., Singapore"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-10 bg-background/70"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Job Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-background/70">
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Experience Level</label>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="bg-background/70">
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

            <div className="space-y-4 pt-2">
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
                className="w-full action-card"
              >
                Reset to CV Context
              </Button>

              <Button
                variant="default"
                className="w-full action-card"
                onClick={() => setShowCVModal(true)}
                disabled={cvsLoading || cvs.length === 0}
                title={cvsLoading ? 'Loading your CVs…' : cvs.length === 0 ? 'No CVs found' : 'Open CV selector'}
              >
                <FileText className="h-4 w-4 mr-2" />
                {selectedCV ? 'Change CV' : 'Select CV'}
              </Button>

              <Button
                variant="default"
                className="w-full action-card"
                onClick={() => keywordSearch()}
                disabled={cvsLoading || cvs.length === 0}
              >
                <SearchCheck className="h-4 w-4 mr-2" />
                Search Manually
              </Button>
            </div>
          </div>
        </aside>

        {/* MAIN – list, scrollable */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 px-6 pt-6 pb-4 sticky-header">
            <div className="flex items-center justify-between">
              <div className="opacity-0 animate-slide-in-top">
                <h1 className="text-2xl font-bold gradient-title">Job Search</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Suggestions powered by your selected CV
                </p>
              </div>
              <Badge variant="secondary" className="opacity-0 animate-scale-in">
                {filteredJobs.length} jobs
              </Badge>
            </div>

            <div className="flex items-center justify-between mt-4 opacity-0 animate-fade-in">
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
                className="action-card"
              >
                <FileText className="h-4 w-4 mr-2" />
                {selectedCV ? 'Change CV' : 'Select CV'}
              </Button>
            </div>
          </div>

          {/* Jobs list */}
          <div className="p-6 space-y-4">
            {isLoadingJobs && (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!isLoadingJobs && filteredJobs.map((job, idx) => (
              <Card
                key={job.id}
                className="cursor-pointer glass action-card"
                style={{ animation: 'fadeIn .48s ease-out forwards', animationDelay: `${0.02 * (idx + 1)}s`, opacity: 0 }}
                onClick={() => setSelectedJob(job)}  // open modal
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
                    <div className="flex gap-1.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveJob(job.id);
                        }}
                        title={job.saved ? 'Unsave' : 'Save'}
                        className="hover:bg-transparent"
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
                          className="hover:bg-transparent"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDate(job.postedDate)}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {summarize(job.description, 240)}
                  </p>
                </CardContent>
              </Card>
            ))}

            {!isLoadingJobs && filteredJobs.length === 0 && (
              <div className="text-center py-12 animate-fade-in">
                <p className="text-muted-foreground">No jobs found matching your criteria.</p>
                <p className="text-sm text-muted-foreground mt-2">Try adjusting filters or pick a different CV.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Centered premium modal */}
      <JobDetailsModal
        open={Boolean(selectedJob)}
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        toggleSaveJob={toggleSaveJob}
        getJobTypeColor={getJobTypeColor}
        formatDate={formatDate}
      />
    </>
  );
}
