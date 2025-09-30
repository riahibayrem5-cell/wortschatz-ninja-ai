import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { BookOpen, MessageSquare, Target, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);

      // Fetch progress
      const { data } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", session.user.id)
        .single();
      
      setProgress(data);
    };

    checkUser();
  }, [navigate]);

  const features = [
    {
      title: "Vocabulary Generator",
      description: "Learn new B2-C1 level German words by topic",
      icon: BookOpen,
      path: "/vocabulary",
      color: "text-primary",
    },
    {
      title: "Sentence Generator",
      description: "Practice with context-rich German sentences",
      icon: MessageSquare,
      path: "/sentence-generator",
      color: "text-accent",
    },
    {
      title: "Writing Assistant",
      description: "Get detailed feedback on your German writing",
      icon: Target,
      path: "/writing",
      color: "text-primary",
    },
    {
      title: "Exercises",
      description: "Quizzes and translation challenges",
      icon: BookOpen,
      path: "/exercises",
      color: "text-accent",
    },
    {
      title: "The Memorizer",
      description: "Memorize paragraphs for better fluency",
      icon: Brain,
      path: "/memorizer",
      color: "text-primary",
    },
    {
      title: "Conversation Practice",
      description: "Chat with AI in realistic scenarios",
      icon: MessageSquare,
      path: "/conversation",
      color: "text-accent",
    },
    {
      title: "Text Highlighter",
      description: "Identify B2+ vocabulary in articles",
      icon: Target,
      path: "/highlighter",
      color: "text-primary",
    },
    {
      title: "Mistake Diary",
      description: "Track and learn from your mistakes",
      icon: BookOpen,
      path: "/diary",
      color: "text-accent",
    },
    {
      title: "Review Words",
      description: "Spaced repetition practice",
      icon: Brain,
      path: "/review",
      color: "text-primary",
    },
  ];

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      <div className="container max-w-6xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8 pt-4 text-gradient">Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 glass">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Words Learned</p>
                <p className="text-3xl font-bold text-primary">{progress?.words_learned || 0}</p>
              </div>
              <Target className="w-8 h-8 text-primary opacity-50" />
            </div>
          </Card>
          
          <Card className="p-6 glass">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Exercises Done</p>
                <p className="text-3xl font-bold text-accent">{progress?.exercises_completed || 0}</p>
              </div>
              <BookOpen className="w-8 h-8 text-accent opacity-50" />
            </div>
          </Card>
          
          <Card className="p-6 glass">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Day Streak</p>
                <p className="text-3xl font-bold text-primary">{progress?.streak_days || 0}</p>
              </div>
              <Brain className="w-8 h-8 text-primary opacity-50" />
            </div>
          </Card>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card
              key={feature.path}
              className="p-6 glass hover:glow transition-all duration-300 cursor-pointer group"
              onClick={() => navigate(feature.path)}
            >
              <feature.icon className={`w-12 h-12 ${feature.color} mb-4 group-hover:scale-110 transition-transform`} />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;