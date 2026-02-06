import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, BookOpen, Brain, MessageSquare, ArrowRight, 
  Headphones, PenTool, Mic, Target, Clock, Award, CheckCircle2,
  Sparkles, TrendingUp, Shield
} from "lucide-react";
import fluentpassLogo from "@/assets/fluentpass-logo-simple.png";

const Index = () => {
  const navigate = useNavigate();

  const telcSections = [
    { 
      name: "Leseverstehen", 
      points: 75, 
      icon: BookOpen, 
      color: "from-blue-500 to-cyan-500",
      description: "Reading comprehension with authentic texts"
    },
    { 
      name: "Sprachbausteine", 
      points: 30, 
      icon: Target, 
      color: "from-purple-500 to-pink-500",
      description: "Grammar & vocabulary in context"
    },
    { 
      name: "Hörverstehen", 
      points: 75, 
      icon: Headphones, 
      color: "from-green-500 to-emerald-500",
      description: "Listening with native audio"
    },
    { 
      name: "Schriftlicher Ausdruck", 
      points: 45, 
      icon: PenTool, 
      color: "from-amber-500 to-orange-500",
      description: "Formal & informal writing tasks"
    },
    { 
      name: "Mündlicher Ausdruck", 
      points: 75, 
      icon: Mic, 
      color: "from-rose-500 to-red-500",
      description: "Speaking practice with AI feedback"
    },
  ];

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Gemini AI provides instant feedback, personalized exercises, and adaptive learning paths tailored to your level."
    },
    {
      icon: Clock,
      title: "12-Week Mastery Course",
      description: "Structured curriculum with 60+ lessons covering all B2 competencies. Complete certificate upon graduation."
    },
    {
      icon: MessageSquare,
      title: "AI Conversation Partner",
      description: "Practice speaking with our AI tutor. Get pronunciation feedback and build confidence for the oral exam."
    },
    {
      icon: TrendingUp,
      title: "Progress Analytics",
      description: "Track your improvement across all skills. Identify weak areas and focus your practice effectively."
    },
    {
      icon: Award,
      title: "Achievement System",
      description: "Earn badges, certificates, and track your streak. Stay motivated with gamified learning milestones."
    },
    {
      icon: Shield,
      title: "Exam Simulation",
      description: "Full 300-point mock exams matching real TELC format. Timed sections with detailed scoring breakdown."
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 pt-8 pb-20 relative">
          {/* Header */}
          <header className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <img 
                src={fluentpassLogo} 
                alt="FluentPass" 
                className="w-10 h-10 rounded-lg shadow-lg" 
              />
              <span className="text-2xl font-bold text-gradient-luxury">FluentPass</span>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/auth")}
                className="hidden sm:inline-flex"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate("/auth")}
                className="gradient-luxury hover:opacity-90"
              >
                Get Started
              </Button>
            </div>
          </header>

          {/* Hero Content */}
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 glass-luxury px-4 py-2 rounded-full mb-8 animate-fade-in">
              <GraduationCap className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Official TELC B2 Exam Preparation</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 animate-fade-in">
              <span className="text-foreground">Pass Your </span>
              <span className="text-gradient-luxury">TELC B2</span>
              <br />
              <span className="text-foreground">Exam with </span>
              <span className="text-gradient-luxury">Confidence</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in">
              AI-powered German exam preparation with full mock exams, 
              adaptive exercises, and personalized feedback. Join thousands who've 
              achieved their B2 certification.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in">
              <Button
                onClick={() => navigate("/auth")}
                size="lg"
                className="gradient-luxury hover:scale-105 transition-all text-lg px-10 py-7 luxury-glow font-bold shadow-xl"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                onClick={() => navigate("/auth")}
                size="lg"
                variant="outline"
                className="glass-luxury text-lg px-10 py-7 hover:scale-105 transition-all font-semibold border-2"
              >
                <Sparkles className="mr-2 w-5 h-5" />
                View Demo
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-in">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Full exam access
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                AI-powered feedback
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TELC Exam Sections - The Core Product */}
      <div className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Complete <span className="text-gradient-luxury">TELC B2</span> Coverage
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Practice all 5 official exam sections with AI-generated content matching real TELC format
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto mb-12">
            {telcSections.map((section, idx) => (
              <div 
                key={idx}
                className="glass-luxury p-6 rounded-2xl hover:scale-105 transition-all duration-300 group cursor-pointer"
                onClick={() => navigate("/auth")}
              >
                <div className={`bg-gradient-to-br ${section.color} rounded-xl p-3 w-fit mb-4 group-hover:scale-110 transition-transform`}>
                  <section.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-1">{section.name}</h3>
                <p className="text-3xl font-bold text-gradient-luxury mb-2">{section.points} Pts</p>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-4 glass-luxury px-8 py-4 rounded-2xl">
              <span className="text-muted-foreground">Total Score:</span>
              <span className="text-4xl font-bold text-gradient-luxury">300 Points</span>
              <span className="text-muted-foreground">• Pass: 180+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-gradient-luxury mb-2">95%</div>
              <div className="text-muted-foreground">Pass Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-gradient-luxury mb-2">10K+</div>
              <div className="text-muted-foreground">Vocabulary Items</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-gradient-luxury mb-2">60+</div>
              <div className="text-muted-foreground">Course Lessons</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-gradient-luxury mb-2">24/7</div>
              <div className="text-muted-foreground">AI Tutor</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to <span className="text-gradient-luxury">Succeed</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools designed for serious German learners targeting B2 certification
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="glass-luxury p-8 rounded-2xl hover:luxury-glow hover:scale-105 transition-all duration-300 group"
              >
                <div className="gradient-luxury rounded-xl p-3 w-fit mb-5 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 12-Week Course Highlight */}
      <div className="py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto glass-luxury rounded-3xl p-10 md:p-16 luxury-glow">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
                  <Award className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-primary">Featured Course</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  12-Week <span className="text-gradient-luxury">Mastery</span> Program
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Structured curriculum taking you from intermediate to exam-ready. 
                  Each week focuses on specific competencies with progressive difficulty.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>12 comprehensive modules</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>60+ interactive lessons</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>AI tutor for each lesson</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Certificate upon completion</span>
                  </li>
                </ul>
                <Button
                  onClick={() => navigate("/auth")}
                  size="lg"
                  className="gradient-luxury hover:scale-105 transition-all"
                >
                  Enroll Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((week) => (
                  <div 
                    key={week}
                    className="aspect-square rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-lg hover:scale-110 transition-transform cursor-pointer"
                  >
                    W{week}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Start in <span className="text-gradient-luxury">3 Simple Steps</span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {[
              { step: 1, title: "Create Your Free Account", desc: "Sign up in seconds. No credit card required." },
              { step: 2, title: "Take the Placement Test", desc: "We'll assess your level and create a personalized study plan." },
              { step: 3, title: "Start Learning", desc: "Begin with the Mastery Course or jump straight to exam practice." },
            ].map((item) => (
              <div 
                key={item.step}
                className="flex gap-6 items-center glass-luxury p-6 rounded-2xl hover:scale-[1.02] transition-all"
              >
                <div className="gradient-luxury rounded-full w-14 h-14 flex items-center justify-center font-bold text-xl flex-shrink-0 text-white">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-24 bg-gradient-to-t from-muted/50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Ready to <span className="text-gradient-luxury">Pass Your TELC B2?</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join thousands of successful learners. Start your free trial today and 
              take the first step toward your German certification.
            </p>
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="gradient-luxury hover:scale-105 transition-all text-xl px-12 py-8 luxury-glow font-bold shadow-xl"
            >
              Start Learning Free
              <ArrowRight className="ml-3 w-6 h-6" />
            </Button>
            <p className="text-sm text-muted-foreground mt-6">
              ✓ No credit card required • ✓ Full exam access • ✓ Cancel anytime
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-border/40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={fluentpassLogo} alt="FluentPass" className="w-8 h-8 rounded-lg" />
              <span className="font-bold text-gradient-luxury">FluentPass</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <button onClick={() => navigate("/privacy")} className="hover:text-foreground transition-colors">
                Privacy Policy
              </button>
              <button onClick={() => navigate("/terms")} className="hover:text-foreground transition-colors">
                Terms of Service
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} FluentPass. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
