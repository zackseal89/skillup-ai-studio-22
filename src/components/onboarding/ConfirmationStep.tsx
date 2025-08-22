
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, CheckCircle } from 'lucide-react';
import { OnboardingData } from '@/hooks/useOnboarding';

interface ConfirmationStepProps {
  data: OnboardingData;
  onEdit: (step: number) => void;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({ data, onEdit }) => {
  const getSummaryItems = () => [
    { label: 'Industry', value: data.industry, step: 1 },
    { label: 'Role', value: data.role, step: 2 },
    { label: 'AI Skill Level', value: data.ai_skill_level, step: 3 },
    { label: 'Learning Goals', value: data.learning_goals, step: 4 },
    { label: 'Learning Style', value: data.learning_style?.join(', '), step: 5 },
    { label: 'Time Commitment', value: data.time_commitment, step: 6 }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Almost there! Let's review your profile 📋
        </h2>
        <p className="text-gray-600">
          Make sure everything looks good before we create your personalized AI learning journey
        </p>
      </div>

      <div className="space-y-4">
        {getSummaryItems().map((item, index) => (
          <Card key={index} className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">{item.label}</h3>
                  <p className="text-gray-700">{item.value}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(item.step)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="font-semibold text-blue-900 mb-2">🎉 What happens next?</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>✅ We'll generate your personalized AI course roadmap</p>
              <p>✅ You'll get skill assessments tailored to your industry</p>
              <p>✅ We'll recommend the perfect learning path for your goals</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-gray-500">
        <p>By continuing, you agree to our terms and privacy policy.</p>
        <p>You can always update your preferences later in your profile.</p>
      </div>
    </div>
  );
};

export default ConfirmationStep;
