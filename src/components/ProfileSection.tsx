import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Camera, Loader2, User, Calendar } from "lucide-react";

interface ProfileData {
  displayName: string;
  avatarUrl: string | null;
  nativeLanguage: string;
  examTargetDate: string | null;
}

interface ProfileSectionProps {
  userId: string;
  email: string;
  initialData: ProfileData;
  onUpdate: (data: Partial<ProfileData>) => void;
}

const languages = [
  { code: "en", label: "English", labelDe: "Englisch" },
  { code: "ar", label: "Arabic", labelDe: "Arabisch" },
  { code: "tr", label: "Turkish", labelDe: "Türkisch" },
  { code: "ru", label: "Russian", labelDe: "Russisch" },
  { code: "es", label: "Spanish", labelDe: "Spanisch" },
  { code: "fr", label: "French", labelDe: "Französisch" },
  { code: "other", label: "Other", labelDe: "Andere" },
];

export function ProfileSection({ userId, email, initialData, onUpdate }: ProfileSectionProps) {
  const [data, setData] = useState<ProfileData>(initialData);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { language, t } = useLanguage();

  const isDE = language === "de";

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: isDE ? "Fehler" : "Error",
        description: isDE ? "Bitte wähle ein Bild aus" : "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: isDE ? "Fehler" : "Error",
        description: isDE ? "Bild muss kleiner als 2MB sein" : "Image must be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const avatarUrl = urlData.publicUrl;

      // Update user_settings
      await supabase
        .from("user_settings")
        .upsert({
          user_id: userId,
          avatar_url: avatarUrl,
        });

      setData({ ...data, avatarUrl });
      onUpdate({ avatarUrl });

      toast({
        title: isDE ? "Erfolg!" : "Success!",
        description: isDE ? "Avatar wurde aktualisiert" : "Avatar has been updated",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: isDE ? "Fehler" : "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: userId,
          display_name: data.displayName,
          native_language: data.nativeLanguage,
          exam_target_date: data.examTargetDate,
        });

      if (error) throw error;

      onUpdate(data);
      toast({
        title: isDE ? "Gespeichert!" : "Saved!",
        description: isDE ? "Profil wurde aktualisiert" : "Profile has been updated",
      });
    } catch (error: any) {
      toast({
        title: isDE ? "Fehler" : "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    if (data.displayName) {
      return data.displayName.slice(0, 2).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <Card className="p-6 glass">
      <div className="flex items-center gap-3 mb-6">
        <User className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">{isDE ? "Profil" : "Profile"}</h2>
      </div>

      <div className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="w-20 h-20 cursor-pointer" onClick={handleAvatarClick}>
              <AvatarImage src={data.avatarUrl || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary text-xl">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={handleAvatarClick}
              className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              {isDE 
                ? "Klicke auf das Avatar um ein Bild hochzuladen" 
                : "Click the avatar to upload a photo"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isDE ? "Max. 2MB, JPG oder PNG" : "Max 2MB, JPG or PNG"}
            </p>
          </div>
        </div>

        {/* Display Name */}
        <div>
          <Label htmlFor="display-name">{isDE ? "Anzeigename" : "Display Name"}</Label>
          <Input
            id="display-name"
            value={data.displayName}
            onChange={(e) => setData({ ...data, displayName: e.target.value })}
            placeholder={isDE ? "Dein Name" : "Your name"}
            className="mt-2 bg-background/50"
          />
        </div>

        {/* Native Language */}
        <div>
          <Label>{isDE ? "Muttersprache" : "Native Language"}</Label>
          <Select
            value={data.nativeLanguage}
            onValueChange={(value) => setData({ ...data, nativeLanguage: value })}
          >
            <SelectTrigger className="mt-2 bg-background/50">
              <SelectValue placeholder={isDE ? "Sprache auswählen" : "Select language"} />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {isDE ? lang.labelDe : lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Exam Target Date */}
        <div>
          <Label htmlFor="exam-date" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {isDE ? "Prüfungsdatum" : "Exam Target Date"}
          </Label>
          <Input
            id="exam-date"
            type="date"
            value={data.examTargetDate || ""}
            onChange={(e) => setData({ ...data, examTargetDate: e.target.value || null })}
            className="mt-2 bg-background/50"
            min={new Date().toISOString().split("T")[0]}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {isDE 
              ? "Hilft bei der Planung deines Lernpfads" 
              : "Helps plan your learning path"}
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full gradient-primary hover:opacity-90"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isDE ? "Wird gespeichert..." : "Saving..."}
            </>
          ) : (
            isDE ? "Profil speichern" : "Save Profile"
          )}
        </Button>
      </div>
    </Card>
  );
}
