import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  Mic, MicOff, Video, VideoOff, SkipForward, Clock, Bot,
  Volume2, VolumeX, Play, Pause
} from 'lucide-react';
import { toast } from 'sonner';

export function MockInterviewSession({ user, accessToken, onNavigate }) {
  const [showStartModal, setShowStartModal] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(1800);
  const [questionTime, setQuestionTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isWebcamOn, setIsWebcamOn] = useState(true);
  const [interviewCompleted, setInterviewCompleted] = useState(false);

  // question video audio/UI
  const [qvMuted, setQvMuted] = useState(false);
  const [qvPlaying, setQvPlaying] = useState(false);

  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const questionVideoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  // Mock questions
  const questions = [
    { id: '1', text: "Tell me about yourself and why you're interested in this position.", type: 'behavioral', difficulty: 'easy', expectedDuration: 120 },
    { id: '2', text: 'Describe a challenging project you worked on and how you overcame the difficulties.', type: 'behavioral', difficulty: 'medium', expectedDuration: 180 },
    { id: '3', text: 'Explain the difference between REST and GraphQL APIs. When would you use each?', type: 'technical', difficulty: 'medium', expectedDuration: 150 },
    { id: '4', text: 'Write a function to find the longest substring without repeating characters.', type: 'coding', difficulty: 'medium', expectedDuration: 300 },
    { id: '5', text: 'How would you handle a situation where a team member consistently misses deadlines?', type: 'behavioral', difficulty: 'medium', expectedDuration: 120 }
  ];
  const currentQuestion = questions[currentQuestionIndex];

  // file helpers
  const getVideoSrc  = (i) => `/videos/Q${i + 1}.mp4`;
  const getPosterSrc = (i) => `/videos/Q${i + 1}.jpg`; // optional poster

  // timers
  useEffect(() => {
    let interval;
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            endInterview();
            return 0;
          }
          return prev - 1;
        });
        setQuestionTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused]);

  // autoplay next video only after interview active
  useEffect(() => {
    if (isActive) {
      playQuestionVideo({ resetToStart: true, preferSound: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, isActive]);

  // Start: request cam/mic, then play video WITH sound
  const handleStartInterview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (webcamRef.current) webcamRef.current.srcObject = stream;
      setIsActive(true);
      setShowStartModal(false);
      toast.success('Interview started! Good luck.');
      await playQuestionVideo({ resetToStart: true, preferSound: true });
    } catch (err) {
      console.error('Permission error:', err);
      toast.error('Please allow camera & microphone to proceed.');
      // keep modal open so they can retry
    }
  };

  // question video controls
  const playQuestionVideo = async ({ resetToStart = false, preferSound = true } = {}) => {
    const v = questionVideoRef.current;
    if (!v) return;

    const expectedSrc = getVideoSrc(currentQuestionIndex);
    if (!v.src.endsWith(expectedSrc)) v.src = expectedSrc;

    v.playsInline = true;
    v.muted = !preferSound;
    setQvMuted(v.muted);

    if (resetToStart) {
      try { v.currentTime = 0; } catch {}
    }

    try {
      await v.play();
      setQvPlaying(true);
    } catch (err) {
      // fallback: muted autoplay
      v.muted = true;
      setQvMuted(true);
      try {
        await v.play();
        setQvPlaying(true);
        toast.message('Click the speaker to unmute the question audio.');
      } catch (err2) {
        setQvPlaying(false);
      }
    }
  };

  const pauseQuestionVideo = () => {
    const v = questionVideoRef.current;
    if (!v) return;
    v.pause();
    setQvPlaying(false);
  };

  const toggleQvMute = () => {
    const v = questionVideoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setQvMuted(v.muted);
  };

  // webcam/recording
  const toggleWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((t) => (t.enabled = !isWebcamOn));
      setIsWebcamOn(!isWebcamOn);
    }
  };

  const toggleRecording = async () => {
    if (!streamRef.current) return;
    if (!isRecording) {
      try {
        const mr = new MediaRecorder(streamRef.current);
        mediaRecorderRef.current = mr;
        mr.start();
        setIsRecording(true);
        toast.success('Recording started');
      } catch {
        toast.error('Could not start recording');
      }
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  };

  // navigation
  const nextQuestion = () => {
    setQuestionTime(0);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
      toast.success('Moving to next question');
    } else {
      endInterview();
    }
  };

  const endInterview = () => {
    setIsActive(false);
    setInterviewCompleted(true);
    cleanup();
    toast.success('Interview completed!');
    navigate('/interview-results');
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // helpers
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m.toString().padStart(2, '0')}:${r.toString().padStart(2, '0')}`;
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
          <p className="text-muted-foreground">Thank you for completing the mock interview. Your responses are being analyzed.</p>
          <div className="text-sm text-muted-foreground">Redirecting to results in a moment...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background relative">
      {/* Left Panel */}
      <div className="w-1/3 border-r border-border p-4 space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
              {isWebcamOn ? (
                <video ref={webcamRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <VideoOff className="h-12 w-12 mx-auto mb-2" />
                    <p>Video Off</p>
                  </div>
                </div>
              )}
              {isRecording && (
                <div className="absolute top-2 left-2 flex items-center gap-2 bg-red-600 text-white px-2 py-1 rounded text-sm">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  REC
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" onClick={toggleWebcam} className={!isWebcamOn ? 'bg-red-100 text-red-800' : ''}>
            {isWebcamOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </Button>
          <Button variant="outline" onClick={toggleRecording} className={isRecording ? 'bg-red-100 text-red-800' : ''}>
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button variant="outline" onClick={toggleQvMute}>
            {qvMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </div>

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

      {/* Right Panel */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar><AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback></Avatar>
              <div>
                <h2 className="font-semibold">AI Interviewer</h2>
                <p className="text-sm text-muted-foreground">Mock Interview Session</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={endInterview}>End Interview</Button>
            </div>
          </div>
        </div>

        {/* Question Video — fixed pixel height that never changes */}
        <div className="p-4 border-b border-border">
          <Card>
            <CardContent className="p-3">
              <div className="w-full rounded overflow-hidden relative">
                {/* >>> ADJUST ONLY THIS NUMBER to resize (in pixels) <<< */}
                <div className="w-full" style={{ height: 500 }}>
                  <video
                    key={currentQuestionIndex}
                    ref={questionVideoRef}
                    src={getVideoSrc(currentQuestionIndex)}
                    poster={getPosterSrc(currentQuestionIndex)}
                    preload="metadata"          // no buffering before start
                    playsInline
                    className="w-full h-full object-contain bg-black rounded"
                    muted={qvMuted}
                    onLoadedMetadata={(e) => {
                      // don't autoplay until interview is active
                      if (!isActive) return;
                      playQuestionVideo({ resetToStart: false, preferSound: !qvMuted });
                    }}
                    onEnded={(e) => {
                      const v = e.currentTarget;
                      try {
                        v.pause();
                        if (!isNaN(v.duration) && isFinite(v.duration)) {
                          v.currentTime = Math.max(0, v.duration - 0.05);
                        }
                      } catch {}
                      setQvPlaying(false);
                    }}
                    onPlay={() => setQvPlaying(true)}
                    onPause={() => setQvPlaying(false)}
                  />
                </div>

                {/* Overlay play/pause fallback */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  {!qvPlaying ? (
                    <Button size="sm" variant="secondary" onClick={() => playQuestionVideo({ preferSound: !qvMuted })}>
                      <Play className="h-4 w-4 mr-1" /> Play
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={pauseQuestionVideo}>
                      <Pause className="h-4 w-4 mr-1" /> Pause
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question + Controls */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getQuestionTypeColor(currentQuestion.type)}>{currentQuestion.type}</Badge>
                    <Badge className={getDifficultyColor(currentQuestion.difficulty)}>{currentQuestion.difficulty}</Badge>
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

          <div className="flex gap-2">
            {currentQuestionIndex < questions.length - 1 ? (
              <Button onClick={nextQuestion}>
                Next Question <SkipForward className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={endInterview} className="bg-green-600 hover:bg-green-700">
                Finish Interview
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Start Modal (blurred) */}
      {showStartModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <CardTitle className="text-xl">Start Mock Interview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  When you click <b>Start</b>, your browser will ask to use your <b>camera</b> and <b>microphone</b>.
                  After you allow access, the question video will play with sound. (You can mute/unmute anytime.)
                </p>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowStartModal(false)}>Cancel</Button>
                  <Button onClick={handleStartInterview}>Start</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default MockInterviewSession;
