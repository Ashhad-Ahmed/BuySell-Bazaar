import React, {useEffect} from 'react';
import {View, Image, StyleSheet, Dimensions} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Colors} from '../../constants/color';

const {width, height} = Dimensions.get('window');

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Navigate to GetStarted after a brief delay
    const timer = setTimeout(() => {
      navigation.navigate('GetStarted' as never);
    }, 2000); // 2 second delay

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/splash.png')}
        style={styles.icon}
        resizeMode="contain"
      />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: width * 0.4,
    height: width * 0.4,
  },
});

