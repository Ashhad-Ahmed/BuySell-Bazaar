import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Image,
  Animated,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../constants/color';

interface Props {
  inputText: string;
  onChangeText: (text: string) => void;
  onSend: (text: string, image?: string) => void;
  onTypingChange?: (isTyping: boolean) => void;
}

const { width } = Dimensions.get('window');

// constants for sizes
const CAMERA_BTN_SIZE = 35;
const ICON_BTN_SIZE = 30;
const SEND_BTN_WIDTH = 50;
const INPUT_RADIUS = 25;

const ChatInput: React.FC<Props> = React.memo(
  ({ inputText, onChangeText, onSend, onTypingChange }) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isPlusExpanded, setIsPlusExpanded] = useState(false);

    // Animation values
    const plusRotation = useRef(new Animated.Value(0)).current;
    const modalScale = useRef(new Animated.Value(0)).current;
    const modalOpacity = useRef(new Animated.Value(0)).current;
    const iconScale = useRef(new Animated.Value(1)).current;
    const popAnim = useRef(new Animated.Value(1)).current;
    const bgAnim = useRef(new Animated.Value(0)).current;

    // Simple debounce without lodash
    const typingTimeoutRef = useRef<number | null>(null);
    const handleTypingChange = useCallback(
      (text: string) => {
        onChangeText(text);

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        if (onTypingChange) {
          onTypingChange(true);
          typingTimeoutRef.current = setTimeout(() => {
            onTypingChange(false);
          }, 2000);
        }
      },
      [onChangeText, onTypingChange]
    );

    useEffect(() => {
      return () => {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      };
    }, []);

    const handleCameraPress = useCallback(async () => {
      try {
        const result = await launchCamera({
          mediaType: 'photo',
          quality: 0.8,
          cameraType: 'back',
        });
        if (result.assets?.length) {
          setSelectedImage(result.assets[0].uri || null);
        }
      } catch (error) {
        console.warn('Camera error:', error);
      }
    }, []);

    const handleGalleryPress = useCallback(async () => {
      try {
        const result = await launchImageLibrary({
          mediaType: 'photo',
          quality: 0.8,
        });
        if (result.assets?.length) {
          setSelectedImage(result.assets[0].uri || null);
        }
      } catch (error) {
        console.warn('Gallery error:', error);
      }
    }, []);

    const closePopup = useCallback(() => {
      Animated.parallel([
        Animated.timing(plusRotation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(modalScale, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        modalOpacity.setValue(0);
        setIsPlusExpanded(false);
      });
    }, [plusRotation, modalScale, modalOpacity]);

    const handlePlusPress = useCallback(() => {
      if (isPlusExpanded) {
        closePopup();
      } else {
        modalOpacity.setValue(1);
        Animated.parallel([
          Animated.timing(plusRotation, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(modalScale, {
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.spring(iconScale, {
            toValue: 1.2,
            useNativeDriver: true,
          }),
        ]).start(() => {
          Animated.spring(iconScale, {
            toValue: 1,
            friction: 8,
            useNativeDriver: true,
          }).start();
        });
        setIsPlusExpanded(true);
      }
    }, [isPlusExpanded, closePopup, plusRotation, modalScale, modalOpacity, iconScale]);

    const handleSend = useCallback(() => {
      if (inputText.trim() || selectedImage) {
        onSend(inputText.trim(), selectedImage || undefined);
        setSelectedImage(null);
      }
    }, [inputText, selectedImage, onSend]);

    const removeImage = useCallback(() => {
      setSelectedImage(null);
    }, []);

    // Plus icon rotation
    const plusIconRotation = useMemo(
      () =>
        plusRotation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '45deg'],
        }),
      [plusRotation]
    );

    const shouldShowSendIcon = useMemo(
      () => inputText.trim().length > 0 || !!selectedImage,
      [inputText, selectedImage]
    );

    // Pop animation when switching icons
    useEffect(() => {
      Animated.sequence([
        Animated.timing(popAnim, {
          toValue: 0.7,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(popAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();
    }, [shouldShowSendIcon, isPlusExpanded]);

    const gradientOpacity = useMemo(
      () =>
        bgAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
      [bgAnim]
    );

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          {/* Image Preview */}
          {selectedImage && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                <Icon name="close" size={14} color={Colors.white} />
              </TouchableOpacity>
            </View>
          )}

          {/* Input Wrapper */}
          <View style={styles.inputWrapper}>
            {/* Camera Button */}
            <TouchableOpacity style={styles.cameraButton} onPress={handleCameraPress}>
              <LinearGradient
                colors={[Colors.primary, '#4A90E2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cameraButtonGradient}
              >
                <Icon name="camera-alt" size={20} color={Colors.white} />
              </LinearGradient>
            </TouchableOpacity>

            {/* Text Input */}
            <TextInput
              placeholder="Message..."
              placeholderTextColor={Colors.textPlaceholder}
              style={styles.input}
              value={inputText}
              onChangeText={handleTypingChange}
              multiline
            />

            {/* Right Side Icons */}
            <View style={styles.rightIconsContainer}>
              {!shouldShowSendIcon && (
                <TouchableOpacity onPress={handlePlusPress} activeOpacity={0.8}>
                  <Animated.View style={styles.plusButton}>
                    <Animated.View
                      style={{
                        transform: [{ rotate: plusIconRotation }, { scale: iconScale }],
                      }}
                    >
                      <Icon name="add" size={20} color={Colors.primary} />
                    </Animated.View>
                  </Animated.View>
                </TouchableOpacity>
              )}

              {shouldShowSendIcon && (
                <TouchableOpacity onPress={handleSend} activeOpacity={0.8}>
                  <Animated.View style={styles.sendButton}>
                    <View style={StyleSheet.absoluteFill}>
                      <Animated.View
                        style={[StyleSheet.absoluteFill, { backgroundColor: Colors.primary }]}
                      />
                      <Animated.View
                        style={[StyleSheet.absoluteFill, { opacity: gradientOpacity }]}
                      >
                        <LinearGradient
                          colors={['#feda75', '#fa7e1e', '#d62976', '#962fbf', '#4f5bd5']}
                          style={StyleSheet.absoluteFill}
                        />
                      </Animated.View>
                    </View>
                    <Animated.View style={{ transform: [{ scale: popAnim }] }}>
                      <Icon name="send" size={20} color={Colors.white} />
                    </Animated.View>
                  </Animated.View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Plus Menu Modal */}
        {isPlusExpanded && (
          <Modal transparent animationType="none" onRequestClose={closePopup}>
            <TouchableWithoutFeedback onPress={closePopup}>
              <View style={styles.modalOverlay}>
                <Animated.View
                  style={[
                    styles.plusMenu,
                    { transform: [{ scale: modalScale }], opacity: modalOpacity },
                  ]}
                >
                  <TouchableOpacity style={styles.menuItem} onPress={handleCameraPress}>
                    <Icon name="camera-alt" size={24} color={Colors.primary} />
                    <Text style={styles.menuText}>Camera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem} onPress={handleGalleryPress}>
                    <Icon name="photo-library" size={24} color={Colors.primary} />
                    <Text style={styles.menuText}>Gallery</Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        )}
      </KeyboardAvoidingView>
    );
  }
);

const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: INPUT_RADIUS,
    paddingHorizontal: 7,
    paddingVertical: 4,
    minHeight: 32,
    maxHeight: 80,
  },
  cameraButton: {
    marginRight: 8,
    borderRadius: INPUT_RADIUS,
  },
  cameraButtonGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    width: CAMERA_BTN_SIZE,
    height: CAMERA_BTN_SIZE,
    borderRadius: INPUT_RADIUS,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    textAlignVertical: 'top',
    padding: 0,
    marginHorizontal: 4,
  },
  rightIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingBottom: 100,
    paddingRight: 20,
  },
  plusMenu: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    elevation: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    minWidth: 120,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  menuText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
    marginLeft: 12,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.red,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusButton: {
    borderRadius: INPUT_RADIUS,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    width: ICON_BTN_SIZE,
    height: ICON_BTN_SIZE,
  },
  sendButton: {
    borderRadius: INPUT_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    width: SEND_BTN_WIDTH,
    height: 35,
    overflow: 'hidden',
  },
});

export default ChatInput;
