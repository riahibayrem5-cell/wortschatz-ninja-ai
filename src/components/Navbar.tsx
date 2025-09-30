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
      <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
        {/* Logo */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-1.5 sm:gap-2 font-bold text-base sm:text-xl hover:opacity-80 transition-opacity"
        >
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <span className="text-gradient hidden xs:inline">WortschatzNinja</span>
          <span className="text-gradient xs:hidden">WN</span>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className={isActive("/dashboard") ? "text-primary" : ""}
          >
            <Home className="w-4 h-4 mr-1.5" />
            <span className="hidden xl:inline">{t('nav.dashboard')}</span>
          </Button>

          {menuSections.map((section) => (
            <DropdownMenu key={section.label}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs xl:text-sm">
                  {section.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 xl:w-56 glass border-border/50">
                <DropdownMenuLabel className="text-xs xl:text-sm">{section.label}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {section.items.map((item) => (
                  <DropdownMenuItem
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`text-xs xl:text-sm ${isActive(item.path) ? "bg-primary/10" : ""}`}
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
              <Button variant="ghost" size="icon" className="relative h-8 w-8">
                {serverHealth === 'healthy' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                {serverHealth === 'degraded' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                {serverHealth === 'down' && <AlertCircle className="w-4 h-4 text-destructive" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-xs xl:text-sm">
              <div className="px-2 py-1.5 font-semibold">
                {serverHealth === 'healthy' && t('server.healthy')}
                {serverHealth === 'degraded' && t('server.degraded')}
                {serverHealth === 'down' && t('server.down')}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Languages className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-xs xl:text-sm">
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
            className="h-8 w-8"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate("/settings")}
          >
            <Settings className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="glass h-8"
          >
            <LogOut className="w-3.5 h-3.5 xl:mr-1.5" />
            <span className="hidden xl:inline text-xs">{t('nav.logout')}</span>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] max-w-sm glass overflow-y-auto">
            <div className="flex flex-col gap-3 mt-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigate("/dashboard");
                  setMobileOpen(false);
                }}
                className="justify-start h-9"
              >
                <Home className="w-4 h-4 mr-2" />
                {t('nav.dashboard')}
              </Button>

              {menuSections.map((section) => (
                <div key={section.label} className="space-y-1.5">
                  <h3 className="text-xs font-semibold text-muted-foreground px-3 pt-2">
                    {section.label}
                  </h3>
                  {section.items.map((item) => (
                    <Button
                      key={item.path}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigate(item.path);
                        setMobileOpen(false);
                      }}
                      className={`w-full justify-start h-9 text-sm ${
                        isActive(item.path) ? "bg-primary/10" : ""
                      }`}
                    >
                      {item.name}
                    </Button>
                  ))}
                </div>
              ))}

              <div className="flex flex-col gap-2 pt-3 border-t mt-3">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 h-9"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                    {theme === 'dark' ? t('theme.light') : t('theme.dark')}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 px-3">
                        <Languages className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="text-sm">
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
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigate("/settings");
                  setMobileOpen(false);
                }}
                className="justify-start h-9"
              >
                <Settings className="w-4 h-4 mr-2" />
                {t('nav.settings')}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                className="justify-start glass h-9"
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
