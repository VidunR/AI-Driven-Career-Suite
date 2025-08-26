import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Trophy, TrendingUp, TrendingDown, Crown, Award } from 'lucide-react';

export function Leaderboard({ user, accessToken, onNavigate }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('monthly');

  // Mock data
  const mockLeaderboardData = [
    {
      id: '1',
      name: 'Sarah Chen',
      score: 95,
      interviewsCompleted: 24,
      rank: 1,
      change: 0,
      badge: 'Expert'
    },
    {
      id: '2',
      name: 'Mike Johnson',
      score: 92,
      interviewsCompleted: 18,
      rank: 2,
      change: 1,
      badge: 'Pro'
    },
    {
      id: '3',
      name: 'Alex Rivera',
      score: 88,
      interviewsCompleted: 15,
      rank: 3,
      change: -1
    },
    {
      id: '4',
      name: 'Emily Davis',
      score: 85,
      interviewsCompleted: 12,
      rank: 4,
      change: 2
    },
    {
      id: '5',
      name: 'You',
      score: 78,
      interviewsCompleted: 8,
      rank: 15,
      change: 3
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setLeaderboard(mockLeaderboardData);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-orange-500" />;
      default: return <span className="text-muted-foreground">#{rank}</span>;
    }
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <span className="text-muted-foreground">—</span>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground">See how you rank against other users</p>
      </div>

      <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="weekly">This Week</TabsTrigger>
          <TabsTrigger value="monthly">This Month</TabsTrigger>
          <TabsTrigger value="all-time">All Time</TabsTrigger>
        </TabsList>

        <TabsContent value={timeframe} className="space-y-6">
          {/* Top 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {leaderboard.slice(0, 3).map((entry) => (
              <Card key={entry.id} className={entry.rank === 1 ? 'ring-2 ring-yellow-500' : ''}>
                <CardContent className="p-6 text-center">
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    <Avatar className="w-16 h-16 mx-auto">
                      <AvatarFallback>{entry.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{entry.name}</h3>
                      {entry.badge && (
                        <Badge variant="secondary" className="mt-1">{entry.badge}</Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-primary">{entry.score}%</div>
                      <div className="text-sm text-muted-foreground">
                        {entry.interviewsCompleted} interviews
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Full Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>Full Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div 
                    key={entry.id} 
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      entry.name === 'You' ? 'bg-primary/5 border-primary' : 'bg-card'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 text-center">
                        {getRankIcon(entry.rank)}
                      </div>
                      <Avatar>
                        <AvatarFallback>{entry.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{entry.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {entry.interviewsCompleted} interviews completed
                        </div>
                      </div>
                      {entry.badge && (
                        <Badge variant="outline">{entry.badge}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold">{entry.score}%</div>
                        <div className="flex items-center gap-1 text-sm">
                          {getChangeIcon(entry.change)}
                          {entry.change !== 0 && (
                            <span className={entry.change > 0 ? 'text-green-600' : 'text-red-600'}>
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
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold mb-2">Want to climb the leaderboard?</h3>
              <p className="text-muted-foreground mb-4">
                Take more mock interviews to improve your ranking and skills
              </p>
              <Button onClick={() => onNavigate('mock-interview-setup')}>
                Start New Interview
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}