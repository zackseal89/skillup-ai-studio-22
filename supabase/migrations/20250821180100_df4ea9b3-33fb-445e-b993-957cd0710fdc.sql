
-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  industry TEXT NOT NULL,
  role TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create skills table for predefined AI skills per industry
CREATE TABLE public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  industry TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty_level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_skills table for tracking user's skill assessments
CREATE TABLE public.user_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  skill_id UUID REFERENCES public.skills NOT NULL,
  current_level INTEGER NOT NULL DEFAULT 0,
  target_level INTEGER NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'pending',
  assessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

-- Create progress table for tracking learning progress
CREATE TABLE public.progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  module_type TEXT NOT NULL,
  module_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress',
  completion_percentage INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create certifications table for earned certificates
CREATE TABLE public.certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  skill_id UUID REFERENCES public.skills NOT NULL,
  certificate_name TEXT NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  certificate_url TEXT,
  UNIQUE(user_id, skill_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for skills (public read access)
CREATE POLICY "Anyone can view skills" ON public.skills
  FOR SELECT USING (true);

-- Create RLS policies for user_skills
CREATE POLICY "Users can view their own skills" ON public.user_skills
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own skills" ON public.user_skills
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own skills" ON public.user_skills
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for progress
CREATE POLICY "Users can view their own progress" ON public.progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON public.progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for certifications
CREATE POLICY "Users can view their own certifications" ON public.certifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own certifications" ON public.certifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, industry, role, experience_level)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    COALESCE(new.raw_user_meta_data->>'industry', ''),
    COALESCE(new.raw_user_meta_data->>'role', ''),
    COALESCE(new.raw_user_meta_data->>'experience_level', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Pre-seed skills data for the three industries
INSERT INTO public.skills (name, description, industry, category, difficulty_level) VALUES
-- Finance Industry AI Skills
('Prompt Engineering', 'Master the art of crafting effective AI prompts for financial analysis and reporting', 'Finance', 'AI Communication', 1),
('AI-Powered Risk Assessment', 'Learn to use AI tools for credit risk, market risk, and operational risk analysis', 'Finance', 'Risk Management', 2),
('Automated Financial Reporting', 'Implement AI solutions for generating financial reports and compliance documentation', 'Finance', 'Automation', 2),
('Machine Learning for Trading', 'Apply ML algorithms for algorithmic trading and market prediction', 'Finance', 'Machine Learning', 3),

-- Healthcare Industry AI Skills
('AI Medical Documentation', 'Use AI tools for efficient patient record keeping and clinical note generation', 'Healthcare', 'Documentation', 1),
('Diagnostic AI Assistance', 'Leverage AI for medical imaging analysis and diagnostic support', 'Healthcare', 'Diagnostics', 3),
('AI-Enhanced Patient Care', 'Implement AI chatbots and virtual assistants for patient interaction', 'Healthcare', 'Patient Care', 2),
('Healthcare Data Analytics', 'Use AI for population health management and predictive analytics', 'Healthcare', 'Analytics', 2),

-- Technology Industry AI Skills
('Code Generation with AI', 'Master AI-powered coding assistants like GitHub Copilot and ChatGPT for development', 'Technology', 'Development', 1),
('AI-Driven Testing', 'Implement automated testing strategies using AI tools and frameworks', 'Technology', 'Quality Assurance', 2),
('Machine Learning Operations', 'Deploy and manage ML models in production environments', 'Technology', 'MLOps', 3),
('AI Product Management', 'Lead AI product development with understanding of capabilities and limitations', 'Technology', 'Product Management', 2);
