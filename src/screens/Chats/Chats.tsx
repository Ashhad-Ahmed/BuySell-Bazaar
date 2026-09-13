import { StyleSheet, View, Animated } from 'react-native';
import React, { useRef } from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import Header from '../../components/shared/Header';
import ChatList from '../../components/chatsComponents/ChatList';
import { Colors } from '../../constants/color';
import { useAuthStore } from '../../stores/authStore';

const HEADER_MAX_HEIGHT = hp('17%');
const HEADER_MIN_HEIGHT = hp('12%');

const Chats: React.FC = () => {
  const navigation = useNavigation<any>();
  const scrollY = useRef(new Animated.Value(0)).current;
  const currentUserId = useAuthStore(state => state.user?.id || '');

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

  const handleBackPress = () => {
    // Get the parent navigator (root stack) to handle back navigation
    const parent = navigation.getParent();
    if (parent && parent.canGoBack()) {
      parent.goBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <Header 
        type="navigation"  
        title="Messages"
        icon="arrow-back-ios"
        onPress={handleBackPress}
        animatedHeight={headerHeight}
        fadeHeight={fadeHeight}
      />
      <ChatList 
        currentUserId={currentUserId}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      />
    </View>
  );
};

export default Chats;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});