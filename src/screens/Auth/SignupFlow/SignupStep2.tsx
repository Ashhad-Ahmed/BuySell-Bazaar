import React, { useState } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Theme } from '../../../constants/color';

interface SignupStep2Props {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
  route: {
    params: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      gender: string;
    };
  };
}

const SignupStep2: React.FC<SignupStep2Props> = ({ navigation, route }) => {
  const { email, password, firstName, lastName, gender } = route.params;
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (phone.trim().length < 10) {
      newErrors.phone = 'Phone number must be at least 10 digits';
    }
    if (!city.trim()) {
      newErrors.city = 'City is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    
    navigation.navigate('SignupStep3', {
      email,
      password,
      firstName,
      lastName,
      gender,
      phone: phone.trim(),
      city: city.trim(),
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

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
                <Text style={styles.progressText}>Step 2 of 3</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '66%' }]} />
                </View>
              </View>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              <Text style={styles.title}>Contact Information</Text>
              <Text style={styles.subtitle}>Help us reach you</Text>

              {/* Phone */}
              <View style={styles.inputContainer}>
                <Icon name="phone" size={20} color={Colors.textPlaceholder} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor={Colors.textPlaceholder}
                  value={phone}
                  onChangeText={text => {
                    setPhone(text);
                    if (errors.phone) setErrors(e => ({ ...e, phone: '' }));
                  }}
                  keyboardType="phone-pad"
                />
              </View>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

              {/* City */}
              <View style={styles.inputContainer}>
                <Icon name="location-city" size={20} color={Colors.textPlaceholder} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="City"
                  placeholderTextColor={Colors.textPlaceholder}
                  value={city}
                  onChangeText={text => {
                    setCity(text);
                    if (errors.city) setErrors(e => ({ ...e, city: '' }));
                  }}
                  autoCapitalize="words"
                />
              </View>
              {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

              {/* Next Button */}
              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>Next</Text>
                <Icon name="arrow-forward" size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  errorText: {
    color: 'red',
    fontSize: 13,
    marginBottom: 6,
    marginLeft: 6,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    borderRadius: Theme.borderRadius.md,
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
    marginBottom: 30,
    height: 52,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  nextButtonText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default SignupStep2; 