import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { onboardingData } from '../../data/onboardingData';
import OnboardingScreen from '../../screens/OnBoardingScreen/index';
import { useAuthStore } from '../../stores/authStore';

const OnboardingWrapper = () => {
  const [index, setIndex] = useState(0);
  const navigation = useNavigation();
  const { completeOnboarding } = useAuthStore();

  const handleNext = () => {
    setIndex(prev => {
      const next = prev + 1;
      if (next >= onboardingData.length) {
        completeOnboarding();
        navigation.navigate('Auth' as never);
        return prev; // keep stable; navigation ends flow
      }
      return next;
    });
  };

  const handleSkip = () => {
    // Mark onboarding as completed
    completeOnboarding();
    // Navigate to Auth screen at root level
    navigation.navigate('Auth' as never);
  };

  const current = onboardingData[index];

  return (
    <OnboardingScreen
      image={current.image}
      title={current.title}
      highlight={current.highlight}
      subtitle={current.subtitle}
      onNext={handleNext}
      onSkip={handleSkip}
      currentIndex={index}
      totalSlides={onboardingData.length}
    />
  );
};

export default OnboardingWrapper;
