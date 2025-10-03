export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      content_cache: {
        Row: {
          access_count: number | null
          accessed_at: string | null
          audio_url: string | null
          cache_key: string
          content_data: Json
          content_type: string
          created_at: string | null
          difficulty: string | null
          id: string
          topic: string | null
          user_id: string
        }
        Insert: {
          access_count?: number | null
          accessed_at?: string | null
          audio_url?: string | null
          cache_key: string
          content_data: Json
          content_type: string
          created_at?: string | null
          difficulty?: string | null
          id?: string
          topic?: string | null
          user_id: string
        }
        Update: {
          access_count?: number | null
          accessed_at?: string | null
          audio_url?: string | null
          cache_key?: string
          content_data?: Json
          content_type?: string
          created_at?: string | null
          difficulty?: string | null
          id?: string
          topic?: string | null
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          messages: Json
          scenario: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          scenario: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          scenario?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_activity: {
        Row: {
          activity_date: string
          conversations_count: number | null
          created_at: string | null
          exercises_completed: number | null
          id: string
          review_sessions_count: number | null
          time_spent_minutes: number | null
          updated_at: string | null
          user_id: string
          words_learned: number | null
          writing_submissions_count: number | null
        }
        Insert: {
          activity_date?: string
          conversations_count?: number | null
          created_at?: string | null
          exercises_completed?: number | null
          id?: string
          review_sessions_count?: number | null
          time_spent_minutes?: number | null
          updated_at?: string | null
          user_id: string
          words_learned?: number | null
          writing_submissions_count?: number | null
        }
        Update: {
          activity_date?: string
          conversations_count?: number | null
          created_at?: string | null
          exercises_completed?: number | null
          id?: string
          review_sessions_count?: number | null
          time_spent_minutes?: number | null
          updated_at?: string | null
          user_id?: string
          words_learned?: number | null
          writing_submissions_count?: number | null
        }
        Relationships: []
      }
      exercises: {
        Row: {
          analysis: string | null
          completed_at: string | null
          correct_answer: string
          created_at: string
          id: string
          is_correct: boolean | null
          options: Json | null
          question: string
          topic: string | null
          type: string
          user_answer: string | null
          user_id: string
        }
        Insert: {
          analysis?: string | null
          completed_at?: string | null
          correct_answer: string
          created_at?: string
          id?: string
          is_correct?: boolean | null
          options?: Json | null
          question: string
          topic?: string | null
          type: string
          user_answer?: string | null
          user_id: string
        }
        Update: {
          analysis?: string | null
          completed_at?: string | null
          correct_answer?: string
          created_at?: string
          id?: string
          is_correct?: boolean | null
          options?: Json | null
          question?: string
          topic?: string | null
          type?: string
          user_answer?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      highlighted_articles: {
        Row: {
          content: string
          created_at: string
          highlighted_words: Json
          id: string
          title: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          highlighted_words?: Json
          id?: string
          title: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          highlighted_words?: Json
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "highlighted_articles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      history_items: {
        Row: {
          content: Json
          created_at: string
          id: string
          type: string
          user_id: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          type: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "history_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      memorizer_items: {
        Row: {
          created_at: string
          difficulty: string
          english_translation: string
          german_text: string
          id: string
          last_reviewed_at: string | null
          next_review_date: string
          srs_level: number
          theme: string
          user_id: string
        }
        Insert: {
          created_at?: string
          difficulty: string
          english_translation: string
          german_text: string
          id?: string
          last_reviewed_at?: string | null
          next_review_date?: string
          srs_level?: number
          theme: string
          user_id: string
        }
        Update: {
          created_at?: string
          difficulty?: string
          english_translation?: string
          german_text?: string
          id?: string
          last_reviewed_at?: string | null
          next_review_date?: string
          srs_level?: number
          theme?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memorizer_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mistakes: {
        Row: {
          category: string | null
          content: string
          context: Json | null
          correction: string | null
          created_at: string
          explanation: string | null
          id: string
          notes: string | null
          resolved: boolean | null
          source: string | null
          type: string
          user_id: string
        }
        Insert: {
          category?: string | null
          content: string
          context?: Json | null
          correction?: string | null
          created_at?: string
          explanation?: string | null
          id?: string
          notes?: string | null
          resolved?: boolean | null
          source?: string | null
          type: string
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string
          context?: Json | null
          correction?: string | null
          created_at?: string
          explanation?: string | null
          id?: string
          notes?: string | null
          resolved?: boolean | null
          source?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mistakes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      server_metrics: {
        Row: {
          id: string
          metric_type: string
          metric_value: number
          timestamp: string | null
        }
        Insert: {
          id?: string
          metric_type: string
          metric_value: number
          timestamp?: string | null
        }
        Update: {
          id?: string
          metric_type?: string
          metric_value?: number
          timestamp?: string | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          created_at: string
          exercises_completed: number
          id: string
          last_activity_date: string | null
          streak_days: number
          updated_at: string
          user_id: string
          words_learned: number
        }
        Insert: {
          created_at?: string
          exercises_completed?: number
          id?: string
          last_activity_date?: string | null
          streak_days?: number
          updated_at?: string
          user_id: string
          words_learned?: number
        }
        Update: {
          created_at?: string
          exercises_completed?: number
          id?: string
          last_activity_date?: string | null
          streak_days?: number
          updated_at?: string
          user_id?: string
          words_learned?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vocabulary_items: {
        Row: {
          article: string | null
          created_at: string
          definition: string
          example: string | null
          id: string
          last_reviewed_at: string | null
          next_review_date: string
          srs_level: number
          topic: string | null
          user_id: string
          word: string
        }
        Insert: {
          article?: string | null
          created_at?: string
          definition: string
          example?: string | null
          id?: string
          last_reviewed_at?: string | null
          next_review_date?: string
          srs_level?: number
          topic?: string | null
          user_id: string
          word: string
        }
        Update: {
          article?: string | null
          created_at?: string
          definition?: string
          example?: string | null
          id?: string
          last_reviewed_at?: string | null
          next_review_date?: string
          srs_level?: number
          topic?: string | null
          user_id?: string
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "vocabulary_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      writing_submissions: {
        Row: {
          corrected_text: string
          created_at: string
          errors: Json
          id: string
          original_text: string
          overall_feedback: string
          prompt: string
          score: number | null
          user_id: string
        }
        Insert: {
          corrected_text: string
          created_at?: string
          errors?: Json
          id?: string
          original_text: string
          overall_feedback: string
          prompt: string
          score?: number | null
          user_id: string
        }
        Update: {
          corrected_text?: string
          created_at?: string
          errors?: Json
          id?: string
          original_text?: string
          overall_feedback?: string
          prompt?: string
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "writing_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      track_daily_activity: {
        Args: { activity_type: string; increment_value?: number }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
