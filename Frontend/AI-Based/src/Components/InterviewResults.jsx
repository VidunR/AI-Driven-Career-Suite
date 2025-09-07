import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { useNavigate } from 'react-router-dom';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  TrendingUp, Target, Clock, Award, 
  BookOpen, MessageSquare, Brain, CheckCircle, XCircle, 
  Download, Share2, RefreshCw, ArrowLeft 
} from 'lucide-react';
import { toast } from 'sonner';

export function InterviewResults({ user, accessToken, onNavigate }) {
  const [results, setResults] = useState(null);
  const [questionResults, setQuestionResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  // Mock results data
  const mockResults = {
    totalScore: 78,
    duration: 1680, // 28 minutes
    completedQuestions: 5,
    totalQuestions: 5,
    skillScores: {
      communication: 82,
      technical: 75,
      problemSolving: 80,
      leadership: 70,
      creativity: 85
    }
  };

  const mockQuestionResults = [
    {
      id: '1',
      question: 'Tell me about yourself and why you\'re interested in this position.',
      answer: 'I am a software engineer with 3 years of experience...',
      score: 85,
      feedback: 'Great introduction that clearly outlined your background and motivation. You effectively connected your past experience to the role.',
      improvements: ['Could have mentioned specific achievements with quantifiable results', 'Consider discussing long-term career goals'],
      strengths: ['Clear and concise communication', 'Good structure using chronological approach', 'Showed genuine enthusiasm'],
      type: 'behavioral'
    },
    {
      id: '2',
      question: 'Describe a challenging project you worked on and how you overcame the difficulties.',
      answer: 'I worked on a microservices migration project that faced several challenges...',
      score: 75,
      feedback: 'Good use of the STAR method. You clearly described the situation and your actions, though the result could be more specific.',
      improvements: ['Provide more specific metrics for the results', 'Discuss what you learned from the experience'],
      strengths: ['Used STAR method effectively', 'Showed problem-solving skills', 'Demonstrated technical leadership'],
      type: 'behavioral'
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setResults(mockResults);
      setQuestionResults(mockQuestionResults);
      setIsLoading(false);
    }, 2000);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score) => {
    if (score >= 90) return { text: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (score >= 80) return { text: 'Good', color: 'bg-blue-100 text-blue-800' };
    if (score >= 70) return { text: 'Average', color: 'bg-yellow-100 text-yellow-800' };
    if (score >= 60) return { text: 'Below Average', color: 'bg-orange-100 text-orange-800' };
    return { text: 'Needs Improvement', color: 'bg-red-100 text-red-800' };
  };

  const downloadResults = () => {
    toast.success('Results downloaded successfully');
  };

  const shareResults = () => {
    toast.success('Results shared successfully');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h3 className="text-lg font-medium">Analyzing Your Interview</h3>
          <p className="text-muted-foreground">Our AI is processing your responses and generating detailed feedback...</p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Brain className="h-4 w-4 animate-pulse" />
            <span>AI Analysis in Progress</span>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No results available</p>
      </div>
    );
  }

  const scoreBadge = getScoreBadge(results.totalScore);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Interview Results</h1>
            <p className="text-muted-foreground">Detailed analysis of your mock interview performance</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={downloadResults}>
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
          <Button variant="outline" size="sm" onClick={shareResults}>
            <Share2 className="h-4 w-4 mr-2" />
            Share Results
          </Button>
          <Button size="sm" onClick={() => navigate('/mock-interview-setup')}>
            <RefreshCw className="h-4 w-4 mr-2" />
            New Interview
          </Button>
        </div>
      </div>

      {/* Overall Score Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <div className="text-5xl font-bold">{results.totalScore}</div>
              <Badge className={scoreBadge.color} variant="secondary">
                {scoreBadge.text}
              </Badge>
            </div>
            <p className="text-lg text-muted-foreground">Overall Interview Score</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-semibold">{results.completedQuestions}/{results.totalQuestions}</div>
                <p className="text-sm text-muted-foreground">Questions Completed</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold">{formatTime(results.duration)}</div>
                <p className="text-sm text-muted-foreground">Total Duration</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-green-600">✓</div>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(results.skillScores).map(([skill, score]) => (
            <div key={skill} className="space-y-2">
              <div className="flex justify-between">
                <span className="capitalize">{skill.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className={`font-medium ${getScoreColor(score)}`}>{score}%</span>
              </div>
              <Progress value={score} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Key Highlights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Key Highlights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Strong Communication</p>
                <p className="text-sm text-muted-foreground">Excellent verbal communication and clear explanations</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Technical Competence</p>
                <p className="text-sm text-muted-foreground">Solid understanding of technical concepts</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <p className="font-medium">Areas for Growth</p>
                <p className="text-sm text-muted-foreground">Could improve on providing specific metrics and examples</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Recommended Study Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">System Design Patterns</p>
                  <p className="text-sm text-muted-foreground">Practice designing scalable systems and explaining architectural decisions</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Quantifiable Results</p>
                  <p className="text-sm text-muted-foreground">Include specific metrics and numbers when describing achievements</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">STAR Method</p>
                  <p className="text-sm text-muted-foreground">Continue practicing the STAR method for behavioral questions</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="w-full justify-start" onClick={() => navigate('/mock-interview-session')}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Take Another Mock Interview
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/job-search')}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Browse Job Opportunities
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/cv-manager')}>
                <BookOpen className="h-4 w-4 mr-2" />
                Update Your CV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}