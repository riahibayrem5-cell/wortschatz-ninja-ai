import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Vocabulary from "./pages/Vocabulary";
import SentenceGenerator from "./pages/SentenceGenerator";
import Review from "./pages/Review";
import WritingAssistant from "./pages/WritingAssistant";
import Exercises from "./pages/Exercises";
import Memorizer from "./pages/Memorizer";
import Conversation from "./pages/Conversation";
import TextHighlighter from "./pages/TextHighlighter";
import MistakeDiary from "./pages/MistakeDiary";
import Settings from "./pages/Settings";
import AuthPage from "./components/AuthPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vocabulary" element={<Vocabulary />} />
          <Route path="/sentence-generator" element={<SentenceGenerator />} />
          <Route path="/review" element={<Review />} />
          <Route path="/writing" element={<WritingAssistant />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/memorizer" element={<Memorizer />} />
          <Route path="/conversation" element={<Conversation />} />
          <Route path="/highlighter" element={<TextHighlighter />} />
          <Route path="/diary" element={<MistakeDiary />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
