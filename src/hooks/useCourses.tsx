import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  difficulty_level: string;
  category: string;
  industry: string;
  skills: string[];
  modules: number;
  has_certificate: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  status: string;
  course?: Course;
}

export const useCourses = (filters?: { category?: string; industry?: string; difficulty?: string; search?: string }) => {
  return useQuery({
    queryKey: ['courses', filters],
    queryFn: async () => {
      let query = supabase.from('courses').select('*');
      
      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      
      if (filters?.industry && filters.industry !== 'all') {
        query = query.eq('industry', filters.industry);
      }
      
      if (filters?.difficulty && filters.difficulty !== 'all') {
        query = query.eq('difficulty_level', filters.difficulty);
      }
      
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as Course[];
    },
  });
};

export const useCourse = (courseId: string) => {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) throw error;
      return data as Course;
    },
    enabled: !!courseId,
  });
};

export const useUserEnrollments = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['enrollments', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          course:courses (*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (error) throw error;
      return data as CourseEnrollment[];
    },
    enabled: !!user?.id,
  });
};

export const useEnrollInCourse = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!user?.id) throw new Error('No user');

      // Check if already enrolled first
      const { data: existing } = await supabase
        .from('course_enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .eq('status', 'active')
        .maybeSingle();

      if (existing) {
        return existing;
      }

      // Insert new enrollment
      const { data, error } = await supabase
        .from('course_enrollments')
        .insert({
          user_id: user.id,
          course_id: courseId
        })
        .select()
        .single();

      if (error) {
        // Handle duplicate key error gracefully
        if (error.code === '23505') {
          // Fetch the existing enrollment
          const { data: existingData } = await supabase
            .from('course_enrollments')
            .select('id')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .single();
          return existingData;
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });
};

export const useFeaturedCourses = () => {
  return useQuery({
    queryKey: ['featured-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Course[];
    },
  });
};