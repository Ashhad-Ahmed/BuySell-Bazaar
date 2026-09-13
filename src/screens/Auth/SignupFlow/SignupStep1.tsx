import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  Modal,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Theme } from '../../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import CustomDatePickerModal from '../../../components/shared/CustomDatePickerModal';
import { useAuth } from '../../../services/hooks/useAuth';

const genderOptions = ['Male', 'Female', 'Other'];

interface SignupStep1Props {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
  route: {
    params: {
      email: string;
      password: string;
    };
  };
}

const SignupStep1: React.FC<SignupStep1Props> = ({ navigation, route }) => {
  const { email, password } = route.params;
  const [step, setStep] = useState(1);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [city, setCity] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const { 
    signup, 
    isSigningUp, 
    error, 
    clearError,
    signupSuccess,
    isAuthenticated 
  } = useAuth();

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!gender.trim()) newErrors.gender = 'Gender is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!phoneNo.trim()) newErrors.phoneNo = 'Phone number is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = useCallback(async () => {
    if (!validateStep3()) return;
    
    try {
      const signupPayload = { 
        f_name: firstName, 
        l_name: lastName,
        email, 
        password,
        phone_no: phoneNo,
        gender,
        city,
        date_of_birth: dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : undefined,
        FUID: "sample_fuid_12345" // Hardcoded for now
      };
      console.log('Signup Payload:', JSON.stringify(signupPayload, null, 2));
      await signup(signupPayload);
    } catch (err) {
      // Error is handled by the hook
    }
  }, [firstName, lastName, email, password, phoneNo, gender, city, dateOfBirth, agreeToTerms, signup]);

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 1) navigation.goBack();
    else setStep(step - 1);
  };

  // Handle authentication success
  useEffect(() => {
    if (signupSuccess || isAuthenticated) {
      // Navigation will be handled automatically by AppNavigator
      // when isAuthenticated changes to true
    }
  }, [signupSuccess, isAuthenticated]);

  // Handle errors
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error, clearError]);

  const handleDateSelect = (selectedDate: Date) => {
    setDateOfBirth(selectedDate);
    setShowDatePicker(false);
    if (errors.dateOfBirth) setErrors(e => ({ ...e, dateOfBirth: '' }));
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Who's Joining \nUs Today?";
      case 2:
        return 'Stay \nConnected';
      case 3:
        return 'Review Your \nInformation';
      default:
        return '';
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 1:
        return 'This helps us personalize your experience.';
      case 2:
        return 'We\'ll use this to personalize your experience.';
      case 3:
        return 'Please review your information before proceeding.';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
                  <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
            scrollEventThrottle={16}
            nestedScrollEnabled={false}
          >
          <LinearGradient
            colors={['#152F54', '#20447A']}
            start={{ x: 0, y: 0.4 }}
            end={{ x: 0, y: 1 }}
            style={styles.header}
          >
            <View style={styles.topSection}>
              <View style={styles.topRow}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                  <Icon name="chevron-back-outline" size={24} color={Colors.white} />
                </TouchableOpacity>
                <View style={styles.stepCounter}>
                  <Text style={styles.stepText}>Step {step} of 3</Text>
                </View>
              </View>
              <View style={styles.progressLine}>
                <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
              </View>
            </View>
            <Text style={styles.headerTitle}>
              {getStepTitle()}
            </Text>
            <Text style={styles.headerSubtitle}>
              {getStepSubtitle()}
            </Text>
          </LinearGradient>

          <View style={styles.formContainer}>
            {step === 1 ? (
              <>
                <Text style={styles.fieldLabel}>First Name</Text>
                <View style={styles.inputContainer}>
                  <Icon name="person" size={20} color={Colors.primary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, errors.firstName && { borderColor: 'red' }]}
                    placeholder="Enter your first name"
                    placeholderTextColor={Colors.textPlaceholder}
                    value={firstName}
                    onChangeText={text => {
                      setFirstName(text);
                      if (errors.firstName) setErrors(e => ({ ...e, firstName: '' }));
                    }}
                    autoCapitalize="words"
                    autoComplete="name"
                    textContentType="givenName"
                    returnKeyType="next"
                  />
                </View>
                {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

                <Text style={styles.fieldLabel}>Last Name</Text>
                <View style={styles.inputContainer}>
                  <Icon name="person" size={20} color={Colors.primary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, errors.lastName && { borderColor: 'red' }]}
                    placeholder="Enter your last name"
                    placeholderTextColor={Colors.textPlaceholder}
                    value={lastName}
                    onChangeText={text => {
                      setLastName(text);
                      if (errors.lastName) setErrors(e => ({ ...e, lastName: '' }));
                    }}
                    autoCapitalize="words"
                    autoComplete="name"
                    textContentType="familyName"
                    returnKeyType="next"
                  />
                </View>
                {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

                <Text style={styles.fieldLabel}>Gender</Text>
                <TouchableOpacity style={styles.inputContainer} onPress={() => setGenderModalVisible(true)}>
                  <Icon name="person" size={20} color={Colors.primary} style={styles.inputIcon} />
                  <Text
                    style={[
                      styles.input,
                      {
                        paddingVertical: 14,
                        color: gender ? Colors.textPrimary : Colors.textPlaceholder,
                      },
                    ]}
                  >
                    {gender || 'Select your gender'}
                  </Text>
                </TouchableOpacity>
                {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
              </>
            ) : step === 2 ? (
              <>
                <Text style={styles.fieldLabel}>Phone Number</Text>
                <View style={styles.inputContainer}>
                  <Icon name="call" size={20} color={Colors.primary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, errors.phoneNo && { borderColor: 'red' }]}
                    placeholder="Enter your phone number"
                    placeholderTextColor={Colors.textPlaceholder}
                    value={phoneNo}
                    onChangeText={text => {
                      setPhoneNo(text);
                      if (errors.phoneNo) setErrors(e => ({ ...e, phoneNo: '' }));
                    }}
                    keyboardType="phone-pad"
                    returnKeyType="next"
                  />
                </View>
                {errors.phoneNo && <Text style={styles.errorText}>{errors.phoneNo}</Text>}

                <Text style={styles.fieldLabel}>City</Text>
                <View style={styles.inputContainer}>
                  <Icon name="location" size={20} color={Colors.primary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, errors.city && { borderColor: 'red' }]}
                    placeholder="Enter your city"
                    placeholderTextColor={Colors.textPlaceholder}
                    value={city}
                    onChangeText={text => {
                      setCity(text);
                      if (errors.city) setErrors(e => ({ ...e, city: '' }));
                    }}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
                {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

                <Text style={styles.fieldLabel}>Date of Birth</Text>
                <TouchableOpacity 
                  style={[styles.inputContainer, errors.dateOfBirth && { borderColor: 'red' }]} 
                  onPress={() => setShowDatePicker(true)}
                >
                  <Icon name="calendar" size={20} color={Colors.primary} style={styles.inputIcon} />
                  <Text
                    style={[
                      styles.input,
                      {
                        paddingVertical: 14,
                        color: dateOfBirth ? Colors.textPrimary : Colors.textPlaceholder,
                      },
                    ]}
                  >
                    {dateOfBirth ? formatDate(dateOfBirth) : 'Select your date of birth'}
                  </Text>
                </TouchableOpacity>
                {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
              </>
            ) : (
              <>
                {/* Summary Section */}
                <View style={styles.summaryContainer}>
                  <View style={styles.summaryHeader}>
                    <Icon name="checkmark-circle" size={24} color={Colors.primary} />
                    <Text style={styles.summaryTitle}>🎉 Almost There!</Text>
                  </View>
                  <Text style={styles.summarySubtitle}>Here's what we've collected so far:</Text>
                  
                  <View style={styles.summaryContent}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Full Name:</Text>
                      <Text style={styles.summaryValue}>{firstName} {lastName}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Email:</Text>
                      <Text style={styles.summaryValue}>{email}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Phone:</Text>
                      <Text style={styles.summaryValue}>{phoneNo}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>City:</Text>
                      <Text style={styles.summaryValue}>{city}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Gender:</Text>
                      <Text style={styles.summaryValue}>{gender}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Date of Birth:</Text>
                      <Text style={styles.summaryValue}>
                        {dateOfBirth ? formatDate(dateOfBirth) : 'Not selected'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Terms Checkbox */}
                <View style={styles.termsContainer}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => {
                      setAgreeToTerms((prev) => !prev);
                      if (errors.agreeToTerms) setErrors(e => ({ ...e, agreeToTerms: '' }));
                    }}
                  >
                    <View style={[styles.checkboxInner, agreeToTerms && styles.checkboxChecked]}>
                      {agreeToTerms && <Icon name="check" size={12} color={Colors.white} />}
                    </View>
                  </TouchableOpacity>
                  <Text style={styles.termsText}>
                    I hereby agree to the{' '}
                    <Text style={styles.termsLink}>terms of services</Text>
                    {' '}and{' '}
                    <Text style={styles.termsLink}>privacy policy</Text>
                  </Text>
                </View>
                {errors.agreeToTerms && <Text style={styles.errorText}>{errors.agreeToTerms}</Text>}
              </>
            )}
            
            <TouchableOpacity 
              style={[styles.nextButton, step === 3 && isSigningUp && styles.nextButtonDisabled]} 
              onPress={step === 3 ? handleSignup : handleNext} 
              accessibilityLabel={step === 3 ? "Create Account Button" : "Next Step Button"}
              disabled={step === 3 && isSigningUp}
            >
              <Text style={styles.nextButtonText}>
                {step === 3 ? (isSigningUp ? 'Creating Account...' : 'Create Account') : 'Next'}
              </Text>
              {step !== 3 && <Icon name="arrow-forward" size={20} color={Colors.white} />}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Gender Picker Modal */}
      <Modal visible={genderModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {genderOptions.map(option => (
              <Pressable
                key={option}
                onPress={() => {
                  setGender(option);
                  setGenderModalVisible(false);
                  if (errors.gender) setErrors(e => ({ ...e, gender: '' }));
                }}
                style={styles.modalOption}
              >
                <Text style={styles.modalText}>{option}</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => setGenderModalVisible(false)} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <CustomDatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onDateSelect={handleDateSelect}
        initialDate={dateOfBirth || new Date(2000, 0, 1)}
        title="SELECT YOUR DATE OF BIRTH"
        maxDate={new Date()}
      />


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    backgroundColor: Colors.background,
    paddingBottom: hp('12%'),
    flexGrow: 1,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: hp('2.5%'),
    paddingBottom: hp('3.7%'),
    paddingHorizontal: wp('5%'),
    borderBottomLeftRadius: Theme.borderRadius.xxl + 10,
    borderBottomRightRadius: Theme.borderRadius.xxl + 10,
    minHeight: 250,
    gap: 10,
  },
  topSection: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    marginRight: Theme.spacing.sm,
  },
  stepCounter: {
    alignSelf: 'flex-start',
  },
  stepText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
  },
  progressLine: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginTop: 10,
    marginBottom: 15,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: 2,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: wp('8%'),
    fontFamily: "Poppins-SemiBold",
    textAlign: 'left',
    marginTop: Theme.spacing.xs,
  },
  headerSubtitle: {
    color: Colors.white,
    fontSize: wp('3.5%'),
    fontFamily: "Poppins-Regular",
    textAlign: 'left',
    marginTop: Theme.spacing.sm,
  },
  formContainer: {
    paddingHorizontal: wp('4.5%'),
    paddingTop: hp('3.7%'),
    paddingBottom: hp('2.5%'),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.round,
    paddingHorizontal: Theme.spacing.md,
    marginBottom: hp('1%'),
    borderWidth: 1,
    borderColor: Colors.border,
    height: hp('6.5%'),

  },
  inputIcon: {
    marginRight: Theme.spacing.sm + 4,
    width: 20,
    color: Colors.primary,
  },
  input: {
    flex: 1,
    fontSize: wp('3.3%'),
    color: Colors.textPrimary,
    fontFamily: "Poppins-Light",
    marginBottom: -3,
  },
  fieldLabel: {
    fontSize: wp('3.5%'),
    color: Colors.textSecondary,
    marginBottom: hp('1%'),
    fontFamily: "Poppins-Medium",
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    marginBottom: 4,
    marginLeft: 6,
  },
  summaryContainer: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  summarySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  summaryContent: {
    backgroundColor: '#f8f9fa',
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Poppins-Medium",
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontFamily: "Poppins-Regular",
    flex: 2,
    textAlign: 'right',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.md,
    paddingHorizontal: 0,
  },
  checkbox: {
    marginRight: Theme.spacing.sm + 4,
    marginTop: 2,
  },
  checkboxInner: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.primary,
    fontFamily: "Poppins-Medium",
  },
  nextButton: {
    backgroundColor: Colors.primary,
    borderRadius: Theme.borderRadius.md,
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
    marginTop: hp('2.5%'),
    marginBottom: hp('2.5%'),
    height: hp('6.5%'),
    justifyContent: 'center',
    flexDirection: 'row',
  },
  nextButtonDisabled: {
    backgroundColor: Colors.textSecondary,
    opacity: 0.7,
  },
  nextButtonText: {
    color: Colors.white,
    fontSize: wp('4%'),
        fontFamily: "Poppins-SemiBold",
    marginRight: wp('2%'),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  modalOption: {
    paddingVertical: 14,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
  },
  modalText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontFamily: "Poppins-Regular",
  },
  modalCancel: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: Colors.textPrimary,
      fontFamily: "Poppins-Medium",
  },


});

export default SignupStep1;
