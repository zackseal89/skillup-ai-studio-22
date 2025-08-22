
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User, Users, TrendingUp, Shield, Wrench, Headphones } from 'lucide-react';

const commonRoles = [
  { id: 'Manager', name: 'Manager / Team Lead', icon: Users },
  { id: 'Analyst', name: 'Data Analyst', icon: TrendingUp },
  { id: 'Administrator', name: 'Administrator', icon: Shield },
  { id: 'Specialist', name: 'Specialist / Expert', icon: User },
  { id: 'Technician', name: 'Technician', icon: Wrench },
  { id: 'Support', name: 'Customer Support', icon: Headphones }
];

interface RoleStepProps {
  value?: string;
  onChange: (value: string) => void;
}

const RoleStep: React.FC<RoleStepProps> = ({ value, onChange }) => {
  const [customRole, setCustomRole] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const handleRoleSelect = (roleId: string) => {
    onChange(roleId);
    setShowCustom(false);
    setCustomRole('');
  };

  const handleCustomRoleSubmit = () => {
    if (customRole.trim()) {
      onChange(customRole.trim());
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          What's your current role? 👩‍💻
        </h2>
        <p className="text-gray-600">
          We'll customize AI training based on your responsibilities
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {commonRoles.map((role) => {
          const IconComponent = role.icon;
          const isSelected = value === role.id;
          return (
            <Card
              key={role.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleRoleSelect(role.id)}
            >
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{role.name}</h3>
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

      <div className="text-center">
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Don't see your role? Add a custom one
        </button>
      </div>

      {showCustom && (
        <Card className="border-2 border-dashed border-blue-300">
          <CardContent className="p-4">
            <div className="space-y-3">
              <Input
                placeholder="Enter your role (e.g., Marketing Coordinator, Sales Rep)"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCustomRoleSubmit()}
              />
              <button
                onClick={handleCustomRoleSubmit}
                disabled={!customRole.trim()}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Use This Role
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {value && !commonRoles.find(r => r.id === value) && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-green-800 font-medium">Selected: {value}</span>
              <Badge variant="default" className="bg-green-500">
                Custom Role
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RoleStep;
