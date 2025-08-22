
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, MessageCircle, Wrench, Clock } from 'lucide-react';

const learningStyles = [
  {
    id: 'Videos',
    name: 'Video Tutorials',
    description: 'Learn through visual demonstrations',
    icon: Play,
    color: 'bg-red-100 text-red-700'
  },
  {
    id: 'Interactive',
    name: 'Interactive Q&A',
    description: 'Learn through conversations and questions',
    icon: MessageCircle,
    color: 'bg-blue-100 text-blue-700'
  },
  {
    id: 'Hands-on',
    name: 'Hands-on Projects',
    description: 'Learn by building real solutions',
    icon: Wrench,
    color: 'bg-green-100 text-green-700'
  },
  {
    id: 'Short Lessons',
    name: 'Short Lessons',
    description: 'Quick, bite-sized learning sessions',
    icon: Clock,
    color: 'bg-purple-100 text-purple-700'
  }
];

interface LearningStyleStepProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const LearningStyleStep: React.FC<LearningStyleStepProps> = ({ value, onChange }) => {
  const toggleStyle = (styleId: string) => {
    const newValue = value.includes(styleId)
      ? value.filter(id => id !== styleId)
      : [...value, styleId];
    onChange(newValue);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          How do you prefer to learn? 📚
        </h2>
        <p className="text-gray-600">
          Choose all that apply - we'll mix and match to keep you engaged
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {learningStyles.map((style) => {
          const IconComponent = style.icon;
          const isSelected = value.includes(style.id);
          return (
            <Card
              key={style.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => toggleStyle(style.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl ${style.color}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{style.name}</h3>
                      {isSelected && (
                        <Badge variant="default" className="bg-blue-500">
                          Selected
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{style.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {value.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-medium text-blue-900 mb-2">Your selected learning styles:</h3>
            <div className="flex flex-wrap gap-2">
              {value.map((styleId) => {
                const style = learningStyles.find(s => s.id === styleId);
                return (
                  <Badge key={styleId} variant="secondary" className="bg-blue-100 text-blue-800">
                    {style?.name}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LearningStyleStep;
