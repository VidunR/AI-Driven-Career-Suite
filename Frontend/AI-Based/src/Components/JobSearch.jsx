import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { Search, MapPin, Calendar, DollarSign, Building, Clock, ExternalLink, Heart, Filter, Sparkles, FileText, X } from 'lucide-react';
import { toast } from 'sonner';
import CVPicker from './CVPicker'; // Fixed: Use the correct import name

export default function JobSearch({ user, accessToken, onNavigate }) {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');     // keep empty string for "placeholder" state
  const [levelFilter, setLevelFilter] = useState('');    // keep empty string for "placeholder" state
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [savedJobsOnly, setSavedJobsOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  // NEW: CV selection modal + state
  const [showCVModal, setShowCVModal] = useState(false);
  const [selectedCV, setSelectedCV] = useState(null);

  // ADDED: Sentinel value constants used by <SelectItem/> instead of empty string
  const ANY_TYPE = 'any-type';
  const ANY_LEVEL = 'any-level';

  // Mock CVs (replace with real data later)
  const mockCVs = [
    {
      id: 'cv1',
      name: 'Frontend CV (React/TS)',
      role: 'Frontend Engineer',
      experienceLevel: 'mid',
      summary: 'React, TypeScript, modern UI, performance',
      skills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'Tailwind', 'Node.js']
    },
    {
      id: 'cv2',
      name: 'Full-Stack CV (Node/React)',
      role: 'Full-Stack Engineer',
      experienceLevel: 'mid',
      summary: 'Node.js APIs, React, SQL/NoSQL, AWS basics',
      skills: ['React', 'Node.js', 'Express', 'PostgreSQL', 'AWS', 'Docker']
    },
    {
      id: 'cv3',
      name: 'Cloud/DevOps CV',
      role: 'DevOps Engineer',
      experienceLevel: 'mid',
      summary: 'AWS, Kubernetes, Terraform, CI/CD',
      skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Python', 'CI/CD']
    }
  ];

  // Mock job data - in a real app, this would come from an API
  const mockJobs = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      type: 'full-time',
      level: 'senior',
      salary: { min: 120000, max: 160000, currency: 'USD' },
      description: 'We are looking for a passionate Senior Frontend Developer to join our dynamic team...',
      requirements: ['React', 'TypeScript', 'Node.js', '5+ years experience'],
      benefits: ['Health insurance', 'Stock options', 'Flexible hours', 'Remote work'],
      postedDate: '2024-08-15',
      applicationDeadline: '2024-09-15',
      skills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'Node.js'],
      remote: true,
      saved: false,
      applied: false
    },
    {
      id: '2',
      title: 'Full Stack Engineer',
      company: 'StartupXYZ',
      location: 'New York, NY',
      type: 'full-time',
      level: 'mid',
      salary: { min: 90000, max: 120000, currency: 'USD' },
      description: 'Join our fast-growing startup as a Full Stack Engineer and help build the future...',
      requirements: ['Python', 'Django', 'React', '3+ years experience'],
      benefits: ['Equity', 'Health insurance', 'Lunch provided', 'Learning budget'],
      postedDate: '2024-08-14',
      skills: ['Python', 'Django', 'React', 'PostgreSQL', 'AWS'],
      remote: false,
      saved: true,
      applied: false
    },
    {
      id: '3',
      title: 'Junior Software Developer',
      company: 'MegaCorp',
      location: 'Austin, TX',
      type: 'full-time',
      level: 'entry',
      salary: { min: 70000, max: 85000, currency: 'USD' },
      description: 'Perfect opportunity for recent graduates to start their career in software development...',
      requirements: ['JavaScript', 'Basic React knowledge', 'Computer Science degree'],
      benefits: ['Training program', 'Mentorship', 'Health insurance', 'Gym membership'],
      postedDate: '2024-08-13',
      skills: ['JavaScript', 'React', 'HTML', 'CSS', 'Git'],
      remote: false,
      saved: false,
      applied: true
    },
    {
      id: '4',
      title: 'DevOps Engineer',
      company: 'CloudTech Solutions',
      location: 'Seattle, WA',
      type: 'contract',
      level: 'mid',
      salary: { min: 110000, max: 140000, currency: 'USD' },
      description: 'Looking for an experienced DevOps Engineer to manage our cloud infrastructure...',
      requirements: ['AWS', 'Docker', 'Kubernetes', 'Terraform', '4+ years experience'],
      benefits: ['Flexible schedule', 'Remote work', 'High hourly rate'],
      postedDate: '2024-08-12',
      skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Python'],
      remote: true,
      saved: false,
      applied: false
    },
    {
      id: '5',
      title: 'Product Manager',
      company: 'InnovateCorp',
      location: 'Los Angeles, CA',
      type: 'full-time',
      level: 'senior',
      salary: { min: 130000, max: 170000, currency: 'USD' },
      description: 'Lead product strategy and work with cross-functional teams to deliver amazing products...',
      requirements: ['Product management experience', 'Agile methodologies', 'Data analysis'],
      benefits: ['Stock options', 'Unlimited PTO', 'Health insurance', 'Professional development'],
      postedDate: '2024-08-11',
      skills: ['Product Management', 'Agile', 'Data Analysis', 'Leadership'],
      remote: true,
      saved: true,
      applied: false
    }
  ];

  // --- Effects ---
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setJobs(mockJobs);
      setFilteredJobs(mockJobs);
      setSelectedJob(mockJobs[0]);
      setIsLoading(false);
    }, 800);
  }, []);

  // Open the CV picker the first time once jobs have loaded and no CV chosen
  useEffect(() => {
    if (!isLoading && !selectedCV) setShowCVModal(true);
  }, [isLoading, selectedCV]);

  // Re-filter when anything changes (including selectedCV)
  useEffect(() => {
    filterJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, locationFilter, typeFilter, levelFilter, remoteOnly, savedJobsOnly, jobs, selectedCV]);

  // --- Helpers ---
  const computeMatchScore = (job, cv) => {
    if (!cv) return 0;
    const cvSkills = new Set(cv.skills.map(s => s.toLowerCase()));
    const overlap = job.skills.reduce((acc, s) => acc + (cvSkills.has(s.toLowerCase()) ? 1 : 0), 0);
    // small boost if levels look aligned (entry/mid/senior presence)
    const levelBoost = cv.experienceLevel && job.level && cv.experienceLevel.toLowerCase().startsWith(job.level[0]) ? 1 : 0;
    return overlap + levelBoost;
  };

  const filterJobs = () => {
    let filtered = jobs;

    // Search query filter
    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Location filter
    if (locationFilter) {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Job type filter (ignore sentinel)
    if (typeFilter && typeFilter !== ANY_TYPE) {
      filtered = filtered.filter(job => job.type === typeFilter);
    }

    // Experience level filter (ignore sentinel)
    if (levelFilter && levelFilter !== ANY_LEVEL) {
      filtered = filtered.filter(job => job.level === levelFilter);
    }

    // Remote only filter
    if (remoteOnly) {
      filtered = filtered.filter(job => job.remote);
    }

    // Saved jobs only filter
    if (savedJobsOnly) {
      filtered = filtered.filter(job => job.saved);
    }

    // If a CV is selected, rank by match score (descending)
    const ranked = filtered
      .map(j => ({ ...j, _matchScore: computeMatchScore(j, selectedCV) }))
      .sort((a, b) => b._matchScore - a._matchScore);

    setFilteredJobs(ranked);
  };

  const toggleSaveJob = (jobId) => {
    setJobs(prev => prev.map(job =>
      job.id === jobId ? { ...job, saved: !job.saved } : job
    ));
    toast.success('Job saved state updated');
  };

  const applyToJob = (jobId) => {
    setJobs(prev => prev.map(job =>
      job.id === jobId ? { ...job, applied: true } : job
    ));
    toast.success('Application submitted successfully!');
  };

  const formatSalary = (salary) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: salary.currency,
      minimumFractionDigits: 0
    });
    return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`;
  };

  const getJobTypeColor = (type) => {
    switch (type) {
      case 'full-time': return 'bg-green-100 text-green-800';
      case 'part-time': return 'bg-blue-100 text-blue-800';
      case 'contract': return 'bg-orange-100 text-orange-800';
      case 'remote': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'entry': return 'bg-green-100 text-green-800';
      case 'mid': return 'bg-blue-100 text-blue-800';
      case 'senior': return 'bg-purple-100 text-purple-800';
      case 'lead': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* CV Picker Modal - Fixed: Use correct component name and props */}
      <CVPicker
        open={showCVModal}
        items={mockCVs}  // Fixed: Use 'items' instead of 'cvs'
        currentCVId={selectedCV?.id}
        onClose={() => setShowCVModal(false)}
        onConfirm={(cv) => {
          setSelectedCV(cv);
          setShowCVModal(false);
          toast.success(`Using "${cv.name}" to suggest jobs`);
        }}
      />

      {/* Filters Sidebar */}
      <div className="w-80 border-r border-border p-6 space-y-6 overflow-y-auto">
        <div>
          <h2 className="text-lg font-semibold mb-4">Search & Filters</h2>

          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Job Title or Company</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="City, State"
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
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY_TYPE}>All Types</SelectItem>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Experience Level */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Experience Level</label>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY_LEVEL}>All Levels</SelectItem>
                <SelectItem value="entry">Entry Level</SelectItem>
                <SelectItem value="mid">Mid Level</SelectItem>
                <SelectItem value="senior">Senior Level</SelectItem>
                <SelectItem value="lead">Lead/Principal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remote"
                checked={remoteOnly}
                onCheckedChange={(v) => setRemoteOnly(Boolean(v))}
              />
              <label htmlFor="remote" className="text-sm">Remote only</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="saved"
                checked={savedJobsOnly}
                onCheckedChange={(v) => setSavedJobsOnly(Boolean(v))}
              />
              <label htmlFor="saved" className="text-sm">Saved jobs only</label>
            </div>
          </div>

          {/* Clear Filters */}
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setLocationFilter('');
              setTypeFilter('');   // empty string lets <Select> show placeholder again
              setLevelFilter('');  // empty string lets <Select> show placeholder again
              setRemoteOnly(false);
              setSavedJobsOnly(false);
            }}
            className="w-full mt-6"
          >
            Clear All Filters
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Job List */}
        <div className="w-1/2 border-r border-border overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-2xl font-bold">Job Search</h1>
              <Badge variant="secondary">{filteredJobs.length} jobs found</Badge>
            </div>

            {/* NEW: Current CV pill + Change button */}
            <div className="flex items-center justify-between mb-6">
              {selectedCV ? (
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/10 text-primary border-primary/30">
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                    Using CV: {selectedCV.name}
                  </Badge>
                  
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Choose a CV to get personalized suggestions
                </div>
              )}
              <Button variant="outline" size="sm" onClick={() => setShowCVModal(true)}>
                <FileText className="h-4 w-4 mr-2" />
                {selectedCV ? 'Change CV' : 'Select CV'}
              </Button>
            </div>

            <div className="space-y-4">
              {filteredJobs.map((job) => {
                const showMatch = typeof job._matchScore === 'number' && selectedCV;
                const strongMatch = showMatch && job._matchScore >= 4;
                const okMatch = showMatch && job._matchScore >= 2 && job._matchScore < 4;

                return (
                  <Card
                    key={job.id}
                    className={`cursor-pointer transition-colors hover:bg-accent/50 ${selectedJob?.id === job.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedJob(job)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{job.title}</h3>
                            {showMatch && (
                              <Badge className={`${strongMatch ? 'bg-emerald-100 text-emerald-700' : okMatch ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>
                                {strongMatch ? 'Great match' : okMatch ? 'Good match' : 'Some overlap'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {job.company}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSaveJob(job.id);
                            }}
                          >
                            <Heart className={`h-4 w-4 ${job.saved ? 'fill-red-500 text-red-500' : ''}`} />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={getLevelColor(job.level)}>
                          {job.level}
                        </Badge>
                        <Badge className={getJobTypeColor(job.type)}>
                          {job.type}
                        </Badge>
                        {job.remote && <Badge variant="outline">Remote</Badge>}
                        {job.applied && <Badge className="bg-green-100 text-green-800">Applied</Badge>}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {formatSalary(job.salary)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(job.postedDate).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {job.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {filteredJobs.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No jobs found matching your criteria.</p>
                  <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search terms.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="w-1/2 overflow-y-auto">
          {selectedJob ? (
            <div className="p-6">
              <div className="space-y-6">
                {/* Job Header */}
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-2xl font-bold">{selectedJob.title}</h1>
                      <p className="text-lg text-muted-foreground flex items-center gap-2 mt-1">
                        <Building className="h-5 w-5" />
                        {selectedJob.company}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => toggleSaveJob(selectedJob.id)}
                      >
                        <Heart className={`h-4 w-4 mr-2 ${selectedJob.saved ? 'fill-red-500 text-red-500' : ''}`} />
                        {selectedJob.saved ? 'Saved' : 'Save'}
                      </Button>
                      <Button
                        onClick={() => applyToJob(selectedJob.id)}
                        disabled={selectedJob.applied}
                      >
                        {selectedJob.applied ? 'Applied' : 'Apply Now'}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <Badge className={getLevelColor(selectedJob.level)}>
                      {selectedJob.level}
                    </Badge>
                    <Badge className={getJobTypeColor(selectedJob.type)}>
                      {selectedJob.type}
                    </Badge>
                    {selectedJob.remote && <Badge variant="outline">Remote</Badge>}
                    {typeof selectedJob._matchScore === 'number' && selectedCV && (
                      <Badge variant="secondary">
                        <Sparkles className="h-3.5 w-3.5 mr-1" />
                        Match score: {selectedJob._matchScore}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedJob.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>{formatSalary(selectedJob.salary)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Posted {new Date(selectedJob.postedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Job Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Job Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedJob.description}
                  </p>
                </div>

                {/* Requirements */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                  <ul className="space-y-2">
                    {selectedJob.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-muted-foreground">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Benefits</h3>
                  <ul className="space-y-2">
                    {selectedJob.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-accent mt-1">✓</span>
                        <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {selectedJob.applicationDeadline && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="text-orange-600 font-medium">
                        Application deadline: {new Date(selectedJob.applicationDeadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Apply Button */}
                <div className="pt-4">
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => applyToJob(selectedJob.id)}
                    disabled={selectedJob.applied}
                  >
                    {selectedJob.applied ? 'Already Applied' : 'Apply for this Position'}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Select a job to view details
                </h3>
                <p className="text-muted-foreground">
                  Choose a job from the list to see full details and apply
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}