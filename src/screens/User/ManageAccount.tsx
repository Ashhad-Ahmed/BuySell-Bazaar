import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import Header from '../../components/shared/Header';
import {Colors, Theme} from '../../constants/color';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import DynamicModal from '../../components/shared/DynamicModal';
import {deleteAccount} from '../../services/mutations/userUpdate';
import {useAuthStore} from '../../stores/authStore';
import {useAuth} from '../../services/hooks/useAuth';

const HEADER_MAX_HEIGHT = hp('17%');
const HEADER_MIN_HEIGHT = hp('12%');

const ManageAccount = () => {
  const navigation = useNavigation();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const {token} = useAuthStore();
  const {logout} = useAuth();

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

  const handleDeleteAccount = async () => {
    if (!token) {
      Alert.alert('Error', 'Authentication token not found. Please log in again.');
      setShowDeleteAccountModal(false);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAccount(token);
      
      // Close modal
      setShowDeleteAccountModal(false);
      
      // Show success message
      Alert.alert(
        'Account Deleted',
        'Your account has been successfully deleted.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Logout and navigate to Auth screen
              // The AppNavigator will automatically redirect based on isAuthenticated state
              logout();
            },
          },
        ],
        {cancelable: false}
      );
    } catch (error: any) {
      console.error('Error deleting account:', error);
      setShowDeleteAccountModal(false);
      Alert.alert(
        'Error',
        error?.message || 'Failed to delete account. Please try again later.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        type="navigation"
        title="Manage Account"
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
        <View style={styles.contentContainer}>
            <Text style={styles.warningText}>
            Once you delete your account, there is no going back. Please be certain.
          </Text>
          <TouchableOpacity
            style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
            onPress={() => setShowDeleteAccountModal(true)}
            disabled={isDeleting}>
            <Icon name="delete-outline" size={20} color={Colors.red} style={styles.deleteIcon} />
            <Text style={styles.deleteButtonText}>
              {isDeleting ? 'Deleting Account...' : 'Delete Account'}
            </Text>
          </TouchableOpacity>
        
        </View>
      </Animated.ScrollView>

      <DynamicModal
        visible={showDeleteAccountModal}
        icon={<Icon name="warning" size={40} color={Colors.red} />}
        text="Are you sure you want to delete your account? This action cannot be undone."
        acceptText={isDeleting ? 'Deleting...' : 'Yes, Delete'}
        rejectText="Cancel"
        onAccept={handleDeleteAccount}
        onReject={() => {
          if (!isDeleting) {
            setShowDeleteAccountModal(false);
          }
        }}
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
  contentContainer: {
    marginTop: 20,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.red,
    borderRadius: 60,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  deleteIcon: {
    marginRight: 10,
  },
  deleteButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: Colors.red,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  warningText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: Colors.black,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
});

export default ManageAccount;

