import React, { useRef } from 'react';
import { Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

import Home from '../../screens/Home/Home';
import Sell from '../../screens/PostAdAndDemand';
import Chats from '../../screens/Chats/Chats';
import User from '../../screens/User/UserTab';
import MyAds from '../../screens/MyAds/MyAds';
import CustomTabBar from '../../components/CustomTabBar';
import AllDemands from '../../screens/AllDemands/AllDemands';
import Playground from '../../screens/playground';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/* ---------- SMOOTH TRANSITION WRAPPER ---------- */
const SmoothTransitionWrapper = ({ children }: { children: React.ReactNode }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.98)).current;

  useFocusEffect(
    React.useCallback(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      return () => {
        opacity.setValue(0);
        scale.setValue(0.98);
      };
    }, [opacity, scale])
  );

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity,
        transform: [{ scale }],
      }}
    >
      {children}
    </Animated.View>
  );
};

/* ---------- HOME STACK WITH SLIDE ANIMATIONS ---------- */
const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      gestureEnabled: true,
      gestureDirection: 'horizontal',
      animation: 'slide_from_right',
    }}
    initialRouteName="HomeMain"
  >
    <Stack.Screen name="HomeMain" component={Home} />
    <Stack.Screen name="AllDemands" component={AllDemands} />
    <Stack.Screen
      name="playground"
      component={Playground}
      options={{
        animation: 'slide_from_bottom',
      }}
    />
  </Stack.Navigator>
);

/* ---------- MAIN TABS WITH SMOOTH TAB TRANSITION ---------- */
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
    }}
    tabBar={(props) => <CustomTabBar {...props} />}
  >
    <Tab.Screen name="Home">
      {() => (
        <SmoothTransitionWrapper>
          <HomeStack />
        </SmoothTransitionWrapper>
      )}
    </Tab.Screen>

    <Tab.Screen name="Chats">
      {() => (
        <SmoothTransitionWrapper>
          <Chats />
        </SmoothTransitionWrapper>
      )}
    </Tab.Screen>

    <Tab.Screen name="Sell">
      {() => (
        <SmoothTransitionWrapper>
          <Sell />
        </SmoothTransitionWrapper>
      )}
    </Tab.Screen>

    <Tab.Screen name="MyAds">
      {() => (
        <SmoothTransitionWrapper>
          <MyAds />
        </SmoothTransitionWrapper>
      )}
    </Tab.Screen>

    <Tab.Screen name="User">
      {() => (
        <SmoothTransitionWrapper>
          <User />
        </SmoothTransitionWrapper>
      )}
    </Tab.Screen>
  </Tab.Navigator>
);

export default MainTabs;
