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
        <div className="text-center max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center mb-8 animate-fade-in">
            <div className="relative mb-6">
              <div className="absolute inset-0 blur-3xl opacity-30 bg-gradient-luxury"></div>
              <img 
                src="/fluentpass-logo.png" 
                alt="FluentPass - German Language Learning Platform" 
                className="relative w-32 h-32 md:w-40 md:h-40 luxury-glow hover:scale-105 transition-transform duration-300 object-contain" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <h1 className="text-6xl md:text-8xl font-bold text-gradient-luxury mb-2">FluentPass</h1>
            <div className="h-1 w-32 bg-gradient-luxury rounded-full"></div>
          </div>
          
          <p className="text-3xl md:text-4xl font-bold mb-6 animate-fade-in text-foreground">
            Master German B2-C1 Like Never Before
          </p>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-4xl mx-auto animate-fade-in leading-relaxed">
            Transform your German learning journey with AI-powered tools designed specifically for advanced learners. 
            Achieve fluency faster with personalized vocabulary, real-time feedback, and authentic TELC B2 exam preparation.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12 animate-fade-in">
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="gradient-luxury hover:scale-105 transition-all text-xl px-14 py-8 luxury-glow font-bold shadow-2xl"
            >
              Start Learning Free
              <ArrowRight className="ml-3 w-6 h-6" />
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              variant="outline"
              className="glass-luxury text-xl px-14 py-8 hover:scale-105 transition-all font-semibold border-2"
            >
              Sign In
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm md:text-base text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="text-primary text-xl">✓</span> No credit card required
            </span>
            <span className="flex items-center gap-2">
              <span className="text-primary text-xl">✓</span> Full TELC B2 mock exams
            </span>
            <span className="flex items-center gap-2">
              <span className="text-primary text-xl">✓</span> AI-powered feedback
            </span>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
          <div className="text-center glass-luxury p-8 rounded-2xl hover:scale-105 transition-all duration-300 hover:luxury-glow">
            <div className="text-4xl md:text-5xl font-bold text-gradient-luxury mb-3">10,000+</div>
            <div className="text-sm md:text-base text-muted-foreground font-medium">Vocabulary Items</div>
          </div>
          <div className="text-center glass-luxury p-8 rounded-2xl hover:scale-105 transition-all duration-300 hover:luxury-glow">
            <div className="text-4xl md:text-5xl font-bold text-gradient-luxury mb-3">95%</div>
            <div className="text-sm md:text-base text-muted-foreground font-medium">Exam Success Rate</div>
          </div>
          <div className="text-center glass-luxury p-8 rounded-2xl hover:scale-105 transition-all duration-300 hover:luxury-glow">
            <div className="text-4xl md:text-5xl font-bold text-gradient-luxury mb-3">24/7</div>
            <div className="text-sm md:text-base text-muted-foreground font-medium">AI Tutor Available</div>
          </div>
          <div className="text-center glass-luxury p-8 rounded-2xl hover:scale-105 transition-all duration-300 hover:luxury-glow">
            <div className="text-4xl md:text-5xl font-bold text-gradient-luxury mb-3">B2-C1</div>
            <div className="text-sm md:text-base text-muted-foreground font-medium">Level Focused</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 pb-24">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-gradient-luxury">Everything You Need to Succeed</h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Comprehensive tools designed for serious German learners targeting B2-C1 proficiency
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="glass-luxury p-10 rounded-2xl hover:luxury-glow hover:scale-105 transition-all duration-300 group">
            <div className="bg-gradient-primary rounded-xl p-4 w-fit mb-6 group-hover:scale-110 transition-transform">
              <BookOpen className="w-10 h-10 text-primary-foreground" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Smart Vocabulary Builder</h3>
            <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
              Generate contextual B2-C1 vocabulary by topic with native examples, pronunciations, and usage notes. AI creates personalized word lists based on your level.
            </p>
            <ul className="text-base text-muted-foreground space-y-3">
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span> Topic-specific vocabulary
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span> Audio pronunciations
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span> Real-world examples
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span> Spaced repetition system
              </li>
            </ul>
          </div>

          <div className="glass-luxury p-10 rounded-2xl hover:luxury-glow hover:scale-105 transition-all duration-300 group">
            <div className="bg-gradient-accent rounded-xl p-4 w-fit mb-6 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-10 h-10 text-accent-foreground" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-4">AI Writing Assistant</h3>
            <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
              Get instant feedback on your German writing with detailed error analysis, corrections, and B2-C1 level suggestions. Practice with authentic TELC prompts.
            </p>
            <ul className="text-base text-muted-foreground space-y-3">
              <li className="flex items-center gap-2">
                <span className="text-accent">•</span> Grammar & style corrections
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent">•</span> Vocabulary enhancement
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent">•</span> TELC B2 prompt practice
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent">•</span> Detailed explanations
              </li>
            </ul>
          </div>

          <div className="glass-luxury p-10 rounded-2xl hover:luxury-glow hover:scale-105 transition-all duration-300 group md:col-span-2 lg:col-span-1">
            <div className="bg-gradient-primary rounded-xl p-4 w-fit mb-6 group-hover:scale-110 transition-transform">
              <Brain className="w-10 h-10 text-primary-foreground" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Full TELC B2 Mock Exams</h3>
            <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
              Practice all exam sections with AI-generated content that matches real TELC B2 format. Get instant scoring and detailed feedback on every section.
            </p>
            <ul className="text-base text-muted-foreground space-y-3">
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span> Reading comprehension
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span> Listening with audio
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span> Writing evaluation
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span> Speaking assessment
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-4 pb-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-center mb-16 text-gradient-luxury">How It Works</h2>
          
          <div className="space-y-8">
            <div className="flex gap-8 items-start glass-luxury p-10 rounded-2xl hover:scale-105 transition-all duration-300">
              <div className="gradient-primary rounded-full w-16 h-16 flex items-center justify-center font-bold text-2xl flex-shrink-0 shadow-lg">
                1
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3">Create Your Free Account</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Sign up in seconds and access all features immediately. No credit card required, no hidden fees—just pure learning power.
                </p>
              </div>
            </div>

            <div className="flex gap-8 items-start glass-luxury p-10 rounded-2xl hover:scale-105 transition-all duration-300">
              <div className="gradient-accent rounded-full w-16 h-16 flex items-center justify-center font-bold text-2xl flex-shrink-0 shadow-lg">
                2
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3">Choose Your Learning Path</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Build vocabulary, practice writing, take mock exams, or use all tools together for comprehensive learning tailored to your goals.
                </p>
              </div>
            </div>

            <div className="flex gap-8 items-start glass-luxury p-10 rounded-2xl hover:scale-105 transition-all duration-300">
              <div className="gradient-primary rounded-full w-16 h-16 flex items-center justify-center font-bold text-2xl flex-shrink-0 shadow-lg">
                3
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3">Get AI-Powered Feedback</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Receive instant, detailed feedback on everything you do. Track your progress and watch your German improve daily with personalized insights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 pb-24">
        <div className="glass-luxury p-16 md:p-20 rounded-3xl max-w-5xl mx-auto text-center luxury-glow">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-gradient-luxury">Ready to Master German?</h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            Join thousands of learners achieving B2-C1 fluency with FluentPass. Start your journey to excellence today.
          </p>
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="gradient-luxury hover:scale-105 transition-all text-xl px-16 py-8 luxury-glow font-bold shadow-2xl"
          >
            Start Learning Free Today
            <ArrowRight className="ml-3 w-6 h-6" />
          </Button>
          <p className="text-sm text-muted-foreground mt-6">No credit card required • Cancel anytime • Full TELC B2 access</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
