import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { 
  SlideInDown, 
  SlideOutUp,
  Easing 
} from 'react-native-reanimated';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Colors } from '../../constants/color';
import Feather from 'react-native-vector-icons/Feather';

const FeatureAdBanner = () => {
  const words = ['Faster', 'Better', 'Wiser', 'Easier'];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    },1500); 
    return () => clearInterval(interval);
  }, []);

  const handleContactPress = () => {
    const whatsappUrl =
      'https://wa.me/923352465451?text=Hello,%20I%20would%20like%20to%20feature%20my%20ad%20on%20BuySell%20Bazaar';
    Linking.openURL(whatsappUrl).catch(err =>
      console.error("Couldn't open link", err)
    );
  };

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={['#E8F4FD', '#FFF4E6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <View style={styles.leftSection}>
          <View style={styles.badge}>
            <Feather name="trending-up" size={14} color={Colors.primary} />
            <Text style={styles.badgeText}>BOOST</Text>
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>Sell 10X </Text>
            <View style={styles.wordWrapper}>
              <Animated.Text
                key={currentIndex}
                entering={SlideInDown.springify()
                  .damping(25)
                  .stiffness(50)
                  .mass(1.2)
                  .duration(700)}
                exiting={SlideOutUp.duration(600).easing(Easing.bezier(0.25, 0.1, 0.25, 1))}
                style={styles.animatedWord}
              >
                {words[currentIndex]}
              </Animated.Text>
            </View>
          </View>

          <Text style={styles.subtitle}>
            Feature your ad & reach{'\n'}thousands instantly
          </Text>
        </View>

        <TouchableOpacity style={styles.ctaButton} onPress={handleContactPress}>
          <Feather name="message-circle" size={18} color={Colors.white} />
          <Text style={styles.buttonText}>Contact</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: wp('4%') },
  banner: {
    borderRadius: 20,
    paddingVertical: hp('2.5%'),
    paddingHorizontal: wp('5%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: { flex: 1 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 1,
    borderRadius: 12,
    marginBottom: 8,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    color: Colors.primary,
    fontFamily: 'Poppins-Bold',
    letterSpacing: 0.5,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    fontSize: 22,
    color: Colors.black,
    fontFamily: 'Poppins-Bold',
  },
  wordWrapper: {
    position: 'relative',
    height: 28, // ensures no jump when text swaps
    width: 100, // fixed width for smooth sliding
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  animatedWord: {
    fontSize: 22,
    color: Colors.primary,
    fontFamily: 'Poppins-Bold',
    lineHeight: 28,
    marginTop: -7, // Move word up slightly
  },
  subtitle: {
    fontSize: 12,
    color: Colors.gray,
    fontFamily: 'Poppins-Regular',
    lineHeight: 18,
    marginBottom: 8,
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
});

export default FeatureAdBanner;
