import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Check, X } from "lucide-react";

const Review = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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

      if (currentIndex < dueItems.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
      } else {
        toast({ title: "Review complete!", description: "Great work!" });
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (dueItems.length === 0) {
    return (
      <div className="min-h-screen gradient-hero p-4">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            size="sm"
            className="mb-6 glass"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Card className="p-12 glass text-center">
            <h2 className="text-2xl font-bold mb-4">No reviews due!</h2>
            <p className="text-muted-foreground">Come back later or add more vocabulary.</p>
          </Card>
        </div>
      </div>
    );
  }

  const currentItem = dueItems[currentIndex];

  return (
    <div className="min-h-screen gradient-hero p-4">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => navigate("/dashboard")}
          variant="outline"
          size="sm"
          className="mb-6 glass"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-4 text-center">
          <p className="text-muted-foreground">
            {currentIndex + 1} / {dueItems.length}
          </p>
        </div>

        <Card className="p-12 glass glow text-center">
          <h2 className="text-4xl font-bold text-primary mb-8">{currentItem.word}</h2>

          {!showAnswer ? (
            <Button
              onClick={() => setShowAnswer(true)}
              className="gradient-primary hover:opacity-90"
            >
              Show Answer
            </Button>
          ) : (
            <div className="space-y-6">
              <div>
                <p className="text-xl mb-4">{currentItem.definition}</p>
                <div className="p-4 bg-background/30 rounded-lg">
                  <p className="text-muted-foreground italic">{currentItem.example}</p>
                </div>
              </div>

              <div className="flex gap-4 justify-center pt-6">
                <Button
                  onClick={() => handleReview(false)}
                  variant="outline"
                  size="lg"
                  className="glass hover:bg-destructive/20"
                >
                  <X className="w-5 h-5 mr-2" />
                  Needs Practice
                </Button>
                <Button
                  onClick={() => handleReview(true)}
                  size="lg"
                  className="gradient-accent hover:opacity-90"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Knew It
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