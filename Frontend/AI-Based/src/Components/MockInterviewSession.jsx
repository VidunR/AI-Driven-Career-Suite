import React, { useState, useEffect, useRef } from 'react';
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
import { getQuestionsFor } from '../data/questionBank'; // ← only this

export function MockInterviewSession() {
  const [showStartModal, setShowStartModal] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(900);
  const [questionTime, setQuestionTime] = useState(0);

  // mic/webcam state
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
  const audioRecordStreamRef = useRef(null); // audio-only recording
  const previewStreamRef = useRef(null);     // preview stream
  const chunksRef = useRef([]);

  const recordTimerRef = useRef(null);
  const [lastAudioBlob, setLastAudioBlob] = useState(null);
  const [lastAudioUrl, setLastAudioUrl] = useState(null);

  // from setup
  const jobRole = location.state?.jobRole || 'Software Engineer';
  const selectedDifficulty = (() => {
    const raw = String(location.state?.difficulty || 'mid').toLowerCase();
    if (raw.includes('entry') || raw.includes('junior')) return 'entry';
    if (raw.includes('senior')) return 'senior';
    return 'mid';
  })();

  const currentQuestion = questions[currentQuestionIndex];

  // Load questions strictly by difficulty
  useEffect(() => {
    const selected = getQuestionsFor(jobRole, selectedDifficulty, 5); // no mixed mode
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, isActive]);

  useEffect(() => {
    return () => { if (lastAudioUrl) URL.revokeObjectURL(lastAudioUrl); };
  }, [lastAudioUrl]);

  const handleStartInterview = async () => {
    try {
      let pv = null;
      try {
        // Try both first
        pv = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch {
        // Fallback: try only audio
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

  // ===== Recording controls =====
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

  // ===== Transcription =====
  async function sendForTranscription(blob) {
    try {
      setTranscribing(true);
      const form = new FormData();
      form.append('audio', blob, 'answer.webm');
      form.append('language', 'en');

      const token = localStorage.getItem('jwtToken');
      const r = await fetch('http://localhost:5000/interview/transcribe', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form
      });

      const data = await r.json();
      if (!r.ok) {
        console.error('Transcribe error:', data);
        toast.error(data?.detail || data?.error || 'Transcription failed.');
        return;
      }
      setCurrentAnswer(data.text || '');
      toast.success('Transcription ready. Review and submit.');
    } catch (e) {
      console.error(e);
      toast.error('Transcription request failed.');
    } finally {
      setTranscribing(false);
    }
  }

  // ===== Interview flow =====

  // Ensures we never submit an empty responses array
  const finalizeResponsesBeforeSubmit = () => {
    const trimmed = currentAnswer.trim();

    // If there are no saved responses and no current answer, add a blank entry for the current question
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

    // If there's a current answer not yet saved, append it now
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

    // Always push an entry (even if the answer is empty) to avoid empty responses[]
    const entry = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.text,
      answer: trimmed, // can be ""
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
      endInterview(nextResponses); // pass final answers
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
      const difficulty = (location.state?.difficulty || "mid"); // optional but stored on server

      // Log for debugging
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

  // End Interview button should also ensure we don't send an empty array
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

  if (!currentQuestion) return <div className="flex items-center justify-center h-screen">Loading…</div>;

  if (interviewCompleted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">✅</div>
          <h2 className="text-2xl font-bold">Interview Completed!</h2>
          <p className="text-muted-foreground">Generating feedback…</p>
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
                  REC&nbsp;{formatTime(recordingSeconds)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-center">
              <Button
                variant="outline"
                onClick={toggleWebcam}
                className={`${!isWebcamOn ? 'bg-red-100 text-red-800' : ''} w-full text-sm`}
              >
                {isWebcamOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </Button>

              <Button
                variant="default"
                onClick={startRecording}
                disabled={isRecording || transcribing}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white text-sm px-3"
                title="Start Recording"
              >
                <Mic className="h-4 w-4 mr-2" /> Start
              </Button>

              <Button
                variant="secondary"
                onClick={stopRecordingAndTranscribe}
                disabled={!isRecording}
                className="w-full bg-gray-100 text-sm px-3 whitespace-normal"
                title="Stop Recording and Transcribe"
              >
                <MicOff className="h-4 w-4 mr-2" /> Stop Recording
              </Button>

              <Button
                variant="outline"
                onClick={() => toggleQvMute()}
                className="w-full"
              >
                {qvMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>

              <div className="col-span-2 sm:col-span-4 text-xs text-muted-foreground">
                {transcribing
                  ? "Transcribing…"
                  : (isRecording ? "Recording in progress…" : "Tip: Record your answer, then stop to auto-transcribe.")
                }
              </div>
            </div>

            {lastAudioUrl && !isRecording && (
              <div className="flex items-center justify-between rounded-md border p-2">
                <audio src={lastAudioUrl} controls className="w-full mr-2" />
                <a
                  href={lastAudioUrl}
                  download={`answer_${currentQuestionIndex + 1}.webm`}
                  className="inline-flex"
                  title="Download recording"
                >
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" /> Download
                  </Button>
                </a>
              </div>
            )}
          </CardContent>
        </Card>


        {/* Timers */}
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

        {/* Progress */}
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
                <p className="text-sm text-muted-foreground">{jobRole} — Mock Interview</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleEndInterviewClick}>End Interview</Button>
            </div>
          </div>
        </div>

        {/* Question Video */}
        <div className="p-4 border-b border-border">
          <Card>
            <CardContent className="p-3">
              <div className="w-full rounded overflow-hidden relative">
                <div className="w-full" style={{ height: 400 }}>
                  <video
                    key={currentQuestion.id}
                    ref={questionVideoRef}
                    src={currentQuestion.video}
                    playsInline
                    className="w-full h-full object-contain bg-black rounded"
                    muted={qvMuted}
                    onLoadedMetadata={() => { if (!isActive) return; playQuestionVideo({ preferSound: !qvMuted }); }}
                    onEnded={() => { questionVideoRef.current?.pause(); setQvPlaying(false); }}
                    onPlay={() => setQvPlaying(true)}
                    onPause={() => setQvPlaying(false)}
                    onError={() => { toast.error(`Video not found: ${currentQuestion.video}`); }}
                  />
                </div>
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

        {/* Question + Answer */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={chipColor(chipType(currentQuestion.text))}>{chipType(currentQuestion.text)}</Badge>
                    {/* Show selected difficulty text for clarity */}
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {selectedDifficulty === 'entry' ? 'junior' : selectedDifficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </CardTitle>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Expected: {Math.floor(120 / 60)}m
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed mb-4">{currentQuestion.text}</p>

              <Textarea
                rows={5}
                placeholder="Type your answer, or record and auto-transcribe…"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
              />
              <div className="flex justify-between mt-2">
                <span className="text-sm text-muted-foreground">{currentAnswer.length} chars</span>
                {currentQuestionIndex < questions.length - 1 ? (
                  <Button onClick={collectAnswerAndMaybeFinish}>
                    Next Question <SkipForward className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={collectAnswerAndMaybeFinish} className="bg-green-600 hover:bg-green-700">
                    Finish & Analyze
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Start Modal */}
      {showStartModal && (
        <div className="fixed inset-0 z-50">
          {/* darker backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <CardTitle className="text-xl">Start Mock Interview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  When you click <b>Start</b>, your browser will ask to use your <b>camera</b> and <b>microphone</b>.
                  You can then <b>Start Recording</b> an answer and <b>Stop & Transcribe</b> to fill the text box automatically.
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
