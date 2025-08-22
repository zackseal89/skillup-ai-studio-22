
import React from 'react';
import OnboardingFlow from '@/components/OnboardingFlow';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Onboarding = () => {
  const { user } = useAuth();
  const { data: onboardingData } = useOnboarding();
  const navigate = useNavigate();

  useEffect(() => {
    if (onboardingData?.onboarding_completed) {
      navigate('/dashboard');
    }
  }, [onboardingData, navigate]);

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <OnboardingFlow 
      onComplete={() => navigate('/dashboard')}
    />
  );
};

export default Onboarding;
