import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Bell, Calendar, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const SubscriptionReminder = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [daysUntilExpiry, setDaysUntilExpiry] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkSubscriptionExpiry();
  }, []);

  const checkSubscriptionExpiry = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Check if reminder was dismissed recently
      const dismissedTime = localStorage.getItem('subscriptionReminderDismissed');
      if (dismissedTime) {
        const hoursSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60);
        if (hoursSinceDismissed < 12) return;
      }

      const { data } = await supabase
        .from("user_subscriptions")
        .select("expires_at, is_permanent")
        .eq("user_id", session.user.id)
        .eq("status", "active")
        .maybeSingle();

      if (data && !data.is_permanent && data.expires_at) {
        const expiryDate = new Date(data.expires_at);
        const today = new Date();
        const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysLeft <= 7 && daysLeft > 0) {
          setDaysUntilExpiry(daysLeft);
          setShow(true);
        }
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('subscriptionReminderDismissed', Date.now().toString());
    setDismissed(true);
  };

  if (!show || dismissed || !daysUntilExpiry) return null;

  return (
    <Card className="fixed top-20 right-4 max-w-sm p-5 glass-luxury luxury-glow z-50 animate-slide-in-right border-primary/20">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-muted-foreground hover:text-primary transition-colors"
        aria-label="Dismiss reminder"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl gradient-primary shadow-md">
          <Bell className="w-6 h-6 text-primary-foreground animate-pulse" />
        </div>
        
        <div className="flex-1 pr-4">
          <h3 className="font-bold text-base mb-2 flex items-center gap-2 text-gradient-luxury">
            Subscription Reminder
            <Calendar className="w-4 h-4 text-accent" />
          </h3>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Your premium subscription expires in <span className="font-bold text-accent text-base">{daysUntilExpiry} {daysUntilExpiry === 1 ? 'day' : 'days'}</span>. 
            Renew now to continue enjoying unlimited access to all features.
          </p>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => navigate("/subscriptions")}
              className="gradient-luxury hover:scale-105 transition-all luxury-glow font-semibold"
            >
              <Crown className="w-3.5 h-3.5 mr-1.5" />
              Renew Now
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="text-xs hover:bg-muted"
            >
              Remind Later
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
