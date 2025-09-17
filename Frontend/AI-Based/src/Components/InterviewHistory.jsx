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
import { Link } from "react-router-dom";
import axios from "axios";

export function InterviewHistory({ user, onNavigate }) {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [jobRoleFilter, setJobRoleFilter] = useState(""); // filter by jobRoleName
  const [isLoading, setIsLoading] = useState(true);

  // Available job roles
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
          position: s.jobRoleName,
          company: "N/A", // backend doesn't return company
          type: "mixed", // default type
          duration: s.interviewDuration * 60, // convert minutes to seconds
          score: s.completedPercentage, // use completedPercentage as score
          status: s.isCompleted ? "completed" : "partial",
          questionsCompleted: s.completedPercentage / 20, // placeholder
          totalQuestions: 5, // placeholder
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
        s.position.toLowerCase().includes(q)
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

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const deleteSession = (sessionId) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    toast.success("Interview session deleted");
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
        <Link to="/mock-interview-setup">
          <Button onClick={() => onNavigate("mock-interview-setup")}>
            <Play className="h-4 w-4 mr-2" />
            New Interview
          </Button>
        </Link>
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

        {filteredSessions.map((session) => (
          <Card key={session.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{session.position}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <Badge variant="outline">{session.type}</Badge>
                    <Badge
                      variant={
                        session.status === "completed" ? "default" : "secondary"
                      }
                    >
                      {session.status}
                    </Badge>
                    <span>
                      {session.date.toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                      })}
                    </span>
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
                    onClick={() => onNavigate("interview-results")}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Results
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteSession(session.id)}
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
            <Button
              className="mt-4"
              onClick={() => onNavigate("mock-interview-setup")}
            >
              Start Your First Interview
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
