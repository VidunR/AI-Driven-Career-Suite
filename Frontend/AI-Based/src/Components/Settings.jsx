import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Bell, Shield, User, Globe, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';

export function Settings({ user, onNavigate }) {
  const token = localStorage.getItem("jwtToken");

  const [activeTab, setActiveTab] = useState("notifications");
  const [settings, setSettings] = useState({
    notifications: {
      email: false,
      push: false,
      interviews: false,
      updates: false,
    },
    privacy: {
      profileVisibility: "private", 
      shareProgress: true,
      anonymousMode: false,
    },
    preferences: {
      language: "english",
      timezone: "UTC",
      theme: "dark",
      soundEffects: true,
    },
  });

  const [accountData, setAccountData] = useState(null);


  // Fetch settings when tab changes
  useEffect(() => {
  if (!token) {
    toast.error("User not authenticated");
    return;
  }

  const fetchData = async () => {
    try {
      let url = "";
      if (activeTab === "account") {
        url = "http://localhost:5000/settings/account";
      } else if (activeTab === "notifications") {
        url = "http://localhost:5000/settings/notifications";
      } else if (activeTab === "privacy") {
        url = "http://localhost:5000/settings/privacy";
      } else if (activeTab === "preferences") {
        url = "http://localhost:5000/settings/preference";
      }

      if (!url) return;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data;

      if (activeTab === "account") {
        setSettings((prev) => ({
          ...prev,
          account: {
            email: data.email, // <- from backend response
          },
        }));
      }

      if (activeTab === "notifications") {
        setSettings((prev) => ({
          ...prev,
          notifications: {
            email: data.emailNotification,
            push: data.pushNotification,
            interviews: data.interviewReminder,
            updates: data.productUpdate,
          },
        }));
      }

      if (activeTab === "privacy") {
        setSettings((prev) => ({
          ...prev,
          privacy: {
            profileVisibility: data.publicProfileVisibility ? "public" : "private",
            anonymousMode: data.isanonymous,
          },
        }));
      }

      if (activeTab === "preferences") {
        setSettings((prev) => ({
          ...prev,
          preferences: {
            ...prev.preferences,
            language: data.language?.toLowerCase() || "english",
            soundEffects: data.soundEffect,
          },
        }));
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
      toast.error("Failed to load settings");
    }
  };

  fetchData();
}, [activeTab, token]);


  const handleSave = () => {
    toast.success("Settings saved successfully");
    // Optional: send updated settings back to backend
  };

  const exportData = () => {
    toast.success("Data export started. You will receive an email when ready.");
  };

  const deleteAccount = () => {
    toast.error("Account deletion requested. Please contact support to confirm.");
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                  </div>
                  <Switch
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, email: checked },
                      }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                  </div>
                  <Switch
                    checked={settings.notifications.push}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, push: checked },
                      }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Interview Reminders</Label>
                  </div>
                  <Switch
                    checked={settings.notifications.interviews}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, interviews: checked },
                      }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Product Updates</Label>
                  </div>
                  <Switch
                    checked={settings.notifications.updates}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, updates: checked },
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Profile Visibility</Label>
                  <Select
                    value={settings.privacy.profileVisibility}
                    onValueChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        privacy: { ...prev.privacy, profileVisibility: value },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Anonymous Mode</Label>
                  </div>
                  <Switch
                    checked={settings.privacy.anonymousMode}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        privacy: { ...prev.privacy, anonymousMode: checked },
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Application Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={settings.preferences.language}
                    onValueChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        preferences: { ...prev.preferences, language: value },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="german">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sound Effects</Label>
                </div>
                <Switch
                  checked={settings.preferences.soundEffects}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      preferences: { ...prev.preferences, soundEffects: checked },
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Account Email</Label>
                  <Input value={settings.account?.email || ""} disabled />
                  <p className="text-sm text-muted-foreground mt-1">
                    Contact support to change your email address
                  </p>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium">Data Management</h4>
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={exportData}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium text-red-600">Danger Zone</h4>
                  <Button variant="destructive" onClick={deleteAccount}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save All Changes</Button>
      </div>
    </div>
  );
}
