-- Create learning sessions table for real-time tracking
CREATE TABLE public.learning_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID REFERENCES public.courses,
  session_type TEXT NOT NULL CHECK (session_type IN ('course', 'assessment', 'practice')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create calendar events table for personalized scheduling
CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  event_type TEXT NOT NULL CHECK (event_type IN ('deadline', 'reminder', 'session', 'personal')),
  course_id UUID REFERENCES public.courses,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create course personalization table for mini-onboarding
CREATE TABLE public.course_personalization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses,
  current_knowledge_level INTEGER CHECK (current_knowledge_level >= 0 AND current_knowledge_level <= 100),
  learning_preferences JSONB,
  custom_goals TEXT,
  difficulty_preference TEXT CHECK (difficulty_preference IN ('easy', 'medium', 'hard', 'adaptive')),
  time_preference TEXT CHECK (time_preference IN ('short', 'medium', 'long', 'flexible')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_personalization ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for learning_sessions
CREATE POLICY "Users can view their own learning sessions"
  ON public.learning_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning sessions"
  ON public.learning_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning sessions"
  ON public.learning_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Create RLS policies for calendar_events
CREATE POLICY "Users can view their own calendar events"
  ON public.calendar_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own calendar events"
  ON public.calendar_events FOR ALL
  USING (auth.uid() = user_id);

-- Create RLS policies for course_personalization
CREATE POLICY "Users can view their own course personalization"
  ON public.course_personalization FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own course personalization"
  ON public.course_personalization FOR ALL
  USING (auth.uid() = user_id);

-- Create function to automatically end learning sessions
CREATE OR REPLACE FUNCTION public.end_learning_session(session_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.learning_sessions 
  SET 
    ended_at = now(),
    duration_minutes = EXTRACT(EPOCH FROM (now() - started_at)) / 60
  WHERE id = session_id AND user_id = auth.uid() AND ended_at IS NULL;
  
  RETURN FOUND;
END;
$$;