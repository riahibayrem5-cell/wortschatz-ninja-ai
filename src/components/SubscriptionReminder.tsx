import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Bell, Calendar, Crown, Sparkles, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const SubscriptionReminder = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [daysUntilExpiry, setDaysUntilExpiry] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [tierName, setTierName] = useState<string>('Premium');
  const [isRenewing, setIsRenewing] = useState(false);

  useEffect(() => {
    checkSubscriptionExpiry();
  }, []);

  const checkSubscriptionExpiry = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Check if reminder was dismissed recently (within 24 hours)
      const dismissedTime = localStorage.getItem('subscriptionReminderDismissed');
      if (dismissedTime) {
        const hoursSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60);
        if (hoursSinceDismissed < 24) return;
      }

      const { data } = await supabase
        .from("user_subscriptions")
        .select(`
          expires_at, 
          is_permanent,
          subscription_tiers (name)
        `)
        .eq("user_id", session.user.id)
        .eq("status", "active")
        .maybeSingle();

      if (data && !data.is_permanent && data.expires_at) {
        const expiryDate = new Date(data.expires_at);
        const today = new Date();
        const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Show reminder if expiring within 14 days
        if (daysLeft <= 14 && daysLeft > 0) {
          setDaysUntilExpiry(daysLeft);
          setTierName(data.subscription_tiers?.name || 'Premium');
          setShow(true);
        }
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const handleRenew = async () => {
    setIsRenewing(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      navigate('/subscriptions');
    } finally {
      setIsRenewing(false);
    }
  };

  const handleDismiss = async () => {
    const timestamp = Date.now().toString();
    localStorage.setItem('subscriptionReminderDismissed', timestamp);
    
    // Track dismissal in database for analytics
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from("subscription_reminders").insert({
          user_id: session.user.id,
          reminder_type: "renewal",
          dismissed_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error saving reminder dismissal:", error);
    }
    
    setDismissed(true);
  };

  if (!show || dismissed || !daysUntilExpiry) return null;

  const isUrgent = daysUntilExpiry <= 3;
  const isWarning = daysUntilExpiry <= 7;

  return (
    <Card className={`fixed top-20 right-4 max-w-sm p-5 glass-luxury luxury-glow z-50 animate-slide-in-right ${
      isUrgent ? 'border-destructive border-2' : isWarning ? 'border-yellow-500 border-2' : 'border-primary/20'
    }`}>
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-muted-foreground hover:text-primary transition-colors"
        aria-label="Dismiss reminder"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-xl shadow-md ${
          isUrgent ? 'bg-destructive/10' : isWarning ? 'bg-yellow-500/10' : 'gradient-primary'
        }`}>
          {isUrgent || isWarning ? (
            <AlertCircle className={`w-6 h-6 ${isUrgent ? 'text-destructive' : 'text-yellow-500'} animate-pulse`} />
          ) : (
            <Bell className="w-6 h-6 text-primary-foreground animate-pulse" />
          )}
        </div>
        
        <div className="flex-1 pr-4">
          {isUrgent && (
            <Badge className="mb-2 bg-destructive/10 text-destructive border-destructive">
              ⚠️ Urgent
            </Badge>
          )}
          <h3 className="font-bold text-base mb-2 flex items-center gap-2 text-gradient-luxury">
            {isUrgent ? 'Subscription Expiring!' : 'Renewal Reminder'}
            <Calendar className="w-4 h-4 text-accent" />
          </h3>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Your <span className="font-semibold text-primary">{tierName}</span> plan expires in{' '}
            <span className={`font-bold text-base ${isUrgent ? 'text-destructive' : isWarning ? 'text-yellow-500' : 'text-accent'}`}>
              {daysUntilExpiry} {daysUntilExpiry === 1 ? 'day' : 'days'}
            </span>.
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Don't lose access to premium features. Renew now to continue your learning journey!
          </p>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleRenew}
              disabled={isRenewing}
              className="gradient-luxury hover:scale-105 transition-all luxury-glow font-semibold flex-1"
            >
              {isRenewing ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Opening...
                </>
              ) : (
                <>
                  <Crown className="w-3.5 h-3.5 mr-1.5" />
                  Renew Now
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="text-xs hover:bg-muted"
            >
              Later
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
