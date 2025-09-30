import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Crown,
  Award,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ----------------------- Shared Animations (parity with other pages) ---------------------- */
const AnimationStyles = () => (
  <style>{`
    @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
    @keyframes slideInFromTop { from { opacity: 0; transform: translateY(-1rem) } to { opacity: 1; transform: translateY(0) } }
    @keyframes slideInFromBottom { from { opacity: 0; transform: translateY(1rem) } to { opacity: 1; transform: translateY(0) } }
    @keyframes slideInFromLeft { from { opacity: 0; transform: translateX(-1rem) } to { opacity: 1; transform: translateX(0) } }
    @keyframes slideInFromRight { from { opacity: 0; transform: translateX(1rem) } to { opacity: 1; transform: translateX(0) } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.97) } to { opacity: 1; transform: scale(1) } }
    @keyframes float { 0%, 100% { transform: translateY(0px) } 50% { transform: translateY(-8px) } }
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
      position: relative; overflow: hidden;
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
  `}</style>
);

export function Leaderboard({ user }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("monthly");
  const navigate = useNavigate();

  // Fetch leaderboard from backend based on timeframe (UNCHANGED)
  const fetchLeaderboard = async (tf) => {
    setIsLoading(true);
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/leaderboard/${tf}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`Failed to fetch ${tf} leaderboard`);

      const data = await res.json();

      // Normalize data for frontend (UNCHANGED)
      const mapped = data.map((entry) => ({
        id: entry.userId,
        name: `${entry.firstName} ${entry.lastName}`,
        score: parseFloat(entry.avgScore),
        interviewsCompleted: entry.numberOfInterviews,
        rank: entry.rank,
        change: 0, // backend doesn’t provide change, keep 0
      }));

      setLeaderboard(mapped);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setLeaderboard([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch when timeframe changes (UNCHANGED)
  useEffect(() => {
    fetchLeaderboard(timeframe);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-orange-500" />;
      default:
        return <span className="text-muted-foreground font-medium">#{rank}</span>;
    }
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <span className="text-muted-foreground">—</span>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 calm-bg">
        <AnimationStyles />
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-10 h-10 border-2 border-violet-500/80 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  // Visual ordering for podium (no logic change to data)
  const top3 = leaderboard.slice(0, 3);
  const podiumOrder = (entry) =>
    entry.rank === 1 ? "order-2" : entry.rank === 2 ? "order-1" : "order-3";
  const podiumHeight = (entry) =>
    entry.rank === 1 ? "pt-6" : entry.rank === 2 ? "pt-10" : "pt-12";
  const podiumRing =
    (entry) => (entry.rank === 1 ? "ring-2 ring-yellow-500/70" : "");

  return (
    <>
      <AnimationStyles />
      <div className="calm-bg min-h-[calc(100vh-5rem)]">
        <div className="p-6 max-w-6xl mx-auto space-y-8">

          {/* Header */}
          <div className="text-center space-y-2 opacity-0 animate-slide-in-top">
            <h1 className="text-3xl font-bold gradient-title inline-flex items-center gap-2">
              <Sparkles className="w-6 h-6 animate-float" />
              Leaderboard
            </h1>
            <p className="text-muted-foreground">
              See how you rank against other users
            </p>
          </div>

          <Tabs
            value={timeframe}
            onValueChange={(value) => setTimeframe(value)}
            className="opacity-0 animate-scale-in delay-100"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="weekly">This Week</TabsTrigger>
              <TabsTrigger value="monthly">This Month</TabsTrigger>
              <TabsTrigger value="alltime">All Time</TabsTrigger>
            </TabsList>

            <TabsContent value={timeframe} className="space-y-6">
              {/* Top 3 Podium */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-0 animate-slide-in-bottom delay-100">
                {top3.map((entry, idx) => (
                  <Card
                    key={entry.id}
                    className={`glass action-card ${podiumRing(entry)} ${podiumOrder(entry)} ${podiumHeight(entry)}`}
                    style={{ animationDelay: `${0.08 * (idx + 1)}s` }}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          {getRankIcon(entry.rank)}
                        </div>
                        <Avatar className="w-16 h-16 mx-auto shadow-md">
                          <AvatarFallback>
                            {entry.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{entry.name}</h3>
                          {entry.badge && (
                            <Badge variant="secondary" className="mt-1">
                              {entry.badge}
                            </Badge>
                          )}
                        </div>

                        {/* Score + progress for a calm, premium read */}
                        <div className="space-y-2">
                          <div className="text-2xl font-bold text-primary">
                            {entry.score}%
                          </div>
                          <Progress value={entry.score} className="h-2" />
                          <div className="text-xs text-muted-foreground">
                            {entry.interviewsCompleted} interviews
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Full Leaderboard */}
              <Card className="glass opacity-0 animate-fade-in delay-200">
                <CardHeader>
                  <CardTitle>Full Rankings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboard.map((entry, idx) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card/50 glass row-card"
                        style={{ animation: "fadeIn .45s ease-out forwards", animationDelay: `${0.02 * (idx + 1)}s`, opacity: 0 }}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-8 text-center shrink-0">
                            {getRankIcon(entry.rank)}
                          </div>
                          <Avatar className="shrink-0">
                            <AvatarFallback>
                              {entry.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-medium truncate">{entry.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {entry.interviewsCompleted} interviews completed
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          {/* subtle inline progress */}
                          <div className="hidden md:block w-40">
                            <Progress value={entry.score} className="h-2" />
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{entry.score}%</div>
                            <div className="flex items-center gap-1 text-sm justify-end">
                              {getChangeIcon(entry.change)}
                              {entry.change !== 0 && (
                                <span
                                  className={
                                    entry.change > 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }
                                >
                                  {Math.abs(entry.change)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Call to Action */}
              <Card className="glass action-card opacity-0 animate-slide-in-bottom delay-200 bg-gradient-to-r from-primary/10 to-accent/10">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold mb-2">
                    Want to climb the leaderboard?
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Take more mock interviews to improve your ranking and skills
                  </p>
                  <Button
                    onClick={() => navigate("/mock-interview-setup")}
                    className="animate-glow"
                  >
                    Start New Interview
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

export default Leaderboard;
