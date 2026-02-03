import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription, PremiumFeature, PREMIUM_FEATURES } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock, Sparkles, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PremiumGateProps {
  feature: PremiumFeature;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
}

export const PremiumGate = ({ 
  feature, 
  children, 
  fallback, 
  showUpgradePrompt = true 
}: PremiumGateProps) => {
  const navigate = useNavigate();
  const { isLoading, checkFeatureAccess, tier, tierName } = useSubscription();

  if (isLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const hasAccess = checkFeatureAccess(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  const featureInfo = PREMIUM_FEATURES[feature];
  const requiredTier = featureInfo.minTier;
  const tierColors = {
    basic: 'from-blue-500 to-cyan-500',
    pro: 'from-purple-500 to-pink-500',
    premium: 'from-amber-500 to-orange-500',
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-lg w-full glass-luxury border-primary/20 overflow-hidden">
        {/* Decorative header */}
        <div className={`h-2 bg-gradient-to-r ${tierColors[requiredTier as keyof typeof tierColors] || tierColors.basic}`} />
        
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Premium Feature</CardTitle>
          <CardDescription className="text-base">
            {featureInfo.name} requires a {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} subscription or higher
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Current vs Required */}
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Your Plan</p>
              <Badge variant="secondary" className="text-sm">
                {tierName || 'Free'}
              </Badge>
            </div>
            <Zap className="h-4 w-4 text-muted-foreground" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Required</p>
              <Badge className={`bg-gradient-to-r ${tierColors[requiredTier as keyof typeof tierColors] || tierColors.basic} text-white`}>
                <Crown className="h-3 w-3 mr-1" />
                {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Feature description */}
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">
              {featureInfo.description}
            </p>
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/subscriptions')} 
              className="w-full gradient-luxury text-primary-foreground font-semibold py-6"
              size="lg"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Upgrade to {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)}
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Cancel anytime • Secure payment • Instant access
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

// Quick check component for inline gating
export const RequiresPremium = ({ 
  feature, 
  children,
  inline = false 
}: { 
  feature: PremiumFeature; 
  children: ReactNode;
  inline?: boolean;
}) => {
  const { checkFeatureAccess, isLoading } = useSubscription();
  const navigate = useNavigate();
  
  if (isLoading) return null;
  
  if (checkFeatureAccess(feature)) {
    return <>{children}</>;
  }

  if (inline) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => navigate('/subscriptions')}
        className="gap-2"
      >
        <Lock className="h-3 w-3" />
        Upgrade
      </Button>
    );
  }

  return null;
};
