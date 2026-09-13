import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Theme } from '../../constants/color';
import { fonts } from '../../config/themes/typography';
import { useForgotPassword} from '../../services/mutations';
import { useSetNewPassword } from '../../services/mutations/user';
import DynamicModal from '../../components/shared/DynamicModal';

const resetImage1 = require('../../images/reset1.png');
const resetImage2 = require('../../images/reset2.png');

const { width, height } = Dimensions.get('window');
interface ResetPasswordProps {
  navigation: { navigate: (screen: string, params?: any) => void; replace: (screen: string, params?: any) => void };
  route?: { params?: { step?: 1 | 2; email?: string; tempToken?: string  } };
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ navigation, route }) => {
const { mutateAsync: forgotPassword } = useForgotPassword(); 
const { mutateAsync: NewPassword } = useSetNewPassword();

  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
  const [isNewPasswordHidden, setIsNewPasswordHidden] = useState(true);
  const [isConfirmPasswordHidden, setIsConfirmPasswordHidden] = useState(true);
  const [tempToken, setTempToken] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);


  // If we came back from OTP with step=2, move to step 2 and pre-fill email (if provided)
  useEffect(() => {
    const step = route?.params?.step;
    const emailFromRoute = route?.params?.email;
     const tokenFromRoute = route?.params?.tempToken;
    if (step === 2) setCurrentStep(2);
    if (emailFromRoute) setEmail(emailFromRoute);
    if (tokenFromRoute) setTempToken(tokenFromRoute);
  }, [route?.params]);

const handleEmailSubmit = async () => {
  if (!email?.trim()) {
    setLocalError("Enter a valid email address");

    return;
  }

  try {
    setLoading(true);
    await forgotPassword(email.trim());  
    console.log('Forgot password email sent successfully'); 
    // On success, go to OTP
    navigation.navigate('OTPVerification', { email: email.trim() });
  } catch (e: any) {
    // show error toast/alert here
    console.error(e);
  } finally {
    setLoading(false);
  }
};

 const handlePasswordSubmit = async () => {
  if (!newPassword.trim() || !confirmPassword.trim()) {
    setLocalError("Both fields are required");
    return;
  }

  if (newPassword !== confirmPassword) {
    setLocalError("Passwords do not match");
    return;
  }

  try {
    setLoading(true);

    await NewPassword({
      email,
      newPassword,
      tempToken,
    });

    console.log("✅ Password updated successfully");
    setShowSuccess(true); // <-- show modal instead of navigating directly
  } catch (e: any) {
    console.error("❌ Error updating password:", e.response?.data || e.message);
    setLocalError(
      e.response?.data?.message || "Failed to update password. Try again."
    );
  } finally {
    setLoading(false);
  }
};



  const renderEmailStep = () => (
    <View style={styles.formContainer}>
      <Text style={styles.subtitle}>Enter your email to reset your password</Text>
      <Text style={styles.fieldLabel}>Email address*</Text>
      <View style={styles.inputContainer}>
        <Icon name="email" size={20} color={Colors.primary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor={Colors.textPlaceholder}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="next"
        />
      </View>
          {localError ? (
        <Text style={styles.error}>
           {localError}
            </Text>
        ) : null}
      <TouchableOpacity style={styles.actionButton} onPress={handleEmailSubmit}>
        <Text style={styles.actionButtonText}>        
            {loading ? "Validating your email..." : "Continue"}
        </Text>
      </TouchableOpacity>
      
     
      
    </View>
  );

  const renderPasswordStep = () => (
    <View style={styles.formContainer}>
      <Text style={styles.subtitle}>Enter your new password</Text>

      {/* New Password */}
      <Text style={styles.fieldLabel}>Enter new password*</Text>
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={() => setIsNewPasswordHidden(prev => !prev)} style={styles.inputIcon}>
          <Icon name={isNewPasswordHidden ? 'visibility-off' : 'visibility'} size={20} color={Colors.primary} />
        </TouchableOpacity>
        <TextInput
          key={`new-${isNewPasswordHidden ? 'password' : 'text'}`}
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={Colors.textPlaceholder}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={isNewPasswordHidden}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType={Platform.OS === 'ios' ? 'newPassword' : 'password'}
          importantForAutofill="no"
          returnKeyType="next"
        />
      </View>

      {/* Confirm Password */}
      <Text style={styles.fieldLabel}>Re-enter new password*</Text>
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={() => setIsConfirmPasswordHidden(prev => !prev)} style={styles.inputIcon}>
          <Icon name={isConfirmPasswordHidden ? 'visibility-off' : 'visibility'} size={20} color={Colors.primary} />
        </TouchableOpacity>
        <TextInput
          key={`confirm-${isConfirmPasswordHidden ? 'password' : 'text'}`}
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor={Colors.textPlaceholder}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={isConfirmPasswordHidden}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType={Platform.OS === 'ios' ? 'password' : 'password'}
          importantForAutofill="no"
          returnKeyType="done"
        />
      </View>

      <TouchableOpacity style={styles.actionButton} onPress={handlePasswordSubmit}>
        <Text style={styles.actionButtonText}>
          
          {loading ? "Updating your passoword.." : "Submit"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const keyboardOffset = Platform.OS === 'ios' ? 20 : (StatusBar.currentHeight ?? 0) + 20;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={keyboardOffset}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          >
            <View style={{ flex: 1 }}>
               <Text style={styles.title}>Reset your password</Text>
                
              <View style={styles.header}>
                <View>
                  <View style={[styles.progressContainer]}>
                    <View style={[styles.progressLine, currentStep >= 1 && styles.progressLineActive]} />
                    <View style={[styles.progressLine, currentStep >= 2 && styles.progressLineActive]} />
                  </View>
                </View>

                <Image
                  source={currentStep === 1 ? resetImage1 : resetImage2}
                  style={styles.image}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.content}>
                {currentStep === 1 ? renderEmailStep() : renderPasswordStep()}
              </View>
            </View>
            {localError ? (
              <Text
                style={styles.error}
              >
                {localError}
              </Text>
            ) : null}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <DynamicModal
  visible={showSuccess}
  icon={<Icon name="check-circle" size={60} color={Colors.primary} />}
  text="Your password has been reset successfully!"
  acceptText="Okay"
  rejectText="" // no reject button
  onAccept={() => {
    setShowSuccess(false);
    navigation.replace("Auth"); // navigate after okay
  }}
/>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    marginTop: height * 0.03,
  },

  content: { backgroundColor: Colors.white, paddingBottom: 20 },
  header: {
    paddingTop: 20,
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: 10,
    alignItems: 'center',
  },
  formContainer: { paddingHorizontal: Theme.spacing.lg },

  // Headings & text
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
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
    fontFamily: fonts['Poppins-Regular'],
  },
  fieldLabel: {
    fontSize: 14,
    color: Colors.black,
    marginBottom: 8,
    fontFamily: fonts['Poppins-Medium'],
  },

  // Progress
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  progressLine: { width: 130, height: 4, backgroundColor: Colors.border, borderRadius: 2 },
  progressLineActive: { backgroundColor: Colors.primary },

  // Illustration
  image: { width: width * 0.5, height: width * 0.4, marginBottom: 10 },

  // Inputs
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingLeft: 16,
    paddingRight: 12,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.grayBase,
    minHeight: 52,
  },
  inputIcon: { marginRight: Theme.spacing.sm + 4, width: 20, alignItems: 'center' },
  input: {
    flex: 1,
    fontSize: 12,
    color: Colors.textPrimary,
    paddingVertical: 12,
    fontFamily: fonts['Poppins-Regular'],
  },
  error:{
     color: Colors.red,
      textAlign: "center",
      marginBottom: 8,
      fontFamily: fonts["Poppins-SemiBold"],
  },

  // Button
  actionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
    marginTop: 20,
    height: 55,
    justifyContent: 'center',
    borderRadius: 999,
  },
  actionButtonText: { color: Colors.textWhite, fontSize: 16, fontFamily: fonts['Poppins-SemiBold'] },
});

export default ResetPassword;
