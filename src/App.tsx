import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SubscriptionBanner } from "@/components/SubscriptionBanner";
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
import Conversation from "./pages/Conversation";
import TextHighlighter from "./pages/TextHighlighter";
import MistakeDiary from "./pages/MistakeDiary";
import Settings from "./pages/Settings";
import TelcExam from "./pages/TelcExam";
import AICompanion from "./pages/AICompanion";
import History from "./pages/History";
import Subscriptions from "./pages/Subscriptions";
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
            <Route path="/conversation" element={<Conversation />} />
            <Route path="/highlighter" element={<TextHighlighter />} />
            <Route path="/diary" element={<MistakeDiary />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/telc-exam" element={<TelcExam />} />
            <Route path="/ai-companion" element={<AICompanion />} />
            <Route path="/history" element={<History />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
