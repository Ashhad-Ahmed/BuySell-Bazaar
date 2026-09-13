// components/onboarding/OnboardingScreen.tsx
import React, { useEffect, memo } from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  Image as RNImage,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../constants/color';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';

const { width, height } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  image: any;
  title: string;
  subtitle: string;
  highlight: string;
  onNext: () => void;
  onSkip?: () => void;
  currentIndex?: number;
  totalSlides?: number;
}

const OnboardingScreen: React.FC<Props> = ({
  image,
  title,
  subtitle,
  highlight,
  onNext,
  onSkip,
  currentIndex = 0,
  totalSlides = 1,
}) => {
  const RING_SIZE = 60;
  const RING_STROKE = 4;
  const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

  const progress = useSharedValue((currentIndex + 1) / totalSlides);

  useEffect(() => {
    const target = (currentIndex + 1) / totalSlides;
    progress.value = withTiming(target, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [currentIndex, totalSlides, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  // 🔑 Safely resolve local require() to a URI FastImage can use
  const resolved = RNImage.resolveAssetSource(image);
  const fastImageSource = resolved?.uri
    ? { uri: resolved.uri }
    : image; // fallback if it's already a valid source

  return (
    <View style={styles.container}>
      <Animated.View
        key={currentIndex}
        entering={SlideInRight.duration(300).easing(Easing.out(Easing.cubic)).delay(300)}
        exiting={SlideOutLeft.duration(300).easing(Easing.in(Easing.cubic))}
        style={styles.contentWrapper}
      >
        <FastImage
          source={fastImageSource}
          style={styles.image}
          resizeMode={FastImage.resizeMode.cover}
        />

        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {title}
            <Text style={styles.highlight}>{highlight}</Text>
          </Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </Animated.View>

      {onSkip && (
        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      <View style={styles.nextButtonWrapper}>
        <Svg width={RING_SIZE} height={RING_SIZE}>
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke="#E0E0E0"
            strokeWidth={RING_STROKE}
            fill="none"
            transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
          />
          <AnimatedCircle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke={Colors.primary}
            strokeWidth={RING_STROKE}
            fill="none"
            strokeDasharray={[CIRCUMFERENCE, CIRCUMFERENCE]}
            animatedProps={animatedProps}
            strokeLinecap="round"
            transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
          />
        </Svg>
        <TouchableOpacity style={styles.nextButton} onPress={onNext}>
          <Icon name="arrow-forward" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default memo(OnboardingScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  image: {
    width: width,
    height: height * 0.55,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  textContainer: {
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 50,
  },
  title: {
    fontSize: 28,
    color: '#333333',
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  highlight: {
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 14,
    fontWeight: '400',
    fontFamily: 'Poppins-Regular',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
  },
  skipText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Poppins-SemiBold',
  },
  contentWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  nextButtonWrapper: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  nextButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
});
