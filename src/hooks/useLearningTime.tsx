import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface LearningSession {
  id: string;
  user_id: string;
  course_id?: string;
  session_type: 'course' | 'assessment' | 'practice';
  started_at: string;
  ended_at?: string;
  duration_minutes?: number;
  created_at: string;
}

export const useLearningTime = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['learning-time', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('learning_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LearningSession[];
    },
    enabled: !!user?.id,
  });
};

export const useStartLearningSession = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ courseId, sessionType }: { courseId?: string; sessionType: 'course' | 'assessment' | 'practice' }) => {
      if (!user?.id) throw new Error('No user');

      const { data, error } = await supabase
        .from('learning_sessions')
        .insert({
          user_id: user.id,
          course_id: courseId,
          session_type: sessionType
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-time'] });
    },
  });
};

export const useEndLearningSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase.rpc('end_learning_session', {
        session_id: sessionId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-time'] });
    },
  });
};

export const useLearningStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['learning-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');
      
      const { data: sessions, error } = await supabase
        .from('learning_sessions')
        .select('duration_minutes, created_at, session_type')
        .eq('user_id', user.id)
        .not('duration_minutes', 'is', null);

      if (error) throw error;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const stats = {
        totalMinutes: sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0),
        todayMinutes: sessions
          .filter(s => new Date(s.created_at) >= today)
          .reduce((sum, s) => sum + (s.duration_minutes || 0), 0),
        weekMinutes: sessions
          .filter(s => new Date(s.created_at) >= thisWeek)
          .reduce((sum, s) => sum + (s.duration_minutes || 0), 0),
        monthMinutes: sessions
          .filter(s => new Date(s.created_at) >= thisMonth)
          .reduce((sum, s) => sum + (s.duration_minutes || 0), 0),
        streakDays: calculateStreak(sessions),
        totalSessions: sessions.length
      };

      return stats;
    },
    enabled: !!user?.id,
  });
};

function calculateStreak(sessions: any[]): number {
  if (sessions.length === 0) return 0;

  const sortedDates = [...new Set(
    sessions.map(s => new Date(s.created_at).toDateString())
  )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 0;
  const today = new Date().toDateString();
  
  for (let i = 0; i < sortedDates.length; i++) {
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() - i);
    
    if (sortedDates[i] === expectedDate.toDateString()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}