import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Bell, Shield, User, Globe, Trash2, Download, AlertTriangle, Key, Settings as SettingsIcon, Sparkles, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from "react-router-dom";

const ConfirmDialog = ({ open, onClose, onConfirm, title, description, confirmText = "Confirm", cancelText = "Cancel", variant = "destructive" }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-2xl shadow-2xl border border-border max-w-md w-full mx-4 p-6 animate-scale-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">{title}</h2>
        </div>
        <p className="text-muted-foreground mb-4 text-base">{description}</p>
        <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg border border-red-200 dark:border-red-900 mb-6">
          <p className="text-sm text-red-800 dark:text-red-300 font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            This action cannot be undone
          </p>
          <p className="text-sm text-red-700 dark:text-red-400 mt-2">
            Once deleted, your account and all associated data will be permanently removed.
          </p>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} className="hover:bg-muted transition-all duration-300">
            {cancelText}
          </Button>
          <Button variant={variant} onClick={() => { onConfirm(); onClose(); }} className="bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <Trash2 className="h-4 w-4 mr-2" />
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

const PasswordDialog = ({ open, onClose, onSubmit }) => {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  const validate = (f) => {
    const e = { currentPassword: "", newPassword: "", confirmPassword: "" };
    if (!f.currentPassword) e.currentPassword = "Current password is required.";
    if (!f.newPassword) {
      e.newPassword = "New password is required.";
    } else if (!passwordRegex.test(f.newPassword)) {
      e.newPassword = "Must be 8+ chars with uppercase, lowercase, number, and special character.";
    } else if (f.newPassword === f.currentPassword) {
      e.newPassword = "Use a different password than the current one.";
    }
    if (!f.confirmPassword) {
      e.confirmPassword = "Please re-enter the new password.";
    } else if (f.confirmPassword !== f.newPassword) {
      e.confirmPassword = "Passwords do not match.";
    }
    return e;
  };

  useEffect(() => { setErrors(validate(form)); }, [form]);
  useEffect(() => { if (open) { setForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); setErrors({ currentPassword: "", newPassword: "", confirmPassword: "" }); } }, [open]);

  const hasErrors = !!(errors.currentPassword || errors.newPassword || errors.confirmPassword);

  const handleSubmit = async () => {
    const e = validate(form);
    setErrors(e);
    if (e.currentPassword || e.newPassword || e.confirmPassword) {
      toast.error("Fix validation errors before submitting");
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({ currentPassword: form.currentPassword, newPassword: form.newPassword, confirmPassword: form.confirmPassword });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputErrorClass = "border-red-500 focus-visible:ring-red-500";
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-2xl shadow-2xl border border-border max-w-md w-full mx-4 p-6 animate-scale-in">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Key className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">Change Password</h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" type="password" value={form.currentPassword} onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))} className={errors.currentPassword ? inputErrorClass : ""} />
            {errors.currentPassword && <p className="text-xs text-red-500 mt-1">{errors.currentPassword}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" value={form.newPassword} onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))} className={errors.newPassword ? inputErrorClass : ""} />
            <p className="text-xs text-muted-foreground mt-1">Must be 8+ chars with uppercase, lowercase, number, and special character.</p>
            {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Re-enter New Password</Label>
            <Input id="confirmPassword" type="password" value={form.confirmPassword} onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))} className={errors.confirmPassword ? inputErrorClass : ""} />
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || hasErrors}>
              <Key className="h-4 w-4 mr-2" />
              {isSubmitting ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export function Settings({ user, onNavigate }) {
  const token = localStorage.getItem("jwtToken");
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("notifications");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState({
    notifications: { email: false, push: false, interviews: false, updates: false },
    privacy: { profileVisibility: "private", shareProgress: true, anonymousMode: false },
    preferences: { language: "english", timezone: "UTC", theme: "dark", soundEffects: true },
    account: { email: "" }
  });

  useEffect(() => {
    if (!token) { toast.error("User not authenticated"); return; }

    const fetchData = async () => {
      try {
        let url = "";
        if (activeTab === "account") url = "http://localhost:5000/settings/account";
        else if (activeTab === "notifications") url = "http://localhost:5000/settings/notifications";
        else if (activeTab === "privacy") url = "http://localhost:5000/settings/privacy";
        else if (activeTab === "preferences") url = "http://localhost:5000/settings/preference";

        if (!url) return;

        const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        const data = res.data;

        if (activeTab === "account") setSettings((prev) => ({ ...prev, account: { email: data.email } }));
        if (activeTab === "notifications") setSettings((prev) => ({ ...prev, notifications: { email: !!data.emailNotification, push: !!data.pushNotification, interviews: !!data.interviewReminder, updates: !!data.productUpdate } }));
        if (activeTab === "privacy") setSettings((prev) => ({ ...prev, privacy: { ...prev.privacy, profileVisibility: data.publicProfileVisibility ? "public" : "private", anonymousMode: !!data.isanonymous } }));
        if (activeTab === "preferences") setSettings((prev) => ({ ...prev, preferences: { ...prev.preferences, language: (data.language || "English").toLowerCase(), soundEffects: !!data.soundEffect } }));
      } catch (err) {
        console.error("Error fetching settings:", err);
        toast.error("Failed to load settings");
      }
    };

    fetchData();
  }, [activeTab, token]);

  const capitalize = (s) => typeof s === "string" && s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;

  const handleSave = async () => {
    if (!token) { toast.error("User not authenticated"); return; }
    setIsSaving(true);
    try {
      const payload = {
        emailNotification: !!settings.notifications.email,
        pushNotification: !!settings.notifications.push,
        interviewReminder: !!settings.notifications.interviews,
        productUpdate: !!settings.notifications.updates,
        publicProfileVisibility: settings.privacy.profileVisibility === "public",
        isanonymous: !!settings.privacy.anonymousMode,
        language: capitalize(settings.preferences.language || "English"),
        soundEffect: !!settings.preferences.soundEffects
      };
      await axios.post("http://localhost:5000/settings/update", payload, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Settings saved successfully");
    } catch (err) {
      console.error("Error saving settings:", err);
      const msg = err?.response?.data?.message || "Failed to save settings";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const exportData = () => { toast.success("Data export started. You will receive an email when ready."); };

  const handleDeleteAccount = async () => {
    if (!token) { toast.error("User not authenticated"); return; }
    try {
      await axios.delete("http://localhost:5000/settings/account", { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Account deleted successfully");
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Error when deleting account:", err);
      const msg = err?.response?.data?.message || "Failed to delete account";
      toast.error(msg);
    }
  };

  const openChangePassword = () => { setIsPasswordDialogOpen(true); };

  const handlePasswordChange = async ({ currentPassword, newPassword, confirmPassword }) => {
    if (!token) { toast.error("User not authenticated"); return; }
    try {
      const res = await axios.put("http://localhost:5000/settings/updatepassword", { currentPassword, newPassword, confirmPassword }, { headers: { Authorization: `Bearer ${token}` } });
      const msg = res?.data?.message || "Password Updated";
      toast.success(msg);
      setIsPasswordDialogOpen(false);
    } catch (err) {
      console.error("Error changing password:", err);
      const msg = err?.response?.data?.message || err?.response?.data?.errorMessage || "Failed to change password";
      toast.error(msg);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInFromTop { from { opacity: 0; transform: translateY(-1rem); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.3s ease-out forwards; }
        .animate-slide-in-top { animation: slideInFromTop 0.6s ease-out forwards; }
        .opacity-0 { opacity: 0; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .setting-card { transition: all 0.3s ease; }
        .setting-card:hover { transform: translateY(-2px); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); }
      `}</style>

      <div className="opacity-0 animate-slide-in-top">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <SettingsIcon className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        <p className="text-muted-foreground text-sm">Manage your account settings and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="opacity-0 animate-slide-in-top delay-100">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-border setting-card opacity-0 animate-scale-in delay-200 hover:shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 bg-blue-500/10 rounded-lg">
                  <Bell className="h-4 w-4 text-blue-500" />
                </div>
                Notification Settings
              </CardTitle>
              <CardDescription className="text-sm">Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors duration-300">
                  <div>
                    <Label className="text-sm font-medium">Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch checked={settings.notifications.email} onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, notifications: { ...prev.notifications, email: checked } }))} />
                </div>
                <Separator />
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors duration-300">
                  <div>
                    <Label className="text-sm font-medium">Push Notifications</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Get push notifications on your device</p>
                  </div>
                  <Switch checked={settings.notifications.push} onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, notifications: { ...prev.notifications, push: checked } }))} />
                </div>
                <Separator />
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors duration-300">
                  <div>
                    <Label className="text-sm font-medium">Interview Reminders</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Reminders for upcoming interviews</p>
                  </div>
                  <Switch checked={settings.notifications.interviews} onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, notifications: { ...prev.notifications, interviews: checked } }))} />
                </div>
                <Separator />
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors duration-300">
                  <div>
                    <Label className="text-sm font-medium">Product Updates</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">News about new features</p>
                  </div>
                  <Switch checked={settings.notifications.updates} onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, notifications: { ...prev.notifications, updates: checked } }))} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card className="border-border setting-card opacity-0 animate-scale-in delay-200 hover:shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 bg-green-500/10 rounded-lg">
                  <Shield className="h-4 w-4 text-green-500" />
                </div>
                Privacy Settings
              </CardTitle>
              <CardDescription className="text-sm">Control your privacy and data sharing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-300">
                  <Label className="text-sm font-medium">Profile Visibility</Label>
                  <Select value={settings.privacy.profileVisibility} onValueChange={(value) => setSettings((prev) => ({ ...prev, privacy: { ...prev.privacy, profileVisibility: value } }))}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1.5">Who can see your profile information</p>
                </div>
                <Separator />
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors duration-300">
                  <div>
                    <Label className="text-sm font-medium">Anonymous Mode</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Hide your identity in public areas</p>
                  </div>
                  <Switch checked={settings.privacy.anonymousMode} onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, privacy: { ...prev.privacy, anonymousMode: checked } }))} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card className="border-border setting-card opacity-0 animate-scale-in delay-200 hover:shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 bg-purple-500/10 rounded-lg">
                  <Globe className="h-4 w-4 text-purple-500" />
                </div>
                Application Preferences
              </CardTitle>
              <CardDescription className="text-sm">Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-300">
                  <Label className="text-sm font-medium">Language</Label>
                  <Select value={settings.preferences.language} onValueChange={(value) => setSettings((prev) => ({ ...prev, preferences: { ...prev.preferences, language: value } }))}>
                    <SelectTrigger className="mt-2">
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
                <Separator />
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors duration-300">
                  <div>
                    <Label className="text-sm font-medium">Sound Effects</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Play sounds for interactions</p>
                  </div>
                  <Switch checked={settings.preferences.soundEffects} onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, preferences: { ...prev.preferences, soundEffects: checked } }))} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card className="border-border setting-card opacity-0 animate-scale-in delay-200 hover:shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 bg-orange-500/10 rounded-lg">
                  <User className="h-4 w-4 text-orange-500" />
                </div>
                Account Management
              </CardTitle>
              <CardDescription className="text-sm">Manage your account and data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-muted/30">
                  <Label className="mb-2 block text-sm font-medium">Account Email</Label>
                  <Input value={settings.account?.email || ""} disabled className="bg-background" />
                  <p className="text-xs text-muted-foreground mt-1.5">Contact support to change your email address</p>
                </div>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Data Management</h4>
                  <Button variant="outline" onClick={exportData} className="hover:border-primary hover:text-primary transition-all duration-300">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Password</h4>
                  <Button variant="outline" onClick={openChangePassword} className="hover:border-primary hover:text-primary transition-all duration-300">
                    <Key className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </div>
                <Separator />
                <div className="space-y-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
                  <h4 className="font-medium text-sm text-red-600 dark:text-red-400">Danger Zone</h4>
                  <p className="text-xs text-muted-foreground">Once you delete your account, there is no going back.</p>
                  <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)} className="bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end opacity-0 animate-slide-in-top delay-300">
        <Button onClick={handleSave} disabled={isSaving} className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CheckCircle className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>

      <ConfirmDialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} onConfirm={handleDeleteAccount} title="Delete Account" description="Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data." confirmText="Delete Account" cancelText="Cancel" variant="destructive" />
      <PasswordDialog open={isPasswordDialogOpen} onClose={() => setIsPasswordDialogOpen(false)} onSubmit={handlePasswordChange} />
    </div>
  );
}