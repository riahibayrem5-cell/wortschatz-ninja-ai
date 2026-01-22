import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TelcSectionScores {
  reading: number;
  listening: number;
  writing: number;
  speaking: number;
  sprachbausteine: number;
}

export interface TelcStats {
  totalExamsTaken: number;
  averageScore: number;
  currentStreak: number;
  totalPracticeMinutes: number;
  sectionScores: TelcSectionScores;
  bestSection: string;
  weakestSection: string;
  todayMinutes: number;
  weeklyProgress: number[];
  lastExamDate?: Date;
  isLoading: boolean;
}

export interface DailyTask {
  id: string;
  title: string;
  section: string;
  completed: boolean;
  duration: number;
}

const sectionKeyMap: Record<string, keyof TelcSectionScores> = {
  lesen: 'reading',
  leseverstehen: 'reading',
  reading: 'reading',
  hoeren: 'listening',
  hörverstehen: 'listening',
  listening: 'listening',
  schreiben: 'writing',
  writing: 'writing',
  sprechen: 'speaking',
  speaking: 'speaking',
  sprachbausteine: 'sprachbausteine',
};

const sectionLabels: Record<keyof TelcSectionScores, string> = {
  reading: 'Lesen',
  listening: 'Hören',
  writing: 'Schreiben',
  speaking: 'Sprechen',
  sprachbausteine: 'Sprachbausteine',
};

export function useTelcStats() {
  const [stats, setStats] = useState<TelcStats>({
    totalExamsTaken: 0,
    averageScore: 0,
    currentStreak: 0,
    totalPracticeMinutes: 0,
    sectionScores: { reading: 0, listening: 0, writing: 0, speaking: 0, sprachbausteine: 0 },
    bestSection: '-',
    weakestSection: '-',
    todayMinutes: 0,
    weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
    isLoading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setStats(prev => ({ ...prev, isLoading: false }));
          return;
        }

        const userId = session.user.id;

        // Fetch all data in parallel
        const [
          examAttemptsResult,
          userProgressResult,
          dailyActivityResult,
          todayActivityResult,
        ] = await Promise.all([
          // TELC exam attempts
          supabase
            .from('telc_exam_attempts')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'completed')
            .order('completed_at', { ascending: false }),
          
          // User progress (streak)
          supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', userId)
            .single(),
          
          // Weekly activity (last 7 days)
          supabase
            .from('daily_activity')
            .select('*')
            .eq('user_id', userId)
            .gte('activity_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
            .order('activity_date', { ascending: true }),
          
          // Today's activity
          supabase
            .from('daily_activity')
            .select('*')
            .eq('user_id', userId)
            .eq('activity_date', new Date().toISOString().split('T')[0])
            .single(),
        ]);

        const examAttempts = examAttemptsResult.data || [];
        const userProgress = userProgressResult.data;
        const dailyActivities = dailyActivityResult.data || [];
        const todayActivity = todayActivityResult.data;

        // Calculate total exams taken
        const totalExamsTaken = examAttempts.length;

        // Calculate average score from exam results
        let averageScore = 0;
        const sectionTotals: TelcSectionScores = { reading: 0, listening: 0, writing: 0, speaking: 0, sprachbausteine: 0 };
        const sectionCounts: Record<keyof TelcSectionScores, number> = { reading: 0, listening: 0, writing: 0, speaking: 0, sprachbausteine: 0 };

        if (totalExamsTaken > 0) {
          let totalScore = 0;
          
          examAttempts.forEach(exam => {
            // Calculate percentage from exam score
            const maxScore = exam.max_score || 300;
            const score = exam.total_score || 0;
            const percentage = Math.round((score / maxScore) * 100);
            totalScore += percentage;

            // Extract section scores from results JSON
            if (exam.results) {
              const results = exam.results as any;
              Object.entries(results).forEach(([section, data]: [string, any]) => {
                const normalizedKey = sectionKeyMap[section.toLowerCase()];
                if (normalizedKey && data?.score !== undefined && data?.maxScore !== undefined) {
                  const sectionPercent = data.maxScore > 0 ? Math.round((data.score / data.maxScore) * 100) : 0;
                  sectionTotals[normalizedKey] += sectionPercent;
                  sectionCounts[normalizedKey]++;
                }
              });
            }
          });

          averageScore = Math.round(totalScore / totalExamsTaken);
        }

        // Calculate average section scores
        const sectionScores: TelcSectionScores = {
          reading: sectionCounts.reading > 0 ? Math.round(sectionTotals.reading / sectionCounts.reading) : 0,
          listening: sectionCounts.listening > 0 ? Math.round(sectionTotals.listening / sectionCounts.listening) : 0,
          writing: sectionCounts.writing > 0 ? Math.round(sectionTotals.writing / sectionCounts.writing) : 0,
          speaking: sectionCounts.speaking > 0 ? Math.round(sectionTotals.speaking / sectionCounts.speaking) : 0,
          sprachbausteine: sectionCounts.sprachbausteine > 0 ? Math.round(sectionTotals.sprachbausteine / sectionCounts.sprachbausteine) : 0,
        };

        // Find best and weakest sections
        const sectionEntries = Object.entries(sectionScores) as [keyof TelcSectionScores, number][];
        const nonZeroSections = sectionEntries.filter(([, score]) => score > 0);
        
        let bestSection = '-';
        let weakestSection = '-';
        
        if (nonZeroSections.length > 0) {
          const sorted = [...nonZeroSections].sort((a, b) => b[1] - a[1]);
          bestSection = sectionLabels[sorted[0][0]];
          weakestSection = sectionLabels[sorted[sorted.length - 1][0]];
        }

        // Get streak from user_progress
        const currentStreak = userProgress?.streak_days || 0;

        // Calculate total practice minutes from all daily activities
        const totalPracticeMinutes = dailyActivities.reduce((sum, day) => 
          sum + (day.time_spent_minutes || 0), 0
        );

        // Today's minutes
        const todayMinutes = todayActivity?.time_spent_minutes || 0;

        // Weekly progress (calculate % of daily goal, assuming 60 min goal)
        const dailyGoal = 60;
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          // Start from Monday
          const currentDay = date.getDay();
          const monday = new Date(date);
          monday.setDate(date.getDate() - currentDay + 1 + i);
          return monday.toISOString().split('T')[0];
        });

        const weeklyProgress = last7Days.map(dateStr => {
          const dayData = dailyActivities.find(d => d.activity_date === dateStr);
          const minutes = dayData?.time_spent_minutes || 0;
          return Math.min(100, Math.round((minutes / dailyGoal) * 100));
        });

        // Last exam date
        const lastExamDate = examAttempts[0]?.completed_at 
          ? new Date(examAttempts[0].completed_at) 
          : undefined;

        setStats({
          totalExamsTaken,
          averageScore,
          currentStreak,
          totalPracticeMinutes,
          sectionScores,
          bestSection,
          weakestSection,
          todayMinutes,
          weeklyProgress,
          lastExamDate,
          isLoading: false,
        });

      } catch (error) {
        console.error('Error fetching TELC stats:', error);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchStats();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('telc-stats-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'telc_exam_attempts' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_activity' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_progress' }, fetchStats)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return stats;
}

// Hook to get section-specific progress for the SectionProgressCards
export function useSectionProgress() {
  const [progress, setProgress] = useState<{
    sections: Array<{
      id: string;
      progress: number;
      bestScore: number;
      practiceCount: number;
      lastPracticed?: string;
    }>;
    isLoading: boolean;
  }>({ sections: [], isLoading: true });

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setProgress({ sections: [], isLoading: false });
          return;
        }

        // Fetch all exam attempts to calculate section progress
        const { data: attempts } = await supabase
          .from('telc_exam_attempts')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('status', 'completed');

        const sectionData: Record<string, { scores: number[]; count: number; lastDate?: string }> = {
          reading: { scores: [], count: 0 },
          sprachbausteine: { scores: [], count: 0 },
          listening: { scores: [], count: 0 },
          writing: { scores: [], count: 0 },
          speaking: { scores: [], count: 0 },
        };

        (attempts || []).forEach(exam => {
          if (exam.results) {
            const results = exam.results as any;
            Object.entries(results).forEach(([section, data]: [string, any]) => {
              const normalizedKey = sectionKeyMap[section.toLowerCase()];
              if (normalizedKey && sectionData[normalizedKey] && data?.score !== undefined && data?.maxScore !== undefined) {
                const percent = data.maxScore > 0 ? Math.round((data.score / data.maxScore) * 100) : 0;
                sectionData[normalizedKey].scores.push(percent);
                sectionData[normalizedKey].count++;
                if (!sectionData[normalizedKey].lastDate || 
                    (exam.completed_at && exam.completed_at > sectionData[normalizedKey].lastDate!)) {
                  sectionData[normalizedKey].lastDate = exam.completed_at;
                }
              }
            });
          }
        });

        const sections = Object.entries(sectionData).map(([id, data]) => ({
          id,
          progress: data.scores.length > 0 
            ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length) 
            : 0,
          bestScore: data.scores.length > 0 ? Math.max(...data.scores) : 0,
          practiceCount: data.count,
          lastPracticed: data.lastDate,
        }));

        setProgress({ sections, isLoading: false });

      } catch (error) {
        console.error('Error fetching section progress:', error);
        setProgress({ sections: [], isLoading: false });
      }
    };

    fetchProgress();
  }, []);

  return progress;
}
