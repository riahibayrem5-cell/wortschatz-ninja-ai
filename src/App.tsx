import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SubscriptionBanner } from "@/components/SubscriptionBanner";
import { SubscriptionReminder } from "@/components/SubscriptionReminder";
import { CommandPalette } from "@/components/CommandPalette";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import PageTransition from "@/components/PageTransition";
import RequireAuth from "@/components/RequireAuth";
import { Loader2 } from "lucide-react";

// Critical routes - loaded immediately
import Index from "./pages/Index";
import AuthPage from "./components/AuthPage";
import Dashboard from "./pages/Dashboard";

// Non-critical routes - lazy loaded
const Vocabulary = lazy(() => import("./pages/Vocabulary"));
const WordDossier = lazy(() => import("./pages/WordDossier"));
const SentenceGenerator = lazy(() => import("./pages/SentenceGenerator"));
const Review = lazy(() => import("./pages/Review"));
const WritingAssistant = lazy(() => import("./pages/WritingAssistant"));
const Exercises = lazy(() => import("./pages/Exercises"));
const Memorizer = lazy(() => import("./pages/Memorizer"));
const WordAssociation = lazy(() => import("./pages/WordAssociation"));
const Conversation = lazy(() => import("./pages/Conversation"));
const TextHighlighter = lazy(() => import("./pages/TextHighlighter"));
const MistakeDiary = lazy(() => import("./pages/MistakeDiary"));
const Settings = lazy(() => import("./pages/Settings"));
const TelcExam = lazy(() => import("./pages/TelcExam"));
const TelcVorbereitung = lazy(() => import("./pages/TelcVorbereitung"));
const AICompanion = lazy(() => import("./pages/AICompanion"));
const History = lazy(() => import("./pages/History"));
const ActivityLog = lazy(() => import("./pages/ActivityLog"));
const Subscriptions = lazy(() => import("./pages/Subscriptions"));
const LearningPath = lazy(() => import("./pages/LearningPath"));
const Achievements = lazy(() => import("./pages/Achievements"));
const MasteryCourse = lazy(() => import("./pages/MasteryCourse"));
const ModuleDetail = lazy(() => import("./pages/ModuleDetail"));
const LessonPage = lazy(() => import("./pages/LessonPage"));
const CourseTutor = lazy(() => import("./pages/CourseTutor"));
const Certificates = lazy(() => import("./pages/Certificates"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminContent = lazy(() => import("./pages/admin/Content"));
const AdminSubscriptions = lazy(() => import("./pages/admin/Subscriptions"));
const AdminAudioManager = lazy(() => import("./pages/admin/AudioManager"));
const AdminAlerts = lazy(() => import("./pages/admin/Alerts"));
const AdminAnalytics = lazy(() => import("./pages/admin/Analytics"));
const AdminAIControls = lazy(() => import("./pages/admin/AIControls"));
const AdminPlatformSettings = lazy(() => import("./pages/admin/PlatformSettings"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen gradient-hero flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <PageTransition key={location.pathname}>
      <Suspense fallback={<PageLoader />}>
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          {/* Protected app */}
          <Route element={<RequireAuth />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vocabulary" element={<Vocabulary />} />
            <Route path="/word-dossier" element={<WordDossier />} />
            <Route path="/sentence-generator" element={<SentenceGenerator />} />
            <Route path="/review" element={<Review />} />
            <Route path="/writing" element={<WritingAssistant />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/memorizer" element={<Memorizer />} />
            <Route path="/word-association" element={<WordAssociation />} />
            <Route path="/conversation" element={<Conversation />} />
            <Route path="/highlighter" element={<TextHighlighter />} />
            <Route path="/diary" element={<MistakeDiary />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/telc-exam" element={<TelcExam />} />
            <Route path="/telc-vorbereitung" element={<TelcVorbereitung />} />
            <Route path="/ai-companion" element={<AICompanion />} />
            <Route path="/history" element={<History />} />
            <Route path="/activity-log" element={<ActivityLog />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/learning-path" element={<LearningPath />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/mastery-course" element={<MasteryCourse />} />
            <Route path="/mastery-course/:moduleId" element={<ModuleDetail />} />
            <Route path="/mastery-course/:moduleId/lesson/:lessonId" element={<LessonPage />} />
            <Route path="/mastery-course/:moduleId/tutor" element={<CourseTutor />} />
            <Route path="/certificates" element={<Certificates />} />
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/content" element={<AdminContent />} />
            <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
            <Route path="/admin/audio" element={<AdminAudioManager />} />
            <Route path="/admin/alerts" element={<AdminAlerts />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/ai" element={<AdminAIControls />} />
            <Route path="/admin/settings" element={<AdminPlatformSettings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </PageTransition>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CommandPalette />
          <SubscriptionBanner />
          <SubscriptionReminder />
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
