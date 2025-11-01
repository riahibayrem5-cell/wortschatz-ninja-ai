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
      .maybeSingle();

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
    <Card className="fixed bottom-4 right-4 max-w-md p-6 glass-luxury border-primary/30 luxury-glow z-50 animate-slide-in-right">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-muted-foreground hover:text-primary transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl gradient-luxury">
          <Crown className="w-7 h-7 text-primary-foreground" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-gradient-luxury">
            {t('subscriptions.upgradeNow')}
            <Zap className="w-5 h-5 text-accent animate-pulse" />
          </h3>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Unlock unlimited AI requests, advanced features, and priority support to accelerate your German mastery.
          </p>
          
          <div className="flex gap-3">
            <Button
              size="sm"
              onClick={() => navigate("/subscriptions")}
              className="gradient-luxury hover:scale-105 transition-all luxury-glow font-semibold"
            >
              View Premium Plans
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="hover:bg-muted"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};