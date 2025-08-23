import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TeachingAgentRequest {
  topic: string;
}

export interface TeachingAgentResponse {
  roadmap: string;
  resources: any[];
  exercises: any[];
  topic: string;
  id: string;
}

export const useTeachingAgent = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: TeachingAgentRequest): Promise<TeachingAgentResponse> => {
      const { data, error } = await supabase.functions.invoke('teaching-agent-team', {
        body: request
      });

      if (error) {
        console.error('Teaching Agent error:', error);
        throw new Error(error.message || 'Failed to get teaching agent response');
      }

      if (!data.success) {
        throw new Error(data.error || 'Teaching agent request failed');
      }

      return data.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Learning Plan Generated!",
        description: `Your personalized plan for "${data.topic}" is ready.`,
      });
      // Invalidate roadmaps to refresh the list
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate learning plan. Please try again.",
        variant: "destructive",
      });
    },
  });
};