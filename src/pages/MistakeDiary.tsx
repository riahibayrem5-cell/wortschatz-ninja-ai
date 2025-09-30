import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, AlertCircle } from "lucide-react";

interface Mistake {
  id: string;
  type: string;
  content: string;
  correction: string;
  explanation: string;
  category: string;
  created_at: string;
}

const MistakeDiary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchMistakes();
  }, []);

  const fetchMistakes = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("mistakes")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMistakes(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredMistakes = filter === 'all' 
    ? mistakes 
    : mistakes.filter(m => m.category === filter);

  const categories = ['all', ...new Set(mistakes.map(m => m.category))];

  const getMistakesByType = () => {
    const types: { [key: string]: number } = {};
    mistakes.forEach(m => {
      types[m.type] = (types[m.type] || 0) + 1;
    });
    return types;
  };

  const mistakeTypes = getMistakesByType();

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero p-4">
      <div className="max-w-6xl mx-auto">
        <Button
          onClick={() => navigate("/dashboard")}
          variant="outline"
          size="sm"
          className="mb-6 glass"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="p-8 glass mb-8">
          <h1 className="text-3xl font-bold mb-6 text-gradient">Mistake Diary</h1>
          
          {Object.keys(mistakeTypes).length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {Object.entries(mistakeTypes).map(([type, count]) => (
                <Card key={type} className="p-4 glass">
                  <p className="text-2xl font-bold text-primary">{count}</p>
                  <p className="text-sm text-muted-foreground capitalize">{type}</p>
                </Card>
              ))}
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <Button
                key={cat}
                onClick={() => setFilter(cat)}
                variant={filter === cat ? 'default' : 'outline'}
                size="sm"
                className={filter === cat ? 'gradient-primary' : 'glass'}
              >
                {cat === 'all' ? 'All' : cat}
              </Button>
            ))}
          </div>
        </Card>

        {filteredMistakes.length === 0 ? (
          <Card className="p-12 glass text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No mistakes yet!</h2>
            <p className="text-muted-foreground">
              Mistakes will be automatically logged as you practice.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredMistakes.map((mistake) => (
              <Card key={mistake.id} className="p-6 glass hover:glow transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-destructive/20 text-destructive px-2 py-1 rounded">
                      {mistake.type}
                    </span>
                    <span className="text-xs bg-background/30 px-2 py-1 rounded text-muted-foreground">
                      {mistake.category}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(mistake.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Your version:</p>
                    <p className="text-foreground font-mono text-destructive">{mistake.content}</p>
                  </div>

                  {mistake.correction && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Correction:</p>
                      <p className="text-foreground font-mono text-accent">{mistake.correction}</p>
                    </div>
                  )}

                  {mistake.explanation && (
                    <div className="p-3 bg-background/30 rounded-lg">
                      <p className="text-sm text-foreground">{mistake.explanation}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MistakeDiary;