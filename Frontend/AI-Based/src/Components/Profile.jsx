import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { MapPin, Edit, Save, Target, Award } from 'lucide-react';

export function Profile({ onNavigate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    country: '',
    address: '',
    bio: '',
    currentProfessionalRole: '',
    targetProfessionalRole: '',
    linkedInURL: '',
    skills: [],
    goals: ['Improve technical interviews', 'Practice system design', 'Enhance communication']
  });

  const [stats, setStats] = useState({
    interviewCount: 0,
    averageScore: 0,
    improvement: 0,
    rank: '-',
    skillProgress: {
      communication: 0,
      technical: 0,
      problemSolving: 0,
      leadership: 0
    }
  });

  const token = localStorage.getItem("jwtToken");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        toast.error("User not authenticated");
        return;
      }

      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Overview Stats
        const overviewRes = await axios.get("http://localhost:5000/profile/overview", { headers });
        const overviewData = overviewRes.data;
        setStats(prev => ({
          ...prev,
          interviewCount: overviewData.interviewCount,
          averageScore: overviewData.averageScore,
          rank: overviewData.rank,
          improvement: overviewData.improvement,
          skillProgress: overviewData.skillProgress || prev.skillProgress
        }));

        // Personal Details
        const personalRes = await axios.get("http://localhost:5000/profile/personal", { headers });
        const personalData = personalRes.data;
        setProfileData(prev => ({
          ...prev,
          fullName: `${personalData.firstName} ${personalData.lastName}`,
          email: personalData.email || '',
          phoneNumber: personalData.phoneNumber || '',
          country: personalData.country || '',
          address: personalData.address || '',
          bio: personalData.bio || '',
          currentProfessionalRole: personalData.currentProfessionalRole || '',
          targetProfessionalRole: personalData.targetProfessionalRole || '',
          linkedInURL: personalData.linkedInURL || ''
        }));

        // Skills & Goals
        const skillsRes = await axios.get("http://localhost:5000/profile/skills", { headers });
        const skillsData = skillsRes.data;
        setProfileData(prev => ({
          ...prev,
          skills: Array.isArray(skillsData) ? skillsData : skillsData.skills || [],
          goals: skillsData.goals || prev.goals
        }));

      } catch (err) {
        console.error("Error fetching profile:", err);
        toast.error("Failed to load profile");
      }
    };

    fetchProfile();
  }, [token]);

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Profile updated successfully');
    // Optional: Send updated data to backend via axios PUT request
  };

  const addSkill = (skill) => {
    if (skill && !profileData.skills.includes(skill)) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const removeSkill = (skill) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profile</h1>
        <Button
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          variant={isEditing ? "default" : "outline"}
        >
          {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Personal Details</TabsTrigger>
          <TabsTrigger value="skills">Skills & Goals</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardContent className="p-6 flex items-start gap-6">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="text-xl">
                  {profileData.fullName.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <h2 className="text-xl font-semibold">{profileData.fullName || 'User'}</h2>
                <p className="text-muted-foreground">{profileData.currentProfessionalRole || 'Professional'}</p>
                {profileData.address && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {profileData.address}
                  </p>
                )}
                {profileData.bio && <p className="text-sm">{profileData.bio}</p>}
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.slice(0, 5).map(skill => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                  {profileData.skills.length > 5 && (
                    <Badge variant="outline">+{profileData.skills.length - 5} more</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
                <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.interviewCount}</div>
                <p className="text-sm text-muted-foreground">Interviews</p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.averageScore}%</div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">#{stats.rank}</div>
                <p className="text-sm text-muted-foreground">Rank</p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.improvement}%</div>
                <p className="text-sm text-muted-foreground">Improvement</p>
                </CardContent>
            </Card>
        </div>
        </TabsContent>

        {/* Personal Details */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={profileData.fullName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={profileData.email} disabled />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={profileData.phoneNumber}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input
                    value={profileData.country}
                    onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input
                    value={profileData.address}
                    onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Bio</Label>
                  <Textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Current Role</Label>
                  <Input
                    value={profileData.currentProfessionalRole}
                    onChange={(e) => setProfileData(prev => ({ ...prev, currentProfessionalRole: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Target Role</Label>
                  <Input
                    value={profileData.targetProfessionalRole}
                    onChange={(e) => setProfileData(prev => ({ ...prev, targetProfessionalRole: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>LinkedIn URL</Label>
                  <Input
                    value={profileData.linkedInURL}
                    onChange={(e) => setProfileData(prev => ({ ...prev, linkedInURL: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills & Goals */}
        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {profileData.skills.map(skill => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  {isEditing && (
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  )}
                </Badge>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {profileData.goals.map((goal, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics */}
        <TabsContent value="statistics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skill Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(stats.skillProgress).map(([skill, progress]) => (
                <div key={skill} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="capitalize">{skill}</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
