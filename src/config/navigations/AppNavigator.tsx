import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthStack from './AuthStack';
import MainTabs from './MainTab';
import AdDisplay from '../../screens/Ads/AdDisplay';
import { useAuthStore } from '../../stores/authStore';
import PostAdOrDemandScreen from '../../screens/PostAdAndDemand';
import DemandDisplay from '../../screens/DemandDisplay/DemandDisplay';
import NotificationScreen from '../../screens/NotificationScreen';
import ChatDetail from '../../screens/Chats/ChatDetail';
import Getstarted from '../../screens/OnBoardingScreen/Getstarted';
import OnboardingWrapper from '../../screens/OnBoardingScreen/OnboardingWrapper';
import SplashScreen from '../../screens/OnBoardingScreen/SplashScreen';
import FavoriteAds from '../../screens/FavoriteItems.tsx';
import Search from '../../screens/Search/index';
import AllAds from '../../screens/AllAds/index';
import UserProfile from '../../screens/User/UserProfile';
import Settings from '../../screens/User/Settings';
import Permissions from '../../screens/User/Permissions';
import ManageAccount from '../../screens/User/ManageAccount';

const RootStack = createNativeStackNavigator();

const AppNavigator = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const hasCompletedOnboarding = useAuthStore(state => state.hasCompletedOnboarding);

  const getInitialRouteName = () => {
    if (isAuthenticated) return 'MainTabs';
    if (hasCompletedOnboarding) return 'Auth';
    return 'SplashScreen';
  };

  return (
    <RootStack.Navigator
      initialRouteName={getInitialRouteName()}
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        animation: 'slide_from_right', 
      }}
    >
      {isAuthenticated ? (
        <>
          <RootStack.Screen name="MainTabs" component={MainTabs} />
          <RootStack.Screen name="Search" component={Search} />
          <RootStack.Screen name="AllAds" component={AllAds} />
          <RootStack.Screen name="ChatDetail" component={ChatDetail} />
          <RootStack.Screen name="AdDisplay" component={AdDisplay} />
          <RootStack.Screen name="DemandDisplay" component={DemandDisplay} />
          <RootStack.Screen
            name="PostAdOrDemandScreen"
            component={PostAdOrDemandScreen}
            options={{
              animation: 'slide_from_right', 
            }}
          />
          <RootStack.Screen
            name="NotificationScreen"
            component={NotificationScreen}
            options={{
              animation: 'slide_from_right', 
            }}
          />
          <RootStack.Screen name="FavoriteAds" component={FavoriteAds} />
          <RootStack.Screen name="UserProfile" component={UserProfile} />
          <RootStack.Screen name="Settings" component={Settings} />
          <RootStack.Screen name="Permissions" component={Permissions} />
          <RootStack.Screen name="ManageAccount" component={ManageAccount} />
        </>
      ) : hasCompletedOnboarding ? (
        <RootStack.Screen name="Auth" component={AuthStack} />
      ) : (
        <>
          <RootStack.Screen name="SplashScreen" component={SplashScreen} />
          <RootStack.Screen name="GetStarted" component={Getstarted} />
          <RootStack.Screen name="Onboarding" component={OnboardingWrapper} />
          <RootStack.Screen name="Auth" component={AuthStack} />
        </>
      )}
    </RootStack.Navigator>
  );
};

export default AppNavigator;
