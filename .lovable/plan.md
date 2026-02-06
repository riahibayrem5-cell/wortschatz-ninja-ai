# FluentPass Platform Upgrade Plan

## Progress Tracker

### ✅ Completed
- [x] Fix RLS policies with `USING (true)` - Hardened monitor_runs and system_alerts tables
- [x] Create extensions schema for better security organization
- [x] Disable auto-confirm email (email verification required)
- [x] Add Google OAuth authentication
- [x] Implement Forgot Password flow
- [x] Fix hardcoded copyright year (now dynamic)

### 🔄 In Progress
- [ ] Stripe webhook handler (skipped - user chose to continue without secret)

### 📋 Pending (Phase 2-4)

#### Phase 2: Core Improvements
- [ ] Upgrade AI models to latest versions (gemini-3-flash-preview)
- [ ] Add AI usage tracking and quotas
- [ ] Implement rate limiting on edge functions

#### Phase 3: UX Enhancements
- [ ] Add skeleton loading states
- [ ] Implement push notifications for reminders
- [ ] Add "What's New" changelog modal

#### Phase 4: Growth Features
- [ ] FSRS spaced repetition algorithm
- [ ] PWA/Offline support
- [ ] Community features (leaderboards)

---

## Technical Debt Resolved
- ✅ Copyright year hardcoded as 2024 → Now uses `new Date().getFullYear()`
- ✅ No social login → Google OAuth added via Lovable Cloud
- ✅ No forgot password flow → Implemented with email reset link
- ✅ Permissive RLS policies → Restricted to admin/service_role only

## Security Improvements Applied
1. **RLS Hardening**: `monitor_runs` and `system_alerts` now require admin role for viewing
2. **Email Verification**: Auto-confirm disabled, users must verify email
3. **Extensions Schema**: Created dedicated schema for database extensions
