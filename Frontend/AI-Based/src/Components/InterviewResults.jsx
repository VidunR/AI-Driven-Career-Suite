import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Flag, CheckCircle2, XCircle } from "lucide-react";

// --- Inline UI components (same as yours) ---
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
// --- /UI ---

/** Maps DB result from GET /interviewresult/:id into the UI shape */
/** Maps DB result from GET /interviewresult/:id into the UI shape */
function mapDbResultToUi(db) {
  if (!db) return null;

  // If the server returns the saved model JSON, prefer it.
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

  // Fallback if feedbackJson is missing: build from interviewAnalysis rows
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
  if (score >= 90) return { text: "Outstanding", cls: "bg-emerald-900/20 text-emerald-400 border-emerald-800" };
  if (score >= 80) return { text: "Excellent", cls: "bg-green-900/20 text-green-400 border-green-800" };
  if (score >= 70) return { text: "Good", cls: "bg-blue-900/20 text-blue-400 border-blue-800" };
  if (score >= 60) return { text: "Fair", cls: "bg-yellow-900/20 text-yellow-400 border-yellow-800" };
  return { text: "Needs Improvement", cls: "bg-red-900/20 text-red-400 border-red-800" };
};

export function InterviewResults() {
  const location = useLocation();
  const navigate = useNavigate();

  const [data, setData] = useState(null);      // unified UI shape
  const [loading, setLoading] = useState(false);
  const incomingFeedback = location.state?.feedback;
  const interviewId = location.state?.interviewId;

  // 1) If feedback is passed directly from evaluate → use it
  // 2) Otherwise, if we only have interviewId (from History) → fetch DB results and map
  useEffect(() => {
  let abort = false;
  async function fetchFromDb(id) {
    try {
      setLoading(true);
      const token = localStorage.getItem("jwtToken");
      const r = await fetch(`http://localhost:5000/interviewresult/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const dbJson = await r.json();
      if (abort) return;

      if (!r.ok) {
        console.error("Fetch interview result failed:", dbJson);
        setData(null);
        return;
      }
      setData(mapDbResultToUi(dbJson));
    } catch (e) {
      console.error("Fetch interview result error:", e);
      if (!abort) setData(null);
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
}, [incomingFeedback, interviewId]);


  const role = data?.jobRole || "Role";
  const overall = data?.overall || {};
  const perQuestion = Array.isArray(data?.perQuestion) ? data.perQuestion : [];
  const badge = gradeBadge(overall.totalScore ?? 0);

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: '#111827' }}>
        <div className="max-w-4xl mx-auto space-y-8 text-center text-slate-300">Loading results…</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: '#111827' }}>
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="hover:bg-slate-700/50 text-slate-300 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <h1 className="text-3xl font-bold text-white">Interview Results</h1>
          </div>
          <Card className="shadow-2xl border-slate-700 bg-slate-800/90 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <RefreshCw className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">No Results Found</h3>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                Run a mock interview, or open results from your interview history.
              </p>
              <Button onClick={() => navigate("/mock-interview-setup")} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 shadow-lg">
                <RefreshCw className="h-4 w-4 mr-2" /> Start New Interview
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: '#111827' }}>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="hover:bg-slate-700/50 text-slate-300 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Interview Results</h1>
              <p className="text-lg text-slate-400 mt-1">{role}</p>
            </div>
          </div>
          <Button size="lg" onClick={() => navigate("/mock-interview-setup")} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 shadow-lg">
            <RefreshCw className="h-4 w-4 mr-2" /> New Interview
          </Button>
        </div>

        {/* Overall Score Card */}
        <Card className="shadow-2xl border-slate-700 bg-slate-800/90 backdrop-blur-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2" />
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-center gap-8 mb-8">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-6xl font-black text-white leading-none mb-2">
                    {overall.totalScore ?? "--"}
                  </div>
                  <div className="text-sm text-slate-400 uppercase tracking-wide font-medium">Overall Score</div>
                </div>
                <div className="space-y-3">
                  <Badge variant="secondary" className={`${badge.cls} border px-4 py-2 font-medium`}>{badge.text}</Badge>
                  <div className="w-48"><Progress value={overall.totalScore ?? 0} className="h-3 bg-slate-700" /></div>
                </div>
              </div>
              <div className="flex-1 lg:pl-8">
                <h3 className="font-semibold text-white mb-3">Performance Summary</h3>
                <p className="text-slate-300 leading-relaxed">{overall.summary || "No overall summary provided."}</p>
              </div>
            </div>

            <Separator className="my-8 bg-slate-600" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <h4 className="font-semibold text-white">Top Strengths</h4>
                </div>
                <div className="bg-emerald-900/20 rounded-lg p-6 border border-emerald-800/30">
                  {(overall.strengths?.length ? (
                    <ul className="space-y-3">
                      {overall.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-300">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2.5 flex-shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 italic">No specific strengths identified</p>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-yellow-400" />
                  <h4 className="font-semibold text-white">Areas for Improvement</h4>
                </div>
                <div className="bg-yellow-900/20 rounded-lg p-6 border border-yellow-800/30">
                  {(overall.improvements?.length ? (
                    <ul className="space-y-3">
                      {overall.improvements.map((s, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-300">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2.5 flex-shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 italic">No specific improvements suggested</p>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Per-Question Feedback */}
        <Card className="shadow-2xl border-slate-700 bg-slate-800/90 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <div className="w-1 h-6 bg-blue-600 rounded-full" /> Question-by-Question Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {(!perQuestion || perQuestion.length === 0) && (
              <div className="text-center py-12">
                <p className="text-slate-500">No question-level feedback provided.</p>
              </div>
            )}

            {perQuestion?.map((q, idx) => {
              const qb = gradeBadge(q.score ?? 0);
              const hasFlags = q?.flags?.off_topic || q?.flags?.profanity;
              return (
                <div key={q.id || idx} className="bg-slate-700/30 rounded-xl border border-slate-600 p-6 hover:shadow-lg hover:bg-slate-700/40 transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-2">Question {idx + 1}</h4>
                      <p className="text-slate-300">{q.question || "—"}</p>
                    </div>
                    <div className="flex items-center gap-4 lg:text-right">
                      <div>
                        <div className="text-3xl font-bold text-white">{q.score ?? "--"}</div>
                        <div className="text-sm text-slate-400">Score</div>
                      </div>
                      <Badge variant="secondary" className={`${qb.cls} border px-3 py-1`}>{qb.text}</Badge>
                    </div>
                  </div>

                  <div className="mb-6"><Progress value={q.score ?? 0} className="h-2 bg-slate-600" /></div>

                  <div className="mb-6">
                    <h5 className="font-medium text-white mb-3">Answer Analysis</h5>
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                      <p className="text-slate-300 leading-relaxed">{q.answerSummary || "No summary for this answer."}</p>
                    </div>
                  </div>

                  {hasFlags && (
                    <div className="mb-6">
                      <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Flag className="h-4 w-4 text-red-400" />
                          <span className="font-medium text-red-300">Content Flags</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {q?.flags?.off_topic && (
                            <Badge variant="destructive" className="gap-1 bg-red-900/30 text-red-400 border-red-800">
                              <XCircle className="h-3 w-3" /> Off-topic
                            </Badge>
                          )}
                          {q?.flags?.profanity && (
                            <Badge variant="destructive" className="gap-1 bg-red-900/30 text-red-400 border-red-800">
                              <XCircle className="h-3 w-3" /> Profanity
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-white mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Strengths
                      </h5>
                      <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-800/30">
                        {q.strengths?.length ? (
                          <ul className="space-y-2">
                            {q.strengths.map((s, i) => (
                              <li key={i} className="flex items-start gap-2 text-slate-300">
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
                                <span className="text-sm">{s}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-slate-500 text-sm italic">No specific strengths identified</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-white mb-3 flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-yellow-400" /> Improvements
                      </h5>
                      <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-800/30">
                        {q.improvements?.length ? (
                          <ul className="space-y-2">
                            {q.improvements.map((s, i) => (
                              <li key={i} className="flex items-start gap-2 text-slate-300">
                                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                                <span className="text-sm">{s}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-slate-500 text-sm italic">No specific improvements suggested</p>
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
  );
}

export default InterviewResults;
