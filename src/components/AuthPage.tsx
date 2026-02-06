import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Mail, ArrowLeft } from "lucide-react";

type AuthMode = "login" | "signup" | "forgot-password";

const AuthPage = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as { from?: Location })?.from?.pathname || "/dashboard";

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate(from, { replace: true });
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate(from, { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, from]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "forgot-password") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?mode=reset`,
        });
        if (error) throw error;
        toast({
          title: "Check your email",
          description: "We've sent you a password reset link.",
        });
        setMode("login");
      } else if (mode === "login") {
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
          title: "Check your email!",
          description: "We've sent you a verification link to confirm your account.",
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

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Google Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
      setGoogleLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "forgot-password":
        return "Reset Password";
      case "signup":
        return "Create Account";
      default:
        return "Welcome Back";
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case "forgot-password":
        return "Enter your email to receive a reset link";
      case "signup":
        return "Start your German learning journey";
      default:
        return "Master German B2-C1 with AI";
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
          <p className="text-muted-foreground text-lg">{getSubtitle()}</p>
        </div>

        {mode === "forgot-password" && (
          <button
            onClick={() => setMode("login")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </button>
        )}

        {mode !== "forgot-password" && (
          <>
            {/* Google Sign In Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-base mb-6 border-2 hover:bg-muted/50"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continue with Google
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or continue with email</span>
              </div>
            </div>
          </>
        )}
        
        <form onSubmit={handleEmailAuth} className="space-y-5">
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
          
          {mode !== "forgot-password" && (
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
          )}

          {mode === "login" && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setMode("forgot-password")}
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}
          
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
            ) : mode === "forgot-password" ? (
              <>
                <Mail className="w-5 h-5 mr-2" />
                Send Reset Link
              </>
            ) : mode === "login" ? (
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

        {mode !== "forgot-password" && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-base text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              {mode === "login" ? "Don't have an account? Sign up free →" : "Already have an account? Sign in →"}
            </button>
          </div>
        )}

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
