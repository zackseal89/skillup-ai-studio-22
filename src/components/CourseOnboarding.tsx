import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Brain, Clock, Target, BookOpen } from "lucide-react";
import { useCreateCoursePersonalization } from "@/hooks/useCoursePersonalization";
import { useToast } from "@/hooks/use-toast";

interface CourseOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  onComplete: () => void;
}

export function CourseOnboarding({ 
  isOpen, 
  onClose, 
  courseId, 
  courseTitle, 
  onComplete 
}: CourseOnboardingProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    current_knowledge_level: 30,
    difficulty_preference: "",
    time_preference: "",
    custom_goals: "",
    learning_preferences: {
      learning_style: "",
      focus_areas: [] as string[]
    }
  });

  const createPersonalization = useCreateCoursePersonalization();
  const { toast } = useToast();

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = async () => {
    try {
      await createPersonalization.mutateAsync({
        course_id: courseId,
        current_knowledge_level: formData.current_knowledge_level,
        difficulty_preference: formData.difficulty_preference as any,
        time_preference: formData.time_preference as any,
        custom_goals: formData.custom_goals,
        learning_preferences: formData.learning_preferences
      });

      toast({
        title: "Course personalized!",
        description: "Your learning experience has been customized based on your preferences."
      });

      onComplete();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive"
      });
    }
  };

  const steps = [
    {
      title: "Knowledge Level",
      icon: Brain,
      content: (
        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium">
              How familiar are you with {courseTitle}?
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              This helps us adjust the course difficulty for you.
            </p>
          </div>
          <div className="space-y-4">
            <div className="px-4">
              <Slider
                value={[formData.current_knowledge_level]}
                onValueChange={(value) => setFormData(prev => ({...prev, current_knowledge_level: value[0]}))}
                max={100}
                step={10}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Beginner</span>
              <span className="font-medium">{formData.current_knowledge_level}%</span>
              <span>Expert</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Learning Style",
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium">
              How do you prefer to learn?
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              We'll adapt the content presentation to match your style.
            </p>
          </div>
          <RadioGroup
            value={formData.learning_preferences.learning_style}
            onValueChange={(value) => setFormData(prev => ({
              ...prev,
              learning_preferences: { ...prev.learning_preferences, learning_style: value }
            }))}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="visual" id="visual" />
              <Label htmlFor="visual">Visual (diagrams, charts, videos)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hands-on" id="hands-on" />
              <Label htmlFor="hands-on">Hands-on (practice exercises, coding)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="reading" id="reading" />
              <Label htmlFor="reading">Reading (text-based content)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mixed" id="mixed" />
              <Label htmlFor="mixed">Mixed approach</Label>
            </div>
          </RadioGroup>
        </div>
      )
    },
    {
      title: "Preferences",
      icon: Target,
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Difficulty Preference</Label>
              <RadioGroup
                value={formData.difficulty_preference}
                onValueChange={(value) => setFormData(prev => ({...prev, difficulty_preference: value}))}
                className="mt-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="easy" id="easy" />
                  <Label htmlFor="easy">Start easy, build confidence</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium">Balanced approach</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hard" id="hard" />
                  <Label htmlFor="hard">Challenge me from the start</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="adaptive" id="adaptive" />
                  <Label htmlFor="adaptive">Adaptive (adjust based on performance)</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">Time Preference</Label>
              <RadioGroup
                value={formData.time_preference}
                onValueChange={(value) => setFormData(prev => ({...prev, time_preference: value}))}
                className="mt-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="short" id="short" />
                  <Label htmlFor="short">Short sessions (15-30 min)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium-time" />
                  <Label htmlFor="medium-time">Medium sessions (30-60 min)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="long" id="long" />
                  <Label htmlFor="long">Long sessions (60+ min)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="flexible" id="flexible" />
                  <Label htmlFor="flexible">Flexible timing</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Goals",
      icon: Clock,
      content: (
        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium">
              What are your specific goals for this course?
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Tell us what you want to achieve to help us customize your learning path.
            </p>
          </div>
          <Textarea
            value={formData.custom_goals}
            onChange={(e) => setFormData(prev => ({...prev, custom_goals: e.target.value}))}
            placeholder="e.g., Learn to build web applications, Prepare for certification, Understand core concepts for my job..."
            className="min-h-[120px]"
          />
        </div>
      )
    }
  ];

  const currentStep = steps[step - 1];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <currentStep.icon className="h-5 w-5" />
            <span>Personalize Your Learning</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Step {step} of {steps.length}</span>
              <span>{Math.round((step / steps.length) * 100)}% complete</span>
            </div>
            <Progress value={(step / steps.length) * 100} className="h-2" />
          </div>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{currentStep.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {currentStep.content}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handleBack} 
              disabled={step === 1}
            >
              Back
            </Button>
            {step < steps.length ? (
              <Button 
                onClick={handleNext}
                disabled={
                  (step === 2 && !formData.learning_preferences.learning_style) ||
                  (step === 3 && (!formData.difficulty_preference || !formData.time_preference))
                }
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleComplete}
                disabled={createPersonalization.isPending}
              >
                {createPersonalization.isPending ? "Saving..." : "Complete"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}