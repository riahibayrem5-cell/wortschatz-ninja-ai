import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Shield, Brain, Zap, ArrowRight } from "lucide-react";

const CURRENT_VERSION = "2.1.0";
const STORAGE_KEY = "fluentpass_last_seen_version";

interface ChangelogEntry {
  version: string;
  date: string;
  highlights: Array<{
    icon: React.ElementType;
    title: string;
    description: string;
    tag: string;
    tagVariant?: "default" | "secondary" | "destructive" | "outline";
  }>;
}

const changelog: ChangelogEntry[] = [
  {
    version: "2.1.0",
    date: "March 2026",
    highlights: [
      {
        icon: Brain,
        title: "Upgraded AI Models",
        description: "All AI features now use the latest Gemini 3 Flash for faster, more accurate responses across exercises, conversations, and analysis.",
        tag: "AI",
        tagVariant: "default",
      },
      {
        icon: Zap,
        title: "AI Usage Tracking",
        description: "Track your daily AI usage with quota limits tied to your subscription tier. See remaining requests at a glance.",
        tag: "New",
        tagVariant: "default",
      },
      {
        icon: Shield,
        title: "Enhanced Security",
        description: "Strengthened database security policies and added email verification for new accounts.",
        tag: "Security",
        tagVariant: "secondary",
      },
      {
        icon: Sparkles,
        title: "Google Sign-In",
        description: "Sign in faster with your Google account — no more password to remember.",
        tag: "Auth",
        tagVariant: "outline",
      },
    ],
  },
];

const WhatsNewModal = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const lastSeen = localStorage.getItem(STORAGE_KEY);
    if (lastSeen !== CURRENT_VERSION) {
      // Small delay so dashboard loads first
      const timer = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, CURRENT_VERSION);
    setOpen(false);
  };

  const entry = changelog[0];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleDismiss(); }}>
      <DialogContent className="sm:max-w-lg glass-luxury border-primary/20">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-primary animate-sparkle" />
            <DialogTitle className="text-xl">What's New</DialogTitle>
            <Badge variant="outline" className="text-xs">{entry.version}</Badge>
          </div>
          <DialogDescription className="text-muted-foreground">
            {entry.date} — Here's what's improved in FluentPass
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {entry.highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10 hover:border-primary/20 transition-colors"
              >
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-sm font-semibold">{item.title}</h4>
                    <Badge variant={item.tagVariant} className="text-[10px] px-1.5 py-0">
                      {item.tag}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <Button onClick={handleDismiss} className="w-full mt-4 gradient-primary">
          Got it
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsNewModal;
