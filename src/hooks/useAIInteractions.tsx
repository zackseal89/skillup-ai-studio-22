import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface AIInteraction {
  id: string;
  user_id: string;
  interaction_type: string;
  input_prompt: string;
  output_response: string;
  model_used: string;
  tokens_consumed: number | null;
  created_at: string;
}

export const useAIInteractions = (interactionType?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['ai-interactions', user?.id, interactionType],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');
      
      let query = supabase
        .from('ai_interactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (interactionType) {
        query = query.eq('interaction_type', interactionType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AIInteraction[] || [];
    },
    enabled: !!user?.id,
  });
};

export const useAIInteractionStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['ai-interaction-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('ai_interactions')
        .select('interaction_type, tokens_consumed')
        .eq('user_id', user.id);

      if (error) throw error;

      // Calculate stats
      const stats = data.reduce((acc, interaction) => {
        const type = interaction.interaction_type;
        if (!acc[type]) {
          acc[type] = { count: 0, totalTokens: 0 };
        }
        acc[type].count += 1;
        acc[type].totalTokens += interaction.tokens_consumed || 0;
        return acc;
      }, {} as Record<string, { count: number; totalTokens: number }>);

      const totalInteractions = data.length;
      const totalTokens = data.reduce((sum, interaction) => sum + (interaction.tokens_consumed || 0), 0);

      return {
        totalInteractions,
        totalTokens,
        byType: stats
      };
    },
    enabled: !!user?.id,
  });
};