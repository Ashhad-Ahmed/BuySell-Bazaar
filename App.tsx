import 'react-native-gesture-handler';
import 'react-native-reanimated';
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { messaging } from './src/firebase/firebaseConfig';
import notifee from '@notifee/react-native';
import { syncUserToFirestore } from './src/firebase/syncUserToFirestore';
import { useAuthStore } from './src/stores/authStore';
import AppNavigator from './src/config/navigations/AppNavigator';
import { ToastProvider } from './src/contexts/ToastContext';
import { logAppOpen } from './src/firebase/analytics';
import { getAnalytics } from '@react-native-firebase/analytics';
import crashlytics from "@react-native-firebase/crashlytics";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: { retry: 1 },
  },
});


const App: React.FC = () => {
  const { user  } = useAuthStore();


  useEffect(() => {
  crashlytics().log("App started");

  if (user?.id) {
    crashlytics().setUserId(String(user.id));
  }
}, [user]);

  useEffect(() => {
    messaging.requestPermission();

    notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    const unsubscribe = messaging.onMessage(async remoteMessage => {
      console.log('📩 Foreground FCM:', remoteMessage);

      await notifee.displayNotification({
        title: remoteMessage.notification?.title || 'New Notification',
        body: remoteMessage.notification?.body || 'You have a new update.',
        android: {
          channelId: 'default',
          pressAction: { id: 'default' },
        },
      });
    });

    return unsubscribe;
  }, []);

      useEffect(() => {
  logAppOpen();
  messaging.requestPermission();
}, []);

useEffect(() => {
  getAnalytics().logEvent("test_event", { test: true });
}, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <NavigationContainer>
            <StatusBar
              barStyle="dark-content"
              translucent
              backgroundColor="transparent"
            />
            <AppNavigator />
          </NavigationContainer>
        </ToastProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
};

export default App;
