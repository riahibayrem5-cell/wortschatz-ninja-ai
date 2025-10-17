import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, Crown, Loader2, Sparkles, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Tier {
  id: string;
  name: string;
  price_tnd: number;
  features: any;
  max_ai_requests: number | null;
  max_exercises: number | null;
}

interface UserSubscription {
  id: string;
  tier_id: string;
  status: string;
  is_permanent: boolean;
  expires_at: string | null;
}

const Subscriptions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Load subscription tiers
      const { data: tiersData, error: tiersError } = await supabase
        .from("subscription_tiers")
        .select("*")
        .order("price_tnd", { ascending: true });

      if (tiersError) throw tiersError;
      setTiers(tiersData || []);

      // Load user's subscription
      const { data: subData, error: subError } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (!subError && subData) {
        setUserSubscription(subData);
      }
    } catch (error: any) {
      console.error("Error loading subscription data:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tierId: string) => {
    setSubscribing(tierId);
    try {
      const tier = tiers.find(t => t.id === tierId);
      if (!tier) throw new Error("Tier not found");

      // Get Stripe price ID (you'll need to map tier IDs to Stripe price IDs)
      // For now, using a placeholder - replace with actual price IDs
      const priceIdMap: { [key: string]: string } = {
        // Add your actual Stripe price IDs here
        // Example: 'tier-uuid': 'price_xxxxx'
      };

      const priceId = priceIdMap[tierId];
      if (!priceId) {
        toast({ 
          title: "Configuration Error", 
          description: "Please contact support to set up Stripe prices.",
          variant: "destructive" 
        });
        return;
      }

      // Create Stripe checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in new tab
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({ title: t('error'), description: error.message, variant: "destructive" });
    } finally {
      setSubscribing(null);
    }
  };

  const getTierIcon = (index: number) => {
    if (index === 0) return Zap;
    if (index === 1) return Sparkles;
    return Crown;
  };

  const getTierColor = (index: number) => {
    if (index === 0) return "from-blue-500 to-cyan-500";
    if (index === 1) return "from-purple-500 to-pink-500";
    return "from-yellow-500 to-orange-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      <div className="container max-w-7xl mx-auto p-4 md:p-6">
        <div className="text-center mb-12 mt-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient animate-fade-in">
            {t('chooseYourPlan')}
          </h1>
          <p className="text-muted-foreground text-lg">
            Unlock your full potential with premium features
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {tiers.map((tier, index) => {
            const Icon = getTierIcon(index);
            const isCurrentPlan = userSubscription?.tier_id === tier.id;
            const isPermanent = isCurrentPlan && userSubscription?.is_permanent;
            
            return (
              <Card 
                key={tier.id}
                className={`glass relative overflow-hidden transition-all hover:scale-105 animate-fade-in ${
                  isCurrentPlan ? 'ring-2 ring-primary shadow-2xl' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${getTierColor(index)} opacity-5`} />
                
                {/* Current plan badge */}
                {isCurrentPlan && (
                  <div className="absolute top-4 right-4">
                    <Badge className="gradient-primary">
                      {isPermanent ? (
                        <>
                          <Crown className="w-3 h-3 mr-1" />
                          Permanent
                        </>
                      ) : (
                        t('currentPlan')
                      )}
                    </Badge>
                  </div>
                )}

                <CardHeader className="relative">
                  <div className="flex items-center justify-center mb-4">
                    <div className={`p-4 rounded-full bg-gradient-to-br ${getTierColor(index)}`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl text-center">{tier.name}</CardTitle>
                  <CardDescription className="text-center">
                    <span className="text-4xl font-bold text-foreground">
                      {tier.price_tnd} TND
                    </span>
                    <span className="text-muted-foreground">{t('perMonth')}</span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative space-y-6">
                  {/* Features */}
                  <ul className="space-y-3">
                    {tier.max_ai_requests && (
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span>{tier.max_ai_requests} {t('aiRequests')}</span>
                      </li>
                    )}
                    {!tier.max_ai_requests && (
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="font-semibold text-primary">{t('unlimitedAIRequests')}</span>
                      </li>
                    )}
                    
                    {tier.max_exercises && (
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span>{tier.max_exercises} {t('exercisesPerMonth')}</span>
                      </li>
                    )}
                    {!tier.max_exercises && (
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="font-semibold text-primary">{t('unlimitedExercises')}</span>
                      </li>
                    )}
                    
                    {(tier.features as string[]).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSubscribe(tier.id)}
                    disabled={subscribing !== null || isPermanent}
                    className={`w-full ${
                      index === 2 
                        ? 'gradient-primary' 
                        : index === 1 
                        ? 'gradient-accent' 
                        : 'glass'
                    } ${isCurrentPlan && !isPermanent ? 'opacity-50' : ''}`}
                  >
                    {subscribing === tier.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : isPermanent ? (
                      'Active - Permanent'
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : (
                      t('subscribe')
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {userSubscription && !userSubscription.is_permanent && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Your subscription will renew on{" "}
            {new Date(userSubscription.expires_at!).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;
