import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SubscriptionBanner } from "@/components/SubscriptionBanner";
import { SubscriptionReminder } from "@/components/SubscriptionReminder";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Vocabulary from "./pages/Vocabulary";
import WordDossier from "./pages/WordDossier";
import SentenceGenerator from "./pages/SentenceGenerator";
import Review from "./pages/Review";
import WritingAssistant from "./pages/WritingAssistant";
import Exercises from "./pages/Exercises";
import Memorizer from "./pages/Memorizer";
import WordAssociation from "./pages/WordAssociation";
import Conversation from "./pages/Conversation";
import TextHighlighter from "./pages/TextHighlighter";
import MistakeDiary from "./pages/MistakeDiary";
import Settings from "./pages/Settings";
import TelcExam from "./pages/TelcExam";
import AICompanion from "./pages/AICompanion";
import History from "./pages/History";
import ActivityLog from "./pages/ActivityLog";
import Subscriptions from "./pages/Subscriptions";
import LearningPath from "./pages/LearningPath";
import Achievements from "./pages/Achievements";
import MasteryCourse from "./pages/MasteryCourse";
import ModuleDetail from "./pages/ModuleDetail";
import LessonPage from "./pages/LessonPage";
import CourseTutor from "./pages/CourseTutor";
import Certificates from "./pages/Certificates";
import AuthPage from "./components/AuthPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SubscriptionBanner />
          <SubscriptionReminder />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
