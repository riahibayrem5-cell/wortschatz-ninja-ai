// Update this page (the content is just a fallback if you fail to update the page)

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, Brain, MessageSquare, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-hero">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-12 h-12 text-primary mr-3" />
            <h1 className="text-6xl font-bold text-gradient">WortschatzNinja</h1>
          </div>
          
          <p className="text-xl text-muted-foreground mb-4">
            Master German at B2-C1 level with AI-powered learning
          </p>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Vocabulary building, sentence analysis, and spaced repetition - all powered by advanced AI to accelerate your German learning journey.
          </p>

          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="gradient-primary hover:opacity-90 transition-opacity text-lg px-8 glow"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              variant="outline"
              className="glass text-lg px-8"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="glass p-8 rounded-xl hover:glow transition-all duration-300">
            <BookOpen className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-2xl font-semibold mb-3">Smart Vocabulary</h3>
            <p className="text-muted-foreground">
              Generate contextual B2-C1 vocabulary by topic with examples and definitions
            </p>
          </div>

          <div className="glass p-8 rounded-xl hover:glow transition-all duration-300">
            <MessageSquare className="w-12 h-12 text-accent mb-4" />
            <h3 className="text-2xl font-semibold mb-3">Sentence Analysis</h3>
            <p className="text-muted-foreground">
              Create complex sentences with detailed grammatical breakdowns
            </p>
          </div>

          <div className="glass p-8 rounded-xl hover:glow transition-all duration-300">
            <Brain className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-2xl font-semibold mb-3">Spaced Repetition</h3>
            <p className="text-muted-foreground">
              Review vocabulary at optimal intervals for long-term retention
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
