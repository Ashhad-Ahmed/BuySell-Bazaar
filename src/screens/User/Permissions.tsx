import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  Switch,
  Platform,
  Linking,
  PermissionsAndroid,
} from 'react-native';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import Header from '../../components/shared/Header';
import {Colors, Theme} from '../../constants/color';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';

const HEADER_MAX_HEIGHT = hp('17%');
const HEADER_MIN_HEIGHT = hp('12%');

const Permissions = () => {
  const navigation = useNavigation();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const fadeHeight = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [60, 30],
    extrapolate: 'clamp',
  });

  // Check permission status when screen is focused (in case user changes it in settings)
  useFocusEffect(
    React.useCallback(() => {
      checkNotificationPermission();
    }, []),
  );

  const checkNotificationPermission = async () => {
    try {
      const authStatus = await messaging().hasPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      setNotificationEnabled(enabled);
    } catch (error) {
      console.error('Error checking notification permission:', error);
      setNotificationEnabled(false);
    }
  };

  const openNotificationSettings = () => {
    if (Platform.OS === 'android') {
      // Open Android app settings page where user can manage notifications
      // This will open: Settings > Apps > [Your App] > Notifications
      Linking.openSettings();
    } else {
      // iOS - open app settings
      Linking.openURL('app-settings:');
    }
  };

  const requestAndroidNotificationPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      // Check Android version - POST_NOTIFICATIONS is required for Android 13+ (API 33+)
      const androidVersion = Platform.Version;
      
      if (androidVersion >= 33) {
        // Android 13+ - Request POST_NOTIFICATIONS permission
        // Note: POST_NOTIFICATIONS might not be in PermissionsAndroid.PERMISSIONS
        // We'll use the string directly if the constant doesn't exist
        const POST_NOTIFICATIONS = 
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS || 
          'android.permission.POST_NOTIFICATIONS';
        
        const granted = await PermissionsAndroid.request(
          POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'This app needs notification permission to send you updates.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // Android < 13 - notifications are granted by default
        return true;
      }
    } catch (error) {
      console.error('Error requesting Android notification permission:', error);
      return false;
    }
  };

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      // First, check current permission status
      const currentStatus = await messaging().hasPermission();
      const isCurrentlyEnabled =
        currentStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        currentStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (isCurrentlyEnabled) {
        // Already enabled, just update state
        setNotificationEnabled(true);
        try {
          const token = await messaging().getToken();
          console.log('FCM Token:', token);
        } catch (tokenError) {
          console.error('Error getting FCM token:', tokenError);
        }
        return;
      }

      // Request notification permission
      try {
        let permissionGranted = false;

        if (Platform.OS === 'android') {
          // For Android, use PermissionsAndroid to request POST_NOTIFICATIONS
          permissionGranted = await requestAndroidNotificationPermission();
          
          if (!permissionGranted) {
            // Permission request was denied or not shown - redirect to settings
            Alert.alert(
              'Enable Notifications',
              'Please enable notifications in your device settings to receive updates.',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                  onPress: () => setNotificationEnabled(false),
                },
                {
                  text: 'Open Settings',
                  onPress: async () => {
                    await openNotificationSettings();
                    setNotificationEnabled(false);
                  },
                },
              ],
            );
            return;
          }

          // Also request Firebase messaging permission
          const authStatus = await messaging().requestPermission({
            alert: true,
            badge: true,
            sound: true,
          });
          permissionGranted =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        } else {
          // iOS - use Firebase messaging request
          const authStatus = await messaging().requestPermission({
            alert: true,
            badge: true,
            sound: true,
          });
          permissionGranted =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        }

        if (permissionGranted) {
          setNotificationEnabled(true);
          // Get FCM token after permission is granted
          try {
            const token = await messaging().getToken();
            console.log('FCM Token:', token);
          } catch (tokenError) {
            console.error('Error getting FCM token:', tokenError);
          }
        } else {
          // Permission denied - redirect to settings
          setNotificationEnabled(false);
          Alert.alert(
            'Enable Notifications',
            'Notification permission was denied. Please enable it in your device settings.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Open Settings',
                onPress: async () => {
                  await openNotificationSettings();
                },
              },
            ],
          );
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        setNotificationEnabled(false);
        Alert.alert(
          'Permission Error',
          'Unable to request notification permission. Please enable it from device settings.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Open Settings',
              onPress: async () => {
                await openNotificationSettings();
              },
            },
          ],
        );
      }
    } else {
      // Disable notifications - redirect to settings since we can't disable programmatically
      Alert.alert(
        'Disable Notifications',
        'To disable notifications, please go to your device settings.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setNotificationEnabled(true), // Revert toggle
          },
          {
            text: 'Open Settings',
            onPress: async () => {
              await openNotificationSettings();
              // Keep toggle state - it will update when user returns from settings
            },
          },
        ],
      );
    }
  };

  return (
    <View style={styles.container}>
      <Header
        type="navigation"
        title="Permissions"
        icon="arrow-back-ios"
        onPress={() => navigation.goBack()}
        animatedHeight={headerHeight}
        fadeHeight={fadeHeight}
      />
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: false},
        )}>
        <View style={styles.permissionItem}>
          <View style={styles.permissionTextContainer}>
            <Icon name="notifications" size={24} color={Colors.primary} style={styles.permissionIcon} />
            <Text style={styles.permissionLabel}>Notifications</Text>
          </View>
          <Switch
            trackColor={{false: Colors.border, true: Colors.primary}}
            thumbColor={notificationEnabled ? Colors.white : Colors.white}
            ios_backgroundColor={Colors.border}
            onValueChange={handleNotificationToggle}
            value={notificationEnabled}
          />
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContainer: {
    paddingBottom: 60,
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: 20,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.inputBackground,
    borderRadius: 60,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  permissionTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  permissionIcon: {
    marginRight: 10,
  },
  permissionLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: Colors.textPrimary,
  },
});

export default Permissions;

