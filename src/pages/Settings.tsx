import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { User, Mail, Bell, Volume2, Key, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [elevenLabsKey, setElevenLabsKey] = useState("");
  const [showElevenLabsKey, setShowElevenLabsKey] = useState(false);
  const [geminiKey, setGeminiKey] = useState("");
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
    setEmail(session.user.email || "");
    
    // Load preferences from localStorage
    const audioSetting = localStorage.getItem("audioEnabled");
    const notifSetting = localStorage.getItem("notificationsEnabled");
    const savedElevenLabsKey = localStorage.getItem("elevenLabsApiKey");
    const savedGeminiKey = localStorage.getItem("geminiApiKey");
    
    if (audioSetting !== null) setAudioEnabled(audioSetting === "true");
    if (notifSetting !== null) setNotificationsEnabled(notifSetting === "true");
    if (savedElevenLabsKey) setElevenLabsKey(savedElevenLabsKey);
    if (savedGeminiKey) setGeminiKey(savedGeminiKey);
    
    setLoading(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem("audioEnabled", audioEnabled.toString());
    localStorage.setItem("notificationsEnabled", notificationsEnabled.toString());
    toast({ title: "Settings saved!", description: "Your preferences have been updated" });
  };

  const handleSaveApiKeys = () => {
    let saved = false;
    
    if (elevenLabsKey.trim()) {
      localStorage.setItem("elevenLabsApiKey", elevenLabsKey.trim());
      saved = true;
    }
    
    if (geminiKey.trim()) {
      localStorage.setItem("geminiApiKey", geminiKey.trim());
      saved = true;
    }
    
    if (saved) {
      toast({ title: "API Keys saved!", description: "Your API keys have been updated securely" });
    } else {
      toast({ title: "Error", description: "Please enter at least one valid API key", variant: "destructive" });
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    try {
      // Note: Account deletion would need to be implemented via an admin function
      toast({
        title: "Contact Support",
        description: "Please contact support to delete your account",
        variant: "destructive",
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      <div className="container max-w-4xl mx-auto p-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gradient">{t('settings.title')}</h1>

        <div className="space-y-6">
          {/* Account Information */}
          <Card className="p-6 glass">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Account Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-background/50 mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>

              <div>
                <Label>User ID</Label>
                <Input
                  value={user?.id || ""}
                  disabled
                  className="bg-background/50 mt-2 font-mono text-xs"
                />
              </div>
            </div>
          </Card>

          {/* API Keys */}
          <Card className="p-6 glass">
            <div className="flex items-center gap-3 mb-6">
              <Key className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">API Keys</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="elevenlabs-key">ElevenLabs API Key</Label>
                <div className="flex gap-2 mt-2">
                  <div className="relative flex-1">
                    <Input
                      id="elevenlabs-key"
                      type={showElevenLabsKey ? "text" : "password"}
                      value={elevenLabsKey}
                      onChange={(e) => setElevenLabsKey(e.target.value)}
                      placeholder="sk-..."
                      className="bg-background/50 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setShowElevenLabsKey(!showElevenLabsKey)}
                    >
                      {showElevenLabsKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Used for high-quality text-to-speech. Get your key from elevenlabs.io
                </p>
              </div>

              <div>
                <Label htmlFor="gemini-key">Google Gemini API Key</Label>
                <div className="flex gap-2 mt-2">
                  <div className="relative flex-1">
                    <Input
                      id="gemini-key"
                      type={showGeminiKey ? "text" : "password"}
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="AIza..."
                      className="bg-background/50 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                    >
                      {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Used for AI-powered features. Get your key from ai.google.dev
                </p>
              </div>

              <Button
                onClick={handleSaveApiKeys}
                className="w-full gradient-primary hover:opacity-90"
              >
                Save API Keys
              </Button>
            </div>
          </Card>

          {/* Preferences */}
          <Card className="p-6 glass">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Preferences</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    Audio Playback
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable text-to-speech for German and English text
                  </p>
                </div>
                <Switch
                  checked={audioEnabled}
                  onCheckedChange={setAudioEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Review Reminders
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when vocabulary is due for review
                  </p>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>

              <Button
                onClick={handleSavePreferences}
                className="w-full gradient-primary hover:opacity-90"
              >
                Save Preferences
              </Button>
            </div>
          </Card>

          {/* Study Statistics */}
          <Card className="p-6 glass">
            <h2 className="text-xl font-semibold mb-4">Study Statistics</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account created:</span>
                <span>{new Date(user?.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last login:</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="p-6 glass border-destructive/50">
            <h2 className="text-xl font-semibold mb-4 text-destructive">Danger Zone</h2>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Once you delete your account, there is no going back. All your progress,
                vocabulary, and data will be permanently deleted.
              </p>
              <Button
                onClick={handleDeleteAccount}
                variant="destructive"
                className="w-full"
              >
                Delete Account
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;