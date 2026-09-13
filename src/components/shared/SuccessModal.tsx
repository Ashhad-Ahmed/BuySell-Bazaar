import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import Colors from '../../constants/color';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Props {
  visible: boolean;
  onClose: () => void;
  success: boolean;
  message?: string;
}

const AdSuccessModal = ({ visible, onClose, success, message }: Props) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Icon name="close" size={20} color={Colors.black} />
          </TouchableOpacity>

          <View style={styles.animationContainer}>
            <LottieView
              source={
                success
                  ? require('../../animations/Done.json') 
                  : require('../../animations/Errorfailure.json')
              }
              autoPlay
              loop={false}
              style={{ width: 170, height: 170 }}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {success ? 'Success!' : 'Failed to Post Ad'}
          </Text>

          {/* Subtitle / Message */}
          <Text style={styles.subtitle}>
            {message
              ? message
              : success
              ? 'Your post has been created successfully.'
              : 'Something went wrong. Please try again.'}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 24,
    width: 300,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  animationContainer: {
    width: 130,
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.black,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
    zIndex: 5,
  },
});

export default AdSuccessModal;
