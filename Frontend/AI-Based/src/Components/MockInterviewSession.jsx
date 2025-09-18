import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  Mic, MicOff, Video, VideoOff, Pause, Play, SkipForward, 
  Clock, MessageSquare, Bot, User, Volume2, VolumeX 
} from 'lucide-react';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';

export function MockInterviewSession({ user, accessToken, onNavigate }) {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes
  const [questionTime, setQuestionTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [responses, setResponses] = useState([]);
  const [showHints, setShowHints] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);

  const navigate = useNavigate();
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  // Mock questions - in a real app, these would be generated based on the setup
  const questions = [
    {
      id: '1',
      text: 'Tell me about yourself and why you\'re interested in this position.',
      type: 'behavioral',
      difficulty: 'easy',
      expectedDuration: 120
    },
    {
      id: '2',
      text: 'Describe a challenging project you worked on and how you overcame the difficulties.',
      type: 'behavioral',
      difficulty: 'medium',
      expectedDuration: 180
    },
    {
      id: '3',
      text: 'Explain the difference between REST and GraphQL APIs. When would you use each?',
      type: 'technical',
      difficulty: 'medium',
      expectedDuration: 150
    },
    {
      id: '4',
      text: 'Write a function to find the longest substring without repeating characters.',
      type: 'coding',
      difficulty: 'medium',
      expectedDuration: 300
    },
    {
      id: '5',
      text: 'How would you handle a situation where a team member consistently misses deadlines?',
      type: 'behavioral',
      difficulty: 'medium',
      expectedDuration: 120
    }
  ];

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    startInterview();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    let interval;
    
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            endInterview();
            return 0;
          }
          return prev - 1;
        });
        
        setQuestionTime(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, isPaused]);

  const startInterview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsActive(true);
      toast.success('Interview started! Good luck!');
    } catch (error) {
      console.error('Error accessing camera/microphone:', error);
      toast.error('Could not access camera/microphone. You can still continue with text responses.');
      setIsActive(true);
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    toast.info(isPaused ? 'Interview resumed' : 'Interview paused');
  };

  const toggleRecording = async () => {
    if (!streamRef.current) return;

    if (!isRecording) {
      try {
        const mediaRecorder = new MediaRecorder(streamRef.current);
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsRecording(true);
        toast.success('Recording started');
      } catch (error) {
        toast.error('Could not start recording');
      }
    } else {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        toast.success('Recording stopped');
      }
    }
  };

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !isVideoOn;
      });
      setIsVideoOn(!isVideoOn);
    }
  };

  const nextQuestion = () => {
    // Save current answer
    if (currentAnswer.trim() || isRecording) {
      const response = {
        questionId: currentQuestion.id,
        answer: currentAnswer,
        duration: questionTime,
        timestamp: new Date()
      };
      setResponses(prev => [...prev, response]);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentAnswer('');
      setQuestionTime(0);
      toast.success('Moving to next question');
    } else {
      endInterview();
    }
  };

  const endInterview = () => {
    setIsActive(false);
    setInterviewCompleted(true);
    cleanup();
     
    // Save final answer if exists
    if (currentAnswer.trim()) {
      const response = {
        questionId: currentQuestion.id,
        answer: currentAnswer,
        duration: questionTime,
        timestamp: new Date()
      };
      setResponses(prev => [...prev, response]);
    }

    toast.success('Interview completed!');
    
    // Navigate to results after a short delay
    
    navigate('/interview-results');

  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionTypeColor = (type) => {
    switch (type) {
      case 'behavioral': return 'bg-blue-100 text-blue-800';
      case 'technical': return 'bg-green-100 text-green-800';
      case 'coding': return 'bg-purple-100 text-purple-800';
      case 'system-design': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (interviewCompleted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold">Interview Completed!</h2>
          <p className="text-muted-foreground">
            Thank you for completing the mock interview. Your responses are being analyzed.
          </p>
          <div className="text-sm text-muted-foreground">
            Redirecting to results in a moment...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Left Panel - Video and Controls */}
      <div className="w-1/3 border-r border-border p-4 space-y-4">
        {/* Video Feed */}
        <Card>
          <CardContent className="p-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
              {isVideoOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <VideoOff className="h-12 w-12 mx-auto mb-2" />
                    <p>Video Off</p>
                  </div>
                </div>
              )}
              
              {/* Recording Indicator */}
              {isRecording && (
                <div className="absolute top-2 left-2 flex items-center gap-2 bg-red-600 text-white px-2 py-1 rounded text-sm">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  REC
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-2">
          
          <Button
            variant="outline"
            onClick={toggleVideo}
            className={!isVideoOn ? 'bg-red-100 text-red-800' : ''}
          >
            {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            onClick={toggleRecording}
            className={isRecording ? 'bg-red-100 text-red-800' : ''}
          >
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          
        </div>

        {/* Timer and Progress */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Time</span>
              <span className="text-lg font-mono">{formatTime(timeRemaining)}</span>
            </div>
            <Progress value={(1800 - timeRemaining) / 1800 * 100} className="h-2" />
            
            <div className="flex items-center justify-between text-sm">
              <span>Question Time</span>
              <span className="font-mono">{formatTime(questionTime)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Interview Progress */}
        <Card>
          <CardContent className="p-4">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Progress</span>
                <span>{currentQuestionIndex + 1} / {questions.length}</span>
              </div>
              <Progress value={(currentQuestionIndex + 1) / questions.length * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Interview Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold">AI Interviewer</h2>
                <p className="text-sm text-muted-foreground">Mock Interview Session</p>
              </div>
            </div>
            <div className="flex gap-2">
              
              <Button variant="outline" size="sm" onClick={endInterview}>
                End Interview
              </Button>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getQuestionTypeColor(currentQuestion.type)}>
                      {currentQuestion.type}
                    </Badge>
                    <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                      {currentQuestion.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </CardTitle>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Expected: {Math.floor(currentQuestion.expectedDuration / 60)}m
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">{currentQuestion.text}</p>
            </CardContent>
          </Card>

          {/* Hints */}
          {showHints && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <span>💡</span>
                  Helpful Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="text-blue-700">
                <ul className="space-y-1 text-sm">
                  {currentQuestion.type === 'behavioral' && (
                    <>
                      <li>• Use the STAR method (Situation, Task, Action, Result)</li>
                      <li>• Be specific with examples and quantify results</li>
                      <li>• Show what you learned from the experience</li>
                    </>
                  )}
                  {currentQuestion.type === 'technical' && (
                    <>
                      <li>• Think out loud and explain your reasoning</li>
                      <li>• Consider trade-offs and alternatives</li>
                      <li>• Ask clarifying questions if needed</li>
                    </>
                  )}
                  {currentQuestion.type === 'coding' && (
                    <>
                      <li>• Start with a brute force solution, then optimize</li>
                      <li>• Test your solution with edge cases</li>
                      <li>• Explain time and space complexity</li>
                    </>
                  )}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Answer Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Your Response
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Type your answer here... You can also use voice recording above."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                rows={8}
                className="resize-none"
              />
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {currentAnswer.length} characters
                  {isRecording && (
                    <span className="ml-2 text-red-600 flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                      Recording audio response
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex gap-2">
            {currentQuestionIndex < questions.length - 1 ? (
              <Button onClick={nextQuestion}>
                Next Question
                <SkipForward className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={endInterview} className="bg-green-600 hover:bg-green-700">
                Finish Interview
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}