import { useState } from "react";
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
import { Sparkles, Menu, LogOut, Settings, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged out successfully" });
    navigate("/");
  };

  const menuSections = [
    {
      label: "Foundations",
      items: [
        { name: "Vocabulary Generator", path: "/vocabulary" },
        { name: "Sentence Generator", path: "/sentence-generator" },
        { name: "Writing Assistant", path: "/writing" },
      ],
    },
    {
      label: "Practice",
      items: [
        { name: "Exercises", path: "/exercises" },
        { name: "The Memorizer", path: "/memorizer" },
      ],
    },
    {
      label: "Communication",
      items: [
        { name: "Conversation Practice", path: "/conversation" },
        { name: "Text Highlighter", path: "/highlighter" },
      ],
    },
    {
      label: "Progress",
      items: [
        { name: "Review", path: "/review" },
        { name: "Mistake Diary", path: "/diary" },
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
        <div className="hidden md:flex items-center gap-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className={isActive("/dashboard") ? "text-primary" : ""}
          >
            <Home className="w-4 h-4 mr-2" />
            Dashboard
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
            Logout
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
                Dashboard
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

              <Button
                variant="ghost"
                onClick={() => {
                  navigate("/settings");
                  setMobileOpen(false);
                }}
                className="justify-start"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
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
                Logout
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navbar;