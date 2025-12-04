import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: number;
  points: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Fetch all achievements
    const { data: allAchievements } = await supabaseClient
      .from('achievements')
      .select('*');

    // Fetch user's current achievements
    const { data: userAchievements } = await supabaseClient
      .from('user_achievements')
      .select('*')
      .eq('user_id', user.id);

    // Fetch user progress
    const { data: progress } = await supabaseClient
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    // Fetch TELC exam attempts
    const { data: telcAttempts } = await supabaseClient
      .from('telc_exam_attempts')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'completed');

    // Fetch conversation count
    const { count: conversationCount } = await supabaseClient
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Fetch writing count
    const { count: writingCount } = await supabaseClient
      .from('writing_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const newlyUnlocked: Achievement[] = [];
    const progressUpdates: { id: string; progress: number }[] = [];

    // Check each achievement
    for (const achievement of (allAchievements || [])) {
      const existing = userAchievements?.find(ua => ua.achievement_id === achievement.id);
      
      let currentProgress = 0;
      let shouldUnlock = false;

      switch (achievement.category) {
        case 'streak':
          currentProgress = progress?.streak_days || 0;
          shouldUnlock = currentProgress >= achievement.requirement;
          break;
        case 'vocabulary':
          currentProgress = progress?.words_learned || 0;
          shouldUnlock = currentProgress >= achievement.requirement;
          break;
        case 'exercises':
          currentProgress = progress?.exercises_completed || 0;
          shouldUnlock = currentProgress >= achievement.requirement;
          break;
        case 'telc':
          if (achievement.id === 'telc_first') {
            currentProgress = telcAttempts?.length || 0;
            shouldUnlock = currentProgress >= 1;
          } else if (achievement.id === 'telc_pass' || achievement.id === 'telc_excellent') {
            const bestScore = telcAttempts?.reduce((max, a) => {
              const percentage = Math.round((a.total_score / 300) * 100);
              return percentage > max ? percentage : max;
            }, 0) || 0;
            currentProgress = bestScore;
            shouldUnlock = bestScore >= achievement.requirement;
          }
          break;
        case 'conversation':
          currentProgress = conversationCount || 0;
          shouldUnlock = currentProgress >= achievement.requirement;
          break;
        case 'writing':
          currentProgress = writingCount || 0;
          shouldUnlock = currentProgress >= achievement.requirement;
          break;
        case 'special':
          // Special achievements are handled differently
          break;
      }

      if (!existing) {
        // Create new achievement progress
        await supabaseClient
          .from('user_achievements')
          .insert({
            user_id: user.id,
            achievement_id: achievement.id,
            progress: currentProgress,
            completed: shouldUnlock,
            notified: false
          });

        if (shouldUnlock) {
          newlyUnlocked.push(achievement);
        }
      } else if (!existing.completed && shouldUnlock) {
        // Unlock achievement
        await supabaseClient
          .from('user_achievements')
          .update({
            progress: currentProgress,
            completed: true,
            unlocked_at: new Date().toISOString(),
            notified: false
          })
          .eq('id', existing.id);

        newlyUnlocked.push(achievement);
      } else if (currentProgress !== existing.progress) {
        // Update progress
        await supabaseClient
          .from('user_achievements')
          .update({ progress: currentProgress })
          .eq('id', existing.id);

        progressUpdates.push({ id: achievement.id, progress: currentProgress });
      }
    }

    // Calculate total XP
    const { data: completedAchievements } = await supabaseClient
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', user.id)
      .eq('completed', true);

    const totalXP = completedAchievements?.reduce((sum, ua) => {
      const achievement = allAchievements?.find(a => a.id === ua.achievement_id);
      return sum + (achievement?.points || 0);
    }, 0) || 0;

    return new Response(
      JSON.stringify({
        newlyUnlocked,
        progressUpdates,
        totalXP,
        totalAchievements: allAchievements?.length || 0,
        unlockedCount: completedAchievements?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in check-achievements:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
