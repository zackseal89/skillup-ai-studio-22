-- Remove all existing hardcoded data to ensure courses section starts empty
-- First delete course enrollments that reference courses
DELETE FROM public.course_enrollments;

-- Then delete course personalization data
DELETE FROM public.course_personalization;

-- Delete any learning sessions that reference courses
UPDATE public.learning_sessions SET course_id = NULL WHERE course_id IS NOT NULL;

-- Delete any calendar events that reference courses
UPDATE public.calendar_events SET course_id = NULL WHERE course_id IS NOT NULL;

-- Delete any quizzes that reference courses
UPDATE public.quizzes SET course_id = NULL WHERE course_id IS NOT NULL;

-- Finally delete all courses
DELETE FROM public.courses;