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
import { Bell, Shield, User, Globe, Trash2, Download, AlertTriangle, Key } from 'lucide-react';
import { toast } from 'sonner';

// Simple confirmation modal component
const ConfirmDialog = ({ open, onClose, onConfirm, title, description, confirmText = "Confirm", cancelText = "Cancel", variant = "destructive" }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-background dark:bg-gray-900 text-white rounded-lg shadow-lg border border-gray-700 max-w-md w-full mx-4 p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
            {title}
          </h2>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {description}
        </p>
        
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-200 dark:border-red-800 mb-6">
          <p className="text-sm text-red-800 dark:text-red-300 font-medium">
            ⚠️ This action is irreversible
          </p>
          <p className="text-sm text-red-700 dark:text-red-400 mt-1">
            Once deleted, your account and all associated data will be permanently removed from our servers.
          </p>
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button 
            variant={variant} 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Change Password modal component
const PasswordDialog = ({ open, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  if (!open) return null;

  const handleSubmit = async () => {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    await onSubmit({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-background dark:bg-gray-900 text-white rounded-lg shadow-lg border border-gray-700 max-w-md w-full mx-4 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Key className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Change Password</h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={form.currentPassword}
              onChange={(e) =>
                setForm((f) => ({ ...f, currentPassword: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={form.newPassword}
              onChange={(e) =>
                setForm((f) => ({ ...f, newPassword: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Re-enter New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm((f) => ({ ...f, confirmPassword: e.target.value }))
              }
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              <Key className="h-4 w-4 mr-2" />
              Update Password
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export function Settings({ user, onNavigate }) {
  const token = localStorage.getItem("jwtToken");

  const [activeTab, setActiveTab] = useState("notifications");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
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
              email: data.email,
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
  };

  const exportData = () => {
    toast.success("Data export started. You will receive an email when ready.");
  };

  const handleDeleteAccount = () => {
    // Here you would make the API call to delete the account
    toast.error("Account deletion requested. Please contact support to confirm.");
  };

  const openChangePassword = () => {
    setIsPasswordDialogOpen(true);
  };

  const handlePasswordChange = async ({ currentPassword, newPassword }) => {
    if (!token) {
      toast.error("User not authenticated");
      return;
    }
    try {
      await axios.post(
        "http://localhost:5000/settings/change-password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Password changed successfully");
      setIsPasswordDialogOpen(false);
    } catch (err) {
      console.error("Error changing password:", err);
      const msg = err?.response?.data?.message || "Failed to change password";
      toast.error(msg);
    }
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
                  <h4 className="font-medium">Password</h4>
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={openChangePassword}>
                      <Key className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium text-red-600">Danger Zone</h4>
                  <Button 
                    variant="destructive" 
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
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

      {/* Custom Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        description="Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data, including your profile, settings, and any associated content."
        confirmText="Delete Account"
        cancelText="Cancel"
        variant="destructive"
        className="color-primary"
      />

      {/* Change Password Dialog */}
      <PasswordDialog
        open={isPasswordDialogOpen}
        onClose={() => setIsPasswordDialogOpen(false)}
        onSubmit={handlePasswordChange}
      />
    </div>
  );
}
