import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction,
  useEffect,
} from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Colors} from '../../constants/color';
import {useAuthStore} from '../../stores/authStore';
import ImageCropPicker from 'react-native-image-crop-picker';

export interface UserImageUploadRef {
  getImageUri: () => string | null;
}

interface Props {
  editable?: boolean;
  gender?: string;
}

const UserImageUpload: ForwardRefRenderFunction<UserImageUploadRef, Props> = (
  {editable = false, gender = 'male'},
  ref,
) => {
  const {user} = useAuthStore();
  const [imageUri, setImageUri] = useState<string | null>(user?.avatar || null);

  // 👇 React to editable changes
  useEffect(() => {
    if (!editable) {
      // if edit mode turned off → reset to stored avatar
      setImageUri(user?.avatar || null);
    }
  }, [editable, user?.avatar]);

  useImperativeHandle(ref, () => ({
    getImageUri: () => imageUri,
  }));

  const getFallbackAvatar = () => {
    if (gender?.toLowerCase() === 'female') {
      return require('../../images/female_avatar.jpg');
    }
    return require('../../images/avatar.png');
  };

  const requestPermission = async (type: 'camera' | 'gallery') => {
    if (Platform.OS !== 'android') return true;
    try {
      if (type === 'camera') {
        const res = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        return res === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const sdk = Platform.Version;
        const perm =
          sdk >= 33
            ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
            : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
        const res = await PermissionsAndroid.request(perm);
        return res === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.log('Permission error:', err);
      return false;
    }
  };

  const handleCamera = async () => {
    const granted = await requestPermission('camera');
    if (!granted) return Alert.alert('Permission Denied', 'Camera access denied.');
    try {
      const img = await ImageCropPicker.openCamera({
        width: 400,
        height: 400,
        cropping: true,
        cropperCircleOverlay: true,
        compressImageQuality: 0.8,
      });
      setImageUri(img.path);
    } catch (e: any) {
      if (e.message?.includes('cancel')) return;
      Alert.alert('Camera Error', 'Unable to capture image.');
    }
  };

  const handleGallery = async () => {
    const granted = await requestPermission('gallery');
    if (!granted) return Alert.alert('Permission Denied', 'Gallery access denied.');
    try {
      const img = await ImageCropPicker.openPicker({
        width: 400,
        height: 400,
        cropping: true,
        cropperCircleOverlay: true,
        compressImageQuality: 0.8,
      });
      setImageUri(img.path);
    } catch (e: any) {
      if (e.message?.includes('cancel')) return;
      Alert.alert('Gallery Error', 'Unable to open gallery.');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={imageUri ? {uri: imageUri} : getFallbackAvatar()}
        style={styles.avatar}
      />
      {/* 👇 only show when editing */}
      {editable && (
        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={handleCamera} style={styles.button}>
            <Icon name="photo-camera" size={22} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleGallery} style={styles.button}>
            <Icon name="photo-library" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {alignItems: 'center', marginBottom: 15},
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderColor: Colors.primary,
    borderWidth: 2,
    marginBottom: 10,
  },
  buttonRow: {flexDirection: 'row', gap: 12},
  button: {
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 30,
  },
});

export default forwardRef(UserImageUpload);
