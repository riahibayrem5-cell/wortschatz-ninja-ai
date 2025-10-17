import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Check, Crown, Loader2, Sparkles, Zap, Award, TrendingUp, Shield } from "lucide-react";
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
      
      <div className="container max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Premium Hero Section */}
        <div className="text-center mb-16 mt-8 max-w-4xl mx-auto">
          <Badge className="mb-4 gradient-luxury text-primary-foreground px-4 py-1">
            <Crown className="w-3 h-3 mr-1" />
            Premium German Learning Platform
          </Badge>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-gradient-luxury animate-fade-in leading-tight">
            Master German with <br className="hidden md:block" />AI-Powered Excellence
          </h1>
          <p className="text-foreground/80 text-xl md:text-2xl mb-4 font-light">
            Join thousands of learners achieving fluency faster with personalized AI guidance
          </p>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">
            Experience premium features designed for serious learners. From TELC B2 preparation to advanced conversation practice, 
            everything you need for German mastery in one elegant platform.
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-8 mb-16 text-center max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">TELC Certified Content</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Proven Results</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Money-Back Guarantee</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {tiers.map((tier, index) => {
            const Icon = getTierIcon(index);
            const isCurrentPlan = userSubscription?.tier_id === tier.id;
            const isPermanent = isCurrentPlan && userSubscription?.is_permanent;
            const isPopular = index === 1;
            
            return (
              <Card 
                key={tier.id}
                className={`glass-luxury relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-luxury animate-fade-in ${
                  isCurrentPlan ? 'ring-2 ring-primary shadow-luxury' : ''
                } ${isPopular ? 'lg:scale-105 lg:shadow-luxury' : ''}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Premium shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50" />
                
                {/* Popular badge */}
                {isPopular && !isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="gradient-luxury text-primary-foreground px-4 py-1 shadow-lg">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                {/* Current plan badge */}
                {isCurrentPlan && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="gradient-primary text-primary-foreground">
                      {isPermanent ? (
                        <>
                          <Crown className="w-3 h-3 mr-1" />
                          Lifetime Access
                        </>
                      ) : (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          Active Plan
                        </>
                      )}
                    </Badge>
                  </div>
                )}

                <CardHeader className="relative pt-8 pb-6">
                  <div className="flex items-center justify-center mb-6">
                    <div className={`p-5 rounded-2xl bg-gradient-to-br ${getTierColor(index)} shadow-lg`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-3xl text-center font-bold mb-2">{tier.name}</CardTitle>
                  <CardDescription className="text-center space-y-2">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-bold text-foreground">
                        {tier.price_tnd}
                      </span>
                      <span className="text-muted-foreground">TND/month</span>
                    </div>
                    {index === 0 && (
                      <p className="mt-3 text-sm text-muted-foreground">
                        Ideal for beginners exploring German language fundamentals
                      </p>
                    )}
                    {index === 1 && (
                      <p className="mt-3 text-sm text-muted-foreground">
                        Perfect for dedicated learners targeting B2 certification
                      </p>
                    )}
                    {index === 2 && (
                      <p className="mt-3 text-sm text-muted-foreground">
                        Ultimate package for ambitious learners seeking mastery
                      </p>
                    )}
                  </CardDescription>
                  <Separator className="mt-6 bg-border/50" />
                </CardHeader>

                <CardContent className="relative space-y-6 pt-6">
                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {tier.max_ai_requests && (
                      <li className="flex items-start gap-3">
                        <div className="rounded-full bg-primary/10 p-1 shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm">
                          <strong className="text-foreground">{tier.max_ai_requests} AI requests</strong>
                          <span className="text-muted-foreground"> per month — intelligent feedback and personalized analysis</span>
                        </span>
                      </li>
                    )}
                    {!tier.max_ai_requests && (
                      <li className="flex items-start gap-3">
                        <div className="rounded-full bg-primary p-1 shrink-0 mt-0.5">
                          <Sparkles className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="text-sm">
                          <strong className="text-primary font-semibold">Unlimited AI requests</strong>
                          <span className="text-muted-foreground"> — learn without limits, anytime</span>
                        </span>
                      </li>
                    )}
                    
                    {tier.max_exercises && (
                      <li className="flex items-start gap-3">
                        <div className="rounded-full bg-primary/10 p-1 shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm">
                          <strong className="text-foreground">{tier.max_exercises} exercises</strong>
                          <span className="text-muted-foreground"> monthly — structured practice for skill mastery</span>
                        </span>
                      </li>
                    )}
                    {!tier.max_exercises && (
                      <li className="flex items-start gap-3">
                        <div className="rounded-full bg-primary p-1 shrink-0 mt-0.5">
                          <TrendingUp className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="text-sm">
                          <strong className="text-primary font-semibold">Unlimited exercises</strong>
                          <span className="text-muted-foreground"> — practice until perfect</span>
                        </span>
                      </li>
                    )}
                    
                    {(tier.features as string[]).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="rounded-full bg-primary/10 p-1 shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSubscribe(tier.id)}
                    disabled={subscribing !== null || isPermanent}
                    size="lg"
                    className={`w-full text-base font-semibold py-7 ${
                      index === 2 
                        ? 'gradient-luxury text-primary-foreground shadow-luxury hover:shadow-xl' 
                        : index === 1 
                        ? 'gradient-accent text-accent-foreground shadow-accent-glow hover:shadow-xl' 
                        : 'gradient-primary text-primary-foreground shadow-glow hover:shadow-xl'
                    } ${isCurrentPlan && !isPermanent ? 'opacity-60' : ''} transition-all duration-300`}
                  >
                    {subscribing === tier.id ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing Payment...
                      </>
                    ) : isPermanent ? (
                      <>
                        <Crown className="w-5 h-5 mr-2" />
                        Lifetime Access Active
                      </>
                    ) : isCurrentPlan ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Your Current Plan
                      </>
                    ) : (
                      <>
                        Upgrade to {tier.name}
                        <Sparkles className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                  
                  {!isCurrentPlan && (
                    <p className="text-xs text-center text-muted-foreground mt-3">
                      Cancel anytime • No hidden fees • Secure payment
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {userSubscription && !userSubscription.is_permanent && (
          <div className="mt-12 text-center space-y-2">
            <p className="text-muted-foreground">
              Your subscription renews automatically on{" "}
              <span className="font-semibold text-foreground">
                {new Date(userSubscription.expires_at!).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              Manage your subscription, update payment methods, or cancel anytime in your{" "}
              <Button 
                variant="link" 
                className="p-0 h-auto text-xs text-primary"
                onClick={() => navigate('/settings')}
              >
                Settings
              </Button>
            </p>
          </div>
        )}

        {!userSubscription && (
          <div className="mt-16 space-y-8">
            <Card className="glass-luxury p-8 max-w-4xl mx-auto shadow-luxury">
              <h3 className="text-2xl font-bold text-center mb-8 text-gradient-luxury">
                Why FluentPass is Your Ultimate German Learning Partner
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center space-y-3">
                  <div className="inline-flex p-4 rounded-full bg-primary/10 mb-2">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-bold text-lg">AI-Powered Precision</h4>
                  <p className="text-sm text-muted-foreground">
                    Advanced AI analyzes your speech, writing, and comprehension to deliver personalized feedback that accelerates your progress exponentially.
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="inline-flex p-4 rounded-full bg-accent/10 mb-2">
                    <Award className="w-8 h-8 text-accent" />
                  </div>
                  <h4 className="font-bold text-lg">TELC B2 Certified</h4>
                  <p className="text-sm text-muted-foreground">
                    Our curriculum is specifically designed for TELC B2 success, with exam-focused exercises and strategies that have helped thousands pass with confidence.
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="inline-flex p-4 rounded-full bg-primary/10 mb-2">
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-bold text-lg">Proven Results</h4>
                  <p className="text-sm text-muted-foreground">
                    Track your improvement with detailed analytics, achieve measurable milestones, and join successful learners who've mastered German faster than traditional methods.
                  </p>
                </div>
              </div>
            </Card>

            <div className="text-center max-w-2xl mx-auto">
              <p className="text-muted-foreground text-sm">
                <Shield className="w-4 h-4 inline mr-1 text-primary" />
                30-day money-back guarantee • Secure payment processing • No commitment required
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;
