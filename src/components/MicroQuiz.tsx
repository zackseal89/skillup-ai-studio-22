import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Target, 
  Clock, 
  Award,
  BookOpen,
  RefreshCw,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QuizQuestion {
  id: number;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
}

interface Quiz {
  id: string;
  questions: QuizQuestion[];
  difficulty_level: string;
  module_id: string;
  course_id?: string;
}

interface QuizFeedback {
  questions: Array<{
    questionId: number;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
  }>;
  aiFeedback?: string;
  score: number;
  passed: boolean;
}

interface MicroQuizProps {
  moduleContent: string;
  moduleId: string;
  courseId?: string;
  topic?: string;
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  onComplete?: (score: number) => void;
}

export const MicroQuiz = ({ 
  moduleContent, 
  moduleId, 
  courseId, 
  topic, 
  difficultyLevel = 'intermediate',
  onComplete 
}: MicroQuizProps) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [feedback, setFeedback] = useState<QuizFeedback | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  
  const { toast } = useToast();

  // Timer effect
  useEffect(() => {
    if (quiz && !showResults && startTime) {
      const interval = setInterval(() => {
        setTimeSpent(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [quiz, showResults, startTime]);

  const generateQuiz = async () => {
    setIsGenerating(true);
    try {
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

      setQuiz(data.quiz);
      setStartTime(new Date());
      toast({
        title: "Quiz Generated!",
        description: `5 ${difficultyLevel} questions ready for you.`,
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitQuiz = async () => {
    if (!quiz) return;

    // Check if all questions are answered
    const unansweredQuestions = quiz.questions.filter(q => !answers[q.id.toString()]);
    if (unansweredQuestions.length > 0) {
      toast({
        title: "Incomplete Quiz",
        description: `Please answer all questions before submitting. ${unansweredQuestions.length} questions remaining.`,
        variant: "destructive",
      });
      return;
    }

    setIsGrading(true);
    try {
      const { data, error } = await supabase.functions.invoke('grade-quiz', {
        body: {
          quizId: quiz.id,
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

      setFeedback(data.feedback);
      setShowResults(true);
      
      // Call completion callback
      if (onComplete) {
        onComplete(data.gradePercentage);
      }

      toast({
        title: "Quiz Complete!",
        description: `You scored ${data.gradePercentage}% (${data.correctCount}/${data.totalQuestions})`,
        variant: data.passed ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Grading error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to grade quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGrading(false);
    }
  };

  const resetQuiz = () => {
    setQuiz(null);
    setAnswers({});
    setCurrentQuestion(0);
    setShowResults(false);
    setFeedback(null);
    setTimeSpent(0);
    setStartTime(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!quiz) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle>Micro-Quiz Generator</CardTitle>
          </div>
          <CardDescription>
            Test your understanding with 5 personalized questions about this module
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold">5</div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </div>
            <div>
              <div className="text-lg font-semibold capitalize">{difficultyLevel}</div>
              <div className="text-sm text-muted-foreground">Difficulty</div>
            </div>
            <div>
              <div className="text-lg font-semibold">AI</div>
              <div className="text-sm text-muted-foreground">Graded</div>
            </div>
          </div>
          
          <Button 
            onClick={generateQuiz}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Target className="h-4 w-4 mr-2" />
            )}
            {isGenerating ? 'Generating Quiz...' : 'Start Quiz'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showResults && feedback) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <CardTitle>Quiz Results</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{formatTime(timeSpent)}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Summary */}
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold">{feedback.score}%</div>
            <Progress value={feedback.score} className="h-2" />
            <div className="flex items-center justify-center gap-2">
              {feedback.passed ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Passed
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  Needs Review
                </Badge>
              )}
              <Badge variant="outline">
                {feedback.questions.filter(q => q.isCorrect).length}/{feedback.questions.length} Correct
              </Badge>
            </div>
          </div>

          {/* AI Feedback */}
          {feedback.aiFeedback && (
            <Alert>
              <ThumbsUp className="h-4 w-4" />
              <AlertDescription>
                <strong>AI Feedback:</strong>
                <div className="mt-2 text-sm">{feedback.aiFeedback}</div>
              </AlertDescription>
            </Alert>
          )}

          {/* Detailed Results */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Question Review
            </h4>
            {feedback.questions.map((q, index) => (
              <div key={q.questionId} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-2">
                  {q.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">Question {index + 1}</div>
                    <div className="text-sm text-muted-foreground mt-1">{q.question}</div>
                  </div>
                </div>
                
                <div className="ml-7 space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Your answer:</span> {q.userAnswer}
                  </div>
                  {!q.isCorrect && (
                    <div>
                      <span className="font-medium">Correct answer:</span> {q.correctAnswer}
                    </div>
                  )}
                  <div className="text-muted-foreground">
                    <span className="font-medium">Explanation:</span> {q.explanation}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button onClick={resetQuiz} variant="outline" className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retake Quiz
            </Button>
            {feedback.passed && (
              <Button className="flex-1">
                <Award className="h-4 w-4 mr-2" />
                Continue Learning
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Quiz Taking Interface
  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;
  const allQuestionsAnswered = quiz.questions.every(q => answers[q.id.toString()]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle>Question {currentQuestion + 1} of {quiz.questions.length}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{formatTime(timeSpent)}</span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Badge variant="outline" className="mb-3">{question.difficulty} difficulty</Badge>
          <h3 className="text-lg font-medium leading-relaxed">{question.question}</h3>
        </div>

        {question.type === 'multiple-choice' && question.options && (
          <RadioGroup
            value={answers[question.id.toString()] || ''}
            onValueChange={(value) => handleAnswerChange(question.id.toString(), value)}
          >
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option.charAt(0)} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {question.type === 'true-false' && (
          <RadioGroup
            value={answers[question.id.toString()] || ''}
            onValueChange={(value) => handleAnswerChange(question.id.toString(), value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="True" id="true" />
              <Label htmlFor="true" className="cursor-pointer">True</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="False" id="false" />
              <Label htmlFor="false" className="cursor-pointer">False</Label>
            </div>
          </RadioGroup>
        )}

        {question.type === 'short-answer' && (
          <Textarea
            placeholder="Enter your answer here..."
            value={answers[question.id.toString()] || ''}
            onChange={(e) => handleAnswerChange(question.id.toString(), e.target.value)}
            className="min-h-[100px]"
          />
        )}

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          
          {isLastQuestion ? (
            <Button
              onClick={submitQuiz}
              disabled={!allQuestionsAnswered || isGrading}
            >
              {isGrading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              {isGrading ? 'Grading...' : 'Submit Quiz'}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion(prev => Math.min(quiz.questions.length - 1, prev + 1))}
              disabled={!answers[question.id.toString()]}
            >
              Next
            </Button>
          )}
        </div>

        {/* Question Navigation */}
        <Separator />
        <div className="flex gap-2 flex-wrap">
          {quiz.questions.map((_, index) => (
            <Button
              key={index}
              variant={currentQuestion === index ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentQuestion(index)}
              className="w-8 h-8 p-0"
            >
              {answers[quiz.questions[index].id.toString()] ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                index + 1
              )}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};