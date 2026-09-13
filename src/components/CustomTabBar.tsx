import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Keyboard,
} from 'react-native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Svg, {Path} from 'react-native-svg';
import { useUnreadChatsCount } from '../services/hooks/useUnreadChatsCount';

const {width} = Dimensions.get('window');

const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [shouldHideTabBar, setShouldHideTabBar] = useState(false);
  const unreadChatsCount = useUnreadChatsCount();

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Check if current screen should hide the tab bar
  const checkHiddenScreen = () => {
    const currentRoute = state.routes[state.index];
    
    if (currentRoute.name === 'Home') {
      // Check if the Home stack is currently showing AdDisplay, Search, DemandDisplay, or AllDemands
      const homeState = currentRoute.state;
      
      if (homeState && homeState.routes) {
        const currentHomeRoute = homeState.routes[homeState.index ?? 0];
        const isHidden = currentHomeRoute.name === 'AdDisplay' || 
                        currentHomeRoute.name === 'Search' || 
                        currentHomeRoute.name === 'DemandDisplay' ||
                        currentHomeRoute.name === 'AllDemands';
        setShouldHideTabBar(isHidden);
        return;
      }
    }
    setShouldHideTabBar(false);
  };

  // Use focus effect to check screen state when navigation changes
  useFocusEffect(
    React.useCallback(() => {
      checkHiddenScreen();
    }, [state])
  );

  // Hide tab bar when keyboard is visible or when on hidden screens
  if (keyboardVisible || shouldHideTabBar) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      {/* SVG Curved Background */}
      <View style={styles.background}>
        <Svg width={width} height={70} viewBox={`0 0 ${width} 70`}>
        <Path
  fill="#fafafa"
  d={`
    M0,0 
    H${width / 2 - 80} 
    C${width / 2 - 40},0 ${width / 2 - 40},50 ${width / 2},50 
    C${width / 2 + 40},50 ${width / 2 + 40},0 ${width / 2 + 80},0 
    H${width} 
    V70 
    H0 
    Z
  `}
/>
        </Svg>
      </View>

      {/* Floating SELL Button */}
      <View style={styles.sellButtonContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Sell')}
          activeOpacity={0.8}
          style={styles.sellButton}>
          <Ionicons name="add" size={30} color="#152F54" />
        </TouchableOpacity>
      </View>

      {/* Tab Icons */}
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const iconName: Record<string, string> = {
            Home: isFocused ? 'home' : 'home-outline',
            Chats: isFocused ? 'chatbubble' : 'chatbubble-outline',
            Sell: 'add',
            MyAds: isFocused ? 'heart' : 'heart-outline',
            User: isFocused ? 'user' : 'user-o',
          };

          // Render nothing for Sell tab, but preserve its spot
          if (route.name === 'Sell') {
            return (
              <View key="dummy-sell" style={{flex: 1, alignItems: 'center'}}>
                <Text style={styles.sellLabel}>SELL</Text>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabButton}
              activeOpacity={0.6}>
              <View style={styles.iconContainer}>
                {route.name === 'User' ? (
                  <FontAwesome
                    name={iconName[route.name] || 'user-o'}
                    size={20}
                    color={isFocused ? '#152F54' : '#9A9A9A'}
                  />
                ) : (
                  <Ionicons
                    name={iconName[route.name] || 'help-outline'}
                    size={20}
                    color={isFocused ? '#152F54' : '#9A9A9A'}
                  />
                )}
                
                {/* 🔔 Unread badge for Chats tab */}
                {route.name === 'Chats' && unreadChatsCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadChatsCount > 99 ? '99+' : unreadChatsCount}
                    </Text>
                  </View>
                )}
              </View>
              
              <Text
                style={[
                  styles.label,
                  {color: isFocused ? '#152F54' : '#9A9A9A'},
                ]}>
                {route.name === 'MyAds' ? 'My Ads' : route.name.charAt(0).toUpperCase() + route.name.slice(1).toLowerCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default CustomTabBar;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 70,
    alignItems: 'center',
  },
  background: {
    position: 'absolute',
    bottom: 0,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 70,
    width: '100%',
    paddingHorizontal: 16,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fafafa',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Poppins-Bold' : 'Poppins-Bold',
  },
  label: {
    fontSize: 10,
    marginTop: 2,
    // fontWeight: '500',
    fontFamily: "Poppins-Medium",
  },
  sellButtonContainer: {
    position: 'absolute',
    bottom: 26, // was 20, raised to match visual spacing
    alignSelf: 'center',
    zIndex: 10,
  },
  sellButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    borderWidth: 4,
    borderColor: '#152F54',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sellLabel: {
    fontSize: 10,
    // fontWeight: 'bold',
    fontFamily: "Poppins-SemiBold",
    color: '#000',
    marginTop: 4,
    textAlign: 'center',
  },
});
