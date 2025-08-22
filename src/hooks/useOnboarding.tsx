
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface OnboardingData {
  industry: string;
  role: string;
  ai_skill_level: 'Beginner' | 'Intermediate' | 'Advanced';
  learning_goals: string;
  learning_style: string[];
  time_commitment: string;
}

export const useOnboarding = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['onboarding', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('onboarding')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
};

export const useCreateOnboarding = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (onboardingData: OnboardingData) => {
      if (!user?.id) throw new Error('No user');

      const { data, error } = await supabase
        .from('onboarding')
        .insert({
          user_id: user.id,
          ...onboardingData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
    },
  });
};

export const useGenerateRoadmap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (onboardingData: OnboardingData) => {
      const { data, error } = await supabase.functions.invoke('generate-roadmap', {
        body: onboardingData
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course_roadmaps'] });
    },
  });
};
