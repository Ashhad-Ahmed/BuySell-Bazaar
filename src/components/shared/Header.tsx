import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';

import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import SearchBar from '../searchBar';
import { useAuthStore } from '../../stores/authStore';
import { Colors } from '../../constants/color';
const logo = require('../../images/st-black.png');

interface HeaderProps {
  type: 'navigation' | 'logo' | 'textWithIcons' | 'listingsHeader';
  title?: string;
  icon?: string;
  onPress?: () => void;
  backgroundColor?: string;
  textColor?: string;
  iconColor?: string;
  showActions?: boolean;
  animatedHeight?: any; // Accept Animated.Value or undefined
  fadeHeight?: any; // Accept Animated.Value or undefined
  onSearchPress?: () => void;
  onLayoutToggle?: () => void;
  onSortPress?: () => void;
  layoutType?: 'grid' | 'list';
}

const Header = ({
  type,
  title = '',
  icon = 'arrow-back',
  onPress,
  backgroundColor = '#FFF6E9',
  textColor = '#000',
  iconColor = '#000',
  showActions = true,
  animatedHeight,
  fadeHeight,
  onSearchPress,
  onLayoutToggle,
  onSortPress,
  layoutType = 'grid',
}: HeaderProps) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const ParentView = animatedHeight ? Animated.View : View;
  const parentStyle = [
    styles.parent,
    {paddingTop: insets.top},
    animatedHeight ? {height: animatedHeight} : {},
  ];
const unreadNotifications = useAuthStore(state => state.unreadNotifications);


  const renderContent = () => {
    if (type === 'navigation') {
      return (
        <View style={styles.navRow}>
          
          <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={styles.iconButton}>
            <Icon name={icon} size={18} color={iconColor} />
          </TouchableOpacity>
          <Text style={[styles.title, {color: textColor}]} numberOfLines={1}>
            {title}
          </Text>
        </View>
      );
    } else if (type === 'textWithIcons') {
      return (
        <>
          <View style={styles.navRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              style={styles.iconButton}>
              <Icon name={icon} size={18} color={iconColor} />
            </TouchableOpacity>
            <Text style={[styles.title, {color: textColor}]} numberOfLines={1}>
              {title}
            </Text>
          </View>
          {showActions && (
            <View style={styles.rightView}>
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="call" size={20} color={iconColor} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, {marginLeft: 12}]}>
                <Icon name="person-outline" size={20} color={iconColor} />
              </TouchableOpacity>
            </View>
          )}
        </>
      );
    } else if (type === 'listingsHeader') {
      return (
        <View style={styles.listingsContainer}>
          <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={styles.backButton}>
            <Icon name="arrow-back-ios" size={20} color={iconColor} />
          </TouchableOpacity>
          <View style={styles.searchContainer}>
            <SearchBar
              placeholder="Search area, city or country"
              leftIcon="search"
              onPress={onSearchPress}
            />
          </View>
          <View style={styles.listingsActions}>
            <TouchableOpacity
              style={styles.listingsButton}
              onPress={onLayoutToggle}
              activeOpacity={0.7}
            >
              <Icon 
                name={layoutType === 'grid' ? 'view-module' : 'view-list'} 
                size={20} 
                color={iconColor} 
              />
            </TouchableOpacity>
            {/* <TouchableOpacity
              style={styles.listingsButton}
              onPress={onSortPress}
              activeOpacity={0.7}
            >
              <Icon2 name="sort-ascending" size={20} color={iconColor} />
            </TouchableOpacity> */}
          </View>
        </View>
      );
    } else {
      return (
        <>
          <View style={styles.leftView}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          </View>
          {showActions && (
            <View style={styles.rightView}>
            <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('NotificationScreen')}
        >
          <Icon name="notifications-none" size={wp('5%')} color={iconColor} />
          {unreadNotifications > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </Text>
            </View>
          )}
</TouchableOpacity>
              <TouchableOpacity
                style={[styles.notificationButton, {marginLeft: 12}]}
                onPress={() => navigation.navigate('FavoriteAds' as never)}>
                <Icon name="favorite-border" size={wp('5%')} color={iconColor} />
              </TouchableOpacity>
            </View>
          )}
        </>
      );
    }
  };

  return (
    <View style={{backgroundColor: 'transparent'}}>
      <LinearGradient
        colors={['rgba(255, 177, 53, 0.25)', 'rgba(167, 193, 255, 0.75)']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={{borderBottomLeftRadius: 0, borderBottomRightRadius: 0}}>
        <ParentView style={parentStyle}>{renderContent()}</ParentView>
      </LinearGradient>
      <Animated.View
        style={[styles.fade, fadeHeight ? {height: fadeHeight} : null]}
        pointerEvents="none">
        <LinearGradient
          colors={['rgba(255,255,255,0)', '#FFFFFF']}
          style={{flex: 1, width: '100%'}}
          pointerEvents="none"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  parent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
    justifyContent: 'center',
    height: hp('17%'),
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconButton: {
    padding: wp('1%'),
    marginRight: wp('2.5%'),
    zIndex: 3,
  },
  title: {
    fontSize: hp('2.5%'),
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    lineHeight: hp('3%'),
  },
  leftView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginTop: -hp('1.3%'), // Move navigation content up
  },
  logo: {
    width: wp('30%'),
    height: hp('5.5%'),
    zIndex: 3,
  },
  rightView: {
    flex: 1,
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end', 
      marginTop: -hp('1.3%'), // Move right side content up
  },
  notificationButton: {
    backgroundColor: Colors.white,
    borderRadius: wp('2%'),
    padding: wp('2%'),
    width: wp('9%'),
    height: wp('9%'),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    zIndex: 3,
  },
  badge: {
  position: 'absolute',
  top: 2,
  right: 2,
  minWidth: 16,
  height: 16,
  borderRadius: 8,
  backgroundColor: Colors.red,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 3,
},
badgeText: {
  color: '#fff',
  fontSize: 10,
  fontWeight: 'bold',
},

  actionButton: {
    backgroundColor: Colors.white,
    borderRadius: wp('2%'),
    padding: wp('2%'),
    width: wp('9%'),
    height: wp('9%'),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    zIndex: 3,
  },
  listingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: wp('0%'),
  },
  searchContainer: {
    flex: 1,
    marginRight: wp('3%'),
  },
  listingsActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
  },
  listingsButton: {
    backgroundColor: Colors.white,
    borderRadius: wp('2%'),
    padding: wp('2%'),
    width: wp('9%'),
    height: wp('9%'),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    zIndex: 3,
  },
  backButton: {
    // padding: wp('1%'),
    marginRight: wp('1.3%'),
    zIndex: 3,
  },
  fade: {
    position: 'absolute',
    bottom: 0,
    // height: 60,
    width: '100%',
    zIndex: 1,
  },
});

export default Header;
