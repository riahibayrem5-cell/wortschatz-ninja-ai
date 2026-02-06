# FluentPass Platform Upgrade Plan

## Progress Tracker

### ✅ Completed (Phase 1 & 2)

#### Security & Auth
- [x] Fix RLS policies with `USING (true)` - Hardened monitor_runs and system_alerts tables
- [x] Create extensions schema for better security organization
- [x] Disable auto-confirm email (email verification required)
- [x] Add Google OAuth authentication
- [x] Implement Forgot Password flow

#### AI Modernization
- [x] Upgrade ALL edge functions (20+) to `google/gemini-3-flash-preview`
- [x] Migrate `evaluate-telc-answer` and `analyze-pronunciation` from direct Google API to Lovable AI gateway
- [x] Add shared AI utilities (`_shared/ai.ts`) with model configuration
- [x] Add `ai_requests_count` column to `daily_activity` table
- [x] Create `track_ai_usage()` and `get_ai_usage_stats()` database functions
- [x] Create `useAIUsage` hook for frontend usage tracking

#### Technical Debt
- [x] Fix hardcoded copyright year (now dynamic)

### 🔄 Skipped
- [ ] Stripe webhook handler (user chose to continue without secret)

### 📋 Pending (Phase 3-4)

#### Phase 3: UX Enhancements
- [ ] Add skeleton loading states to all data components
- [ ] Implement push notifications for review reminders
- [ ] Add "What's New" changelog modal

#### Phase 4: Growth Features
- [ ] FSRS spaced repetition algorithm for vocabulary
- [ ] PWA/Offline support with service worker
- [ ] Community features (leaderboards, study groups)

---

## Technical Changes Summary

### Database Schema Updates
```sql
-- New column for AI usage tracking
ALTER TABLE daily_activity ADD COLUMN ai_requests_count integer DEFAULT 0;

-- New functions for quota management
CREATE FUNCTION track_ai_usage(p_user_id uuid) RETURNS json;
CREATE FUNCTION get_ai_usage_stats(p_user_id uuid) RETURNS json;
```

### AI Model Migration
All 20+ edge functions upgraded from `google/gemini-2.5-flash` to `google/gemini-3-flash-preview`:
- generate-exercise, conversation, writing-assistant
- analyze-mistakes, analyze-word, analyze-progress, analyze-translation, analyze-pronunciation
- generate-vocabulary, generate-memorizer, generate-sentence, generate-daily-lesson
- generate-gap-fill, generate-smart-exercises, generate-word-association(-dynamic)
- generate-telc-exam, evaluate-telc-answer, telc-practice-helper
- highlight-text, course-ai-tutor, explain-word-association
- ai-monitor-agent (already on gemini-3)

### New Shared Utilities
- `supabase/functions/_shared/ai.ts`: Centralized AI configuration, model selection, usage tracking
- `src/hooks/useAIUsage.ts`: Frontend hook for displaying AI usage stats

### Security Improvements
- RLS policies on `monitor_runs` and `system_alerts` now require admin role
- Extensions isolated to dedicated schema
- Email verification enforced (auto-confirm disabled)
- Google OAuth via Lovable Cloud managed solution
