import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  callInternalAI, 
  AIInteractionType, 
  InternalAIRequest,
  InternalAIResponse 
} from "@/utils/internalAI";

export const useInternalAI = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: InternalAIRequest): Promise<InternalAIResponse> => {
      return await callInternalAI(request);
    },
    onSuccess: (data) => {
      if (data.success) {
        // Optionally show success toast for certain interaction types
        if (data.interactionType === 'insights') {
          toast({
            title: "Insights Generated",
            description: "AI analysis completed successfully.",
          });
        }
        // Invalidate AI interactions cache
        queryClient.invalidateQueries({ queryKey: ['ai-interactions'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "AI Error",
        description: error.message || "Failed to process AI request. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Specialized hooks for different AI interaction types

export const useSummarization = () => {
  const internalAI = useInternalAI();
  
  return useMutation({
    mutationFn: async ({ content, context }: { content: string; context?: any }) => {
      return await internalAI.mutateAsync({
        prompt: `Please provide a concise summary of the following content: ${content}`,
        interactionType: 'summarization',
        context
      });
    }
  });
};

export const useReformatting = () => {
  const internalAI = useInternalAI();
  
  return useMutation({
    mutationFn: async ({ 
      content, 
      targetFormat, 
      context 
    }: { 
      content: string; 
      targetFormat: string; 
      context?: any;
    }) => {
      return await internalAI.mutateAsync({
        prompt: `Please reformat the following content into ${targetFormat}: ${content}`,
        interactionType: 'reformatting',
        context
      });
    }
  });
};

export const usePersonalization = () => {
  const internalAI = useInternalAI();
  
  return useMutation({
    mutationFn: async ({ 
      content, 
      level, 
      tone, 
      context 
    }: { 
      content: string; 
      level: 'beginner' | 'intermediate' | 'advanced'; 
      tone?: string;
      context?: any;
    }) => {
      return await internalAI.mutateAsync({
        prompt: `Please personalize this content for a ${level} level audience${tone ? ` with a ${tone} tone` : ''}: ${content}`,
        interactionType: 'personalization',
        context
      });
    }
  });
};

export const useInsights = () => {
  const internalAI = useInternalAI();
  
  return useMutation({
    mutationFn: async ({ 
      data, 
      focusArea, 
      context 
    }: { 
      data: any; 
      focusArea?: string; 
      context?: any;
    }) => {
      const prompt = focusArea 
        ? `Please generate insights focused on ${focusArea} from this data: ${JSON.stringify(data)}`
        : `Please generate key insights and recommendations from this data: ${JSON.stringify(data)}`;
        
      return await internalAI.mutateAsync({
        prompt,
        interactionType: 'insights',
        context
      });
    }
  });
};