import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

export function MockInterviewSetup() {
  const [config, setConfig] = useState({
    jobTitle: '',
    company: '',
    difficulty: 'mid',                 // <-- only difficulty now
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
    'Digital Marketing Manger',
    'Project Manger'
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

      // ⬇️ Pass only what the session needs
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Mock Interview Setup</h1>
        <p className="text-muted-foreground">Configure your AI-powered mock interview to match your target role</p>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Interview Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jobTitle" className="mb-2 block">Job Title *</Label>
              {/* Dropdown instead of free-text input */}
              <select
                id="jobTitle"
                value={config.jobTitle}
                onChange={(e) => setConfig(prev => ({ ...prev, jobTitle: e.target.value }))}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="" disabled>Select a job role…</option>
                {jobRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
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
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interview Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Interview Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Difficulty Level (only) */}
          <div>
            <Label className="text-base font-medium mb-3 block">Difficulty Level</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {difficultyLevels.map((level) => (
                <Card
                  key={level.value}
                  className={`cursor-pointer transition-colors ${
                    config.difficulty === level.value ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-accent/50'
                  }`}
                  onClick={() => setConfig(prev => ({ ...prev, difficulty: level.value }))}
                >
                  <CardContent className="p-4 text-center">
                    <h4 className="font-medium">{level.label}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{level.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Focus Areas */}
      <Card>
        <CardHeader>
          <CardTitle>Focus Areas</CardTitle>
          <p className="text-sm text-muted-foreground">Select areas you want the interview to focus on</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Common */}
          <div>
            <div className="flex flex-wrap gap-2">
              {commonFocusAreas.map((area) => (
                <Badge
                  key={area}
                  variant={config.focusAreas.includes(area) ? "default" : "outline"}
                  className="cursor-pointer"
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
            />
            <Button onClick={addCustomFocusArea} size="sm">
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
              />
              <Button onClick={addCustomQuestion} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {config.customQuestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {config.customQuestions.map((q) => (
                  <Badge key={q} variant="secondary" className="flex items-center gap-1">
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

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Interview Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span className="font-medium">Position:</span> {config.jobTitle || 'Not specified'}</div>
            <div><span className="font-medium">Company:</span> {config.company || 'General'}</div>
            <div><span className="font-medium">Level:</span> {difficultyLevels.find(l => l.value === config.difficulty)?.label}</div>
            <div><span className="font-medium">Duration:</span> {config.duration} minutes</div>
            <div><span className="font-medium">Focus Areas:</span> {config.focusAreas.length || 'None selected'}</div>
          </div>
        </CardContent>
      </Card>

      {/* Start */}
      <div className="flex justify-center pt-6">
        <Button
          size="lg"
          onClick={startInterview}
          disabled={isStarting || !config.jobTitle}
          className="px-8"
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
  );
}

export default MockInterviewSetup;
