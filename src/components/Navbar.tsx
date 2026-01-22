import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
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
import { 
  Sparkles, Menu, LogOut, Settings, Home, Sun, Moon, Languages, 
  CheckCircle2, AlertCircle, GraduationCap, BookOpen, Target, 
  MessageSquare, TrendingUp, Award
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import fluentpassLogo from "@/assets/fluentpass-logo.png";

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
    const interval = setInterval(checkServerHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkServerHealth = async () => {
    try {
      const checks = await Promise.all([
        supabase.from("user_progress").select("count").limit(1),
        supabase.auth.getSession(),
        Promise.resolve(Date.now())
      ]);

      const latency = Date.now() - (checks[2] as number);
      const dbError = checks[0].error;
      
      if (!dbError) {
        supabase.from("server_metrics").insert({
          metric_type: 'api_latency',
          metric_value: latency
        }).then(() => {});
      }
      
      if (dbError) {
        setServerHealth('down');
      } else if (latency > 1500) {
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
    toast({ title: t('auth.signOut') });
    navigate("/");
  };

  // Reorganized menu sections with clearer grouping
  const menuSections = [
    {
      label: t('nav.foundations'),
      icon: BookOpen,
      items: [
        { name: t('nav.vocabulary'), path: "/vocabulary" },
        { name: t('nav.wordDossier'), path: "/word-dossier" },
        { name: t('nav.sentence'), path: "/sentence-generator" },
        { name: t('nav.writing'), path: "/writing" },
      ],
    },
    {
      label: t('nav.practice'),
      icon: Target,
      items: [
        { name: t('nav.exercises'), path: "/exercises" },
        { name: t('nav.memorizer'), path: "/memorizer" },
        { name: t('nav.wordAssociation'), path: "/word-association" },
        { name: t('nav.highlighter'), path: "/highlighter" },
      ],
    },
    {
      label: t('nav.communication'),
      icon: MessageSquare,
      items: [
        { name: t('nav.conversation'), path: "/conversation" },
      ],
    },
    {
      label: t('nav.progress'),
      icon: TrendingUp,
      items: [
        { name: t('nav.review'), path: "/review" },
        { name: t('nav.diary'), path: "/diary" },
        { name: t('nav.activityLog'), path: "/activity-log" },
        { name: t('nav.learningPath'), path: "/learning-path" },
        { name: t('nav.achievements'), path: "/achievements" },
        { name: t('nav.history'), path: "/history" },
      ],
    },
  ];

  // Dedicated TELC B2 section
  const telcSection = {
    label: t('nav.telcB2'),
    icon: GraduationCap,
    items: [
      { name: t('nav.telcPrep'), path: "/telc-vorbereitung" },
      { name: t('nav.telcExam'), path: "/telc-exam" },
      { name: t('nav.masteryCourse'), path: "/mastery-course" },
      { name: t('nav.certificates'), path: "/certificates" },
    ],
  };

  const isActive = (path: string) => location.pathname === path;

  const handleNavClick = (e: React.MouseEvent, path: string) => {
    if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      navigate(path);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
        {/* Logo */}
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 sm:gap-2 font-bold text-base sm:text-xl hover:scale-105 transition-all group"
        >
          <img 
            src={fluentpassLogo} 
            alt="FluentPass" 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-lg group-hover:rotate-6 transition-transform duration-300" 
          />
          <span className="text-gradient-luxury hidden xs:inline">FluentPass</span>
          <span className="text-gradient-luxury xs:hidden">FP</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2">
          {/* Dashboard */}
          <Link
            to="/dashboard"
            onClick={(e) => handleNavClick(e, "/dashboard")}
            className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-9 px-3 ${isActive("/dashboard") ? "text-primary bg-primary/10" : ""}`}
          >
            <Home className="w-4 h-4" />
            <span className="hidden xl:inline">{t('nav.dashboard')}</span>
          </Link>

          {/* AI Companion - Highlighted */}
          <Link
            to="/ai-companion"
            onClick={(e) => handleNavClick(e, "/ai-companion")}
            className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-bold ring-offset-background transition-colors h-9 px-3 gradient-primary hover:opacity-90 text-primary-foreground ${isActive("/ai-companion") ? "ring-2 ring-primary" : ""}`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{t('nav.aiCompanion')}</span>
          </Link>

          {/* Main menu sections */}
          {menuSections.map((section) => (
            <DropdownMenu key={section.label}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs xl:text-sm gap-1">
                  <section.icon className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">{section.label}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 xl:w-56 bg-popover border-border shadow-lg">
                <DropdownMenuLabel className="text-xs xl:text-sm flex items-center gap-2">
                  <section.icon className="w-4 h-4 text-primary" />
                  {section.label}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {section.items.map((item) => (
                  <DropdownMenuItem
                    key={item.path}
                    asChild
                    className={`text-xs xl:text-sm cursor-pointer ${isActive(item.path) ? "bg-primary/10 text-primary" : ""}`}
                  >
                    <Link 
                      to={item.path}
                      onClick={(e) => handleNavClick(e, item.path)}
                      className="w-full"
                    >
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}

          {/* TELC B2 - Dedicated section with emphasis */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs xl:text-sm gap-1 border border-primary/30 hover:border-primary/50">
                <GraduationCap className="w-3.5 h-3.5 text-primary" />
                <span>{t('nav.telcB2')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-popover border-border shadow-lg">
              <DropdownMenuLabel className="text-sm flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" />
                {t('nav.telcB2')}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {telcSection.items.map((item) => (
                <DropdownMenuItem
                  key={item.path}
                  asChild
                  className={`text-sm cursor-pointer ${isActive(item.path) ? "bg-primary/10 text-primary" : ""}`}
                >
                  <Link 
                    to={item.path}
                    onClick={(e) => handleNavClick(e, item.path)}
                    className="w-full"
                  >
                    {item.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Server Status */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-8 w-8">
                {serverHealth === 'healthy' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                {serverHealth === 'degraded' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                {serverHealth === 'down' && <AlertCircle className="w-4 h-4 text-destructive" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 text-xs bg-popover border-border shadow-lg">
              <div className="p-3 space-y-2">
                <div className="font-semibold text-sm">
                  {serverHealth === 'healthy' && `🟢 ${t('nav.allSystemsOperational')}`}
                  {serverHealth === 'degraded' && `🟡 ${t('nav.performanceDegraded')}`}
                  {serverHealth === 'down' && `🔴 ${t('nav.serviceUnavailable')}`}
                </div>
                <div className="space-y-1.5 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>{t('nav.database')}:</span>
                    <span className={serverHealth === 'down' ? 'text-destructive' : 'text-green-500'}>
                      {serverHealth === 'down' ? t('nav.down') : t('nav.online')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('nav.apiLatency')}:</span>
                    <span className={serverHealth === 'degraded' ? 'text-yellow-500' : 'text-green-500'}>
                      {serverHealth === 'healthy' ? '<500ms' : serverHealth === 'degraded' ? '>1500ms' : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('nav.authService')}:</span>
                    <span className="text-green-500">{t('nav.active')}</span>
                  </div>
                </div>
                <div className="pt-2 border-t text-xs text-muted-foreground">
                  {t('nav.lastChecked')}: {new Date().toLocaleTimeString()}
                </div>
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
            <DropdownMenuContent align="end" className="text-xs xl:text-sm bg-popover border-border shadow-lg">
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

          {/* Settings */}
          <Link
            to="/settings"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8"
          >
            <Settings className="w-4 h-4" />
          </Link>

          {/* Logout */}
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
          <SheetContent side="right" className="w-[85vw] max-w-sm bg-background border-border overflow-y-auto">
            <div className="flex flex-col gap-3 mt-6">
              {/* Dashboard */}
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors ${isActive("/dashboard") ? "bg-primary/10 text-primary" : ""}`}
              >
                <Home className="w-4 h-4" />
                {t('nav.dashboard')}
              </Link>

              {/* AI Companion */}
              <Link
                to="/ai-companion"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md gradient-primary text-primary-foreground font-medium"
              >
                <Sparkles className="w-4 h-4" />
                {t('nav.aiCompanion')}
              </Link>

              {/* TELC B2 Section - Highlighted */}
              <div className="space-y-1.5 pt-2 border-t">
                <h3 className="text-xs font-semibold text-primary px-3 pt-2 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  {t('nav.telcB2')}
                </h3>
                {telcSection.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors ${
                      isActive(item.path) ? "bg-primary/10 text-primary" : ""
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Menu sections */}
              {menuSections.map((section) => (
                <div key={section.label} className="space-y-1.5 pt-2 border-t">
                  <h3 className="text-xs font-semibold text-muted-foreground px-3 pt-2 flex items-center gap-2">
                    <section.icon className="w-4 h-4" />
                    {section.label}
                  </h3>
                  {section.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors ${
                        isActive(item.path) ? "bg-primary/10 text-primary" : ""
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              ))}

              {/* Theme & Language */}
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
                    <DropdownMenuContent align="end" className="text-sm bg-popover border-border shadow-lg">
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

              {/* Settings */}
              <Link
                to="/settings"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
              >
                <Settings className="w-4 h-4" />
                {t('nav.settings')}
              </Link>

              {/* Logout */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                className="justify-start h-9"
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
