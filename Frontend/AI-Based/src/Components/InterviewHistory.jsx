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
import { Search, Eye, Trash2, Play } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

        // Map backend data to frontend structure
        const mappedSessions = res.data.map((s) => ({
        id: s.interviewId,
        date: new Date(s.interviewDate),
        position: s.jobRoleName || "N/A",
        company: "N/A", // still placeholder
        type: "technical",  // still placeholder
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

  // Filtering logic
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
          <p className="text-muted-foreground">
            Review your past mock interview sessions
          </p>
        </div>
        <Button onClick={() => go("mock-interview-setup")}>
          <Play className="h-4 w-4 mr-2" />
          New Interview
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
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
              <SelectTrigger className="w-60">
                <SelectValue placeholder="Filter by Job Role" />
              </SelectTrigger>
              <SelectContent>
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

      {/* Sessions List */}
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4">
              Total Interviews: {sessions.length}
            </h3>
          </CardContent>
        </Card>

        {filteredSessions.map((interview) => (
          <Card key={interview.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{interview.position}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <Badge variant="outline">{interview.type}</Badge>
                    <Badge
                      variant={
                        interview.status === "completed" ? "default" : "secondary"
                      }
                    >
                      {interview.status}
                    </Badge>
                    <span>
                      {interview.date.toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                      })}
                    </span>
                    <span>{formatDuration(interview.duration)}</span>
                    <span className={getcompletedPercentColor(interview.completedPercent)}>
                      {interview.completedPercent}%
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      // pass the interview id to the results page
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
          <div className="text-center py-12">
            <p className="text-muted-foreground">No interview sessions found.</p>
            <Button className="mt-4" onClick={() => go("mock-interview-setup")}>
              Start Your First Interview
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default InterviewHistory;
