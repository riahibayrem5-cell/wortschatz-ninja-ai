export interface LessonExample {
  de: string;
  en: string;
  note?: string | null;
}

export interface LessonKeyTerm {
  german: string;
  article?: string | null;
  plural?: string | null;
  english: string;
  example: string;
  example_en: string;
}

export interface LessonSection {
  heading: string;
  heading_de: string;
  body: string;
  bullets: string[];
  examples: LessonExample[];
}

export interface LessonGrammarBox {
  title: string;
  rule: string;
  examples: { de: string; en: string }[];
  pitfall: string;
}

export interface LessonPracticeItem {
  type: "mcq" | "gap" | "true_false" | "open";
  question: string;
  options: string[];
  answer_index: number | null;
  answer: string;
  explanation: string;
}

export interface LessonContentV2 {
  version: 2;
  detailed_content: true;
  generated_at?: string;
  lesson_type?: string;
  hook: string;
  overview: string;
  objectives: string[];
  telc: {
    section: string;
    teil: string;
    task_type: string;
    minutes: number;
    points: number;
    why_it_matters: string;
  };
  key_terms: LessonKeyTerm[];
  sections: LessonSection[];
  grammar_boxes: LessonGrammarBox[];
  strategy: { title: string; detail: string }[];
  model_text: {
    title: string;
    text: string;
    translation: string;
    notes: string[];
  } | null;
  common_mistakes: { wrong: string; right: string; why: string }[];
  practice: LessonPracticeItem[];
  recap: string[];
  exam_tips: string[];
}

export const isLessonV2 = (content: unknown): content is LessonContentV2 =>
  !!content &&
  typeof content === "object" &&
  (content as { version?: number }).version === 2 &&
  Array.isArray((content as LessonContentV2).sections);
