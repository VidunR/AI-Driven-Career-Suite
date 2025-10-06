import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { useNavigate, useLocation } from 'react-router-dom';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  Mic, MicOff, Video, VideoOff, SkipForward, Clock, Bot,
  Volume2, VolumeX, Play, Pause, Download
} from 'lucide-react';
import { toast } from 'sonner';
import { getQuestionsFor } from '../data/questionBank';

export function MockInterviewSession() {
  const [showStartModal, setShowStartModal] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(600);
  const [questionTime, setQuestionTime] = useState(0);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const [isWebcamOn, setIsWebcamOn] = useState(true);
  const [interviewCompleted, setInterviewCompleted] = useState(false);

  const [currentAnswer, setCurrentAnswer] = useState('');
  const [responses, setResponses] = useState([]);

  const [qvMuted, setQvMuted] = useState(false);
  const [qvPlaying, setQvPlaying] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const webcamRef = useRef(null);
  const questionVideoRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const audioRecordStreamRef = useRef(null);
  const previewStreamRef = useRef(null);
  const chunksRef = useRef([]);

  const recordTimerRef = useRef(null);
  const [lastAudioBlob, setLastAudioBlob] = useState(null);
  const [lastAudioUrl, setLastAudioUrl] = useState(null);

  const jobRole = location.state?.jobRole || 'Software Engineer';
  const selectedDifficulty = (() => {
    const raw = String(location.state?.difficulty || 'mid').toLowerCase();
    if (raw.includes('entry') || raw.includes('junior')) return 'entry';
    if (raw.includes('senior')) return 'senior';
    return 'mid';
  })();

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    const selected = getQuestionsFor(jobRole, selectedDifficulty, 5);
    setQuestions(selected);
  }, [jobRole, selectedDifficulty]);

  useEffect(() => {
    let h;
    if (isActive) {
      h = setInterval(() => {
        setTimeRemaining((t) => {
          if (t <= 1) {
            clearInterval(h);
            handleEndInterviewClick();
            return 0;
          }
          return t - 1;
        });
        setQuestionTime((q) => q + 1);
      }, 1000);
    }
    return () => clearInterval(h);
  }, [isActive]);

  useEffect(() => {
    if (isActive && currentQuestion) playQuestionVideo({ resetToStart: true, preferSound: true });
  }, [currentQuestionIndex, isActive]);

  useEffect(() => {
    return () => { if (lastAudioUrl) URL.revokeObjectURL(lastAudioUrl); };
  }, [lastAudioUrl]);

  const handleStartInterview = async () => {
    try {
      let pv = null;
      try {
        pv = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch {
        pv = await navigator.mediaDevices.getUserMedia({ audio: true });
        toast.message("No camera detected. Starting with audio only.");
        setIsWebcamOn(false);
      }

      previewStreamRef.current = pv;
      if (webcamRef.current && pv.getVideoTracks().length > 0) {
        webcamRef.current.srcObject = pv;
      }

      const audioOnly = new MediaStream(pv.getAudioTracks());
      audioRecordStreamRef.current = audioOnly;

      setIsActive(true);
      setShowStartModal(false);
      toast.success('Interview started!');
      await playQuestionVideo({ resetToStart: true, preferSound: true });
    } catch (err) {
      console.error(err);
      toast.error('Camera/microphone not available. Please enable and retry.');
    }
  };

  const playQuestionVideo = async ({ resetToStart = false, preferSound = true } = {}) => {
    const v = questionVideoRef.current;
    if (!v) return;
    v.playsInline = true;
    v.muted = !preferSound;
    setQvMuted(v.muted);
    if (resetToStart) { try { v.currentTime = 0; } catch {} }
    try { await v.play(); setQvPlaying(true); }
    catch {
      v.muted = true; setQvMuted(true);
      try { await v.play(); setQvPlaying(true); toast.message('Click speaker to unmute.'); }
      catch { setQvPlaying(false); }
    }
  };

  const pauseQuestionVideo = () => { questionVideoRef.current?.pause(); setQvPlaying(false); };
  const toggleQvMute = () => { const v = questionVideoRef.current; if (!v) return; v.muted = !v.muted; setQvMuted(v.muted); };

  const toggleWebcam = () => {
    if (previewStreamRef.current) {
      previewStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = !isWebcamOn));
      setIsWebcamOn(!isWebcamOn);
    }
  };

  async function startRecording() {
    if (!audioRecordStreamRef.current) {
      toast.error('Microphone not ready yet.');
      return;
    }
    try {
      chunksRef.current = [];
      if (lastAudioUrl) { URL.revokeObjectURL(lastAudioUrl); setLastAudioUrl(null); }
      setLastAudioBlob(null);

      const mr = new MediaRecorder(audioRecordStreamRef.current, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => { if (e.data && e.data.size) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setLastAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setLastAudioUrl(url);
        await sendForTranscription(blob);
      };

      mr.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      recordTimerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
      toast.success('Recording started');
    } catch (err) {
      console.error(err);
      toast.error('Could not start recording');
    }
  }

  async function stopRecordingAndTranscribe() {
    if (!isRecording) return;
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } catch (e) {
      console.error(e);
      toast.error('Could not stop recording');
    } finally {
      setIsRecording(false);
      if (recordTimerRef.current) { clearInterval(recordTimerRef.current); recordTimerRef.current = null; }
      toast.message('Processing audio…');
    }
  }

  async function sendForTranscription(blob) {
    try {
      setTranscribing(true);
      const form = new FormData();
      form.append("audio", blob, "answer.webm");
      form.append("language", "en");

      const token = localStorage.getItem("jwtToken");

      const r = await axios.post("http://localhost:5000/interview/transcribe", form, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "multipart/form-data",
        },
      });

      const data = r.data;
      setCurrentAnswer(data.text || "");
      toast.success("Transcription ready. Review and submit.");
    } catch (e) {
      console.error(e);
      toast.error('Transcription request failed.');
    } finally {
      setTranscribing(false);
    }
  }

  const finalizeResponsesBeforeSubmit = () => {
    const trimmed = currentAnswer.trim();

    if (responses.length === 0 && !trimmed && currentQuestion) {
      const entry = {
        questionId: currentQuestion.id,
        questionText: currentQuestion.text,
        answer: "",
        jobRole,
        secondsSpent: questionTime,
        videoPath: currentQuestion.video,
      };
      return [...responses, entry];
    }

    if (trimmed && currentQuestion) {
      const entry = {
        questionId: currentQuestion.id,
        questionText: currentQuestion.text,
        answer: trimmed,
        jobRole,
        secondsSpent: questionTime,
        videoPath: currentQuestion.video,
      };
      return [...responses, entry];
    }

    return responses;
  };

  const collectAnswerAndMaybeFinish = () => {
    const trimmed = currentAnswer.trim();

    const entry = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.text,
      answer: trimmed,
      jobRole,
      secondsSpent: questionTime,
      videoPath: currentQuestion.video,
    };
    const nextResponses = [...responses, entry];

    setResponses(nextResponses);
    setCurrentAnswer('');

    if (currentQuestionIndex < questions.length - 1) {
      setQuestionTime(0);
      setCurrentQuestionIndex((i) => i + 1);
      setRecordingSeconds(0);
      toast.success('Next question');
    } else {
      console.log("Submitting final responses:", nextResponses);
      endInterview(nextResponses);
    }
  };

  const endInterview = async (finalResponses = responses) => {
    setIsActive(false);
    setInterviewCompleted(true);

    if (previewStreamRef.current) previewStreamRef.current.getTracks().forEach((t) => t.stop());
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recordTimerRef.current) { clearInterval(recordTimerRef.current); recordTimerRef.current = null; }

    try {
      const token = localStorage.getItem('jwtToken');
      const difficulty = (location.state?.difficulty || "mid");

      console.log("Final payload:", { jobRole, difficulty, responses: finalResponses });

      const r = await fetch("http://localhost:5000/interview/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ jobRole, difficulty, responses: finalResponses })
      });

      const feedback = await r.json();
      navigate("/interview-results", { state: { feedback } });
    } catch (e) {
      console.error("Evaluation failed", e);
      navigate("/interview-results", { state: { feedback: null } });
    }
  };

  const handleEndInterviewClick = () => {
    const finalResponses = finalizeResponsesBeforeSubmit();
    endInterview(finalResponses);
  };

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const chipType = (t) =>
    t?.includes('design') ? 'system-design'
      : t?.includes('substring') || t?.includes('Big-O') ? 'coding'
      : t?.includes('Explain') ? 'technical'
      : 'behavioral';
  const chipColor = (type) =>
    type === 'system-design' ? 'bg-orange-100 text-orange-800'
      : type === 'coding' ? 'bg-purple-100 text-purple-800'
      : type === 'technical' ? 'bg-green-100 text-green-800'
      : 'bg-blue-100 text-blue-800';

  if (!currentQuestion) {
    return (
      <div className="calm-bg">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground text-lg font-medium">Loading interview questions...</p>
          </div>
        </div>
        <style>{`
          .calm-bg {
            background: radial-gradient(1200px 600px at 0% 0%, rgba(34,211,238,0.08), transparent 60%),
                        radial-gradient(1000px 500px at 100% 20%, rgba(139,92,246,0.10), transparent 55%),
                        radial-gradient(900px 500px at 50% 100%, rgba(236,72,153,0.08), transparent 50%);
            min-height: 100vh;
          }
        `}</style>
      </div>
    );
  }

  if (interviewCompleted) {
    return (
      <div className="calm-bg">
        <div className="flex items-center justify-center min-h-screen p-6">
          <Card className="max-w-md w-full opacity-0 animate-scale-in shadow-2xl">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <div className="text-4xl">✅</div>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">Interview Completed!</h2>
                <p className="text-muted-foreground text-lg">Your AI feedback is being generated...</p>
              </div>
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            </CardContent>
          </Card>
        </div>
        <style>{`
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-scale-in {
            animation: scaleIn 0.5s ease-out forwards;
          }
          .calm-bg {
            background: radial-gradient(1200px 600px at 0% 0%, rgba(34,211,238,0.08), transparent 60%),
                        radial-gradient(1000px 500px at 100% 20%, rgba(139,92,246,0.10), transparent 55%),
                        radial-gradient(900px 500px at 50% 100%, rgba(236,72,153,0.08), transparent 50%);
            min-height: 100vh;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="calm-bg">
      <div className="min-h-screen p-6">
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideInFromTop {
            from { opacity: 0; transform: translateY(-1rem); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideInFromLeft {
            from { opacity: 0; transform: translateX(-1rem); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes slideInFromRight {
            from { opacity: 0; transform: translateX(1rem); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          
          .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
          }
          .animate-slide-in-top {
            animation: slideInFromTop 0.6s ease-out forwards;
          }
          .animate-slide-in-left {
            animation: slideInFromLeft 0.6s ease-out forwards;
          }
          .animate-slide-in-right {
            animation: slideInFromRight 0.6s ease-out forwards;
          }
          .animate-scale-in {
            animation: scaleIn 0.5s ease-out forwards;
          }
          
          .opacity-0 { opacity: 0; }
          .delay-100 { animation-delay: 0.1s; }
          .delay-200 { animation-delay: 0.2s; }
          .delay-300 { animation-delay: 0.3s; }
          
          .calm-bg {
            background: radial-gradient(1200px 600px at 0% 0%, rgba(34,211,238,0.08), transparent 60%),
                        radial-gradient(1000px 500px at 100% 20%, rgba(139,92,246,0.10), transparent 55%),
                        radial-gradient(900px 500px at 50% 100%, rgba(236,72,153,0.08), transparent 50%);
            min-height: 100vh;
          }
          
          .video-card {
            transition: all 0.3s ease;
          }
          .video-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          }
        `}</style>

        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="opacity-0 animate-slide-in-top">
            <Card className="border-border shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-14 h-14">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        <Bot className="h-7 w-7" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold">AI Mock Interview</h2>
                      <p className="text-muted-foreground flex items-center gap-2 mt-1">
                        <span className="font-medium">{jobRole}</span>
                        <span>•</span>
                        <Badge className="bg-purple-100 text-purple-800">
                          {selectedDifficulty === 'entry' ? 'Junior' : selectedDifficulty === 'senior' ? 'Senior' : 'Mid'} Level
                        </Badge>
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleEndInterviewClick}
                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all duration-300"
                  >
                    End Interview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Sidebar */}
            <div className="space-y-6 opacity-0 animate-slide-in-left delay-100">
              {/* Webcam */}
              <Card className="border-border video-card shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Video className="w-4 h-4 text-primary" />
                    Your Video
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="aspect-video bg-black rounded-xl overflow-hidden relative shadow-inner">
                    {isWebcamOn ? (
                      <video ref={webcamRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <div className="text-center space-y-3">
                          <VideoOff className="h-12 w-12 mx-auto opacity-50" />
                          <p className="font-medium">Camera Off</p>
                        </div>
                      </div>
                    )}
                    {isRecording && (
                      <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        REC {formatTime(recordingSeconds)}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Controls */}
              <Card className="border-border shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Recording Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={isWebcamOn ? "outline" : "destructive"}
                      onClick={toggleWebcam}
                      className="h-11"
                    >
                      {isWebcamOn ? <Video className="h-4 w-4 mr-2" /> : <VideoOff className="h-4 w-4 mr-2" />}
                      {isWebcamOn ? 'Video' : 'Video Off'}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={toggleQvMute}
                      className="h-11"
                    >
                      {qvMuted ? <VolumeX className="h-4 w-4 mr-2" /> : <Volume2 className="h-4 w-4 mr-2" />}
                      {qvMuted ? 'Unmute' : 'Audio'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={startRecording}
                      disabled={isRecording || transcribing}
                      className="h-11 bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      Start
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={stopRecordingAndTranscribe}
                      disabled={!isRecording}
                      className="h-11"
                    >
                      <MicOff className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  </div>

                  {transcribing && (
                    <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 rounded-lg">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium text-blue-600">Transcribing...</span>
                    </div>
                  )}

                  {lastAudioUrl && !isRecording && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Latest Recording</p>
                      <div className="flex items-center gap-2 p-2 rounded-lg border">
                        <audio src={lastAudioUrl} controls className="w-full" style={{ height: '32px' }} />
                        <a href={lastAudioUrl} download={`answer_${currentQuestionIndex + 1}.webm`}>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Timers */}
              <Card className="border-border shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Time Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Time</span>
                      <span className="text-lg font-mono font-bold text-primary">{formatTime(timeRemaining)}</span>
                    </div>
                    <Progress value={(900 - timeRemaining) / 900 * 100} className="h-2" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Question Time</span>
                    <span className="text-lg font-mono font-bold">{formatTime(questionTime)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Progress */}
              <Card className="border-border shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Question {currentQuestionIndex + 1} of {questions.length}</span>
                    <span className="font-bold text-primary">{Math.round((currentQuestionIndex + 1) / questions.length * 100)}%</span>
                  </div>
                  <Progress value={(currentQuestionIndex + 1) / questions.length * 100} className="h-3" />
                </CardContent>
              </Card>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-2 space-y-6 opacity-0 animate-slide-in-right delay-200">
              {/* Question Video */}
              <Card className="border-border video-card shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">AI Interviewer Question</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="relative rounded-xl overflow-hidden bg-black">
                    <video
                      key={currentQuestion.id}
                      ref={questionVideoRef}
                      src={currentQuestion.video}
                      playsInline
                      className="w-full object-contain"
                      style={{ height: '400px' }}
                      muted={qvMuted}
                      onLoadedMetadata={() => { if (!isActive) return; playQuestionVideo({ preferSound: !qvMuted }); }}
                      onEnded={() => { questionVideoRef.current?.pause(); setQvPlaying(false); }}
                      onPlay={() => setQvPlaying(true)}
                      onPause={() => setQvPlaying(false)}
                      onError={() => { toast.error(`Video error`); }}
                    />
                    <div className="absolute bottom-3 right-3 flex gap-2">
                      {!qvPlaying ? (
                        <Button size="sm" variant="secondary" onClick={() => playQuestionVideo({ preferSound: !qvMuted })} className="shadow-lg">
                          <Play className="h-4 w-4 mr-1" /> Play
                        </Button>
                      ) : (
                        <Button size="sm" variant="secondary" onClick={pauseQuestionVideo} className="shadow-lg">
                          <Pause className="h-4 w-4 mr-1" /> Pause
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Question & Answer */}
              <Card className="border-border shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={chipColor(chipType(currentQuestion.text))}>
                          {chipType(currentQuestion.text)}
                        </Badge>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          {selectedDifficulty === 'entry' ? 'junior' : selectedDifficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">
                        Question {currentQuestionIndex + 1} of {questions.length}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-lg leading-relaxed">{currentQuestion.text}</p>

                  <div className="space-y-2">
                    <Textarea
                      rows={6}
                      placeholder="Type your answer here, or record and transcribe..."
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      className="resize-none"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{currentAnswer.length} characters</span>
                      {currentQuestionIndex < questions.length - 1 ? (
                        <Button onClick={collectAnswerAndMaybeFinish} className="shadow-lg hover:shadow-xl transition-all duration-300">
                          Next Question <SkipForward className="h-4 w-4 ml-2" />
                        </Button>
                      ) : (
                        <Button onClick={collectAnswerAndMaybeFinish} className="bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-300">
                          Finish & Analyze
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Start Modal */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-lg" />
          <Card className="relative w-1/2 max-w-xl opacity-0 animate-scale-in glass shadow-2xl rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold gradient-title flex items-center gap-2">
                Start Your Mock Interview
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Instruction box */}
              <div className="p-6 rounded-xl border border-border/60 bg-background/70 backdrop-blur-md shadow-inner space-y-4">
                <p className="text-sm font-medium text-foreground">
                  <strong>How it works:</strong>
                </p>

                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      1
                    </span>
                    <span className="flex-1">
                      Grant camera and microphone permissions when prompted
                    </span>
                  </li>

                  <li className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      2
                    </span>
                    <span className="flex-1">
                      Click <strong>“Start Recording”</strong> to capture your answer
                    </span>
                  </li>

                  <li className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      3
                    </span>
                    <span className="flex-1">
                      Click <strong>“Stop Recording”</strong> to automatically transcribe
                    </span>
                  </li>

                  <li className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      4
                    </span>
                    <span className="flex-1">
                      Review, edit, and submit your answer
                    </span>
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-4 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowStartModal(false)}
                  className="action-card"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStartInterview}
                  className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 shadow-lg action-card"
                >
                  Start Interview
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}

export default MockInterviewSession;