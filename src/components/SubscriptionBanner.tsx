import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Crown, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const SubscriptionBanner = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [show, setShow] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Check if user dismissed banner recently
    const dismissedTime = localStorage.getItem('subscriptionBannerDismissed');
    if (dismissedTime) {
      const hoursSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) {
        return;
      }
    }

    // Check subscription status
    const { data } = await supabase
      .from("user_subscriptions")
      .select("*, subscription_tiers(*)")
      .eq("user_id", session.user.id)
      .eq("status", "active")
      .single();

    if (!data) {
      setShow(true);
    } else {
      setHasActiveSubscription(true);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('subscriptionBannerDismissed', Date.now().toString());
    setDismissed(true);
  };

  if (!show || dismissed || hasActiveSubscription) return null;

  return (
    <Card className="fixed bottom-4 right-4 max-w-md p-4 glass border-primary/50 shadow-xl z-50 animate-slide-in-right">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
          <Crown className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold mb-1 flex items-center gap-2">
            {t('subscriptions.upgradeNow')}
            <Zap className="w-4 h-4 text-accent" />
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Unlock unlimited AI requests, advanced features, and priority support.
          </p>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => navigate("/subscriptions")}
              className="gradient-primary hover:opacity-90"
            >
              View Plans
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};