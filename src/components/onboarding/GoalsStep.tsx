
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Lightbulb } from 'lucide-react';

const exampleGoals = [
  "Automate my weekly reports using AI",
  "Use AI to analyze customer feedback",
  "Implement chatbots for customer service",
  "Learn AI tools for data visualization",
  "Use AI to streamline inventory management"
];

interface GoalsStepProps {
  value?: string;
  onChange: (value: string) => void;
}

const GoalsStep: React.FC<GoalsStepProps> = ({ value, onChange }) => {
  const handleExampleClick = (example: string) => {
    onChange(example);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          What are your learning goals? 🎯
        </h2>
        <p className="text-gray-600">
          Tell us what you want to achieve with AI - be as specific as possible
        </p>
      </div>

      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Target className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">Examples of great goals:</h3>
              <div className="space-y-2">
                {exampleGoals.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(example)}
                    className="block text-left text-sm text-blue-700 hover:text-blue-900 hover:underline"
                  >
                    • {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Your Learning Goals
        </label>
        <Textarea
          placeholder="I want to learn AI to... (e.g., automate my daily tasks, improve customer analysis, etc.)"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="resize-none"
        />
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Lightbulb className="w-4 h-4" />
          <span>Tip: The more specific you are, the better we can personalize your experience</span>
        </div>
      </div>

      {value && value.length > 20 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">Great! Your goals are clear and specific.</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GoalsStep;
