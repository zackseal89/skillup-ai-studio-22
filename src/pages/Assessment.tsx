
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, CheckCircle, XCircle, ArrowLeft, Target } from "lucide-react";
import { useSkills } from "@/hooks/useSkills";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const Assessment = () => {
  const { skillId } = useParams();
  const navigate = useNavigate();
  const { data: skills } = useSkills();
  const { toast } = useToast();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const skill = skills?.find(s => s.id === skillId);

  // Mock questions - in production, these would come from a database
  const questions: Question[] = [
    {
      id: '1',
      question: `What is a fundamental concept in ${skill?.name || 'this skill'}?`,
      options: [
        'Basic understanding of core principles',
        'Advanced theoretical knowledge',
        'Expert-level practical application',
        'Superficial awareness only'
      ],
      correctAnswer: 0,
      difficulty: 'beginner'
    },
    {
      id: '2',
      question: `Which best describes intermediate-level proficiency in ${skill?.name || 'this skill'}?`,
      options: [
        'Just starting to learn',
        'Can handle complex tasks with guidance',
        'Expert in all aspects',
        'Never worked with it'
      ],
      correctAnswer: 1,
      difficulty: 'intermediate'
    },
    {
      id: '3',
      question: `What characterizes advanced mastery of ${skill?.name || 'this skill'}?`,
      options: [
        'Basic task completion',
        'Following simple tutorials',
        'Leading projects and mentoring others',
        'Occasional use'
      ],
      correctAnswer: 2,
      difficulty: 'advanced'
    }
  ];

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer !== null) {
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = {
        questionId: questions[currentQuestion].id,
        selectedAnswer,
        correct: selectedAnswer === questions[currentQuestion].correctAnswer,
        partialCredit: Math.abs(selectedAnswer - questions[currentQuestion].correctAnswer) === 1
      };
      setAnswers(newAnswers);
      setSelectedAnswer(null);

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        submitAssessment(newAnswers);
      }
    }
  };

  const submitAssessment = async (finalAnswers: any[]) => {
    if (!skillId) return;
    
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('assess-skill', {
        body: { skillId, answers: finalAnswers }
      });

      if (error) throw error;

      toast({
        title: "Assessment Complete!",
        description: data.message,
      });

      setShowResult(true);
    } catch (error) {
      toast({
        title: "Assessment Error",
        description: "Failed to submit assessment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (!skill) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Skill Not Found</CardTitle>
            <CardDescription>The requested skill assessment could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Assessment Complete!</CardTitle>
              <CardDescription>
                Your {skill.name} skill level has been updated
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                View Updated Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate('/courses')} className="w-full">
                Browse Recommended Courses
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-foreground mb-2">Skill Assessment</h1>
          <p className="text-muted-foreground">
            Assess your current level in {skill.name}
          </p>
        </div>

        {/* Progress */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {currentQuestion + 1} of {questions.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Question */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary" />
                <span>Question {currentQuestion + 1}</span>
              </CardTitle>
              <Badge variant="outline">
                {questions[currentQuestion].difficulty}
              </Badge>
            </div>
            <CardDescription className="text-lg">
              {questions[currentQuestion].question}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions[currentQuestion].options.map((option, index) => (
              <Button
                key={index}
                variant={selectedAnswer === index ? "default" : "outline"}
                className="w-full text-left justify-start h-auto p-4"
                onClick={() => handleAnswerSelect(index)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedAnswer === index 
                      ? 'border-primary bg-primary' 
                      : 'border-muted-foreground'
                  }`} />
                  <span>{option}</span>
                </div>
              </Button>
            ))}
            
            <div className="pt-4">
              <Button 
                onClick={handleNextQuestion}
                disabled={selectedAnswer === null || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Submitting...' : 
                 currentQuestion < questions.length - 1 ? 'Next Question' : 'Complete Assessment'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Assessment;
