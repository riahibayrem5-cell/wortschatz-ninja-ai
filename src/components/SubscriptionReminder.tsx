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
    <Card className="fixed top-20 right-4 max-w-sm p-4 glass-luxury shadow-luxury z-50 animate-slide-in-right border-primary/30">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg gradient-primary">
          <Bell className="w-5 h-5 text-primary-foreground" />
        </div>
        
        <div className="flex-1 pr-4">
          <h3 className="font-semibold mb-1 flex items-center gap-2">
            Subscription Reminder
            <Calendar className="w-4 h-4 text-primary" />
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Your premium subscription expires in <span className="font-bold text-accent">{daysUntilExpiry} {daysUntilExpiry === 1 ? 'day' : 'days'}</span>. 
            Renew now to continue enjoying unlimited access.
          </p>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => navigate("/subscriptions")}
              className="gradient-luxury hover:opacity-90 text-primary-foreground"
            >
              <Crown className="w-3 h-3 mr-1" />
              Renew Now
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="text-xs"
            >
              Remind Later
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
