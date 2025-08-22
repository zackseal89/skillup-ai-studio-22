
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight, BookOpen, Target, Clock } from 'lucide-react';
import { OnboardingData } from '@/hooks/useOnboarding';

interface RoadmapDisplayProps {
  roadmap: string;
  onboardingData: OnboardingData;
}

const RoadmapDisplay: React.FC<RoadmapDisplayProps> = ({ roadmap, onboardingData }) => {
  const handleGetStarted = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to SkillUp AI! 🎉
          </h1>
          <p className="text-lg text-gray-600">
            Your personalized AI learning journey is ready
          </p>
        </div>

        {/* Profile Summary */}
        <Card className="shadow-lg border-0 mb-6">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Your Learning Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-1">Industry & Role</h3>
                <p className="text-gray-600">{onboardingData.industry}</p>
                <Badge variant="secondary" className="mt-1">{onboardingData.role}</Badge>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-1">AI Skill Level</h3>
                <Badge 
                  variant="default" 
                  className={`mt-1 ${
                    onboardingData.ai_skill_level === 'Beginner' ? 'bg-green-500' :
                    onboardingData.ai_skill_level === 'Intermediate' ? 'bg-blue-500' :
                    'bg-purple-500'
                  }`}
                >
                  {onboardingData.ai_skill_level}
                </Badge>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-1">Time Commitment</h3>
                <div className="flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{onboardingData.time_commitment}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generated Roadmap */}
        <Card className="shadow-lg border-0 mb-6">
          <CardHeader className="bg-gradient-to-r from-green-400 to-blue-500 text-white">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Your Personalized AI Learning Roadmap
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {roadmap || "Your personalized roadmap is being generated based on your profile..."}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Goals */}
        <Card className="shadow-lg border-0 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Your Learning Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-700 italic">"{onboardingData.learning_goals}"</p>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold text-gray-900 mb-2">Preferred Learning Styles:</h4>
              <div className="flex flex-wrap gap-2">
                {onboardingData.learning_style?.map((style, index) => (
                  <Badge key={index} variant="outline" className="border-blue-200 text-blue-700">
                    {style}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 text-lg"
          >
            Start My AI Journey
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-gray-600 mt-4">
            Ready to transform your skills with AI? Let's get started!
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoadmapDisplay;
