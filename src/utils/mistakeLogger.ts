import { supabase } from "@/integrations/supabase/client";

export type MistakeSource = 
  | 'writing'
  | 'conversation'
  | 'ai-companion'
  | 'telc-practice'
  | 'telc-exam'
  | 'exercises'
  | 'smart-exercises'
  | 'memorizer'
  | 'course-tutor'
  | 'auto-detected';

export interface MistakeEntry {
  content: string;
  correction: string;
  explanation: string;
  category: string;
  source: MistakeSource;
  context?: Record<string, any>;
}

export interface AnalysisResult {
  mistakes?: Array<{
    error: string;
    correction: string;
    explanation: string;
    category?: string;
  }>;
  detailedErrors?: Array<{
    original: string;
    correction: string;
    explanation: string;
    type?: string;
  }>;
  hasErrors?: boolean;
}

/**
 * Log a single mistake to the database with deduplication
 */
export const logMistake = async (mistake: MistakeEntry): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check for existing similar mistake (deduplication)
    const { data: existing } = await supabase
      .from('mistakes')
      .select('id')
      .eq('user_id', user.id)
      .eq('content', mistake.content)
      .eq('resolved', false)
      .maybeSingle();

    if (existing) {
      console.log('Duplicate mistake skipped:', mistake.content.substring(0, 50));
      return false;
    }

    const { error } = await supabase.from('mistakes').insert({
      user_id: user.id,
      type: mistake.category || 'grammar',
      content: mistake.content,
      correction: mistake.correction,
      explanation: mistake.explanation,
      category: mistake.category || 'grammar',
      source: mistake.source,
      context: mistake.context,
      resolved: false,
    });

    if (error) {
      console.error('Error logging mistake:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in logMistake:', error);
    return false;
  }
};

/**
 * Log multiple mistakes from an AI analysis result
 */
export const logMistakesFromAnalysis = async (
  analysisResult: AnalysisResult,
  source: MistakeSource,
  context?: Record<string, any>
): Promise<number> => {
  if (!analysisResult) return 0;

  let logged = 0;

  // Handle standard mistakes array
  if (analysisResult.mistakes && Array.isArray(analysisResult.mistakes)) {
    for (const m of analysisResult.mistakes) {
      const success = await logMistake({
        content: m.error,
        correction: m.correction,
        explanation: m.explanation,
        category: m.category || 'grammar',
        source,
        context,
      });
      if (success) logged++;
    }
  }

  // Handle detailedErrors array (from TELC evaluations)
  if (analysisResult.detailedErrors && Array.isArray(analysisResult.detailedErrors)) {
    for (const err of analysisResult.detailedErrors) {
      const success = await logMistake({
        content: err.original,
        correction: err.correction,
        explanation: err.explanation,
        category: err.type || 'grammar',
        source,
        context,
      });
      if (success) logged++;
    }
  }

  return logged;
};

/**
 * Log a wrong answer from an exercise
 */
export const logExerciseMistake = async (
  userAnswer: string,
  correctAnswer: string,
  explanation: string,
  source: MistakeSource,
  exerciseType?: string,
  context?: Record<string, any>
): Promise<boolean> => {
  return logMistake({
    content: userAnswer,
    correction: correctAnswer,
    explanation: explanation || `Correct answer: ${correctAnswer}`,
    category: exerciseType || 'comprehension',
    source,
    context,
  });
};

/**
 * Analyze text and automatically store mistakes
 * This is a wrapper around the analyze-mistakes edge function
 */
export const analyzeAndStoreMistakes = async (
  text: string,
  source: MistakeSource,
  difficulty: string = 'B2',
  context?: Record<string, any>
): Promise<AnalysisResult | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-mistakes', {
      body: { 
        text, 
        difficulty, 
        autoStore: true,
        source 
      },
    });

    if (error) {
      console.error('Error analyzing mistakes:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in analyzeAndStoreMistakes:', error);
    return null;
  }
};
