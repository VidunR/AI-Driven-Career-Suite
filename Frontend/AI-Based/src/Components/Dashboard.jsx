import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import {
  TrendingUp,
  FileText,
  Target,
  Award,
  Clock,
  Users,
  MessageSquare,
  Search,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

export function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({
    firstName: "",
    lastName: "",
    cvCount: 0,
    interviewCount: 0,
    highestScore: 0,
    leaderboardRank: "",
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: "cv_created",
      title: "Created new CV: Software Engineer Resume",
      timestamp: "2 hours ago",
      icon: FileText,
    },
    {
      id: 2,
      type: "interview_completed",
      title: "Completed mock interview for Frontend Developer",
      timestamp: "1 day ago",
      icon: MessageSquare,
    },
    {
      id: 3,
      type: "job_applied",
      title: "Applied to Senior React Developer at TechCorp",
      timestamp: "2 days ago",
      icon: Search,
    },
  ]);

  const [quickActions] = useState([
    {
      id: "create-cv",
      title: "Create New CV",
      description: "Build a professional CV with AI assistance",
      icon: FileText,
      color: "bg-blue-500",
      link: "/cv-builder",
    },
    {
      id: "find-jobs",
      title: "Find Jobs",
      description: "Discover opportunities that match your skills",
      icon: Search,
      color: "bg-green-500",
      link: "/job-search",
    },
    {
      id: "practice-interview",
      title: "Practice Interview",
      description: "Improve your interview skills with AI",
      icon: MessageSquare,
      color: "bg-purple-500",
      link: "/mock-interview-setup",
    },
  ]);

  // Fetch dashboard stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("jwtToken"); // ✅ always get it from localStorage
        if (!token) {
          console.error("No token found in localStorage");
          return;
        }

        const response = await axios.get("http://localhost:5000/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Dashboard response:", response.data);
        setStats(response.data);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      }
    };

    fetchStats();
  }, []); // only runs once on mount

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          {getGreeting()}, {stats.firstName} {stats.lastName}!
        </h1>
        <p className="text-muted-foreground text-lg">
          Here's your career progress overview. Ready to take the next step?
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CVs Created</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cvCount}</div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Interviews Practiced
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.interviewCount}</div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highestScore}</div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Leaderboard Rank
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.leaderboardRank}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions (unchanged) */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Card
              key={action.id}
              className="border-border hover:shadow-lg transition-shadow cursor-pointer"
              onClick={action.action}
            >
              <CardHeader>
                <div
                  className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4`}
                >
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to={action.link}>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-0 h-auto"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity & Profile Completeness (unchanged) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest actions and achievements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-3 rounded-lg bg-muted/30"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <activity.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onNavigate("profile")}
            >
              View All Activity
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Profile Completeness
            </CardTitle>
            <CardDescription>
              Complete your profile to improve job matching
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-accent" />
                <span className="text-sm">Basic information added</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-accent" />
                <span className="text-sm">CV uploaded</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-muted rounded-full" />
                <span className="text-sm text-muted-foreground">
                  Skills assessment pending
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-muted rounded-full" />
                <span className="text-sm text-muted-foreground">
                  Portfolio links missing
                </span>
              </div>
            </div>

            <div className="pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">
                  {stats.cvCount > 0 && stats.interviewCount > 0 ? "70%" : "40%"}
                </span>
              </div>
              <Progress
                value={stats.cvCount > 0 && stats.interviewCount > 0 ? 70 : 40}
                className="mb-4"
              />
              <Link to="/profile">
                <Button className="w-full">Complete Profile</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievement Banner (unchanged) */}
      <Card className="border-border bg-gradient-to-r from-primary/10 to-accent/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold">🎉 Achievement Unlocked!</h3>
              <p className="text-muted-foreground">
                You’ve completed {stats.interviewCount} mock interviews.
              </p>
            </div>
            <Link to="/leaderboard">
              <Button
                variant="secondary"
                onClick={() => onNavigate("leaderboard")}
              >
                View Leaderboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
