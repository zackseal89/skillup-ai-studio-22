-- Create courses table with real course data
CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  instructor text NOT NULL,
  duration text NOT NULL,
  difficulty_level text NOT NULL DEFAULT 'Beginner',
  category text NOT NULL,
  industry text NOT NULL,
  skills text[] NOT NULL DEFAULT '{}',
  modules integer NOT NULL DEFAULT 1,
  has_certificate boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to view courses
CREATE POLICY "Anyone can view courses" 
ON public.courses 
FOR SELECT 
USING (true);

-- Insert real course data based on existing skills
INSERT INTO public.courses (title, description, instructor, duration, difficulty_level, category, industry, skills, modules, is_featured) VALUES
('Prompt Engineering Mastery', 'Master the art of crafting effective AI prompts for financial analysis and reporting', 'Dr. Sarah Chen', '6 weeks', 'Beginner', 'AI Communication', 'Finance', ARRAY['Prompt Engineering', 'AI Communication', 'Financial Analysis'], 8, true),
('AI-Powered Risk Assessment', 'Learn to use AI tools for credit risk, market risk, and operational risk analysis', 'Prof. Michael Rodriguez', '8 weeks', 'Intermediate', 'Risk Management', 'Finance', ARRAY['Risk Management', 'AI Analysis', 'Financial Modeling'], 12, false),
('Automated Financial Reporting', 'Implement AI solutions for generating financial reports and compliance documentation', 'Emily Johnson', '10 weeks', 'Intermediate', 'Automation', 'Finance', ARRAY['Automation', 'Financial Reporting', 'Compliance'], 15, true),
('Machine Learning for Trading', 'Apply ML algorithms for algorithmic trading and market prediction', 'Dr. Alex Wong', '12 weeks', 'Advanced', 'Machine Learning', 'Finance', ARRAY['Machine Learning', 'Trading', 'Python', 'Data Analysis'], 18, false),
('AI Medical Documentation', 'Use AI tools for efficient patient record keeping and clinical note generation', 'Dr. Lisa Martinez', '4 weeks', 'Beginner', 'Documentation', 'Healthcare', ARRAY['Medical Documentation', 'AI Tools', 'Healthcare'], 6, false),
('Diagnostic AI Assistance', 'Leverage AI for medical imaging analysis and diagnostic support', 'Dr. Robert Kim', '14 weeks', 'Advanced', 'Diagnostics', 'Healthcare', ARRAY['Diagnostics', 'Medical Imaging', 'AI Analysis'], 20, true),
('AI-Enhanced Patient Care', 'Implement AI chatbots and virtual assistants for patient interaction', 'Sarah Thompson', '7 weeks', 'Intermediate', 'Patient Care', 'Healthcare', ARRAY['Patient Care', 'AI Chatbots', 'Healthcare Technology'], 10, false),
('Healthcare Data Analytics', 'Use AI for population health management and predictive analytics', 'Dr. Jennifer Park', '9 weeks', 'Intermediate', 'Analytics', 'Healthcare', ARRAY['Data Analytics', 'Healthcare', 'Predictive Modeling'], 14, true),
('Code Generation with AI', 'Master AI-powered coding assistants like GitHub Copilot and ChatGPT for development', 'Jake Miller', '8 weeks', 'Beginner', 'Development', 'Technology', ARRAY['Code Generation', 'AI Tools', 'Programming'], 12, true),
('AI-Driven Testing', 'Implement automated testing strategies using AI tools and frameworks', 'Maria Garcia', '6 weeks', 'Intermediate', 'Quality Assurance', 'Technology', ARRAY['Testing', 'Automation', 'AI Tools'], 9, false);

-- Create course_enrollments table to track user enrollment
CREATE TABLE public.course_enrollments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  course_id uuid NOT NULL REFERENCES public.courses(id),
  enrolled_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active',
  UNIQUE(user_id, course_id)
);

-- Enable RLS on enrollments
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

-- Users can view and manage their own enrollments
CREATE POLICY "Users can view their own enrollments" 
ON public.course_enrollments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll in courses" 
ON public.course_enrollments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enrollments" 
ON public.course_enrollments 
FOR UPDATE 
USING (auth.uid() = user_id);