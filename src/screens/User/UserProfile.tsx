import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import Header from '../../components/shared/Header';
import UserImageUpload, {UserImageUploadRef} from '../../components/shared/UserImageUpload';
import {Colors, Theme} from '../../constants/color';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import DynamicModal from '../../components/shared/DynamicModal';
import {userUpdate} from '../../services/mutations/userUpdate';
import storage from '@react-native-firebase/storage';
import {useAuthStore} from '../../stores/authStore';
import CustomDatePickerModal from '../../components/shared/CustomDatePickerModal';
import GenderPickerModal from '../../components/shared/GenderModal';
import {syncUserToFirestore} from '../../firebase/syncUserToFirestore';
import FloatingLabelInput from '../../components/shared/FloatingLabelInput';
import { useErrorModal } from '../../services/hooks/useErrorModal';

interface User {
  fullName: string;
  email: string;
  city: string;
  gender: string;
  dob: string;
  phone: string;
}

const profileFields: {key: keyof User; label: string}[] = [
  {key: 'fullName', label: 'Full Name'},
  {key: 'email', label: 'Email'},
  {key: 'phone', label: 'Phone Number'},
  {key: 'gender', label: 'Gender'},
  {key: 'dob', label: 'Date of Birth'},
  {key: 'city', label: 'City'},
];

const HEADER_MAX_HEIGHT = hp('17%');
const HEADER_MIN_HEIGHT = hp('12%');

const UserProfile = () => {
  const imageRef = useRef<UserImageUploadRef>(null);
  const [isEditing, setIsEditing] = useState(true);
  const {token, user: authUser} = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalIcon, setModalIcon] = useState<React.ReactNode | null>(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
const { visible, message, icon, showError, hideError } = useErrorModal();

  const navigation = useNavigation();

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

  const getInitialUserState = (): User => ({
    fullName: `${authUser?.firstName || ''} ${authUser?.lastName || ''}`.trim(),
    email: authUser?.email || '',
    city: authUser?.city || '',
    gender: authUser?.gender || '',
    dob: authUser?.dateOfBirth || '',
    phone: authUser?.phone || '',
  });

  const [user, setUser] = useState<User>(getInitialUserState());
  const [initialUserState, setInitialUserState] = useState<User>(getInitialUserState());

  useEffect(() => {
    const newInitial = getInitialUserState();
    setUser(newInitial);
    setInitialUserState(newInitial);
  }, [authUser]);

  const slideAnim = useRef(new Animated.Value(100)).current;
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isEditing ? 0 : 100,
      duration: 400,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, [isEditing]);

  /** 🧠 Field Validation **/
  const validateField = (field: keyof User, value: string): string => {
    switch (field) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Full name must be at least 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(value.trim())) return 'Full name can only contain letters';
        return '';
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Invalid email address';
        return '';
      case 'phone':
        if (!/^\d{10,12}$/.test(value.replace(/\D/g, ''))) return 'Enter valid phone number';
        return '';
      case 'city':
        if (!value.trim()) return 'City is required';
        return '';
      case 'gender':
        if (!value.trim()) return 'Select gender';
        return '';
      case 'dob':
        if (!value.trim()) return 'Select date of birth';
        return '';
      default:
        return '';
    }
  };

  const handleInputChange = (field: keyof User, value: string) => {
    const err = validateField(field, value);
    setUser(prev => ({...prev, [field]: value}));
    setTouched(prev => ({...prev, [field]: true}));
    setErrors(prev => {
      const newErrors = {...prev};
      if (err) newErrors[field] = err;
      else delete newErrors[field]; // ✅ remove error when valid
      return newErrors;
    });
  };

  const validateUser = (): boolean => {
    const newErrors: Record<string, string> = {};
    profileFields.forEach(f => {
      const err = validateField(f.key, user[f.key]);
      if (err) newErrors[f.key] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    setUser(initialUserState);
    setErrors({});
    setTouched({});
    setIsEditing(false);
  };

  const handleSaveChanges = async () => {
    if (!validateUser()) return;

    setIsUpdating(true);
    try {
      const [f_name, ...lastNameParts] = user.fullName.split(' ');
      const l_name = lastNameParts.join(' ') || '';
      let profile_picture_url: string | undefined;
      const uri = imageRef.current?.getImageUri?.();

      if (uri && !uri.startsWith('http')) {
        const filename = uri.substring(uri.lastIndexOf('/') + 1);
        const path = `users/${Date.now()}_${filename}`;
        const reference = storage().ref(path);
        await reference.putFile(uri);
        profile_picture_url = await reference.getDownloadURL();
      }

      const payload = {
        f_name,
        l_name,
        email: user.email,
        phone_no: user.phone,
        gender: user.gender,
        date_of_birth: user.dob,
        city: user.city,
        profile_picture_url,
      };

      await userUpdate(payload, token);

      const prevUser = useAuthStore.getState().user;
      if (prevUser) {
        useAuthStore.getState().setUser({
          ...prevUser,
          firstName: f_name,
          lastName: l_name,
          name: `${f_name} ${l_name}`.trim(),
          email: user.email,
          phone: user.phone,
          gender: user.gender,
          city: user.city,
          dateOfBirth: user.dob,
          avatar: profile_picture_url || prevUser.avatar,
          updatedAt: new Date().toISOString(),
        });
      }

      await syncUserToFirestore();

      setModalMessage('Your changes have been saved successfully!');
      setModalIcon(<Icon name="check-circle" size={40} color={Colors.primary} />);
      setShowModal(true);
      setIsEditing(false);

    } catch (err: any) {
      console.error(err);
      showError(err?.message || 'An error occurred while updating your profile.', 
  <Icon name="error-outline" size={40} color={Colors.primary} />);

    } finally {
      setIsUpdating(false);
    }
  };

  const renderEditableField = (field: keyof User, label: string) => {
    const value = user[field] || '';
    const error = errors[field];
    const isDate = field === 'dob';
    const isGender = field === 'gender';
    const isEmail = field === 'email';

    if (!isEditing) {
      return (
        <View key={field} style={{marginBottom: 16}}>
          <FloatingLabelInput label={label} value={value} editable={false} style={styles.inputContainer} />
        </View>
      );
    }

    if (isDate || isGender) {
      return (
        <TouchableOpacity
          key={field}
          onPress={() => (isDate ? setShowDateModal(true) : setShowGenderModal(true))}
          activeOpacity={0.7}>
          <FloatingLabelInput label={label} value={value} editable={false} style={styles.inputContainer} />
          {error && error.length > 0 && <Text style={styles.errorText}>{error}</Text>}
        </TouchableOpacity>
      );
    }

    return (
      <View key={field} style={{marginBottom: 16}}>
        <FloatingLabelInput
          label={label}
          value={value}
          editable={!isEmail}
          onChangeText={text => handleInputChange(field, text)}
          style={[styles.inputContainer, isEmail && styles.disabledInput]}
        />
        {error && error.length > 0 && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        type="navigation"
        title="Profile Settings"
        icon="arrow-back-ios"
        onPress={() => navigation.goBack()}
        animatedHeight={headerHeight}
        fadeHeight={fadeHeight}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex: 1}}>
        <Animated.ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {useNativeDriver: false})}>
          <UserImageUpload ref={imageRef} editable={isEditing} gender={user.gender} />

          {!isEditing && (
            <View style={styles.editButtonWrapper}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setIsEditing(true);
                  setErrors({});
                  setTouched({});
                }}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.sectionTitle}>Personal Information</Text>
          {profileFields.map(field => renderEditableField(field.key, field.label))}

          {isEditing && (
            <Animated.View style={{transform: [{translateY: slideAnim}]}}>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.cancelButton, isUpdating && {opacity: 0.7}]}
                  onPress={handleCancel}
                  disabled={isUpdating}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, isUpdating && {opacity: 0.7}]}
                  onPress={handleSaveChanges}
                  disabled={isUpdating}>
                  <Text style={styles.saveButtonText}>
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          <View style={{height: hp('5%')}} />
        </Animated.ScrollView>
      </KeyboardAvoidingView>

      <DynamicModal
        visible={showModal}
        icon={modalIcon}
        text={modalMessage}
        acceptText="OK"
        rejectText=""
        onAccept={() => setShowModal(false)}
      />

      <CustomDatePickerModal
        visible={showDateModal}
        onClose={() => setShowDateModal(false)}
        onDateSelect={date => {
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, '0');
          const d = String(date.getDate()).padStart(2, '0');
          handleInputChange('dob', `${y}-${m}-${d}`);
          setShowDateModal(false);
        }}
        initialDate={user.dob ? new Date(user.dob) : new Date()}
        minDate={new Date(1970, 0, 1)}
        maxDate={new Date()}
      />

      <GenderPickerModal
        visible={showGenderModal}
        onClose={() => setShowGenderModal(false)}
        onSelect={g => {
          handleInputChange('gender', g);
          setShowGenderModal(false);
        }}
      />
      <DynamicModal
  visible={visible}
  icon={icon}
  text={message}
  acceptText="OK"
  rejectText=""
  onAccept={hideError}
/>

    </View>
    
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.white},
  scrollContainer: {
    paddingBottom: 60,
    paddingHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.sm,
  },
  editButtonWrapper: {alignItems: 'center', marginVertical: 8},
  editButton: {
    backgroundColor: Colors.inputBackground,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  editButtonText: {
    color: Colors.text,
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
    fontFamily: 'Poppins-Medium',
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 60,
    backgroundColor: Colors.white,
  },
  disabledInput: {opacity: 0.8},
  errorText: {
    color: Colors.red,
    fontSize: 12,
    marginTop: 2,
    marginLeft: 8,
    fontFamily: 'Poppins-Regular',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    marginBottom: 25,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.inputBackground,
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 0.3,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 4},
    elevation: 6,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 0.3,
  },
});

export default UserProfile;
