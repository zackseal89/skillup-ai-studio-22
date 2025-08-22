
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, Crown } from 'lucide-react';

const skillLevels = [
  {
    id: 'Beginner' as const,
    name: 'Beginner',
    description: 'New to AI - ready to explore the basics',
    icon: Sparkles,
    color: 'bg-green-100 text-green-700',
    detail: 'Perfect if you\'re just getting started with AI tools and concepts'
  },
  {
    id: 'Intermediate' as const,
    name: 'Intermediate',
    description: 'Some AI experience - want to go deeper',
    icon: Zap,
    color: 'bg-blue-100 text-blue-700',
    detail: 'Great if you\'ve used basic AI tools and want advanced techniques'
  },
  {
    id: 'Advanced' as const,
    name: 'Advanced',
    description: 'AI-savvy - looking for cutting-edge applications',
    icon: Crown,
    color: 'bg-purple-100 text-purple-700',
    detail: 'Ideal if you want to implement AI solutions and lead initiatives'
  }
];

interface SkillLevelStepProps {
  value?: 'Beginner' | 'Intermediate' | 'Advanced';
  onChange: (value: 'Beginner' | 'Intermediate' | 'Advanced') => void;
}

const SkillLevelStep: React.FC<SkillLevelStepProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          What's your AI skill level? 🎯
        </h2>
        <p className="text-gray-600">
          Be honest - we'll meet you where you are and help you grow
        </p>
      </div>

      <div className="space-y-4">
        {skillLevels.map((level) => {
          const IconComponent = level.icon;
          const isSelected = value === level.id;
          return (
            <Card
              key={level.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onChange(level.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl ${level.color}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{level.name}</h3>
                      {isSelected && (
                        <Badge variant="default" className="bg-blue-500">
                          Selected
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-700 font-medium mb-1">{level.description}</p>
                    <p className="text-sm text-gray-500">{level.detail}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SkillLevelStep;
