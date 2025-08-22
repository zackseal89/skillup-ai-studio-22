
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useCreateOnboarding, useGenerateRoadmap, OnboardingData } from '@/hooks/useOnboarding';
import { toast } from 'sonner';
import IndustryStep from './onboarding/IndustryStep';
import RoleStep from './onboarding/RoleStep';
import SkillLevelStep from './onboarding/SkillLevelStep';
import GoalsStep from './onboarding/GoalsStep';
import LearningStyleStep from './onboarding/LearningStyleStep';
import TimeCommitmentStep from './onboarding/TimeCommitmentStep';
import ConfirmationStep from './onboarding/ConfirmationStep';
import RoadmapDisplay from './onboarding/RoadmapDisplay';

const TOTAL_STEPS = 7;

interface OnboardingFlowProps {
  onComplete?: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({
    learning_style: []
  });
  const [roadmapData, setRoadmapData] = useState<string>('');
  const [isComplete, setIsComplete] = useState(false);

  const createOnboarding = useCreateOnboarding();
  const generateRoadmap = useGenerateRoadmap();

  const updateFormData = (data: Partial<OnboardingData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const completeData = formData as OnboardingData;
      
      // Create onboarding record
      await createOnboarding.mutateAsync(completeData);
      
      // Generate roadmap
      const roadmap = await generateRoadmap.mutateAsync(completeData);
      setRoadmapData(roadmap.roadmap);
      
      setIsComplete(true);
      toast.success('Welcome to SkillUp AI! Your personalized learning journey is ready.');
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Something went wrong. Please try again.');
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return !!formData.industry;
      case 2: return !!formData.role;
      case 3: return !!formData.ai_skill_level;
      case 4: return !!formData.learning_goals?.trim();
      case 5: return formData.learning_style && formData.learning_style.length > 0;
      case 6: return !!formData.time_commitment;
      case 7: return true;
      default: return false;
    }
  };

  if (isComplete) {
    return <RoadmapDisplay roadmap={roadmapData} onboardingData={formData as OnboardingData} />;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <IndustryStep value={formData.industry} onChange={(industry) => updateFormData({ industry })} />;
      case 2:
        return <RoleStep value={formData.role} onChange={(role) => updateFormData({ role })} />;
      case 3:
        return <SkillLevelStep value={formData.ai_skill_level} onChange={(ai_skill_level) => updateFormData({ ai_skill_level })} />;
      case 4:
        return <GoalsStep value={formData.learning_goals} onChange={(learning_goals) => updateFormData({ learning_goals })} />;
      case 5:
        return <LearningStyleStep value={formData.learning_style || []} onChange={(learning_style) => updateFormData({ learning_style })} />;
      case 6:
        return <TimeCommitmentStep value={formData.time_commitment} onChange={(time_commitment) => updateFormData({ time_commitment })} />;
      case 7:
        return <ConfirmationStep data={formData as OnboardingData} onEdit={(step) => setCurrentStep(step)} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStep} of {TOTAL_STEPS}</span>
            <span>{Math.round((currentStep / TOTAL_STEPS) * 100)}% complete</span>
          </div>
          <Progress value={(currentStep / TOTAL_STEPS) * 100} className="h-2" />
        </div>

        {/* Main Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Welcome to SkillUp AI! 🚀
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Let's personalize your AI learning journey in just a few steps
            </p>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            {renderStep()}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>
              
              {currentStep === TOTAL_STEPS ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid() || createOnboarding.isPending || generateRoadmap.isPending}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  {createOnboarding.isPending || generateRoadmap.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Your Journey...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <CheckCircle className="w-4 h-4" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingFlow;
