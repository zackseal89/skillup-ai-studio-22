import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
  event_type: 'deadline' | 'reminder' | 'session' | 'personal';
  course_id?: string;
  created_at: string;
}

export const useCalendarEvents = (date?: Date) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['calendar-events', user?.id, date?.toISOString()],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');
      
      let query = supabase
        .from('calendar_events')
        .select(`
          *,
          course:courses(title)
        `)
        .eq('user_id', user.id);

      if (date) {
        const dateStr = date.toISOString().split('T')[0];
        query = query.eq('event_date', dateStr);
      }

      const { data, error } = await query.order('event_date', { ascending: true });

      if (error) throw error;
      return data as CalendarEvent[];
    },
    enabled: !!user?.id,
  });
};

export const useUpcomingEvents = (limit = 5) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['upcoming-events', user?.id, limit],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');
      
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('calendar_events')
        .select(`
          *,
          course:courses(title)
        `)
        .eq('user_id', user.id)
        .gte('event_date', today)
        .order('event_date', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data as CalendarEvent[];
    },
    enabled: !!user?.id,
  });
};

export const useCreateCalendarEvent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (eventData: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at'>) => {
      if (!user?.id) throw new Error('No user');

      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          ...eventData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-events'] });
    },
  });
};

export const useUpdateCalendarEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CalendarEvent> }) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-events'] });
    },
  });
};

export const useDeleteCalendarEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-events'] });
    },
  });
};