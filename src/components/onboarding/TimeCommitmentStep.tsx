
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Coffee, Timer, Calendar } from 'lucide-react';

const timeCommitments = [
  {
    id: '15min-daily',
    name: '15 minutes daily',
    description: 'Perfect for busy schedules',
    icon: Coffee,
    weekly: '1.75 hours/week',
    color: 'bg-green-100 text-green-700'
  },
  {
    id: '30min-daily',
    name: '30 minutes daily',
    description: 'Steady consistent progress',
    icon: Clock,
    weekly: '3.5 hours/week',
    color: 'bg-blue-100 text-blue-700'
  },
  {
    id: '1hour-daily',
    name: '1 hour daily',
    description: 'Accelerated learning',
    icon: Timer,
    weekly: '7 hours/week',
    color: 'bg-purple-100 text-purple-700'
  },
  {
    id: '2hours-week',
    name: '2 hours on weekends',
    description: 'Weekend learning blocks',
    icon: Calendar,
    weekly: '2 hours/week',
    color: 'bg-orange-100 text-orange-700'
  }
];

interface TimeCommitmentStepProps {
  value?: string;
  onChange: (value: string) => void;
}

const TimeCommitmentStep: React.FC<TimeCommitmentStepProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          How much time can you commit? ⏰
        </h2>
        <p className="text-gray-600">
          We'll create a learning schedule that fits your lifestyle
        </p>
      </div>

      <div className="space-y-4">
        {timeCommitments.map((commitment) => {
          const IconComponent = commitment.icon;
          const isSelected = value === commitment.id;
          return (
            <Card
              key={commitment.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onChange(commitment.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${commitment.color}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {commitment.name}
                      </h3>
                      {isSelected && (
                        <Badge variant="default" className="bg-blue-500">
                          Selected
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-1">{commitment.description}</p>
                    <p className="text-sm text-gray-500">≈ {commitment.weekly}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {value && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">
                Perfect! We'll design your learning path around this schedule.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TimeCommitmentStep;
