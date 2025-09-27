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
import { MapPin, Edit, Save, Target } from 'lucide-react';

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

  // Fetch profile on load
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
          improvement: overviewData.improvement
        }));

        // Personal Details
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

  // Validation rules
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

  // Real-time validation
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
        skillsToDelete: [] // Optional: integrate deletion logic if needed
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

  const inputErrorClass = "border-red-500 focus-visible:ring-red-500";

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
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardContent className="p-6 flex items-start gap-6">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="text-xl">
                  {(profileData.firstName[0] || '') + (profileData.lastName[0] || '') || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <h2 className="text-xl font-semibold">
                  {profileData.firstName} {profileData.lastName}
                </h2>
                <p className="text-muted-foreground">
                  {profileData.currentProfessionalRole || 'Professional'}
                </p>
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

          {/* Overview Stats */}
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
                  <Label>First Name</Label>
                  <Input
                    value={profileData.firstName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                    disabled={!isEditing}
                    className={errors.firstName ? inputErrorClass : ""}
                  />
                  {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={profileData.lastName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                    disabled={!isEditing}
                    className={errors.lastName ? inputErrorClass : ""}
                  />
                  {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
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
                    className={errors.phoneNumber ? inputErrorClass : ""}
                  />
                  {errors.phoneNumber && <p className="text-xs text-red-500 mt-1">{errors.phoneNumber}</p>}
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
                    className={errors.linkedInURL ? inputErrorClass : ""}
                  />
                  {errors.linkedInURL && <p className="text-xs text-red-500 mt-1">{errors.linkedInURL}</p>}
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
      </Tabs>
    </div>
  );
}
