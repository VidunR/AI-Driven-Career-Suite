import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Eye, Trash2, Play } from 'lucide-react';
import { toast } from 'sonner';

export function InterviewHistory({ user, accessToken, onNavigate }) {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data
  const mockSessions = [
    {
      id: '1',
      date: new Date('2024-08-15'),
      position: 'Senior Frontend Developer',
      company: 'TechCorp',
      type: 'mixed',
      duration: 1680,
      score: 85,
      status: 'completed',
      questionsCompleted: 5,
      totalQuestions: 5
    },
    {
      id: '2',
      date: new Date('2024-08-12'),
      position: 'Full Stack Engineer',
      company: 'StartupXYZ',
      type: 'technical',
      duration: 2100,
      score: 78,
      status: 'completed',
      questionsCompleted: 4,
      totalQuestions: 4
    },
    {
      id: '3',
      date: new Date('2024-08-10'),
      position: 'Software Engineer',
      company: 'BigTech',
      type: 'behavioral',
      duration: 900,
      score: 72,
      status: 'partial',
      questionsCompleted: 3,
      totalQuestions: 5
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setSessions(mockSessions);
      setFilteredSessions(mockSessions);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = [...sessions];

    if (searchQuery) {
      filtered = filtered.filter(session => 
        session.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.company.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (typeFilter) {
      filtered = filtered.filter(session => session.type === typeFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(session => session.status === statusFilter);
    }

    setFilteredSessions(filtered);
  }, [searchQuery, typeFilter, statusFilter, sessions]);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const deleteSession = (sessionId) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    toast.success('Interview session deleted');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading interview history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Interview History</h1>
          <p className="text-muted-foreground">Review your past mock interview sessions</p>
        </div>
        <Button onClick={() => onNavigate('mock-interview-setup')}>
          <Play className="h-4 w-4 mr-2" />
          New Interview
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by position or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="behavioral">Behavioral</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
                <SelectItem value="case-study">Case Study</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.map((session) => (
          <Card key={session.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{session.position}</h3>
                  <p className="text-muted-foreground">{session.company}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="outline">{session.type}</Badge>
                    <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                      {session.status}
                    </Badge>
                    <span>{session.date.toLocaleDateString()}</span>
                    <span>{formatDuration(session.duration)}</span>
                    <span className={getScoreColor(session.score)}>
                      {session.score}%
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate('interview-results')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Results
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteSession(session.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredSessions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No interview sessions found.</p>
            <Button 
              className="mt-4" 
              onClick={() => onNavigate('mock-interview-setup')}
            >
              Start Your First Interview
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}