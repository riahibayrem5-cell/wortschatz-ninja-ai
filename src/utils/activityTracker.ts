import { supabase } from "@/integrations/supabase/client";

/**
 * Track user activity automatically
 * This function is called whenever a user completes an action
 */
export const trackActivity = async (
  activityType: 'exercise' | 'word' | 'conversation' | 'writing' | 'review',
  incrementValue: number = 1
) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Call the database function to track activity
    const { error } = await supabase.rpc('track_daily_activity', {
      activity_type: activityType,
      increment_value: incrementValue
    });

    if (error) {
      console.error('Error tracking activity:', error);
    }
  } catch (error) {
    console.error('Failed to track activity:', error);
  }
};

/**
 * Get user's activity summary for a date range
 */
export const getActivitySummary = async (days: number = 7) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('daily_activity')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('activity_date', startDate.toISOString().split('T')[0])
      .order('activity_date', { ascending: true });

    if (error) throw error;

    // Calculate totals
    const totals = data?.reduce((acc, day) => ({
      totalExercises: acc.totalExercises + (day.exercises_completed || 0),
      totalWords: acc.totalWords + (day.words_learned || 0),
      totalConversations: acc.totalConversations + (day.conversations_count || 0),
      totalWriting: acc.totalWriting + (day.writing_submissions_count || 0),
      totalReviews: acc.totalReviews + (day.review_sessions_count || 0),
      activeDays: acc.activeDays + (
        (day.exercises_completed || 0) + 
        (day.words_learned || 0) + 
        (day.conversations_count || 0) > 0 ? 1 : 0
      )
    }), {
      totalExercises: 0,
      totalWords: 0,
      totalConversations: 0,
      totalWriting: 0,
      totalReviews: 0,
      activeDays: 0
    });

    return {
      daily: data,
      summary: totals
    };
  } catch (error) {
    console.error('Error getting activity summary:', error);
    return null;
  }
};
