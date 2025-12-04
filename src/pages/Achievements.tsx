import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Trophy, 
  Star, 
  Loader2, 
  Lock,
  CheckCircle2,
  Zap,
  Flame
} from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: number;
  points: number;
  badge_color: string;
}

interface UserAchievement {
  achievement_id: string;
  progress: number;
  completed: boolean;
  unlocked_at: string | null;
}

const Achievements = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [totalXP, setTotalXP] = useState(0);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Load all achievements
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select('*')
        .order('category', { ascending: true });

      setAchievements(achievementsData || []);

      // Load user achievements
      const { data: userAchievementsData } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', session.user.id);

      setUserAchievements(userAchievementsData || []);

      // Calculate total XP
      const xp = (userAchievementsData || [])
        .filter(ua => ua.completed)
        .reduce((sum, ua) => {
          const achievement = achievementsData?.find(a => a.id === ua.achievement_id);
          return sum + (achievement?.points || 0);
        }, 0);
      setTotalXP(xp);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAchievements = async () => {
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-achievements');
      
      if (error) throw error;

      if (data.newlyUnlocked && data.newlyUnlocked.length > 0) {
        data.newlyUnlocked.forEach((achievement: Achievement) => {
          toast({
            title: `🏆 Achievement Unlocked!`,
            description: `${achievement.icon} ${achievement.name} - +${achievement.points} XP`,
          });
        });
      } else {
        toast({ title: "Achievements checked!", description: "Keep going to unlock more!" });
      }

      setTotalXP(data.totalXP || 0);
      loadAchievements();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setChecking(false);
    }
  };

  const getUserAchievement = (achievementId: string) => {
    return userAchievements.find(ua => ua.achievement_id === achievementId);
  };

  const getProgressPercentage = (achievement: Achievement, userAchievement?: UserAchievement) => {
    if (!userAchievement) return 0;
    return Math.min(100, (userAchievement.progress / achievement.requirement) * 100);
  };

  const categoryOrder = ['streak', 'vocabulary', 'exercises', 'telc', 'conversation', 'writing', 'special'];
  const sortedAchievements = [...achievements].sort((a, b) => {
    return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
  });

  const groupedAchievements = sortedAchievements.reduce((groups, achievement) => {
    const category = achievement.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(achievement);
    return groups;
  }, {} as Record<string, Achievement[]>);

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'streak': return '🔥 Streak Achievements';
      case 'vocabulary': return '📚 Vocabulary Mastery';
      case 'exercises': return '💪 Exercise Achievements';
      case 'telc': return '🎓 TELC Exam';
      case 'conversation': return '💬 Conversation';
      case 'writing': return '✍️ Writing';
      case 'special': return '⭐ Special Achievements';
      default: return category;
    }
  };

  const unlockedCount = userAchievements.filter(ua => ua.completed).length;

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
      
      <div className="container max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-yellow-500" />
            <h1 className="text-3xl md:text-4xl font-bold text-gradient-luxury">
              Achievements
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Unlock achievements as you progress on your German learning journey
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="glass-luxury text-center">
            <CardContent className="p-4">
              <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold text-gradient-luxury">{totalXP}</p>
              <p className="text-xs text-muted-foreground">Total XP</p>
            </CardContent>
          </Card>
          <Card className="glass text-center">
            <CardContent className="p-4">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{unlockedCount}/{achievements.length}</p>
              <p className="text-xs text-muted-foreground">Unlocked</p>
            </CardContent>
          </Card>
          <Card className="glass text-center">
            <CardContent className="p-4">
              <Star className="w-8 h-8 mx-auto mb-2 text-accent" />
              <p className="text-2xl font-bold">{Math.round((unlockedCount / achievements.length) * 100)}%</p>
              <p className="text-xs text-muted-foreground">Complete</p>
            </CardContent>
          </Card>
        </div>

        {/* Check Achievements Button */}
        <div className="text-center">
          <Button 
            onClick={checkAchievements} 
            disabled={checking}
            className="gradient-primary gap-2"
          >
            {checking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Flame className="w-4 h-4" />
            )}
            Check for New Achievements
          </Button>
        </div>

        {/* Achievement Categories */}
        {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
          <div key={category} className="space-y-3">
            <h2 className="text-lg font-semibold">{getCategoryTitle(category)}</h2>
            <div className="grid gap-3">
              {categoryAchievements.map((achievement) => {
                const userAchievement = getUserAchievement(achievement.id);
                const isUnlocked = userAchievement?.completed;
                const progressPercent = getProgressPercentage(achievement, userAchievement);

                return (
                  <Card 
                    key={achievement.id} 
                    className={`transition-all ${
                      isUnlocked 
                        ? 'glass-luxury border-primary/30' 
                        : 'glass opacity-80'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`text-4xl ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold ${isUnlocked ? '' : 'text-muted-foreground'}`}>
                              {achievement.name}
                            </h3>
                            <Badge 
                              variant={isUnlocked ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {achievement.points} XP
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {achievement.description}
                          </p>
                          {!isUnlocked && (
                            <div className="space-y-1">
                              <Progress value={progressPercent} className="h-2" />
                              <p className="text-xs text-muted-foreground">
                                {userAchievement?.progress || 0} / {achievement.requirement}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          {isUnlocked ? (
                            <CheckCircle2 className="w-8 h-8 text-primary" />
                          ) : (
                            <Lock className="w-8 h-8 text-muted-foreground" />
                          )}
                          {isUnlocked && userAchievement?.unlocked_at && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(userAchievement.unlocked_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;
