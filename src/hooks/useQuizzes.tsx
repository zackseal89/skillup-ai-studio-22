import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface Quiz {
  id: string;
  user_id: string;
  course_id?: string;
  module_id: string;
  module_content?: string;
  difficulty_level: string;
  questions: any[];
  created_at: string;
}

export interface QuizResponse {
  id: string;
  user_id: string;
  quiz_id: string;
  answers: Record<string, string>;
  grade_percentage?: number;
  feedback?: any;
  completed_at: string;
}

export const useQuizzes = (courseId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['quizzes', user?.id, courseId],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');
      
      let query = supabase
        .from('quizzes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (courseId) {
        query = query.eq('course_id', courseId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Quiz[] || [];
    },
    enabled: !!user?.id,
  });
};

export const useQuizResponses = (quizId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['quiz-responses', user?.id, quizId],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');
      
      let query = supabase
        .from('quiz_responses')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (quizId) {
        query = query.eq('quiz_id', quizId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as QuizResponse[] || [];
    },
    enabled: !!user?.id,
  });
};

export const useGenerateQuiz = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      moduleContent,
      difficultyLevel,
      courseId,
      moduleId,
      topic
    }: {
      moduleContent: string;
      difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
      courseId?: string;
      moduleId: string;
      topic?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: {
          moduleContent,
          difficultyLevel,
          courseId,
          moduleId,
          topic
        }
      });

      if (error) {
        console.error('Quiz generation error:', error);
        throw new Error(error.message || 'Failed to generate quiz');
      }

      if (!data.success) {
        throw new Error(data.error || 'Quiz generation failed');
      }

      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Quiz Generated!",
        description: `5 ${data.quiz.difficulty_level} questions are ready.`,
      });
      // Invalidate quizzes to refresh the list
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useGradeQuiz = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      quizId,
      answers
    }: {
      quizId: string;
      answers: Record<string, string>;
    }) => {
      const { data, error } = await supabase.functions.invoke('grade-quiz', {
        body: {
          quizId,
          answers
        }
      });

      if (error) {
        console.error('Quiz grading error:', error);
        throw new Error(error.message || 'Failed to grade quiz');
      }

      if (!data.success) {
        throw new Error(data.error || 'Quiz grading failed');
      }

      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Quiz Completed!",
        description: `You scored ${data.gradePercentage}% (${data.correctCount}/${data.totalQuestions})`,
        variant: data.passed ? "default" : "destructive",
      });
      // Invalidate quiz responses to refresh
      queryClient.invalidateQueries({ queryKey: ['quiz-responses'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to grade quiz. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useQuizStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['quiz-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('quiz_responses')
        .select('grade_percentage, completed_at')
        .eq('user_id', user.id);

      if (error) throw error;

      const responses = data as QuizResponse[];
      const totalQuizzes = responses.length;
      const averageScore = totalQuizzes > 0 
        ? responses.reduce((sum, r) => sum + (r.grade_percentage || 0), 0) / totalQuizzes 
        : 0;
      const passedQuizzes = responses.filter(r => (r.grade_percentage || 0) >= 70).length;
      const passRate = totalQuizzes > 0 ? (passedQuizzes / totalQuizzes) * 100 : 0;

      return {
        totalQuizzes,
        averageScore: Math.round(averageScore),
        passedQuizzes,
        passRate: Math.round(passRate),
        recentScores: responses
          .slice(0, 10)
          .map(r => r.grade_percentage || 0)
      };
    },
    enabled: !!user?.id,
  });
};