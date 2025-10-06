import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, X, Sparkles, Timer, Target } from 'lucide-react';
import { toast } from 'sonner';

/* ----------------------- Shared Animations (parity with your other pages) ---------------------- */
const AnimationStyles = () => (
  <style>{`
    @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
    @keyframes slideInFromTop { from { opacity: 0; transform: translateY(-1rem) } to { opacity: 1; transform: translateY(0) } }
    @keyframes slideInFromBottom { from { opacity: 0; transform: translateY(1rem) } to { opacity: 1; transform: translateY(0) } }
    @keyframes slideInFromLeft { from { opacity: 0; transform: translateX(-1rem) } to { opacity: 1; transform: translateX(0) } }
    @keyframes slideInFromRight { from { opacity: 0; transform: translateX(1rem) } to { opacity: 1; transform: translateX(0) } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.97) } to { opacity: 1; transform: scale(1) } }
    @keyframes float { 0%,100% { transform: translateY(0px) } 50% { transform: translateY(-8px) } }
    @keyframes shimmer { 0% { background-position: -1000px 0 } 100% { background-position: 1000px 0 } }
    @keyframes glow { 0%,100% { box-shadow: 0 0 20px rgba(99,102,241,0.18) } 50% { box-shadow: 0 0 28px rgba(147,51,234,0.28) } }

    .animate-fade-in { animation: fadeIn .6s ease-out forwards }
    .animate-slide-in-top { animation: slideInFromTop .6s ease-out forwards }
    .animate-slide-in-bottom { animation: slideInFromBottom .6s ease-out forwards }
    .animate-slide-in-left { animation: slideInFromLeft .6s ease-out forwards }
    .animate-slide-in-right { animation: slideInFromRight .6s ease-out forwards }
    .animate-scale-in { animation: scaleIn .45s ease-out forwards }
    .animate-float { animation: float 3s ease-in-out infinite }
    .animate-glow { animation: glow 2.2s ease-in-out infinite }

    .opacity-0 { opacity: 0 }
    .delay-100 { animation-delay: .1s }
    .delay-200 { animation-delay: .2s }
    .delay-300 { animation-delay: .3s }
    .delay-400 { animation-delay: .4s }
    .delay-500 { animation-delay: .5s }
    .delay-600 { animation-delay: .6s }
    .delay-700 { animation-delay: .7s }
    .delay-800 { animation-delay: .8s }
    .delay-900 { animation-delay: .9s }
    .delay-1000 { animation-delay: 1s }

    .glass {
      background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03));
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.08);
    }
    .action-card {
      transition: transform .35s cubic-bezier(.22,.61,.36,1), box-shadow .35s;
      position: relative; overflow: hidden;
    }
    .action-card:hover { transform: translateY(-6px) scale(1.01) }
    .action-card::after {
      content:'';
      position:absolute; inset:0;
      background: linear-gradient(135deg, rgba(99,102,241,0.10), rgba(147,51,234,0.10), rgba(236,72,153,0.08));
      opacity:0; transition: opacity .35s;
      pointer-events: none; /* important: do NOT block inputs/clicks */
    }
    .action-card:hover::after { opacity:.65 }

    .chip { transition: transform .25s }
    .chip:hover { transform: translateY(-2px) }

    .shimmer {
      background: linear-gradient(90deg, transparent, rgba(255,255,255,.07), transparent);
      background-size: 1000px 100%;
      animation: shimmer 2s infinite;
    }

    .gradient-title {
      background: linear-gradient(135deg, #8b5cf6 0%, #22d3ee 50%, #ec4899 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .calm-bg {
      background: radial-gradient(1200px 600px at 0% 0%, rgba(34,211,238,0.08), transparent 60%),
                  radial-gradient(1000px 500px at 100% 20%, rgba(139,92,246,0.10), transparent 55%),
                  radial-gradient(900px 500px at 50% 100%, rgba(236,72,153,0.08), transparent 50%);
    }
  `}</style>
);

export function MockInterviewSetup() {
  const [config, setConfig] = useState({
    jobTitle: '',
    company: '',
    difficulty: 'mid',                 // <-- only difficulty now (UNCHANGED)
    duration: 30,
    focusAreas: [],
    customQuestions: [],
    includeCodeChallenge: false,
    includeSystemDesign: false,
    language: 'english'
  });

  const [newFocusArea, setNewFocusArea] = useState('');
  const [newCustomQuestion, setNewCustomQuestion] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const navigate = useNavigate();

  const difficultyLevels = [
    { value: 'entry',  label: 'Junior Level', description: 'For new graduates and junior positions' },
    { value: 'mid',    label: 'Mid Level',    description: 'For experienced professionals' },
    { value: 'senior', label: 'Senior Level', description: 'For senior and leadership positions' }
  ];

  // --- Job roles for dropdown (exactly as requested) ---
  const jobRoles = [
    'Software Engineer',
    'Cybersecurity Specialist',
    'Accountant',
    "Project Manager",
    "Digital Marketer",
  ];

  const commonFocusAreas = [
    'Leadership','Teamwork','Problem Solving','Communication','Algorithms',
    'Data Structures','System Design','Database Design','Frontend Development',
    'Backend Development','Cloud Computing','DevOps','Machine Learning',
    'Product Management','Project Management','Agile Methodologies'
  ];

  const addFocusArea = (area) => {
    if (area && !config.focusAreas.includes(area)) {
      setConfig(prev => ({ ...prev, focusAreas: [...prev.focusAreas, area] }));
    }
  };

  const removeFocusArea = (area) => {
    setConfig(prev => ({ ...prev, focusAreas: prev.focusAreas.filter(a => a !== area) }));
  };

  const addCustomFocusArea = () => {
    if (newFocusArea.trim()) {
      addFocusArea(newFocusArea.trim());
      setNewFocusArea('');
    }
  };

  const addCustomQuestion = () => {
    if (newCustomQuestion.trim() && !config.customQuestions.includes(newCustomQuestion.trim())) {
      setConfig(prev => ({ ...prev, customQuestions: [...prev.customQuestions, newCustomQuestion.trim()] }));
      setNewCustomQuestion('');
    }
  };

  const removeCustomQuestion = (question) => {
    setConfig(prev => ({ ...prev, customQuestions: prev.customQuestions.filter(q => q !== question) }));
  };

  const startInterview = async () => {
    if (!config.jobTitle) {
      toast.error('Please select a job title');
      return;
    }

    setIsStarting(true);
    try {
      // (Optional) simulate API
      await new Promise(resolve => setTimeout(resolve, 400));
      toast.success('Interview session starting…');

      // ⬇️ Pass only what the session needs (UNCHANGED)
      navigate('/mock-interview-session', {
        state: {
          jobRole:    config.jobTitle,
          difficulty: config.difficulty
        }
      });
    } catch {
      toast.error('Failed to start interview session');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <>
      <AnimationStyles />
      <div className="calm-bg min-h-[calc(100vh-5rem)]">
        <div className="max-w-4xl mx-auto p-6 space-y-6">

          {/* Header */}
          <div className="text-center space-y-2 opacity-0 animate-slide-in-top">
            <h1 className="text-3xl font-bold gradient-title inline-flex items-center gap-2">
              <Sparkles className="w-6 h-6 animate-float" />
              Mock Interview Setup
            </h1>
            <p className="text-muted-foreground">
              Configure your AI-powered mock interview to match your target role
            </p>
          </div>

          {/* Basic Information */}
          <div className="opacity-0 animate-scale-in delay-100">
            <Card className="glass action-card">
              <CardHeader>
                <CardTitle>Interview Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="jobTitle" className="mb-2 block">Job Title *</Label>

                    <select
                      id="jobTitle"
                      value={config.jobTitle}
                      onChange={(e) => setConfig(prev => ({ ...prev, jobTitle: e.target.value }))}
                      className="w-full h-10 rounded-md border border-input bg-background/70 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
                    >
                      <option value="" disabled>Select a job role…</option>
                      {jobRoles.map(role => (
                        <option
                          key={role}
                          value={role}
                          className="bg-background text-foreground"
                        >
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="company" className="mb-2 block">Company (Optional)</Label>
                    <Input
                      id="company"
                      placeholder="e.g., Google, Microsoft, etc."
                      value={config.company}
                      onChange={(e) => setConfig(prev => ({ ...prev, company: e.target.value }))}
                      className="bg-background/70"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interview Configuration */}
          <div className="opacity-0 animate-slide-in-bottom delay-200">
            <Card className="glass action-card">
              <CardHeader>
                <CardTitle>Interview Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Difficulty Level (only) */}
                <div>
                  <Label className="text-base font-medium mb-3 block">Difficulty Level</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {difficultyLevels.map((level, idx) => (
                      <Card
                        key={level.value}
                        className={`cursor-pointer transition-all ${
                          config.difficulty === level.value
                            ? 'ring-2 ring-primary bg-primary/5'
                            : 'hover:bg-accent/50'
                        }`}
                        style={{ animation: 'scaleIn .45s ease-out forwards', animationDelay: `${0.06 * (idx + 1)}s`, opacity: 0 }}
                        onClick={() => setConfig(prev => ({ ...prev, difficulty: level.value }))}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Target className="w-4 h-4 text-primary" />
                            <h4 className="font-medium">{level.label}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{level.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Focus Areas */}
          <div className="opacity-0 animate-slide-in-right delay-300">
            <Card className="glass action-card">
              <CardHeader>
                <CardTitle>Focus Areas</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select areas you want the interview to focus on
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Common */}
                <div>
                  <div className="flex flex-wrap gap-2">
                    {commonFocusAreas.map((area) => (
                      <Badge
                        key={area}
                        variant={config.focusAreas.includes(area) ? "default" : "outline"}
                        className="cursor-pointer chip"
                        onClick={() =>
                          config.focusAreas.includes(area) ? removeFocusArea(area) : addFocusArea(area)
                        }
                      >
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Custom Focus Area */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter custom focus area..."
                    value={newFocusArea}
                    onChange={(e) => setNewFocusArea(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomFocusArea()}
                    className="bg-background/70"
                  />
                  <Button onClick={addCustomFocusArea} size="sm" className="action-card">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Custom Questions */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a custom question…"
                      value={newCustomQuestion}
                      onChange={(e) => setNewCustomQuestion(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCustomQuestion()}
                      className="bg-background/70"
                    />
                    <Button onClick={addCustomQuestion} size="sm" className="action-card">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {config.customQuestions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {config.customQuestions.map((q) => (
                        <Badge key={q} variant="secondary" className="flex items-center gap-1 chip">
                          {q}
                          <button onClick={() => removeCustomQuestion(q)} className="ml-1 hover:text-red-500">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div className="opacity-0 animate-fade-in delay-400">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Interview Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="inline-flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="font-medium">Position:</span> {config.jobTitle || 'Not specified'}
                  </div>
                  <div><span className="font-medium">Company:</span> {config.company || 'General'}</div>
                  <div><span className="font-medium">Level:</span> {difficultyLevels.find(l => l.value === config.difficulty)?.label}</div>
                  <div className="inline-flex items-center gap-2">
                    <Timer className="w-4 h-4 text-primary" />
                    <span className="font-medium">Duration:</span> {config.duration} minutes
                  </div>
                  <div><span className="font-medium">Focus Areas:</span> {config.focusAreas.length || 'None selected'}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Start */}
          <div className="flex justify-center pt-2 opacity-0 animate-slide-in-bottom delay-500">
            <Button
              size="lg"
              onClick={startInterview}
              disabled={isStarting || !config.jobTitle}
              className="px-8 action-card animate-glow"
            >
              {isStarting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Starting Interview...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Start Mock Interview
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default MockInterviewSetup;
