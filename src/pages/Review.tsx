import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Brain, Trophy, RotateCcw } from "lucide-react";
import AudioButton from "@/components/AudioButton";
import Navbar from "@/components/Navbar";
import { trackActivity } from "@/utils/activityTracker";
import { useLanguage } from "@/contexts/LanguageContext";
import { Progress } from "@/components/ui/progress";
import { PageBanner } from "@/components/PageBanner";
const Review = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [dueItems, setDueItems] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDueItems();
  }, []);

  const fetchDueItems = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("vocabulary_items")
        .select("*")
        .eq("user_id", session.user.id)
        .lte("next_review_date", new Date().toISOString())
        .order("next_review_date", { ascending: true });

      if (error) throw error;
      setDueItems(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (knew: boolean) => {
    const item = dueItems[currentIndex];
    const newLevel = knew ? item.srs_level + 1 : Math.max(0, item.srs_level - 1);
    
    // Calculate next review date based on SRS level
    const intervals = [1, 3, 7, 14, 30, 60, 120]; // days
    const daysToAdd = intervals[Math.min(newLevel, intervals.length - 1)];
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + daysToAdd);

    try {
      const { error } = await supabase
        .from("vocabulary_items")
        .update({
          srs_level: newLevel,
          next_review_date: nextReview.toISOString(),
          last_reviewed_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      if (error) throw error;

      // Track review activity
      await trackActivity('review', 1);

      if (currentIndex < dueItems.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
      } else {
        toast({ title: t('reviewComplete'), description: t('greatWork') });
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center space-y-4">
            <Brain className="w-16 h-16 mx-auto text-primary animate-pulse" />
            <p className="text-muted-foreground">{t('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (dueItems.length === 0) {
    return (
      <div className="min-h-screen gradient-hero">
        <Navbar />
        <div className="container max-w-4xl mx-auto p-4">
          <Card className="p-12 glass text-center mt-6 animate-fade-in">
            <Trophy className="w-24 h-24 mx-auto mb-6 text-accent" />
            <h2 className="text-3xl font-bold mb-4 text-gradient">{t('noReviewsDue')}</h2>
            <p className="text-muted-foreground text-lg">{t('comeBackLater')}</p>
            <Button 
              onClick={() => navigate('/vocabulary')}
              className="mt-6 gradient-primary hover:opacity-90"
            >
              {t('vocabulary')}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const currentItem = dueItems[currentIndex];
  const progressPercent = ((currentIndex + 1) / dueItems.length) * 100;

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      <div className="container max-w-4xl mx-auto p-4 space-y-6">
        <PageBanner
          type="review"
          title={t('reviewPage')}
          subtitle="Review your vocabulary with spaced repetition"
          icon={RotateCcw}
          compact
        />
        
        {/* Progress Header */}
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {t('reviewPage')}: {currentIndex + 1} / {dueItems.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <Card className="p-8 md:p-12 glass glow text-center animate-scale-in">
          {/* Word Display */}
          <div className="mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h2 className="text-5xl md:text-6xl font-bold text-gradient animate-fade-in">
                {currentItem.word}
              </h2>
              <AudioButton text={currentItem.word} lang="de-DE" />
            </div>
            {currentItem.article && (
              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                {currentItem.article}
              </p>
            )}
          </div>

          {!showAnswer ? (
            <div className="space-y-6">
              <Button
                onClick={() => setShowAnswer(true)}
                size="lg"
                className="gradient-primary hover:opacity-90 text-lg px-12 py-6 hover-scale"
              >
                {t('showAnswer')}
              </Button>
              
              {/* Visual hint */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Brain className="w-4 h-4" />
                <span>Think about the meaning first</span>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-fade-in">
              {/* Definition */}
              <div className="p-6 bg-background/40 rounded-xl border border-primary/20">
                <p className="text-2xl mb-4 text-foreground">{currentItem.definition}</p>
                {currentItem.example && (
                  <div className="p-4 bg-background/50 rounded-lg border border-primary/10">
                    <p className="text-muted-foreground italic text-lg">"{currentItem.example}"</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  onClick={() => handleReview(false)}
                  variant="outline"
                  size="lg"
                  className="glass hover:bg-destructive/20 hover:border-destructive transition-all hover-scale group"
                >
                  <X className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  {t('needsPractice')}
                </Button>
                <Button
                  onClick={() => handleReview(true)}
                  size="lg"
                  className="gradient-accent hover:opacity-90 hover-scale group"
                >
                  <Check className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  {t('knewIt')}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Review;