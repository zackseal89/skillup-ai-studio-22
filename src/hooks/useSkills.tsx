
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useSkills = (industry?: string) => {
  return useQuery({
    queryKey: ['skills', industry],
    queryFn: async () => {
      let query = supabase.from('skills').select('*');
      
      if (industry) {
        query = query.eq('industry', industry);
      }
      
      const { data, error } = await query.order('difficulty_level').order('name');

      if (error) throw error;
      return data;
    },
  });
};

export const useUserSkills = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user_skills', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('user_skills')
        .select(`
          *,
          skills:skill_id (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
};

export const useCreateUserSkill = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (skillData: { skill_id: string; current_level: number; target_level: number }) => {
      if (!user?.id) throw new Error('No user');

      const { data, error } = await supabase
        .from('user_skills')
        .insert({
          user_id: user.id,
          ...skillData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_skills'] });
    },
  });
};

export const useUpdateUserSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('user_skills')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_skills'] });
    },
  });
};
