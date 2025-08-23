-- Create ai_interactions table to log all internal AI calls
CREATE TABLE public.ai_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  interaction_type TEXT NOT NULL,
  input_prompt TEXT NOT NULL,
  output_response TEXT NOT NULL,
  model_used TEXT NOT NULL DEFAULT 'openai/gpt-5-2025-08-07',
  tokens_consumed INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own AI interactions" 
ON public.ai_interactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI interactions" 
ON public.ai_interactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_ai_interactions_user_id ON public.ai_interactions(user_id);
CREATE INDEX idx_ai_interactions_type ON public.ai_interactions(interaction_type);
CREATE INDEX idx_ai_interactions_created_at ON public.ai_interactions(created_at DESC);