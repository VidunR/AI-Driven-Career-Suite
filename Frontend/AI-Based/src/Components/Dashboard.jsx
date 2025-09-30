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
  Sparkles,
  Zap,
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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
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
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="calm-bg">
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInFromTop {
          from { opacity: 0; transform: translateY(-1rem); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInFromBottom {
          from { opacity: 0; transform: translateY(1rem); }
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
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.6); }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .animate-slide-in-top {
          animation: slideInFromTop 0.6s ease-out forwards;
        }
        
        .animate-slide-in-bottom {
          animation: slideInFromBottom 0.6s ease-out forwards;
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
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        
        .shimmer {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
        
        .opacity-0 { opacity: 0; }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
        .delay-700 { animation-delay: 0.7s; }
        .delay-800 { animation-delay: 0.8s; }
        .delay-900 { animation-delay: 0.9s; }
        .delay-1000 { animation-delay: 1s; }
        
        .calm-bg {
          background: radial-gradient(1200px 600px at 0% 0%, rgba(34,211,238,0.08), transparent 60%),
                      radial-gradient(1000px 500px at 100% 20%, rgba(139,92,246,0.10), transparent 55%),
                      radial-gradient(900px 500px at 50% 100%, rgba(236,72,153,0.08), transparent 50%);
        }
        
        .stat-card {
          position: relative;
          overflow: hidden;
        }
        
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          transition: left 0.5s;
        }
        
        .stat-card:hover::before {
          left: 100%;
        }
        
        .action-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .action-card:hover {
          transform: translateY(-8px) scale(1.02);
        }
        
        .action-card::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 2px;
          background: linear-gradient(135deg, transparent, rgba(255,255,255,0.1), transparent);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s;
        }
        
        .action-card:hover::after {
          opacity: 1;
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .achievement-banner {
          position: relative;
          overflow: hidden;
        }
        
        .achievement-banner::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(59, 130, 246, 0.1) 0%,
            rgba(147, 51, 234, 0.1) 100%
          );
          animation: shimmer 3s infinite;
        }
      `}</style>

      {/* Header with gradient text and animated icon */}
      <div className="space-y-2 opacity-0 animate-slide-in-top">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold">
            {getGreeting()}, {stats.firstName} {stats.lastName}!
          </h1>
          <Sparkles className="w-6 h-6 text-yellow-500 animate-float" />
        </div>
        <p className="text-muted-foreground text-lg">
          Here's your career progress overview. Ready to take the next step?
        </p>
      </div>

      {/* Stats Overview with enhanced cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border stat-card opacity-0 animate-scale-in delay-100 hover:shadow-2xl transition-all duration-500 hover:border-blue-500/50 relative group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CVs Created</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors duration-300">
              <FileText className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{stats.cvCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total documents created
            </p>
          </CardContent>
        </Card>

        <Card className="border-border stat-card opacity-0 animate-scale-in delay-200 hover:shadow-2xl transition-all duration-500 hover:border-purple-500/50 relative group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Interviews Practiced
            </CardTitle>
            <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors duration-300">
              <MessageSquare className="h-5 w-5 text-purple-500 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-500">{stats.interviewCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Mock sessions completed
            </p>
          </CardContent>
        </Card>

        <Card className="border-border stat-card opacity-0 animate-scale-in delay-300 hover:shadow-2xl transition-all duration-500 hover:border-green-500/50 relative group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
            <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors duration-300">
              <Target className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{stats.highestScore}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Best interview performance
            </p>
          </CardContent>
        </Card>

        <Card className="border-border stat-card opacity-0 animate-scale-in delay-400 hover:shadow-2xl transition-all duration-500 hover:border-orange-500/50 relative group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Leaderboard Rank
            </CardTitle>
            <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors duration-300">
              <TrendingUp className="h-5 w-5 text-orange-500 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">{stats.leaderboardRank}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Your global position
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions with enhanced hover effects */}
      <div className="space-y-4 opacity-0 animate-slide-in-bottom delay-500">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Card
              key={action.id}
              className={`border-border action-card relative cursor-pointer opacity-0 animate-scale-in`}
              style={{ animationDelay: `${0.6 + index * 0.1}s` }}
              onClick={action.action}
            >
              <CardHeader>
                <div
                  className={`w-14 h-14 ${action.color} rounded-xl flex items-center justify-center mb-4 shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-6`}
                >
                  <action.icon className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-lg font-bold">{action.title}</CardTitle>
                <CardDescription className="text-sm">{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to={action.link}>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-0 h-auto group hover:text-primary transition-colors duration-300"
                  >
                    <span className="font-medium">Get Started</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity & Profile Completeness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border opacity-0 animate-slide-in-left delay-700 hover:shadow-xl transition-all duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest actions and achievements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
                style={{ 
                  animation: `slideInFromLeft 0.5s ease-out forwards`,
                  animationDelay: `${0.8 + index * 0.1}s`,
                  opacity: 0
                }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300">
                  <activity.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors duration-300">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full hover:scale-[1.02] transition-all duration-300 hover:shadow-md"
              onClick={() => onNavigate("profile")}
            >
              View All Activity
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border opacity-0 animate-slide-in-right delay-700 hover:shadow-xl transition-all duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Target className="w-5 h-5 text-green-500" />
              </div>
              Profile Completeness
            </CardTitle>
            <CardDescription>
              Complete your profile to improve job matching
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors duration-300">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Basic information added</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors duration-300">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">CV uploaded</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors duration-300">
                <div className="w-5 h-5 border-2 border-muted rounded-full animate-pulse" />
                <span className="text-sm text-muted-foreground">
                  Skills assessment pending
                </span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors duration-300">
                <div className="w-5 h-5 border-2 border-muted rounded-full animate-pulse" />
                <span className="text-sm text-muted-foreground">
                  Portfolio links missing
                </span>
              </div>
            </div>

            <div className="pt-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold">Progress</span>
                <span className="text-sm font-bold text-primary">
                  {stats.cvCount > 0 && stats.interviewCount > 0 ? "70%" : "40%"}
                </span>
              </div>
              <Progress
                value={stats.cvCount > 0 && stats.interviewCount > 0 ? 70 : 40}
                className="mb-4 h-3"
              />
              <Link to="/profile">
                <Button className="w-full hover:scale-[1.02] transition-all duration-300 hover:shadow-lg">
                  Complete Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievement Banner with enhanced styling */}
      <Card className="border-border achievement-banner opacity-0 animate-slide-in-bottom delay-900 hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-float shadow-xl">
              <Award className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold flex items-center gap-2">
                🎉 Achievement Unlocked!
                <Sparkles className="w-5 h-5 text-yellow-500" />
              </h3>
              <p className="text-muted-foreground mt-1">
                You've completed {stats.interviewCount} mock interviews. Keep up the great work!
              </p>
            </div>
            <Link to="/leaderboard">
              <Button
                variant="secondary"
                onClick={() => onNavigate("leaderboard")}
                className="hover:scale-105 transition-all duration-300 hover:shadow-lg"
              >
                View Leaderboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}