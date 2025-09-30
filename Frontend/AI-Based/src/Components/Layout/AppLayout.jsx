import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import axios from "axios";
import {
  Award,
  Home,
  FileText,
  Search,
  MessageSquare,
  History,
  Trophy,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export function AppLayout({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const currentPage = location.pathname.substring(1);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/applayout", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(response.data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Failed to load profile.");
        localStorage.removeItem("jwtToken");
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "cv-manager", label: "CV Manager", icon: FileText },
    { id: "cv-builder", label: "CV Builder", icon: FileText },
    { id: "job-search", label: "Job Search", icon: Search },
    { id: "mock-interview-setup", label: "Mock Interview", icon: MessageSquare },
    { id: "interview-history", label: "Interview History", icon: History },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  const bottomItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "help", label: "Help & Support", icon: HelpCircle },
  ];

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-sidebar border-r border-sidebar-border relative overflow-hidden">
      <style>{`
        .calm-sidebar-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: 
            radial-gradient(800px 400px at 0% 0%, rgba(34,211,238,0.06), transparent 50%),
            radial-gradient(600px 300px at 100% 50%, rgba(139,92,246,0.08), transparent 45%),
            radial-gradient(500px 250px at 50% 100%, rgba(236,72,153,0.06), transparent 40%);
          opacity: 0.7;
        }
      `}</style>
      
      {/* Gradient background overlay */}
      <div className="calm-sidebar-bg"></div>

      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-sm">
            <img
              src="/favicon_1.png"
              alt="SkillSprint Logo"
              className="w-8 h-8 object-cover rounded-md"
            />
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">
            SkillSprint
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 relative z-10">
        <nav className="space-y-1 px-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start space-x-3 h-11 transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary/80 shadow-md"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
                onClick={() => {
                  navigate(`/${item.id}`);
                  setSidebarOpen(false);
                }}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Navigation */}
      <div className="p-3 border-t border-sidebar-border space-y-1 relative z-10">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start space-x-3 h-11 transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary/80 shadow-md"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
              onClick={() => {
                navigate(`/${item.id}`);
                setSidebarOpen(false);
              }}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Button>
          );
        })}

        <Button
          variant="ghost"
          className="w-full justify-start space-x-3 h-11 text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
          onClick={() => {
            localStorage.removeItem("jwtToken");
            onLogout?.();
            navigate("/login", { replace: true });
          }}
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-background">
      <style>{`
        .calm-header-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: 
            radial-gradient(600px 200px at 0% 50%, rgba(99,102,241,0.04), transparent 50%),
            radial-gradient(400px 150px at 100% 50%, rgba(147,51,234,0.05), transparent 45%);
          opacity: 0.8;
        }
      `}</style>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 border-r border-border">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-64">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 relative overflow-hidden">
          {/* Gradient background overlay */}
          <div className="calm-header-bg"></div>
          
          <div className="flex items-center space-x-4 relative z-10">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <h1 className="text-xl font-semibold capitalize">
              {currentPage ? currentPage.replace(/-/g, " ") : "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center space-x-4 relative z-10">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading profile...</p>
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{profile.firstName} {profile.lastName}</p>
                  <p className="text-xs text-muted-foreground">{profile.email}</p>
                </div>
                <Avatar className="ring-2 ring-primary/10">
                  {profile.proImgPath ? (
                    <AvatarImage src={`http://localhost:5000${profile.proImgPath}`} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                      {profile.firstName[0]}{profile.lastName[0]}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}