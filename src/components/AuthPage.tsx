import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({ title: "Welcome back!", description: "Logged in successfully" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;
        toast({
          title: "Account created!",
          description: "You can now start learning German",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero">
      <Card className="w-full max-w-lg p-10 md:p-12 glass-luxury luxury-glow">
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="relative mb-4">
            <div className="absolute inset-0 blur-2xl opacity-30 bg-gradient-luxury"></div>
            <img 
              src="/fluentpass-logo.png" 
              alt="FluentPass" 
              className="relative w-20 h-20 md:w-24 md:h-24 hover:scale-105 transition-transform duration-300" 
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gradient-luxury mb-2">FluentPass</h1>
          <p className="text-muted-foreground text-lg">Master German B2-C1 with AI</p>
        </div>
        
        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Email Address</label>
            <Input
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background/50 h-12 text-base border-2 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-background/50 h-12 text-base border-2 focus:border-primary transition-all"
            />
            <p className="text-xs text-muted-foreground mt-2">Minimum 6 characters</p>
          </div>
          
          <Button
            type="submit"
            className="w-full gradient-luxury hover:scale-105 transition-all h-12 text-lg font-bold luxury-glow mt-6"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Processing...
              </>
            ) : isLogin ? (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Sign In to FluentPass
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Create Free Account
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-base text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            {isLogin ? "Don't have an account? Sign up free →" : "Already have an account? Sign in →"}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground">
            ✓ No credit card required  •  ✓ Free forever  •  ✓ Full TELC B2 access
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AuthPage;