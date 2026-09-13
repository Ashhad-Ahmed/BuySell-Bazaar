import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {Colors} from '../../constants/color';
import {useAuthStore} from '../../stores/authStore';

const {width, height} = Dimensions.get('window');

const Getstarted = () => {
  const navigation = useNavigation();
  const {resetOnboarding} = useAuthStore();

  return (
    <View style={styles.container}>
      {/* Background with gradient overlay */}
      <Image
        source={require('../../images/backgroundImage.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(21,47,84,0.8)', 'rgba(21,47,84,1)']}
        start={{x: 0.5, y: 0.1}}
        end={{x: 0.5, y: 1}}
        style={styles.gradientOverlay}
      />

      {/* Content */}
      <View style={styles.innerContainer}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Image
            source={require('../../images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Text + Button Section */}
        <View style={styles.contentSection}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Welcome to BuySell Bazaar</Text>
            <Text style={styles.subtitle}>
              Discover the power of AI-driven{'\n'}marketplace.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Onboarding' as never)}>
            <Text style={styles.buttonText}>Get Started 🚀</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Getstarted;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary ,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: width,
    height: height,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  logoSection: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: height * 0.15,
  },
  logo: {
    width: 200,
    height: 70,
  },
  contentSection: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: height * 0.15,
    paddingHorizontal: 24,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  title: {
    color: Colors.white,
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 10,
  },
  subtitle: {
    color: '#B8C7D9',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    lineHeight: 22,
    opacity: 0.9,
  },
  button: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 50,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  buttonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
  },
});
