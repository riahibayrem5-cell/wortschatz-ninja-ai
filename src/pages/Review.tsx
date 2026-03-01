import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Brain, Trophy, RotateCcw } from "lucide-react";
import AudioButton from "@/components/AudioButton";
import Navbar from "@/components/Navbar";
import { trackActivity } from "@/utils/activityTracker";
import { useLanguage } from "@/contexts/LanguageContext";
import { Progress } from "@/components/ui/progress";
import { PageBanner } from "@/components/PageBanner";
import { 
  type Rating, type FSRSCard,
  migrateFromSRS, scheduleFSRS, getIntervalLabels, getRetrievability 
} from "@/utils/fsrs";

const RATING_CONFIG: Array<{ rating: Rating; label: string; color: string; key: string }> = [
  { rating: 1, label: "Again", color: "bg-destructive/10 hover:bg-destructive/20 border-destructive/30 text-destructive", key: "1" },
  { rating: 2, label: "Hard", color: "bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/30 text-yellow-600", key: "2" },
  { rating: 3, label: "Good", color: "bg-primary/10 hover:bg-primary/20 border-primary/30 text-primary", key: "3" },
  { rating: 4, label: "Easy", color: "bg-accent/10 hover:bg-accent/20 border-accent/30 text-accent", key: "4" },
];

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showAnswer) {
        if (e.code === "Space" || e.key === "Enter") {
          e.preventDefault();
          setShowAnswer(true);
        }
      } else {
        const num = parseInt(e.key);
        if (num >= 1 && num <= 4) {
          e.preventDefault();
          handleReview(num as Rating);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAnswer, currentIndex, dueItems]);

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

  const getFSRSCard = (item: any): FSRSCard => {
    return migrateFromSRS(item.srs_level || 0, item.last_reviewed_at);
  };

  const handleReview = async (rating: Rating) => {
    const item = dueItems[currentIndex];
    const fsrsCard = getFSRSCard(item);
    const result = scheduleFSRS(fsrsCard, rating);

    // Map back to srs_level for DB compatibility
    const newSrsLevel = rating === 1 
      ? Math.max(0, (item.srs_level || 0) - 1) 
      : Math.min(6, (item.srs_level || 0) + (rating >= 3 ? 1 : 0));

    try {
      const { error } = await supabase
        .from("vocabulary_items")
        .update({
          srs_level: newSrsLevel,
          next_review_date: result.next_review_date,
          last_reviewed_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      if (error) throw error;
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
  const fsrsCard = getFSRSCard(currentItem);
  const intervalLabels = getIntervalLabels(fsrsCard);
  const retrievability = getRetrievability(fsrsCard);

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      <div className="container max-w-4xl mx-auto p-4 space-y-6">
        <PageBanner
          type="review"
          title={t('reviewPage')}
          subtitle="Review your vocabulary with FSRS spaced repetition"
          icon={RotateCcw}
          compact
        />
        
        {/* Progress Header */}
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {t('reviewPage')}: {currentIndex + 1} / {dueItems.length}
            </span>
            <div className="flex items-center gap-2">
              {retrievability > 0 && (
                <Badge variant="outline" className="text-[10px]">
                  Recall: {Math.round(retrievability * 100)}%
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">
                {Math.round(progressPercent)}%
              </span>
            </div>
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
              
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Brain className="w-4 h-4" />
                <span>Think about the meaning first · Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">Space</kbd></span>
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

              {/* FSRS Rating Buttons */}
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">How well did you know this?</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {RATING_CONFIG.map(({ rating, label, color, key }) => (
                    <Button
                      key={rating}
                      onClick={() => handleReview(rating)}
                      variant="outline"
                      className={`flex flex-col h-auto py-3 transition-all hover:scale-105 ${color}`}
                    >
                      <span className="font-semibold text-sm">{label}</span>
                      <span className="text-[10px] opacity-70 mt-0.5">{intervalLabels[rating]}</span>
                      <kbd className="text-[9px] opacity-50 mt-1 font-mono">{key}</kbd>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Review;
