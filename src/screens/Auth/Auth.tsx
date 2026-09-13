import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Theme } from '../../constants/color';
import { useAuth } from '../../services/hooks/useAuth';
import { useAuthStore } from '../../stores/authStore';
import LinearGradient from 'react-native-linear-gradient';
import { logSignUp } from '../../firebase/analytics';

import DynamicModal from '../../components/shared/DynamicModal';
const logo = require('../../images/logo.png');
import { useRequestSignupOtp } from "../../services/mutations/user";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const { width } = Dimensions.get('window');

interface AuthProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
}

const Auth: React.FC<AuthProps> = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const passwordInputRef = useRef<TextInput>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalText, setModalText] = useState('');

  const {
    signup,
    login,
    isSigningUp,
    isLoggingIn,
    error,
    clearError,
    signupSuccess,
    loginSuccess,
    isAuthenticated,
  } = useAuth();

  const { resetOnboarding } = useAuthStore();

  const toggleAuthMode = useCallback(() => {
    setIsLogin(prev => !prev);
    setEmail('');
    setPassword('');
    setIsPasswordVisible(false);
    setErrors({});
    setTouched({});
    setFocusedField(null);
  }, []);

  const { mutateAsync: requestSignupOtp } = useRequestSignupOtp();

  const handleForgotPassword = useCallback(() => {
    navigation?.navigate?.('ResetPassword');
  }, [navigation]);

  useEffect(() => {
    if (signupSuccess || loginSuccess || isAuthenticated) {
      // Navigation handled elsewhere when isAuthenticated becomes true
    }
  }, [signupSuccess, loginSuccess, isAuthenticated]);

  // Optional: normalize backend error into a user-friendly message
  const normalizeAuthError = useCallback((msg: string) => {
    const m = msg?.toLowerCase?.() || '';
    if (m.includes('invalid') && m.includes('credentials')) return 'Incorrect email or password. Please try again.';
    if (m.includes('user not found')) return 'No account found with this email.';
    if (m.includes('password')) return 'Incorrect password. Please try again.';
    return msg || 'Something went wrong. Please try again.';
  }, []);

  // 🔔 Show modal on backend auth errors (login/signup)
  useEffect(() => {
    if (error) {
      setModalText(normalizeAuthError(error));
      setModalVisible(true);
      clearError();
    }
  }, [error, clearError, normalizeAuthError]);

  // Validation functions
  const validateEmail = (value: string): string => {
    if (!value.trim()) return 'Email is required';
    const re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
    if (!re.test(String(value).toLowerCase())) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (value: string): string => {
    if (!value.trim()) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'email':
        return validateEmail(value);
      case 'password':
        return validatePassword(value);
      default:
        return '';
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    if (field === 'email') {
      setEmail(value);
    } else if (field === 'password') {
      setPassword(value);
    }

    // Only validate while typing if field was previously touched (on blur)
    // This allows clearing errors as user types after initial validation
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    } else {
      // Clear any existing errors while typing before first blur
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    }
  };

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setFocusedField(null);
    
    const value = field === 'email' ? email : password;
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleFieldFocus = (field: string) => {
    setFocusedField(field);
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    const newTouched: { [key: string]: boolean } = {};

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError) {
      newErrors.email = emailError;
      newTouched.email = true;
    }
    if (passwordError) {
      newErrors.password = passwordError;
      newTouched.password = true;
    }

    setTouched(prev => ({ ...prev, ...newTouched }));
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    if (isLogin) {
      try {
        await login({ email, password });
        // any login errors handled by hook
      } catch {
        // no-op
      }
    } else {
      try {
        const response: any = await signup({
          email, password,
          f_name: '',
          l_name: '',
          FUID: ''
        });

        if (response?.success) {
          console.log("🎉 Signup success:", response);
          await logSignUp(response?.data?.user_id || email);
          // await requestSignupOtp({ email: email.trim() });
          // Navigate straight to OTP screen
          navigation.navigate("OTPVerification", {
            email: email.trim(),
            password,
            flow: "signup",
          });
        } else {
          Alert.alert("Signup Error", response?.message || "Failed to create account.");
        }
      } catch (err: any) {
        Alert.alert(
          "Signup Error",
          err?.response?.data?.message || "Something went wrong. Please try again."
        );
      }
    }
  }, [isLogin, email, password, login, signup, navigation, requestSignupOtp]);

  const handleResetOnboarding = () => {
    resetOnboarding();
    Alert.alert('Onboarding Reset', 'Onboarding has been reset. Restart the app to see the onboarding flow again.');
  };

  // ✅ Modal icon (MaterialIcons)
  const modalIcon = useMemo(
    () => <Icon name="error-outline" size={42} color={Colors.primary} />,
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableResetScrollToCoords={false}
        extraScrollHeight={20}        // keeps focused input nicely above the keyboard
        extraHeight={90}              // helpful on Android; tweak if needed
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <LinearGradient
            colors={['#152F54', '#20447A']}
            start={{ x: 0, y: 0.4 }}
            end={{ x: 0, y: 1 }}
            style={styles.header}
          >
            <View style={styles.logoContainer}>
              <Image source={logo} style={styles.logo} resizeMode="contain" />
            </View>
          </LinearGradient>

          <View style={styles.formContainer}>
            <Text style={styles.title}>{isLogin ? 'Login' : 'Create An Account'}</Text>
            <Text style={styles.subtitle}>{isLogin ? 'Welcome back we missed you' : "Let's set your account"}</Text>

            {/* Email */}
            <Text style={styles.fieldLabel}>Email Address</Text>
            <View style={[
              styles.inputContainer,
              focusedField === 'email' && styles.inputContainerFocused,
              touched.email && errors.email && styles.inputContainerError
            ]}>
              <Icon name="email" size={20} color={Colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email address"
                placeholderTextColor={Colors.textPlaceholder}
                value={email}
                onChangeText={text => handleFieldChange('email', text)}
                onFocus={() => handleFieldFocus('email')}
                onBlur={() => handleFieldBlur('email')}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
              />
            </View>
            {touched.email && errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

            {/* Password */}
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={[
              styles.inputContainer,
              focusedField === 'password' && styles.inputContainerFocused,
              touched.password && errors.password && styles.inputContainerError
            ]}>
              <Icon name="lock" size={20} color={Colors.primary} style={styles.inputIcon} />
              <TextInput
                ref={passwordInputRef}
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={Colors.textPlaceholder}
                value={password}
                onChangeText={text => handleFieldChange('password', text)}
                onFocus={() => handleFieldFocus('password')}
                onBlur={() => handleFieldBlur('password')}
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
              <TouchableOpacity onPress={() => setIsPasswordVisible(prev => !prev)} style={styles.eyeIconContainer}>
                <Icon name={isPasswordVisible ? 'visibility' : 'visibility-off'} size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            {touched.password && errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

            {/* Forgot password */}
            {isLogin && (
              <TouchableOpacity style={styles.forgotPasswordContainer} onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>Forget Password?</Text>
              </TouchableOpacity>
            )}

            {/* Submit */}
            <TouchableOpacity
              style={[styles.actionButton, (isSigningUp || isLoggingIn) && styles.actionButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSigningUp || isLoggingIn}
            >
              <Text style={styles.actionButtonText}>
                {isSigningUp ? 'Signing up...' : isLoggingIn ? 'Logging in...' : isLogin ? 'Login' : 'Sign Up'}
              </Text>
            </TouchableOpacity>

            {/* Switch mode */}
            <TouchableOpacity style={styles.switchModeContainer} onPress={toggleAuthMode}>
              <Text style={styles.switchModeText}>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <Text style={styles.switchModeLink}>{isLogin ? 'Sign Up' : 'Sign In'}</Text>
              </Text>
            </TouchableOpacity>

            {/* Debug */}
            {/* <TouchableOpacity style={styles.debugButton} onPress={handleResetOnboarding}>
              <Text style={styles.debugText}>Reset Onboarding (Debug)</Text>
            </TouchableOpacity> */}
          </View>
        </View>
      </KeyboardAwareScrollView>

      <DynamicModal
        visible={modalVisible}
        icon={modalIcon}
        text={modalText}
        acceptText="Okay"
        rejectText=""            // hides the cancel button
        onAccept={() => setModalVisible(false)}
        onReject={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  errorText: {
    color: 'red',
    fontSize: 13,
    marginBottom: 6,
    marginLeft: 6,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 110,
    paddingBottom: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: Theme.borderRadius.xxl + 10,
    borderBottomRightRadius: Theme.borderRadius.xxl + 10,
    marginBottom: -30,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: Theme.borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.5,
    height: 60,
    resizeMode: 'contain',
    marginBottom: 50,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: 60,
    justifyContent: 'flex-start',
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
    fontFamily: 'Poppins-Regular',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Theme.spacing.xs,
    marginLeft: Theme.spacing.xs,
    fontFamily: 'Poppins-Medium',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 999,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 14,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 52,
    position: 'relative',
  },
  inputContainerFocused: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  inputContainerError: {
    borderColor: Colors.red || '#FF0000',
    borderWidth: 1.5,
  },
  inputIcon: {
    marginRight: Theme.spacing.sm + 4,
    width: 20,
  },
  eyeIconContainer: {
    position: 'absolute',
    right: Theme.spacing.md,
    padding: 4,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    paddingVertical: 0,
    fontFamily: 'Poppins-Light',
    marginBottom: -3,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 15,
    marginTop: 5,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  actionButton: {
    backgroundColor: Colors.primary,
    borderRadius: 999,
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    height: 54,
    justifyContent: 'center',
    fontFamily: 'Poppins-Medium',
  },
  actionButtonDisabled: {
    backgroundColor: Colors.textSecondary,
    opacity: 0.7,
  },
  actionButtonText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
  },
  switchModeContainer: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  switchModeText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Poppins-Regular',
  },
  switchModeLink: {
    color: Colors.primary,
    fontWeight: '500',
  },
  debugButton: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 10,
  },
  debugText: {
    fontSize: 12,
    color: Colors.textSecondary,
    opacity: 0.7,
    fontFamily: 'Poppins-Regular',
  },
});

export default Auth;
