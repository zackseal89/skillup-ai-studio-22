
-- Create onboarding table to store user onboarding data
CREATE TABLE public.onboarding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  industry TEXT NOT NULL,
  role TEXT NOT NULL,
  ai_skill_level TEXT NOT NULL CHECK (ai_skill_level IN ('Beginner', 'Intermediate', 'Advanced')),
  learning_goals TEXT NOT NULL,
  learning_style TEXT[] NOT NULL,
  time_commitment TEXT NOT NULL,
  onboarding_completed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.onboarding ENABLE ROW LEVEL SECURITY;

-- Create policies for onboarding table
CREATE POLICY "Users can view their own onboarding data" 
  ON public.onboarding 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding data" 
  ON public.onboarding 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding data" 
  ON public.onboarding 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create course_roadmaps table to store generated roadmaps
CREATE TABLE public.course_roadmaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  roadmap_content TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS for course_roadmaps
ALTER TABLE public.course_roadmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roadmaps" 
  ON public.course_roadmaps 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roadmaps" 
  ON public.course_roadmaps 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
