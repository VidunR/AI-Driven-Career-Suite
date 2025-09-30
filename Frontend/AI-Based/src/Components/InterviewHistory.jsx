import React, { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Progress } from "./ui/progress";
import {
  Search,
  Eye,
  Trash2,
  Play,
  Sparkles,
  Timer,
  CalendarDays,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/* ----------------------- Shared Animations (Dashboard parity) ---------------------- */
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
      position: relative;
      overflow: hidden;
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

    .row-card { transition: background .3s, transform .25s }
    .row-card:hover { transform: translateY(-3px) }
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

    .soft-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    }
  `}</style>
);

export function InterviewHistory({ user, onNavigate }) {
  const navigate = useNavigate();

  // helper: use onNavigate if it's a function, else fall back to router navigate
  const go = (path) => {
    if (typeof onNavigate === "function") {
      onNavigate(path);
    } else {
      navigate(path.startsWith("/") ? path : `/${path}`);
    }
  };

  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [jobRoleFilter, setJobRoleFilter] = useState(""); // filter by jobRoleName
  const [isLoading, setIsLoading] = useState(true);

  // Keep your original list
  const jobRoles = [
    "Software Engineer",
    "Cybersecurity Specialist",
    "Accountant",
    "Project Manager",
    "Digital Marketer",
  ];

  // Fetch interview history from backend
  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("jwtToken"); // use stored token
        const res = await axios.get("http://localhost:5000/interviewhistory", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Map backend data to frontend structure (unchanged)
        const mappedSessions = res.data.map((s) => ({
          id: s.interviewId,
          date: new Date(s.interviewDate),
          position: s.jobRoleName || "N/A",
          company: "N/A", // placeholder
          type: "technical", // placeholder
          duration: (s.interviewDuration || 0) * 60,
          completedPercent: s.completedPercentage || 0,
          status: s.isCompleted ? "completed" : "partial",
          questionsCompleted: Math.round(((s.completedPercentage || 0) / 100) * 5),
          totalQuestions: 5,
        }));

        setSessions(mappedSessions);
        setFilteredSessions(mappedSessions);
      } catch (err) {
        console.error("Error fetching interview history:", err);
        toast.error("Failed to load interview history.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // Filtering logic (unchanged)
  useEffect(() => {
    let filtered = [...sessions];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((s) =>
        (s.position || "").toLowerCase().includes(q)
      );
    }

    if (jobRoleFilter && jobRoleFilter !== "all") {
      filtered = filtered.filter((s) => s.position === jobRoleFilter);
    }

    setFilteredSessions(filtered);
  }, [searchQuery, jobRoleFilter, sessions]);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getcompletedPercentColor = (completedPercent) => {
    if (completedPercent >= 80) return "text-green-600";
    if (completedPercent >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const deleteInterview = async (interviewId) => {
    try {
      const token = localStorage.getItem("jwtToken");

      await axios.delete("http://localhost:5000/interviewhistory", {
        headers: { Authorization: `Bearer ${token}` },
        data: { interviewID: interviewId },
      });

      // update state after success
      setSessions((prev) => prev.filter((s) => s.id !== interviewId));
      toast.success("Interview session deleted");
    } catch (err) {
      console.error("Delete interview failed:", err);
      toast.error("Failed to delete interview");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 calm-bg">
        <AnimationStyles />
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-10 h-10 border-2 border-violet-500/80 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading interview history...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AnimationStyles />

      <div className="calm-bg min-h-[calc(100vh-5rem)]">
        <div className="p-6 max-w-6xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-start sm:items-center justify-between gap-4 opacity-0 animate-slide-in-top">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold gradient-title flex items-center gap-2">
                <Sparkles className="w-6 h-6 animate-float" />
                Interview History
              </h1>
              <p className="text-muted-foreground">
                Review your past mock interview sessions
              </p>
            </div>
            <Button onClick={() => go("mock-interview-setup")} className="action-card animate-glow">
              <Play className="h-4 w-4 mr-2" />
              New Interview
            </Button>
          </div>

          {/* Filters */}
          <div className="opacity-0 animate-scale-in delay-100">
            <Card className="glass action-card">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by job role..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={jobRoleFilter} onValueChange={setJobRoleFilter}>
                    <SelectTrigger className="w-full md:w-60">
                      <SelectValue placeholder="Filter by Job Role" />
                    </SelectTrigger>
                    <SelectContent className="glass">
                      <SelectItem value="all">All Roles</SelectItem>
                      {jobRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div className="opacity-0 animate-slide-in-bottom delay-200">
            <Card className="glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Total Interviews: {sessions.length}
                  </h3>
                  {/* Calm chips */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="chip">
                      <CalendarDays className="w-3.5 h-3.5 mr-1" />
                      Most recent:{" "}
                      {sessions.length
                        ? new Date(
                            Math.max(...sessions.map((s) => s.date.getTime()))
                          ).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                          })
                        : "—"}
                    </Badge>
                    <Badge variant="outline" className="chip">
                      <Timer className="w-3.5 h-3.5 mr-1" />
                      Avg. duration:{" "}
                      {sessions.length
                        ? (() => {
                            const avg =
                              sessions.reduce((a, b) => a + b.duration, 0) /
                              sessions.length;
                            return formatDuration(Math.round(avg));
                          })()
                        : "—"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sessions List */}
          <div className="space-y-4">
            {filteredSessions.map((interview, idx) => (
              <Card
                key={interview.id}
                className="glass row-card opacity-0 animate-slide-in-right"
                style={{ animationDelay: `${0.08 * (idx + 1)}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-6">
                    {/* Left: title + chips */}
                    <div className="space-y-3 min-w-0">
                      <h3 className="font-semibold text-lg truncate">
                        {interview.position}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <Badge variant="outline" className="chip capitalize">
                          {interview.type}
                        </Badge>
                        <Badge
                          variant={
                            interview.status === "completed" ? "default" : "secondary"
                          }
                          className="chip"
                        >
                          {interview.status}
                        </Badge>
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <CalendarDays className="w-4 h-4" />
                          {interview.date.toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                          })}
                        </span>
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Timer className="w-4 h-4" />
                          {formatDuration(interview.duration)}
                        </span>
                        <span
                          className={`${getcompletedPercentColor(
                            interview.completedPercent
                          )} font-medium`}
                        >
                          {interview.completedPercent}%
                        </span>
                        <span>
                          {/* Progress to add calm feedback */}
                          <div className="pt-1">
                            <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                              <span>
                                Questions: {interview.questionsCompleted}/
                                {interview.totalQuestions}
                              </span>
                            </div>
                            <Progress value={interview.completedPercent} className="h-2" />
                          </div>
                        </span>
                      </div>
                    </div>

                    {/* Right: actions */}
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="action-card"
                        onClick={() =>
                          navigate("/interview-results", {
                            state: { interviewId: interview.id },
                          })
                        }
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Results
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="action-card"
                        onClick={() => deleteInterview(interview.id)}
                        title="Delete session"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredSessions.length === 0 && (
              <Card className="glass opacity-0 animate-fade-in delay-200">
                <CardContent className="p-10 text-center">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 shimmer" />
                  <p className="text-muted-foreground">No interview sessions found.</p>
                  <Button className="mt-4 action-card" onClick={() => go("mock-interview-setup")}>
                    Start Your First Interview
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default InterviewHistory;
