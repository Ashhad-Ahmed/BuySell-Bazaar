import React, {useEffect, useRef, useState, useMemo} from 'react';
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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Colors, Theme} from '../../constants/color';
import {fonts} from '../../config/themes/typography';
const otpImage = require('../../images/otpImage.png');

import {useForgotPassword} from '../../services/mutations/auth';
import {
  useVerifyOtp,
  useVerifySignupOtp,
  useRequestSignupOtp,
} from '../../services/mutations/user';

const {width, height} = Dimensions.get('window');

interface OTPVerificationProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    replace: (screen: string, params?: any) => void;
  };
  route: {
    params?: {
      email?: string;
      password?: string;
      phoneNumber?: string;
      flow?: 'reset' | 'signup';
    };
  };
}

// ✅ Memoized Verify Button (optimized against flicker)
const VerifyButton = React.memo(
  ({
    disabled,
    onPress,
    loading,
  }: {
    disabled: boolean;
    onPress: () => void;
    loading: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.actionButton, disabled && {opacity: 0.6}]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}>
      <Text style={styles.actionButtonText}>
        {loading ? 'Verifying...' : 'Verify'}
      </Text>
    </TouchableOpacity>
  ),
  (prev, next) =>
    prev.disabled === next.disabled &&
    prev.loading === next.loading &&
    prev.onPress === next.onPress
);

const OTPVerification: React.FC<OTPVerificationProps> = ({
  navigation,
  route,
}) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const isPastingRef = useRef(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const email = route?.params?.email;
  const password = route?.params?.password;
  const phoneNumber = route?.params?.phoneNumber;
  const flow = route?.params?.flow || 'reset'; // default to reset

  // reset password flow
  const {mutateAsync: verifyOtp, isPending: verifyingReset} = useVerifyOtp();
  const {mutateAsync: forgotPassword, isPending: resendingReset} =
    useForgotPassword();

  // signup flow
  const {mutateAsync: verifySignupOtp, isPending: verifyingSignup} =
    useVerifySignupOtp();
  const {mutateAsync: requestSignupOtp, isPending: requestingSignup} =
    useRequestSignupOtp();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const isOtpComplete = code.join('').length === 6;
  const isDisabled =
    (flow === 'reset' ? verifyingReset : verifyingSignup) || !isOtpComplete;

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      isPastingRef.current = true;
      const digits = value.replace(/\D/g, '').slice(0, 6);
      const newOtp = ['', '', '', '', '', ''];
      for (let i = 0; i < digits.length && i < 6; i++) newOtp[i] = digits[i];
      setCode(newOtp);
      setLocalError(null);
      setTimeout(() => {
        isPastingRef.current = false;
        const lastFilledIndex = newOtp.reduce(
          (lastIndex, digit, i) => (digit ? i : lastIndex),
          -1
        );
        if (lastFilledIndex >= 0 && lastFilledIndex < 6) {
          inputRefs.current[lastFilledIndex]?.focus();
        } else if (newOtp.every(digit => digit)) {
          inputRefs.current[5]?.focus();
        }
      }, 100);
      return;
    }

    if (isPastingRef.current) return;

    if (value === '') {
      const newOtp = [...code];
      newOtp[index] = '';
      setCode(newOtp);
      setLocalError(null);
      return;
    }

    const lastChar = value.slice(-1);
    if (!/^\d$/.test(lastChar)) return;

    const newOtp = [...code];
    newOtp[index] = lastChar;
    setCode(newOtp);
    setLocalError(null);
    if (lastChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    if (!email?.trim()) {
      setLocalError('Missing email to resend the code.');
      return;
    }

    try {
      setLocalError(null);
      if (flow === 'reset') {
        await forgotPassword(email.trim());
      } else {
        await requestSignupOtp({email: email.trim()});
      }
      setCode(['', '', '', '', '', '']);
      setTimer(60);
      setCanResend(false);
    } catch (e: any) {
      setLocalError(e?.message || 'Failed to resend OTP. Please try again.');
    }
  };

  const handleSubmit = async () => {
    const otp = code.join('');
    if (otp.length !== 6) {
      setLocalError('Please enter the 6-digit code.');
      return;
    }
    if (!email?.trim()) {
      setLocalError('Missing email to verify the code.');
      return;
    }

    try {
      setLocalError(null);
      if (flow === 'reset') {
        const result = await verifyOtp({email, otp});
        console.log('✅ Reset OTP verified, got token:', result.temp_token);
        navigation.replace('ResetPassword', {
          step: 2,
          email,
          tempToken: result.temp_token,
        });
      } else {
        const result = await verifySignupOtp({email, otp});
        console.log('✅ Signup OTP verified:', result);
      }
    } catch (e: any) {
      setLocalError(
        e?.response?.data?.message ||
          e?.message ||
          'Invalid code. Please try again.'
      );
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const hint =
    email && flow === 'reset'
      ? `We sent a reset code to ${email}`
      : email && flow === 'signup'
      ? `We sent a verification code to ${email}`
      : `We are automatically detecting an SMS sent to your number ${
          phoneNumber || '**********'
        }`;

  // ✅ Memoize verify button props to prevent re-renders (fix flicker)
  const verifyButtonProps = useMemo(
    () => ({
      disabled: isDisabled,
      onPress: handleSubmit,
      loading: verifyingReset || verifyingSignup,
    }),
    [isDisabled, handleSubmit, verifyingReset, verifyingSignup]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          scrollEnabled={true}>
          <Text style={styles.title}>Enter Verification Code</Text>
          <Image source={otpImage} style={styles.image} resizeMode="contain" />
          <View style={styles.content}>
            <View style={styles.formContainer}>
              <Text style={styles.subtitle}>{hint}</Text>

              <View style={styles.otpContainer}>
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref: TextInput | null) => {
                      inputRefs.current[index] = ref;
                    }}
                    style={[
                      styles.otpInput,
                      digit ? styles.otpInputFilled : null,
                    ]}
                    value={digit}
                    onChangeText={value => handleOtpChange(value, index)}
                    onKeyPress={e => handleKeyPress(e, index)}
                    keyboardType="numeric"
                    textAlign="center"
                    onFocus={() => {
                      setTimeout(() => {
                        scrollViewRef.current?.scrollToEnd({animated: true});
                      }, 300);
                    }}
                  />
                ))}
              </View>

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive the OTP?</Text>
                <TouchableOpacity
                  onPress={canResend ? handleResendOTP : undefined}
                  disabled={!canResend || resendingReset || requestingSignup}>
                  <Text
                    style={[
                      styles.resendLink,
                      (!canResend || resendingReset || requestingSignup) &&
                        styles.resendLinkDisabled,
                    ]}>
                    {resendingReset || requestingSignup
                      ? 'Resending...'
                      : 'Resend OTP'}
                  </Text>
                </TouchableOpacity>
              </View>

              {!canResend && (
                <View style={styles.timerContainer}>
                  <Icon
                    name="access-time"
                    size={16}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.timerText}>{formatTime(timer)}</Text>
                </View>
              )}

              {localError ? (
                <Text
                  style={{
                    color: '#D32F2F',
                    textAlign: 'center',
                    marginBottom: 8,
                    fontFamily: fonts['Poppins-SemiBold'],
                  }}>
                  {localError}
                </Text>
              ) : null}

              {/* ✅ Memoized Verify Button (no flicker) */}
              <VerifyButton {...verifyButtonProps} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.white, marginTop: height * 0.03},
  keyboardContainer: {flex: 1},
  scrollContent: {paddingBottom: 20},
  content: {backgroundColor: Colors.white},
  image: {
    width: width * 0.5,
    height: width * 0.4,
    alignSelf: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  formContainer: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
    fontFamily: fonts['Poppins-ExtraBold'],
  },
  subtitle: {
    fontSize: 15,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
    paddingHorizontal: 20,
    fontFamily: fonts['Poppins-Bold'],
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  otpInput: {
    width: 45,
    height: 45,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: fonts['Poppins-SemiBold'],
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingVertical: 0,
    includeFontPadding: false,
  },
  otpInputFilled: {
    borderColor: '#1a365d',
    backgroundColor: '#1a365d',
    color: '#ffffff',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  resendText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: fonts['Poppins-SemiBold'],
  },
  resendLink: {
    fontSize: 14,
    color: '#1a365d',
    fontWeight: '500',
    marginLeft: 5,
    fontFamily: fonts['Poppins-SemiBold'],
  },
  resendLinkDisabled: {color: Colors.textPlaceholder},
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  timerText: {fontSize: 14, color: Colors.textSecondary, marginLeft: 5},
  actionButton: {
    backgroundColor: Colors.primary,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
    height: 52,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontFamily: fonts['Poppins-SemiBold'],
    fontWeight: '600',
  },
});

export default OTPVerification;
