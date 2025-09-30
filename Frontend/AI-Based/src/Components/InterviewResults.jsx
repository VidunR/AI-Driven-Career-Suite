import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Flag, CheckCircle2, XCircle, Sparkles, TrendingUp, Target } from "lucide-react";
import axios from "axios";

// --- Inline UI components ---
const Card = ({ className = "", children, ...props }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`} {...props}>
    {children}
  </div>
);
const CardHeader = ({ className = "", children, ...props }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>{children}</div>
);
const CardTitle = ({ className = "", children, ...props }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props}>{children}</h3>
);
const CardContent = ({ className = "", children, ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>{children}</div>
);
const Button = ({ className = "", variant = "default", size = "default", children, ...props }) => {
  const base = "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  };
  const sizes = { default: "h-10 px-4 py-2", sm: "h-9 rounded-md px-3", lg: "h-11 rounded-md px-8", icon: "h-10 w-10" };
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>;
};
const Badge = ({ className = "", variant = "default", children, ...props }) => {
  const base = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  const variants = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground",
  };
  return <div className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</div>;
};
const Progress = ({ className = "", value = 0, ...props }) => (
  <div className={`relative h-4 w-full overflow-hidden rounded-full bg-secondary ${className}`} {...props}>
    <div className="h-full bg-primary transition-all" style={{ width: `${Math.max(0, Math.min(100, value || 0))}%` }} />
  </div>
);
const Separator = ({ className = "", orientation = "horizontal", ...props }) => (
  <div className={`shrink-0 bg-border ${orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]"} ${className}`} {...props} />
);

// Animation styles component
const AnimationStyles = () => (
  <style>{`
    @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
    @keyframes slideInFromTop { from { opacity: 0; transform: translateY(-1rem) } to { opacity: 1; transform: translateY(0) } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.97) } to { opacity: 1; transform: scale(1) } }
    @keyframes float { 0%,100% { transform: translateY(0px) } 50% { transform: translateY(-8px) } }
    @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }

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
    .action-card { 
      transition: transform .35s cubic-bezier(.22,.61,.36,1), box-shadow .35s, background .35s; 
    }
    .action-card:hover { 
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    }
    .gradient-title {
      background: linear-gradient(135deg, #8b5cf6 0%, #22d3ee 50%, #ec4899 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .score-glow {
      text-shadow: 0 0 30px rgba(139, 92, 246, 0.5);
    }
  `}</style>
);

// Map DB -> UI
function mapDbResultToUi(db) {
  if (!db) return null;

  const fx = db.feedbackJson && typeof db.feedbackJson === "object" ? db.feedbackJson : null;

  if (fx) {
    return {
      jobRole: db?.interviewJobRole?.jobRoleName || fx.jobRole || "Role",
      perQuestion: Array.isArray(fx.perQuestion) ? fx.perQuestion : [],
      overall: {
        totalScore:
          Number(fx?.overall?.totalScore) ??
          Number(db?.interviewScore) ??
          Number(db?.completedPercentage) ??
          0,
        summary: fx?.overall?.summary || "",
        strengths: fx?.overall?.strengths || [],
        improvements: fx?.overall?.improvements || [],
      },
    };
  }

  const jobRole = db?.interviewJobRole?.jobRoleName || "Role";
  const list = Array.isArray(db?.interviewAnalysis) ? db.interviewAnalysis : [];

  const perQuestion = list.map((row, idx) => ({
    id: `q${idx + 1}`,
    question: row?.videoQuestion?.question || "",
    answerSummary: row?.feedback || "",
    score: typeof row?.scorePerQuestion === "number" ? Math.round(row.scorePerQuestion) : 0,
    strengths: [],
    improvements: [],
    flags: { off_topic: false, profanity: false },
  }));

  const scores = perQuestion.map(q => q.score).filter(n => typeof n === "number");
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const overallScore = typeof db?.interviewScore === "number" ? Math.round(db.interviewScore) : avg;

  const areas = Array.isArray(db?.interview_performance_breakdown) ? db.interview_performance_breakdown : [];
  const strengths = areas
    .filter(a => (a?.performance_breakdown?.preformanceScore ?? 0) >= 75)
    .map(a => a?.performance_breakdown?.preformanceName)
    .filter(Boolean)
    .slice(0, 5);
  const improvements = areas
    .filter(a => (a?.performance_breakdown?.preformanceScore ?? 0) < 60)
    .map(a => a?.performance_breakdown?.preformanceName)
    .filter(Boolean)
    .slice(0, 5);

  return {
    jobRole,
    perQuestion,
    overall: {
      totalScore: overallScore,
      summary: "",
      strengths,
      improvements,
    },
  };
}

const gradeBadge = (score) => {
  if (score >= 90) return { text: "Outstanding", cls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" };
  if (score >= 80) return { text: "Excellent", cls: "bg-green-500/20 text-green-300 border-green-500/40" };
  if (score >= 70) return { text: "Good", cls: "bg-blue-500/20 text-blue-300 border-blue-500/40" };
  if (score >= 60) return { text: "Fair", cls: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40" };
  return { text: "Needs Improvement", cls: "bg-red-500/20 text-red-300 border-red-500/40" };
};

export function InterviewResults() {
  const location = useLocation();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const incomingFeedback = location.state?.feedback;
  const interviewId = location.state?.interviewId;

  useEffect(() => {
    let abort = false;

    async function fetchFromDb(id) {
      try {
        setLoading(true);
        const token = localStorage.getItem("jwtToken");

        const r = await axios.get(`http://localhost:5000/interviewresults/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (abort) return;
        setData(mapDbResultToUi(r.data));
      } catch (e) {
        if (abort) return;
        const status = e?.response?.status;
        if (status === 404) {
          console.error("Interview results not found");
        } else {
          console.error("Fetch interview result error:", e);
        }
        setData(null);
      } finally {
        if (!abort) setLoading(false);
      }
    }

    if (incomingFeedback && typeof incomingFeedback === "object") {
      setData(incomingFeedback);
      return;
    }
    if (interviewId) {
      fetchFromDb(interviewId);
      return;
    }
    setData(null);

    return () => { abort = true; };
  }, [incomingFeedback, interviewId]);

  const role = data?.jobRole || "Role";
  const overall = data?.overall || {};
  const perQuestion = Array.isArray(data?.perQuestion) ? data.perQuestion : [];
  const badge = gradeBadge(overall.totalScore ?? 0);

  if (loading) {
    return (
      <>
        <AnimationStyles />
        <div className="min-h-screen p-4 md:p-8 calm-bg">
          <div className="max-w-5xl mx-auto space-y-8 text-center animate-fade-in">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground">Loading your results…</p>
          </div>
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <AnimationStyles />
        <div className="min-h-screen p-4 md:p-8 calm-bg">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center gap-4 opacity-0 animate-slide-in-top">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="action-card">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <h1 className="text-3xl font-bold gradient-title">Interview Results</h1>
            </div>
            <Card className="glass action-card opacity-0 animate-scale-in">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
                  <RefreshCw className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">No Results Found</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Run a mock interview, or open results from your interview history.
                </p>
                <Button onClick={() => navigate("/mock-interview-setup")} className="action-card">
                  <RefreshCw className="h-4 w-4 mr-2" /> Start New Interview
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AnimationStyles />
      <div className="min-h-screen p-4 md:p-8 calm-bg">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 opacity-0 animate-slide-in-top">
            <div className="flex items-center gap-4 mt-2">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="action-card">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold gradient-title">Interview Results</h1>
                <p className="text-lg text-muted-foreground mt-1 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  {role}
                </p>
              </div>
            </div>
            
          </div>

          {/* Overall Score Card */}
          <Card className="glass action-card opacity-0 animate-scale-in overflow-hidden" style={{ animationDelay: '0.1s' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10 pointer-events-none" />
            <CardContent className="p-8 relative">
              <div className="flex flex-col lg:flex-row lg:items-center gap-8 mb-8 mt-4">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-7xl font-black score-glow leading-none mb-2">
                      {overall.totalScore ?? "--"}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Overall Score</div>
                  </div>
                  <div className="space-y-3">
                    <Badge variant="secondary" className={`${badge.cls} border px-4 py-2 font-medium text-sm`}>
                      {badge.text}
                    </Badge>
                    <div className="w-48">
                      <Progress value={overall.totalScore ?? 0} className="h-3" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 lg:pl-8 lg:border-l border-border/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-5 w-5 text-primary animate-float" />
                    <h3 className="font-semibold">Performance Summary</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {overall.summary || "Great job completing the interview! Review the detailed feedback below to understand your performance."}
                  </p>
                </div>
              </div>

              <Separator className="my-8 bg-border/30" />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    </div>
                    <h4 className="font-semibold">Top Strengths</h4>
                  </div>
                  <div className="glass rounded-xl p-6 border border-emerald-500/20">
                    {(overall.strengths?.length ? (
                      <ul className="space-y-3">
                        {overall.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-3 text-muted-foreground">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground/60 italic">No specific strengths identified</p>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-yellow-400" />
                    </div>
                    <h4 className="font-semibold">Areas for Improvement</h4>
                  </div>
                  <div className="glass rounded-xl p-6 border border-yellow-500/20">
                    {(overall.improvements?.length ? (
                      <ul className="space-y-3">
                        {overall.improvements.map((s, i) => (
                          <li key={i} className="flex items-start gap-3 text-muted-foreground">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground/60 italic">No specific improvements suggested</p>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Per-Question Feedback */}
          <Card className="glass action-card opacity-0 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="pb-6">
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="w-1 h-7 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full" />
                Question-by-Question Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {(!perQuestion || perQuestion.length === 0) && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No question-level feedback provided.</p>
                </div>
              )}

              {perQuestion?.map((q, idx) => {
                const qb = gradeBadge(q.score ?? 0);
                const hasFlags = q?.flags?.off_topic || q?.flags?.profanity;
                return (
                  <div 
                    key={q.id || idx} 
                    className="glass rounded-xl p-6 action-card"
                    style={{ animation: 'fadeIn .5s ease-out forwards', animationDelay: `${0.05 * (idx + 1)}s`, opacity: 0 }}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">Question {idx + 1}</Badge>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{q.question || "—"}</p>
                      </div>
                      <div className="flex items-center gap-4 lg:text-right">
                        <div>
                          <div className="text-4xl font-bold score-glow">{q.score ?? "--"}</div>
                          <div className="text-xs text-muted-foreground">Score</div>
                        </div>
                        <Badge variant="secondary" className={`${qb.cls} border px-3 py-1.5 text-xs`}>
                          {qb.text}
                        </Badge>
                      </div>
                    </div>

                    <div className="mb-6">
                      <Progress value={q.score ?? 0} className="h-2" />
                    </div>

                    <div className="mb-6">
                      <h5 className="font-medium mb-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Answer Analysis
                      </h5>
                      <div className="glass rounded-lg p-4 border border-border/30">
                        <p className="text-muted-foreground leading-relaxed">
                          {q.answerSummary || "No summary for this answer."}
                        </p>
                      </div>
                    </div>

                    {hasFlags && (
                      <div className="mb-6">
                        <div className="glass border border-red-500/30 rounded-lg p-4 bg-red-500/5">
                          <div className="flex items-center gap-2 mb-3">
                            <Flag className="h-4 w-4 text-red-400" />
                            <span className="font-medium text-red-300">Content Flags</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {q?.flags?.off_topic && (
                              <Badge variant="destructive" className="gap-1 bg-red-500/20 text-red-400 border-red-500/40">
                                <XCircle className="h-3 w-3" /> Off-topic
                              </Badge>
                            )}
                            {q?.flags?.profanity && (
                              <Badge variant="destructive" className="gap-1 bg-red-500/20 text-red-400 border-red-500/40">
                                <XCircle className="h-3 w-3" /> Profanity
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium mb-3 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Strengths
                        </h5>
                        <div className="glass rounded-lg p-4 border border-emerald-500/20">
                          {q.strengths?.length ? (
                            <ul className="space-y-2">
                              {q.strengths.map((s, i) => (
                                <li key={i} className="flex items-start gap-2 text-muted-foreground">
                                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
                                  <span className="text-sm">{s}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-muted-foreground/60 text-sm italic">No specific strengths identified</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium mb-3 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-yellow-400" /> Improvements
                        </h5>
                        <div className="glass rounded-lg p-4 border border-yellow-500/20">
                          {q.improvements?.length ? (
                            <ul className="space-y-2">
                              {q.improvements.map((s, i) => (
                                <li key={i} className="flex items-start gap-2 text-muted-foreground">
                                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                                  <span className="text-sm">{s}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-muted-foreground/60 text-sm italic">No specific improvements suggested</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export default InterviewResults;