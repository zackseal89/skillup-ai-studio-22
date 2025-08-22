
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Heart, ShoppingCart, Factory, Briefcase, Code, GraduationCap, Scale } from 'lucide-react';

const industries = [
  { id: 'Finance', name: 'Finance & Banking', icon: Briefcase, color: 'bg-green-100 text-green-700' },
  { id: 'Healthcare', name: 'Healthcare', icon: Heart, color: 'bg-red-100 text-red-700' },
  { id: 'Retail', name: 'Retail & E-commerce', icon: ShoppingCart, color: 'bg-purple-100 text-purple-700' },
  { id: 'Manufacturing', name: 'Manufacturing', icon: Factory, color: 'bg-orange-100 text-orange-700' },
  { id: 'Technology', name: 'Technology & Software', icon: Code, color: 'bg-blue-100 text-blue-700' },
  { id: 'Education', name: 'Education', icon: GraduationCap, color: 'bg-indigo-100 text-indigo-700' },
  { id: 'Legal', name: 'Legal Services', icon: Scale, color: 'bg-gray-100 text-gray-700' },
  { id: 'Other', name: 'Other', icon: Building2, color: 'bg-yellow-100 text-yellow-700' }
];

interface IndustryStepProps {
  value?: string;
  onChange: (value: string) => void;
}

const IndustryStep: React.FC<IndustryStepProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Which industry do you work in? 🏢
        </h2>
        <p className="text-gray-600">
          This helps us tailor AI solutions specific to your field
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {industries.map((industry) => {
          const IconComponent = industry.icon;
          return (
            <Card
              key={industry.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                value === industry.id 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onChange(industry.id)}
            >
              <CardContent className="p-4 flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${industry.color}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{industry.name}</h3>
                </div>
                {value === industry.id && (
                  <Badge variant="default" className="bg-blue-500">
                    Selected
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default IndustryStep;
