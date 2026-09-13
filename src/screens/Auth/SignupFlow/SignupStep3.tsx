import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Theme } from '../../../constants/color';
import { useAuth } from '../../../services/hooks/useAuth';
import CustomDatePickerModal from '../../../components/shared/CustomDatePickerModal';

interface SignupStep3Props {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
    reset: (params: any) => void;
  };
  route: {
    params: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      gender: string;
      phone: string;
      city: string;
    };
  };
}

const SignupStep3: React.FC<SignupStep3Props> = ({ navigation, route }) => {
  const { 
    email, 
    password, 
    firstName, 
    lastName, 
    gender, 
    phone, 
    city 
  } = route.params;
  
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { 
    signup, 
    isSigningUp, 
    error, 
    clearError,
    signupSuccess,
    isAuthenticated 
  } = useAuth();

  const handleDateSelect = useCallback((selectedDate: Date) => {
    setDateOfBirth(selectedDate);
    setShowDatePicker(false);
  }, []);

  const showDatePickerModal = useCallback(() => {
    setShowDatePicker(true);
  }, []);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    if (!agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = useCallback(async () => {
    if (!validate()) return;
    
    try {
      const signupPayload = { 
        f_name: firstName, 
        l_name: lastName,
        email, 
        password,
        phone_no: phone,
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
  }, [firstName, lastName, email, password, phone, gender, city, dateOfBirth, agreeToTerms, signup]);

  const handleBack = () => {
    navigation.goBack();
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Icon name="arrow-back" size={24} color={Colors.white} />
              </TouchableOpacity>
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>Step 3 of 3</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '100%' }]} />
                </View>
              </View>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              <Text style={styles.title}>Final Details</Text>
              <Text style={styles.subtitle}>Almost there!</Text>

              {/* Date of Birth */}
              <TouchableOpacity style={styles.inputContainer} onPress={showDatePickerModal}>
                <Icon name="event" size={20} color={Colors.textPlaceholder} style={styles.inputIcon} />
                <Text style={[styles.input, !dateOfBirth && styles.placeholderText]}>
                  {dateOfBirth ? dateOfBirth.toLocaleDateString() : 'Date of Birth'}
                </Text>
              </TouchableOpacity>
              {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}

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

              {/* Summary */}
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryTitle}>Summary</Text>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Name:</Text>
                  <Text style={styles.summaryValue}>{firstName} {lastName}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Email:</Text>
                  <Text style={styles.summaryValue}>{email}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Phone:</Text>
                  <Text style={styles.summaryValue}>{phone}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>City:</Text>
                  <Text style={styles.summaryValue}>{city}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Gender:</Text>
                  <Text style={styles.summaryValue}>{gender}</Text>
                </View>
              </View>

              {/* Signup Button */}
              <TouchableOpacity 
                style={[styles.signupButton, isSigningUp && styles.signupButtonDisabled]} 
                onPress={handleSignup}
                disabled={isSigningUp}
              >
                <Text style={styles.signupButtonText}>
                  {isSigningUp ? 'Creating Account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: Theme.spacing.lg,
  },
  backButton: {
    marginBottom: 20,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: 2,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: 40,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.round,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 14,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 52,
  },
  inputIcon: {
    marginRight: Theme.spacing.sm + 4,
    width: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  placeholderText: {
    color: Colors.textPlaceholder,
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    marginBottom: 6,
    marginLeft: 6,
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
    fontWeight: '500',
  },
  summaryContainer: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Theme.spacing.sm,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '400',
  },
  signupButton: {
    backgroundColor: Colors.primary,
    borderRadius: Theme.borderRadius.md,
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
    marginBottom: 30,
    height: 52,
    justifyContent: 'center',
  },
  signupButtonDisabled: {
    backgroundColor: Colors.textSecondary,
    opacity: 0.7,
  },
  signupButtonText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SignupStep3; 