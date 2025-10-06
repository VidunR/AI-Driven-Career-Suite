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
import { toast } from 'sonner';
import { MapPin, Edit, Save, Target, TrendingUp, Award, Sparkles, X } from 'lucide-react';

export function Profile({ onNavigate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [errors, setErrors] = useState({});

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
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
    rank: '-'
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

        const overviewRes = await axios.get("http://localhost:5000/profile/overview", { headers });
        const overviewData = overviewRes.data;
        setStats(prev => ({
          ...prev,
          interviewCount: overviewData.interviewCount,
          averageScore: overviewData.averageScore,
          rank: overviewData.rank,
          improvement: overviewData.improvement
        }));

        const personalRes = await axios.get("http://localhost:5000/profile/personal", { headers });
        const personalData = personalRes.data;
        setProfileData(prev => ({
          ...prev,
          firstName: personalData.firstName || '',
          lastName: personalData.lastName || '',
          email: personalData.email || '',
          phoneNumber: personalData.phoneNumber || '',
          country: personalData.country || '',
          address: personalData.address || '',
          bio: personalData.bio || '',
          currentProfessionalRole: personalData.currentProfessionalRole || '',
          targetProfessionalRole: personalData.targetProfessionalRole || '',
          linkedInURL: personalData.linkedInURL || ''
        }));

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

  const validate = (data) => {
    const newErrors = {};
    if (!data.firstName || data.firstName.trim().length < 2 || data.firstName.trim().length > 50) {
      newErrors.firstName = "First name must be between 2 and 50 characters.";
    }
    if (!data.lastName || data.lastName.trim().length < 2 || data.lastName.trim().length > 50) {
      newErrors.lastName = "Last name must be between 2 and 50 characters.";
    }
    if (data.phoneNumber && !/^[\d\s+()-]{6,20}$/.test(data.phoneNumber)) {
      newErrors.phoneNumber = "Invalid phone number format.";
    }
    if (data.linkedInURL && !/^https?:\/\/.+/.test(data.linkedInURL)) {
      newErrors.linkedInURL = "LinkedIn URL must be valid.";
    }
    return newErrors;
  };

  useEffect(() => {
    if (isEditing) {
      setErrors(validate(profileData));
    }
  }, [profileData, isEditing]);

  const handleSave = async () => {
    if (!token) {
      toast.error("User not authenticated");
      return;
    }

    const validationErrors = validate(profileData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Fix validation errors before saving");
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phoneNumber: profileData.phoneNumber,
        country: profileData.country,
        address: profileData.address,
        bio: profileData.bio,
        currentProfessionalRole: profileData.currentProfessionalRole,
        targetProfessionalRole: profileData.targetProfessionalRole,
        skillsToDelete: []
      };

      const res = await axios.put("http://localhost:5000/profile/personal", payload, { headers });

      toast.success(res.data?.message || "Profile updated successfully");
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      const msg = err?.response?.data?.errors?.join(", ") || err?.response?.data?.errorMessage || "Failed to update profile";
      toast.error(msg);
    }
  };

  const removeSkill = (skill) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const inputErrorClass = "border-red-500 focus-visible:ring-red-500";

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
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
        
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
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
        
        .animate-scale-in {
          animation: scaleIn 0.5s ease-out forwards;
        }
        
        .opacity-0 { opacity: 0; }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
        
        .stat-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .stat-card:hover {
          transform: translateY(-4px);
        }
        
        .skill-badge {
          transition: all 0.2s ease;
        }
        
        .skill-badge:hover {
          transform: scale(1.05);
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between opacity-0 animate-slide-in-top">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Your Profile</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Manage your personal information and career progress
          </p>
        </div>
        <Button
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          variant={isEditing ? "default" : "outline"}
          className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="opacity-0 animate-slide-in-top delay-100">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Personal Details</TabsTrigger>
          <TabsTrigger value="skills">Skills & Goals</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="border-border opacity-0 animate-scale-in delay-200 hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-primary/5 to-purple-500/5">
            <CardContent className="p-6 flex items-start gap-6">
              <Avatar className="w-24 h-24 border-4 border-primary/20 shadow-xl">
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-purple-600 text-white">
                  {(profileData.firstName[0] || '') + (profileData.lastName[0] || '') || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-2xl font-bold">
                    {profileData.firstName} {profileData.lastName}
                  </h2>
                  <p className="text-base text-muted-foreground mt-0.5">
                    {profileData.currentProfessionalRole || 'Professional'}
                  </p>
                </div>
                {profileData.address && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {profileData.address}
                  </p>
                )}
                {profileData.bio && (
                  <p className="text-sm leading-relaxed">{profileData.bio}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.slice(0, 5).map(skill => (
                    <Badge key={skill} variant="secondary" className="skill-badge px-2.5 py-0.5 text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {profileData.skills.length > 5 && (
                    <Badge variant="outline" className="px-2.5 py-0.5 text-xs">
                      +{profileData.skills.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-border stat-card opacity-0 animate-scale-in delay-300 hover:shadow-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Award className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-blue-500">{stats.interviewCount}</div>
                <p className="text-xs text-muted-foreground mt-0.5">Interviews</p>
              </CardContent>
            </Card>
            <Card className="border-border stat-card opacity-0 animate-scale-in delay-400 hover:shadow-xl bg-gradient-to-br from-green-500/10 to-green-500/5">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Target className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-green-500">{stats.averageScore}%</div>
                <p className="text-xs text-muted-foreground mt-0.5">Avg Score</p>
              </CardContent>
            </Card>
            <Card className="border-border stat-card opacity-0 animate-scale-in delay-500 hover:shadow-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-purple-500">#{stats.rank}</div>
                <p className="text-xs text-muted-foreground mt-0.5">Rank</p>
              </CardContent>
            </Card>
            <Card className="border-border stat-card opacity-0 animate-scale-in delay-600 hover:shadow-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-5 h-5 text-orange-500" />
                </div>
                <div className="text-2xl font-bold text-orange-500">{stats.improvement}%</div>
                <p className="text-xs text-muted-foreground mt-0.5">Improvement</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Personal Details */}
        <TabsContent value="details" className="space-y-6">
          <Card className="border-border opacity-0 animate-slide-in-bottom delay-200 hover:shadow-xl transition-all duration-500">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm mb-2">First Name</Label>
                  <Input
                    value={profileData.firstName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                    disabled={!isEditing}
                    className={`transition-all duration-300 ${errors.firstName ? inputErrorClass : ""} ${isEditing ? 'hover:border-primary' : ''}`}
                  />
                  {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm mb-2">Last Name</Label>
                  <Input
                    value={profileData.lastName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                    disabled={!isEditing}
                    className={`transition-all duration-300 ${errors.lastName ? inputErrorClass : ""} ${isEditing ? 'hover:border-primary' : ''}`}
                  />
                  {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm mb-2">Email</Label>
                  <Input value={profileData.email} disabled className="bg-muted" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm mb-2">Phone</Label>
                  <Input
                    value={profileData.phoneNumber}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    disabled={!isEditing}
                    className={`transition-all duration-300 ${errors.phoneNumber ? inputErrorClass : ""} ${isEditing ? 'hover:border-primary' : ''}`}
                  />
                  {errors.phoneNumber && <p className="text-xs text-red-500 mt-1">{errors.phoneNumber}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm mb-2">Country</Label>
                  <Input
                    value={profileData.country}
                    onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                    disabled={!isEditing}
                    className={`transition-all duration-300 ${isEditing ? 'hover:border-primary' : ''}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm mb-2">Address</Label>
                  <Input
                    value={profileData.address}
                    onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                    disabled={!isEditing}
                    className={`transition-all duration-300 ${isEditing ? 'hover:border-primary' : ''}`}
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-sm mb-2">Bio</Label>
                  <Textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                    rows={3}
                    className={`transition-all duration-300 ${isEditing ? 'hover:border-primary' : ''}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm mb-2">Current Role</Label>
                  <Input
                    value={profileData.currentProfessionalRole}
                    onChange={(e) => setProfileData(prev => ({ ...prev, currentProfessionalRole: e.target.value }))}
                    disabled={!isEditing}
                    className={`transition-all duration-300 ${isEditing ? 'hover:border-primary' : ''}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm mb-2">Target Role</Label>
                  <Input
                    value={profileData.targetProfessionalRole}
                    onChange={(e) => setProfileData(prev => ({ ...prev, targetProfessionalRole: e.target.value }))}
                    disabled={!isEditing}
                    className={`transition-all duration-300 ${isEditing ? 'hover:border-primary' : ''}`}
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-sm mb-2">LinkedIn URL</Label>
                  <Input
                    value={profileData.linkedInURL}
                    onChange={(e) => setProfileData(prev => ({ ...prev, linkedInURL: e.target.value }))}
                    disabled={!isEditing}
                    className={`transition-all duration-300 ${errors.linkedInURL ? inputErrorClass : ""} ${isEditing ? 'hover:border-primary' : ''}`}
                  />
                  {errors.linkedInURL && <p className="text-xs text-red-500 mt-1">{errors.linkedInURL}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills & Goals */}
        <TabsContent value="skills" className="space-y-6">
          <Card className="border-border opacity-0 animate-slide-in-left delay-200 hover:shadow-xl transition-all duration-500">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map(skill => (
                  <Badge key={skill} variant="secondary" className="skill-badge px-2.5 py-1 text-xs flex items-center gap-1.5">
                    {skill}
                    {isEditing && (
                      <button
                        onClick={() => removeSkill(skill)}
                        className="ml-0.5 hover:text-red-500 transition-colors duration-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                ))}
                {profileData.skills.length === 0 && (
                  <p className="text-muted-foreground text-sm">No skills added yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border opacity-0 animate-slide-in-left delay-300 hover:shadow-xl transition-all duration-500">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {profileData.goals.map((goal, index) => (
                  <li key={index} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors duration-300">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span className="text-sm">{goal}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}