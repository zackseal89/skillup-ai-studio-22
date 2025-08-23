-- Update course_roadmaps table to support Teaching Agent Team structured data
ALTER TABLE public.course_roadmaps 
ADD COLUMN topic TEXT,
ADD COLUMN agent_type TEXT DEFAULT 'onboarding',
ADD COLUMN resources JSONB,
ADD COLUMN exercises JSONB;

-- Create index for better performance when filtering by agent_type
CREATE INDEX idx_course_roadmaps_agent_type ON public.course_roadmaps(agent_type);
CREATE INDEX idx_course_roadmaps_topic ON public.course_roadmaps(topic) WHERE topic IS NOT NULL;