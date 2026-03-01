import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Infinity, ArrowRight } from "lucide-react";
import { useAIUsage } from "@/hooks/useAIUsage";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

const AIUsageWidget = () => {
  const navigate = useNavigate();
  const { tier, currentUsage, maxRequests, remaining, isUnlimited, isLoading, getUsagePercentage, isNearLimit, isAtLimit } = useAIUsage();

  if (isLoading) {
    return (
      <Card className="glass">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-4 w-20" />
        </CardContent>
      </Card>
    );
  }

  const percentage = getUsagePercentage();

  return (
    <Card className={`glass ${isAtLimit() ? 'border-destructive/30' : isNearLimit() ? 'border-yellow-500/30' : 'border-primary/20'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 text-primary" />
            AI Usage
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            {tier}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isUnlimited ? (
          <div className="flex items-center gap-2 text-sm">
            <Infinity className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Unlimited requests</span>
          </div>
        ) : (
          <>
            <div>
              <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                <span>{currentUsage} used today</span>
                <span>{remaining} remaining</span>
              </div>
              <Progress 
                value={percentage} 
                className={`h-1.5 ${isAtLimit() ? '[&>div]:bg-destructive' : isNearLimit() ? '[&>div]:bg-yellow-500' : ''}`}
              />
            </div>
            {isAtLimit() && (
              <p className="text-[11px] text-destructive font-medium">
                Daily limit reached. Upgrade for more.
              </p>
            )}
            {isNearLimit() && !isAtLimit() && (
              <p className="text-[11px] text-yellow-600 font-medium">
                Running low — {remaining} requests left today.
              </p>
            )}
          </>
        )}

        <div className="grid grid-cols-2 gap-1.5 text-center">
          <div className="p-1.5 rounded-md bg-primary/10">
            <p className="text-xs font-bold text-primary">{currentUsage}</p>
            <p className="text-[9px] text-muted-foreground">Today</p>
          </div>
          <div className="p-1.5 rounded-md bg-muted/30">
            <p className="text-xs font-bold">{maxRequests ?? '∞'}</p>
            <p className="text-[9px] text-muted-foreground">Daily Limit</p>
          </div>
        </div>

        {!isUnlimited && (
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs group"
            onClick={() => navigate('/subscriptions')}
          >
            Upgrade Plan
            <ArrowRight className="w-3 h-3 ml-auto group-hover:translate-x-1 transition-transform" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default AIUsageWidget;
