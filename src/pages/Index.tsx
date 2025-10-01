// Update this page (the content is just a fallback if you fail to update the page)

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, Brain, MessageSquare, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-hero">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-16 pb-24">
        <div className="text-center max-w-5xl mx-auto">
          <div className="flex items-center justify-center mb-6 animate-fade-in">
            <Sparkles className="w-14 h-14 text-primary mr-3" />
            <h1 className="text-6xl md:text-7xl font-bold text-gradient">WortschatzNinja</h1>
          </div>
          
          <p className="text-2xl md:text-3xl font-semibold mb-4 animate-fade-in">
            Master German B2-C1 Like Never Before
          </p>
          <p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto animate-fade-in">
            Transform your German learning journey with AI-powered tools designed specifically for advanced learners. 
            Achieve fluency faster with personalized vocabulary, real-time feedback, and authentic TELC B2 exam preparation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in">
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="gradient-primary hover:opacity-90 transition-opacity text-lg px-10 py-6 glow"
            >
              Start Learning Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              variant="outline"
              className="glass text-lg px-10 py-6"
            >
              Sign In
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <span>✓ No credit card required</span>
            <span>✓ Full TELC B2 mock exams</span>
            <span>✓ AI-powered feedback</span>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <div className="text-center glass p-6 rounded-xl">
            <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
            <div className="text-sm text-muted-foreground">Vocabulary Items</div>
          </div>
          <div className="text-center glass p-6 rounded-xl">
            <div className="text-3xl font-bold text-accent mb-2">95%</div>
            <div className="text-sm text-muted-foreground">Exam Success Rate</div>
          </div>
          <div className="text-center glass p-6 rounded-xl">
            <div className="text-3xl font-bold text-primary mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">AI Tutor Available</div>
          </div>
          <div className="text-center glass p-6 rounded-xl">
            <div className="text-3xl font-bold text-accent mb-2">B2-C1</div>
            <div className="text-sm text-muted-foreground">Level Focused</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-gradient">Everything You Need to Succeed</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools designed for serious German learners targeting B2-C1 proficiency
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="glass p-8 rounded-xl hover:glow transition-all duration-300">
            <BookOpen className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-2xl font-semibold mb-3">Smart Vocabulary Builder</h3>
            <p className="text-muted-foreground mb-4">
              Generate contextual B2-C1 vocabulary by topic with native examples, pronunciations, and usage notes. AI creates personalized word lists based on your level.
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Topic-specific vocabulary</li>
              <li>• Audio pronunciations</li>
              <li>• Real-world examples</li>
              <li>• Spaced repetition system</li>
            </ul>
          </div>

          <div className="glass p-8 rounded-xl hover:glow transition-all duration-300">
            <MessageSquare className="w-12 h-12 text-accent mb-4" />
            <h3 className="text-2xl font-semibold mb-3">AI Writing Assistant</h3>
            <p className="text-muted-foreground mb-4">
              Get instant feedback on your German writing with detailed error analysis, corrections, and B2-C1 level suggestions. Practice with authentic TELC prompts.
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Grammar & style corrections</li>
              <li>• Vocabulary enhancement</li>
              <li>• TELC B2 prompt practice</li>
              <li>• Detailed explanations</li>
            </ul>
          </div>

          <div className="glass p-8 rounded-xl hover:glow transition-all duration-300">
            <Brain className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-2xl font-semibold mb-3">Full TELC B2 Mock Exams</h3>
            <p className="text-muted-foreground mb-4">
              Practice all exam sections with AI-generated content that matches real TELC B2 format. Get instant scoring and detailed feedback on every section.
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Reading comprehension</li>
              <li>• Listening with audio</li>
              <li>• Writing evaluation</li>
              <li>• Speaking assessment</li>
            </ul>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gradient">How It Works</h2>
          
          <div className="space-y-8">
            <div className="flex gap-6 items-start glass p-6 rounded-xl">
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Create Your Free Account</h3>
                <p className="text-muted-foreground">
                  Sign up in seconds and access all features immediately. No credit card required.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start glass p-6 rounded-xl">
              <div className="bg-accent text-accent-foreground rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Choose Your Learning Path</h3>
                <p className="text-muted-foreground">
                  Build vocabulary, practice writing, take mock exams, or use all tools together for comprehensive learning.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start glass p-6 rounded-xl">
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Get AI-Powered Feedback</h3>
                <p className="text-muted-foreground">
                  Receive instant, detailed feedback on everything you do. Track your progress and watch your German improve daily.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 pb-20">
        <div className="glass p-12 rounded-2xl max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Master German?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of learners achieving B2-C1 fluency with WortschatzNinja
          </p>
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="gradient-primary hover:opacity-90 transition-opacity text-lg px-12 py-6 glow"
          >
            Start Learning Free Today
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
