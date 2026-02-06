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
      achievements: {
        Row: {
          badge_color: string | null
          category: string
          created_at: string | null
          description: string
          icon: string
          id: string
          name: string
          points: number
          requirement: number
        }
        Insert: {
          badge_color?: string | null
          category: string
          created_at?: string | null
          description: string
          icon: string
          id: string
          name: string
          points?: number
          requirement: number
        }
        Update: {
          badge_color?: string | null
          category?: string
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          name?: string
          points?: number
          requirement?: number
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      ai_tutor_sessions: {
        Row: {
          created_at: string | null
          id: string
          lesson_id: string | null
          messages: Json
          module_id: string | null
          status: string | null
          topic: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          messages?: Json
          module_id?: string | null
          status?: string | null
          topic?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          messages?: Json
          module_id?: string | null
          status?: string | null
          topic?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tutor_sessions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_tutor_sessions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          certificate_data: Json
          certificate_type: string
          created_at: string | null
          description: string | null
          id: string
          issued_at: string | null
          title: string
          user_id: string
          verification_code: string
        }
        Insert: {
          certificate_data?: Json
          certificate_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          issued_at?: string | null
          title: string
          user_id: string
          verification_code: string
        }
        Update: {
          certificate_data?: Json
          certificate_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          issued_at?: string | null
          title?: string
          user_id?: string
          verification_code?: string
        }
        Relationships: []
      }
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
      course_lessons: {
        Row: {
          content: Json
          created_at: string | null
          estimated_minutes: number
          id: string
          lesson_number: number
          lesson_type: string
          module_id: string
          title: string
          title_de: string
        }
        Insert: {
          content?: Json
          created_at?: string | null
          estimated_minutes?: number
          id?: string
          lesson_number: number
          lesson_type: string
          module_id: string
          title: string
          title_de: string
        }
        Update: {
          content?: Json
          created_at?: string | null
          estimated_minutes?: number
          id?: string
          lesson_number?: number
          lesson_type?: string
          module_id?: string
          title?: string
          title_de?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          created_at: string | null
          description: string
          description_de: string
          estimated_hours: number
          id: string
          skills_focus: Json
          title: string
          title_de: string
          week_number: number
        }
        Insert: {
          created_at?: string | null
          description: string
          description_de: string
          estimated_hours?: number
          id?: string
          skills_focus?: Json
          title: string
          title_de: string
          week_number: number
        }
        Update: {
          created_at?: string | null
          description?: string
          description_de?: string
          estimated_hours?: number
          id?: string
          skills_focus?: Json
          title?: string
          title_de?: string
          week_number?: number
        }
        Relationships: []
      }
      daily_activity: {
        Row: {
          activity_date: string
          ai_requests_count: number | null
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
          ai_requests_count?: number | null
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
          ai_requests_count?: number | null
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
      daily_lessons: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          learning_path_id: string | null
          lesson_data: Json
          lesson_date: string | null
          score: number | null
          time_spent_minutes: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          learning_path_id?: string | null
          lesson_data: Json
          lesson_date?: string | null
          score?: number | null
          time_spent_minutes?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          learning_path_id?: string | null
          lesson_data?: Json
          lesson_date?: string | null
          score?: number | null
          time_spent_minutes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_lessons_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "user_learning_paths"
            referencedColumns: ["id"]
          },
        ]
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
      monitor_runs: {
        Row: {
          alerts_triggered: number | null
          checks_performed: number | null
          created_at: string | null
          details: Json | null
          execution_time_ms: number | null
          id: string
          run_type: string
          status: string
        }
        Insert: {
          alerts_triggered?: number | null
          checks_performed?: number | null
          created_at?: string | null
          details?: Json | null
          execution_time_ms?: number | null
          id?: string
          run_type: string
          status: string
        }
        Update: {
          alerts_triggered?: number | null
          checks_performed?: number | null
          created_at?: string | null
          details?: Json | null
          execution_time_ms?: number | null
          id?: string
          run_type?: string
          status?: string
        }
        Relationships: []
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
      stripe_product_mappings: {
        Row: {
          created_at: string | null
          id: string
          stripe_price_id: string
          stripe_product_id: string
          tier_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          stripe_price_id: string
          stripe_product_id: string
          tier_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          stripe_price_id?: string
          stripe_product_id?: string
          tier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_product_mappings_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "subscription_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_reminders: {
        Row: {
          created_at: string | null
          dismissed_at: string | null
          id: string
          reminder_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dismissed_at?: string | null
          id?: string
          reminder_type?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          dismissed_at?: string | null
          id?: string
          reminder_type?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_tiers: {
        Row: {
          created_at: string | null
          features: Json
          id: string
          max_ai_requests: number | null
          max_exercises: number | null
          name: string
          price_tnd: number
        }
        Insert: {
          created_at?: string | null
          features?: Json
          id?: string
          max_ai_requests?: number | null
          max_exercises?: number | null
          name: string
          price_tnd: number
        }
        Update: {
          created_at?: string | null
          features?: Json
          id?: string
          max_ai_requests?: number | null
          max_exercises?: number | null
          name?: string
          price_tnd?: number
        }
        Relationships: []
      }
      system_alerts: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          created_at: string | null
          details: Json | null
          id: string
          severity: string
          title: string
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string | null
          details?: Json | null
          id?: string
          severity?: string
          title: string
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          severity?: string
          title?: string
        }
        Relationships: []
      }
      telc_exam_attempts: {
        Row: {
          answers: Json | null
          completed_at: string | null
          created_at: string | null
          current_section: string | null
          current_teil: number | null
          exam_state: Json | null
          exam_type: string
          id: string
          max_score: number | null
          results: Json | null
          started_at: string | null
          status: string | null
          time_spent_seconds: number | null
          total_score: number | null
          updated_at: string | null
          user_id: string
          writing_answers: Json | null
        }
        Insert: {
          answers?: Json | null
          completed_at?: string | null
          created_at?: string | null
          current_section?: string | null
          current_teil?: number | null
          exam_state?: Json | null
          exam_type?: string
          id?: string
          max_score?: number | null
          results?: Json | null
          started_at?: string | null
          status?: string | null
          time_spent_seconds?: number | null
          total_score?: number | null
          updated_at?: string | null
          user_id: string
          writing_answers?: Json | null
        }
        Update: {
          answers?: Json | null
          completed_at?: string | null
          created_at?: string | null
          current_section?: string | null
          current_teil?: number | null
          exam_state?: Json | null
          exam_type?: string
          id?: string
          max_score?: number | null
          results?: Json | null
          started_at?: string | null
          status?: string | null
          time_spent_seconds?: number | null
          total_score?: number | null
          updated_at?: string | null
          user_id?: string
          writing_answers?: Json | null
        }
        Relationships: []
      }
      telc_section_scores: {
        Row: {
          completed_at: string | null
          id: string
          max_score: number
          score: number
          section: string
          teil: number
          time_spent_seconds: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          max_score: number
          score: number
          section: string
          teil?: number
          time_spent_seconds?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          max_score?: number
          score?: number
          section?: string
          teil?: number
          time_spent_seconds?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string | null
          completed: boolean | null
          id: string
          notified: boolean | null
          progress: number | null
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id?: string | null
          completed?: boolean | null
          id?: string
          notified?: boolean | null
          progress?: number | null
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string | null
          completed?: boolean | null
          id?: string
          notified?: boolean | null
          progress?: number | null
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_course_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          lesson_id: string | null
          module_id: string
          notes: string | null
          score: number | null
          status: string
          time_spent_minutes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          module_id: string
          notes?: string | null
          score?: number | null
          status?: string
          time_spent_minutes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          module_id?: string
          notes?: string | null
          score?: number | null
          status?: string
          time_spent_minutes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_course_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_course_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_learning_paths: {
        Row: {
          completed_modules: string[] | null
          created_at: string | null
          current_week: number | null
          daily_goal_minutes: number | null
          id: string
          last_lesson_completed_at: string | null
          preferred_focus: string | null
          recommended_next_action: string | null
          strong_areas: Json | null
          target_date: string | null
          target_level: string | null
          total_weeks: number | null
          updated_at: string | null
          user_id: string
          weak_areas: Json | null
        }
        Insert: {
          completed_modules?: string[] | null
          created_at?: string | null
          current_week?: number | null
          daily_goal_minutes?: number | null
          id?: string
          last_lesson_completed_at?: string | null
          preferred_focus?: string | null
          recommended_next_action?: string | null
          strong_areas?: Json | null
          target_date?: string | null
          target_level?: string | null
          total_weeks?: number | null
          updated_at?: string | null
          user_id: string
          weak_areas?: Json | null
        }
        Update: {
          completed_modules?: string[] | null
          created_at?: string | null
          current_week?: number | null
          daily_goal_minutes?: number | null
          id?: string
          last_lesson_completed_at?: string | null
          preferred_focus?: string | null
          recommended_next_action?: string | null
          strong_areas?: Json | null
          target_date?: string | null
          target_level?: string | null
          total_weeks?: number | null
          updated_at?: string | null
          user_id?: string
          weak_areas?: Json | null
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
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          daily_reminder_time: string | null
          display_name: string | null
          exam_target_date: string | null
          id: string
          native_language: string | null
          onboarding_completed: boolean | null
          theme: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          daily_reminder_time?: string | null
          display_name?: string | null
          exam_target_date?: string | null
          id?: string
          native_language?: string | null
          onboarding_completed?: boolean | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          daily_reminder_time?: string | null
          display_name?: string | null
          exam_target_date?: string | null
          id?: string
          native_language?: string | null
          onboarding_completed?: boolean | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_permanent: boolean | null
          started_at: string | null
          status: string
          tier_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_permanent?: boolean | null
          started_at?: string | null
          status?: string
          tier_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_permanent?: boolean | null
          started_at?: string | null
          status?: string
          tier_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "subscription_tiers"
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
      get_ai_usage_stats: { Args: { p_user_id: string }; Returns: Json }
      has_active_subscription: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      track_ai_usage: { Args: { p_user_id: string }; Returns: Json }
      track_daily_activity: {
        Args: { activity_type: string; increment_value?: number }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
