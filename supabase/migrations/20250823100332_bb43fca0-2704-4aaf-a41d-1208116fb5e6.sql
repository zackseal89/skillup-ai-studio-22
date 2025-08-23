-- Create team_skill_assessments table for manager-initiated assessments
CREATE TABLE public.team_skill_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL,
  manager_id UUID NOT NULL,
  assessment_type TEXT NOT NULL DEFAULT 'bulk_analysis',
  job_roles JSONB NOT NULL DEFAULT '[]'::jsonb,
  employee_profiles JSONB NOT NULL DEFAULT '[]'::jsonb,
  skill_gaps_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create learning_path_suggestions table for AI-generated recommendations
CREATE TABLE public.learning_path_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID,
  target_role TEXT NOT NULL,
  suggested_courses JSONB NOT NULL DEFAULT '[]'::jsonb,
  difficulty_level TEXT NOT NULL DEFAULT 'intermediate',
  estimated_duration TEXT,
  skills_covered JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_confidence_score INTEGER DEFAULT 85,
  generated_by TEXT NOT NULL DEFAULT 'gpt-4.1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trend_data table for market insights
CREATE TABLE public.trend_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trend_type TEXT NOT NULL DEFAULT 'skill_demand',
  trend_name TEXT NOT NULL,
  trend_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  demand_score INTEGER DEFAULT 0,
  growth_percentage DECIMAL(5,2) DEFAULT 0.0,
  time_period TEXT DEFAULT 'weekly',
  data_source TEXT DEFAULT 'aiml_api',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.team_skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_path_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_data ENABLE ROW LEVEL SECURITY;

-- RLS policies for team_skill_assessments
CREATE POLICY "Managers can manage team assessments" 
ON public.team_skill_assessments 
FOR ALL 
USING (auth.uid() = manager_id);

-- RLS policies for learning_path_suggestions
CREATE POLICY "Managers can view team path suggestions" 
ON public.learning_path_suggestions 
FOR SELECT 
USING (
  team_id IS NULL OR 
  auth.uid() IN (
    SELECT manager_id FROM teams WHERE teams.id = learning_path_suggestions.team_id
  )
);

CREATE POLICY "Managers can create path suggestions" 
ON public.learning_path_suggestions 
FOR INSERT 
WITH CHECK (
  team_id IS NULL OR 
  auth.uid() IN (
    SELECT manager_id FROM teams WHERE teams.id = learning_path_suggestions.team_id
  )
);

-- RLS policies for trend_data (public read access)
CREATE POLICY "Anyone can view trend data" 
ON public.trend_data 
FOR SELECT 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_team_skill_assessments_team_id ON public.team_skill_assessments(team_id);
CREATE INDEX idx_team_skill_assessments_manager_id ON public.team_skill_assessments(manager_id);
CREATE INDEX idx_learning_path_suggestions_team_id ON public.learning_path_suggestions(team_id);
CREATE INDEX idx_learning_path_suggestions_target_role ON public.learning_path_suggestions(target_role);
CREATE INDEX idx_trend_data_trend_type ON public.trend_data(trend_type);
CREATE INDEX idx_trend_data_trend_name ON public.trend_data(trend_name);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_team_skill_assessments_updated_at
BEFORE UPDATE ON public.team_skill_assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trend_data_updated_at
BEFORE UPDATE ON public.trend_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();