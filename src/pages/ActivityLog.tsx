import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar as CalendarIcon, 
  Flame, 
  TrendingUp, 
  Award,
  Target,
  Clock,
  Zap,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from "date-fns";

interface DailyActivity {
  activity_date: string;
  exercises_completed: number;
  words_learned: number;
  conversations_count: number;
  writing_submissions_count: number;
  review_sessions_count: number;
}

interface UserProgress {
  streak_days: number;
  words_learned: number;
  exercises_completed: number;
}

const ActivityLog = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dailyActivities, setDailyActivities] = useState<DailyActivity[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchActivityData();
  }, [currentMonth]);

  const fetchActivityData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Please log in to view activity", variant: "destructive" });
        return;
      }

      // Fetch daily activities for current month
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);

      const { data: activities, error: activitiesError } = await supabase
        .from("daily_activity")
        .select("*")
        .eq("user_id", session.user.id)
        .gte("activity_date", format(monthStart, 'yyyy-MM-dd'))
        .lte("activity_date", format(monthEnd, 'yyyy-MM-dd'))
        .order("activity_date", { ascending: true });

      if (activitiesError) throw activitiesError;

      // Fetch user progress
      const { data: progress, error: progressError } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (progressError && progressError.code !== 'PGRST116') throw progressError;

      setDailyActivities(activities || []);
      setUserProgress(progress);
    } catch (error: any) {
      toast({ title: "Error loading activity", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getActivityLevel = (activity: DailyActivity) => {
    const total = 
      activity.exercises_completed + 
      activity.words_learned + 
      activity.conversations_count + 
      activity.writing_submissions_count + 
      activity.review_sessions_count;

    if (total === 0) return 'none';
    if (total < 5) return 'low';
    if (total < 15) return 'medium';
    if (total < 30) return 'high';
    return 'veryHigh';
  };

  const getActivityColor = (level: string) => {
    const colors = {
      none: 'bg-muted',
      low: 'bg-primary/20',
      medium: 'bg-primary/40',
      high: 'bg-primary/60',
      veryHigh: 'bg-primary'
    };
    return colors[level as keyof typeof colors] || colors.none;
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const getActivityForDate = (date: Date) => {
    return dailyActivities.find(a => 
      isSameDay(new Date(a.activity_date), date)
    );
  };

  const selectedActivity = selectedDate ? getActivityForDate(selectedDate) : null;

  const monthlyTotal = dailyActivities.reduce((acc, activity) => ({
    exercises: acc.exercises + activity.exercises_completed,
    words: acc.words + activity.words_learned,
    conversations: acc.conversations + activity.conversations_count,
    writing: acc.writing + activity.writing_submissions_count,
    reviews: acc.reviews + activity.review_sessions_count,
    activeDays: acc.activeDays + (getActivityLevel(activity) !== 'none' ? 1 : 0)
  }), { exercises: 0, words: 0, conversations: 0, writing: 0, reviews: 0, activeDays: 0 });

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      <div className="container max-w-6xl mx-auto p-4 md:p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient-luxury">
            📊 Activity Log
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your learning journey and maintain your streak
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass-luxury">
            <CardContent className="p-6 text-center">
              <Flame className="w-8 h-8 mx-auto mb-2 text-accent" />
              <p className="text-3xl font-bold text-gradient-luxury">{userProgress?.streak_days || 0}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
          
          <Card className="glass">
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold">{monthlyTotal.activeDays}</p>
              <p className="text-sm text-muted-foreground">Active Days</p>
            </CardContent>
          </Card>
          
          <Card className="glass">
            <CardContent className="p-6 text-center">
              <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-3xl font-bold">{userProgress?.exercises_completed || 0}</p>
              <p className="text-sm text-muted-foreground">Total Exercises</p>
            </CardContent>
          </Card>
          
          <Card className="glass">
            <CardContent className="p-6 text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <p className="text-3xl font-bold">{userProgress?.words_learned || 0}</p>
              <p className="text-sm text-muted-foreground">Words Learned</p>
            </CardContent>
          </Card>
        </div>

        {/* Calendar View */}
        <Card className="glass-luxury mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-6 h-6 text-primary" />
                <div>
                  <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
                  <CardDescription>Click on a day to see details</CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(new Date())}
                >
                  <Clock className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  disabled={isSameMonth(currentMonth, new Date())}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-muted-foreground p-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: daysInMonth[0].getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Days of the month */}
              {daysInMonth.map(day => {
                const activity = getActivityForDate(day);
                const level = activity ? getActivityLevel(activity) : 'none';
                const isToday = isSameDay(day, new Date());
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      aspect-square rounded-lg transition-all relative
                      ${getActivityColor(level)}
                      ${isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
                      ${isSelected ? 'scale-110 shadow-lg' : 'hover:scale-105'}
                      ${!isSameMonth(day, currentMonth) ? 'opacity-30' : ''}
                    `}
                  >
                    <span className={`text-sm font-medium ${level === 'veryHigh' ? 'text-primary-foreground' : 'text-foreground'}`}>
                      {format(day, 'd')}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-6 text-xs">
              <span className="text-muted-foreground">Less</span>
              <div className="flex gap-1">
                {['none', 'low', 'medium', 'high', 'veryHigh'].map(level => (
                  <div
                    key={level}
                    className={`w-4 h-4 rounded ${getActivityColor(level)}`}
                  />
                ))}
              </div>
              <span className="text-muted-foreground">More</span>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Summary */}
        <Card className="glass-luxury mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Monthly Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 glass rounded-lg">
                <p className="text-2xl font-bold text-primary">{monthlyTotal.exercises}</p>
                <p className="text-xs text-muted-foreground">Exercises</p>
              </div>
              <div className="text-center p-4 glass rounded-lg">
                <p className="text-2xl font-bold text-purple-500">{monthlyTotal.words}</p>
                <p className="text-xs text-muted-foreground">Words</p>
              </div>
              <div className="text-center p-4 glass rounded-lg">
                <p className="text-2xl font-bold text-green-500">{monthlyTotal.conversations}</p>
                <p className="text-xs text-muted-foreground">Conversations</p>
              </div>
              <div className="text-center p-4 glass rounded-lg">
                <p className="text-2xl font-bold text-orange-500">{monthlyTotal.writing}</p>
                <p className="text-xs text-muted-foreground">Writing</p>
              </div>
              <div className="text-center p-4 glass rounded-lg">
                <p className="text-2xl font-bold text-blue-500">{monthlyTotal.reviews}</p>
                <p className="text-xs text-muted-foreground">Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Day Details */}
        {selectedDate && (
          <Card className="glass-luxury">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
                {selectedActivity && (
                  <Badge className="gradient-primary">
                    {getActivityLevel(selectedActivity) !== 'none' ? 'Active Day' : 'No Activity'}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedActivity ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-4 glass rounded-lg">
                    <p className="text-xl font-bold">{selectedActivity.exercises_completed}</p>
                    <p className="text-xs text-muted-foreground">Exercises</p>
                  </div>
                  <div className="text-center p-4 glass rounded-lg">
                    <p className="text-xl font-bold">{selectedActivity.words_learned}</p>
                    <p className="text-xs text-muted-foreground">Words</p>
                  </div>
                  <div className="text-center p-4 glass rounded-lg">
                    <p className="text-xl font-bold">{selectedActivity.conversations_count}</p>
                    <p className="text-xs text-muted-foreground">Conversations</p>
                  </div>
                  <div className="text-center p-4 glass rounded-lg">
                    <p className="text-xl font-bold">{selectedActivity.writing_submissions_count}</p>
                    <p className="text-xs text-muted-foreground">Writing</p>
                  </div>
                  <div className="text-center p-4 glass rounded-lg">
                    <p className="text-xl font-bold">{selectedActivity.review_sessions_count}</p>
                    <p className="text-xs text-muted-foreground">Reviews</p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No activity recorded for this day
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
