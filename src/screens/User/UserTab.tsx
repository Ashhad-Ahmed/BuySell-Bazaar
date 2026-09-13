import React, {useRef} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
  Animated,
} from 'react-native';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import Header from '../../components/shared/Header';
import {Colors, Theme} from '../../constants/color';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuth} from '../../services/hooks/useAuth';
import {useNavigation} from '@react-navigation/native';
import {useAuthStore} from '../../stores/authStore';
import DynamicModal from '../../components/shared/DynamicModal';

const HEADER_MAX_HEIGHT = hp('17%');
const HEADER_MIN_HEIGHT = hp('12%');

const UserTab = () => {
const {logout, isLoggingOut} = useAuth();
const {user: authUser} = useAuthStore();
  const navigation = useNavigation();
  const [confirmLogoutModal, setConfirmLogoutModal] = React.useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

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

  const getFallbackAvatar = () => {
    if (authUser?.gender?.toLowerCase() === 'female') {
      return require('../../images/female_avatar.jpg');
    }
    return require('../../images/avatar.png');
  };
const getDisplayName = () => {
  const first = authUser?.firstName?.trim() || '';
  const last = authUser?.lastName?.trim() || '';

  if (first && last) return `${first} ${last}`;
  if (first) return first;
  if (last) return last;
  return ''; 
};


  return (
    <View style={styles.container}>
      <Header
      type="navigation"
      title="Profile"
      animatedHeight={headerHeight}
      fadeHeight={fadeHeight}
       onPress={() => navigation.goBack()}
      />

      <Animated.ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={Animated.event(
        [{nativeEvent: {contentOffset: {y: scrollY}}}],
        {useNativeDriver: false},
      )}>
      <View style={styles.profileHeader}>
        <Image
        source={authUser?.avatar ? {uri: authUser.avatar} : getFallbackAvatar()}
        style={styles.avatar}
        />
        <Text style={styles.userName}>{getDisplayName()}</Text>
        <TouchableOpacity
        style={styles.editProfileButton}
        onPress={() => navigation.navigate('UserProfile' as never)}>
        <Icon name="edit" size={16} color={Colors.primary} style={styles.editIcon} />
        <Text style={styles.editProfileButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity
        style={styles.menuOption}
        onPress={() => Linking.openURL('https://www.linkedin.com/company/snaptradeai')}>
        <Icon name="info" size={20} color={Colors.primary} style={styles.menuIcon} />
        <Text style={styles.menuOptionText}>About Application</Text>
        </TouchableOpacity>

        <TouchableOpacity 
        style={styles.menuOption}
        onPress={() => Linking.openURL('mailto:snaptradeai@gmail.com')}>
        <Icon name="help-outline" size={20} color={Colors.primary} style={styles.menuIcon} />
        <Text style={styles.menuOptionText}>Help & Support</Text>
        </TouchableOpacity>

        <TouchableOpacity
        style={styles.menuOption}
        onPress={() => navigation.navigate('Settings' as never)}>
        <Icon name="settings" size={20} color={Colors.primary} style={styles.menuIcon} />
        <Text style={styles.menuOptionText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
        style={[styles.menuOption, styles.logoutOption, isLoggingOut && styles.logoutOptionDisabled]}
        onPress={() => setConfirmLogoutModal(true)}
        disabled={isLoggingOut}>
        <Icon name="logout" size={20} color={Colors.red} style={styles.menuIcon} />
        <Text style={[styles.menuOptionText, styles.logoutText]}>
          {isLoggingOut ? 'Logging out...' : 'Log out'}
        </Text>
        </TouchableOpacity>
      </View>
      </Animated.ScrollView>

      <DynamicModal
      visible={confirmLogoutModal}
      icon={<Icon name="logout" size={40} color={Colors.primary} />}
      text="Are you sure you want to log out of your account?"
      acceptText="Yes, Log Out"
      rejectText="Cancel"
      onAccept={() => {
        setConfirmLogoutModal(false);
        logout();
      }}
      onReject={() => setConfirmLogoutModal(false)}
      />
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderColor: Colors.primary,
    borderWidth: 2,
    marginBottom: 10,
  },
  userName: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.textPrimary,
    marginBottom: 5,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  editProfileButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: Colors.text,
    marginLeft: 5,
  },
  editIcon: {
    marginRight: 2,
  },
  menuContainer: {
    marginTop: 20,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: 60,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  menuIcon: {
    marginRight: 10,
  },
  menuOptionText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: Colors.textPrimary,
  },
  logoutOption: {
    backgroundColor: Colors.inputBackground,
    marginBottom: 40,
  },
  logoutOptionDisabled: {
    opacity: 0.5,
  },
  logoutText: {
    color: Colors.red,
  },
});

export default UserTab;

