import React, {useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import Header from '../../components/shared/Header';
import {Colors, Theme} from '../../constants/color';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';

const HEADER_MAX_HEIGHT = hp('17%');
const HEADER_MIN_HEIGHT = hp('12%');

const Settings = () => {
  const navigation = useNavigation();
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const fadeHeight = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [60, 30],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <Header
        type="navigation"
        title="Settings"
        icon="arrow-back-ios"
        onPress={() => navigation.goBack()}
        animatedHeight={headerHeight}
        fadeHeight={fadeHeight}
      />
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: false},
        )}>
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuOption}
            onPress={() => navigation.navigate('Permissions')}>
            <Icon name="notifications" size={20} color={Colors.primary} style={styles.menuIcon} />
            <Text style={styles.menuOptionText}>Permissions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuOption}
            onPress={() => navigation.navigate('ManageAccount')}>
            <Icon name="manage-accounts" size={20} color={Colors.primary} style={styles.menuIcon} />
            <Text style={styles.menuOptionText}>Manage Account</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContainer: {
    paddingBottom: 60,
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: 20,
  },
  menuContainer: {
    marginTop: 20,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: 60,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  menuIcon: {
    marginRight: 10,
  },
  menuOptionText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: Colors.textPrimary,
  },
});

export default Settings;

