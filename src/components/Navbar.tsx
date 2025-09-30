import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Menu, LogOut, Settings, Home, Sun, Moon, Languages, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'dark';
  });
  const [serverHealth, setServerHealth] = useState<'healthy' | 'degraded' | 'down'>('healthy');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    checkServerHealth();
    const interval = setInterval(checkServerHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const checkServerHealth = async () => {
    try {
      const start = Date.now();
      const { error } = await supabase.from("user_progress").select("count").limit(1);
      const latency = Date.now() - start;
      
      if (error) {
        setServerHealth('down');
      } else if (latency > 1000) {
        setServerHealth('degraded');
      } else {
        setServerHealth('healthy');
      }
    } catch {
      setServerHealth('down');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged out successfully" });
    navigate("/");
  };

  const menuSections = [
    {
      label: "Foundations",
      items: [
        { name: t('nav.vocabulary'), path: "/vocabulary" },
        { name: t('nav.sentence'), path: "/sentence-generator" },
        { name: t('nav.writing'), path: "/writing" },
      ],
    },
    {
      label: "Practice",
      items: [
        { name: t('nav.exercises'), path: "/exercises" },
        { name: t('nav.memorizer'), path: "/memorizer" },
      ],
    },
    {
      label: "Communication",
      items: [
        { name: t('nav.conversation'), path: "/conversation" },
        { name: t('nav.highlighter'), path: "/highlighter" },
      ],
    },
    {
      label: "Progress",
      items: [
        { name: t('nav.review'), path: "/review" },
        { name: t('nav.diary'), path: "/diary" },
      ],
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity"
        >
          <Sparkles className="w-6 h-6 text-primary" />
          <span className="text-gradient">WortschatzNinja</span>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className={isActive("/dashboard") ? "text-primary" : ""}
          >
            <Home className="w-4 h-4 mr-2" />
            {t('nav.dashboard')}
          </Button>

          {menuSections.map((section) => (
            <DropdownMenu key={section.label}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  {section.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 glass border-border/50">
                <DropdownMenuLabel>{section.label}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {section.items.map((item) => (
                  <DropdownMenuItem
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={isActive(item.path) ? "bg-primary/10" : ""}
                  >
                    {item.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}

          {/* Server Status */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                {serverHealth === 'healthy' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                {serverHealth === 'degraded' && <AlertCircle className="w-5 h-5 text-yellow-500" />}
                {serverHealth === 'down' && <AlertCircle className="w-5 h-5 text-destructive" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5 text-sm font-semibold">
                {serverHealth === 'healthy' && t('server.healthy')}
                {serverHealth === 'degraded' && t('server.degraded')}
                {serverHealth === 'down' && t('server.down')}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Languages className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('en')}>
                English {language === 'en' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('de')}>
                Deutsch {language === 'de' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('ar')}>
                العربية {language === 'ar' && '✓'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/settings")}
            className={isActive("/settings") ? "text-primary" : ""}
          >
            <Settings className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="glass"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t('nav.logout')}
          </Button>
        </div>

        {/* Mobile Navigation */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="sm">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 glass">
            <div className="flex flex-col gap-4 mt-8">
              <Button
                variant="ghost"
                onClick={() => {
                  navigate("/dashboard");
                  setMobileOpen(false);
                }}
                className="justify-start"
              >
                <Home className="w-4 h-4 mr-2" />
                {t('nav.dashboard')}
              </Button>

              {menuSections.map((section) => (
                <div key={section.label} className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground px-3">
                    {section.label}
                  </h3>
                  {section.items.map((item) => (
                    <Button
                      key={item.path}
                      variant="ghost"
                      onClick={() => {
                        navigate(item.path);
                        setMobileOpen(false);
                      }}
                      className={`w-full justify-start ${
                        isActive(item.path) ? "bg-primary/10" : ""
                      }`}
                    >
                      {item.name}
                    </Button>
                  ))}
                </div>
              ))}

              <div className="flex items-center gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                  {theme === 'dark' ? t('theme.light') : t('theme.dark')}
                </Button>
              </div>

              <Button
                variant="ghost"
                onClick={() => {
                  navigate("/settings");
                  setMobileOpen(false);
                }}
                className="justify-start"
              >
                <Settings className="w-4 h-4 mr-2" />
                {t('nav.settings')}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                className="justify-start glass"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t('nav.logout')}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navbar;
