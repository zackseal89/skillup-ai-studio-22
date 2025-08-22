
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  const [customIndustry, setCustomIndustry] = useState('');
  const [showCustom, setShowCustom] = useState(value === 'Other' || (value && !industries.find(i => i.id === value)));

  const handleIndustrySelect = (industryId: string) => {
    if (industryId === 'Other') {
      setShowCustom(true);
      onChange('Other');
    } else {
      onChange(industryId);
      setShowCustom(false);
      setCustomIndustry('');
    }
  };

  const handleCustomIndustrySubmit = () => {
    if (customIndustry.trim()) {
      onChange(customIndustry.trim());
    }
  };

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
          const isSelected = value === industry.id || (industry.id === 'Other' && showCustom);
          return (
            <Card
              key={industry.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleIndustrySelect(industry.id)}
            >
              <CardContent className="p-4 flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${industry.color}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{industry.name}</h3>
                </div>
                {isSelected && (
                  <Badge variant="default" className="bg-blue-500">
                    Selected
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {showCustom && (
        <Card className="border-2 border-dashed border-blue-300">
          <CardContent className="p-4">
            <div className="space-y-3">
              <Input
                placeholder="Enter your industry (e.g., Aerospace, Gaming, Non-profit)"
                value={customIndustry}
                onChange={(e) => setCustomIndustry(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCustomIndustrySubmit()}
              />
              <button
                onClick={handleCustomIndustrySubmit}
                disabled={!customIndustry.trim()}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Use This Industry
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {value && !industries.find(i => i.id === value) && value !== 'Other' && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-green-800 font-medium">Selected: {value}</span>
              <Badge variant="default" className="bg-green-500">
                Custom Industry
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IndustryStep;
