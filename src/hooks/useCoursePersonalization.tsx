import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface CoursePersonalization {
  id: string;
  user_id: string;
  course_id: string;
  current_knowledge_level?: number;
  learning_preferences?: any;
  custom_goals?: string;
  difficulty_preference?: 'easy' | 'medium' | 'hard' | 'adaptive';
  time_preference?: 'short' | 'medium' | 'long' | 'flexible';
  created_at: string;
  updated_at: string;
}

export const useCoursePersonalization = (courseId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['course-personalization', courseId, user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('course_personalization')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();

      if (error) throw error;
      return data as CoursePersonalization | null;
    },
    enabled: !!user?.id && !!courseId,
  });
};

export const useCreateCoursePersonalization = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (personalizationData: Omit<CoursePersonalization, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('No user');

      const { data, error } = await supabase
        .from('course_personalization')
        .upsert({
          ...personalizationData,
          user_id: user.id,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['course-personalization', data.course_id] 
      });
    },
  });
};

export const useUpdateCoursePersonalization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      courseId, 
      updates 
    }: { 
      courseId: string; 
      updates: Partial<CoursePersonalization> 
    }) => {
      const { data, error } = await supabase
        .from('course_personalization')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('course_id', courseId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['course-personalization', data.course_id] 
      });
    },
  });
};