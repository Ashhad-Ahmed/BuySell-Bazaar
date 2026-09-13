import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  Pressable,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Colors } from '../../constants/color';
import { fonts } from '../../config/themes/typography';

interface ImageCaptureUploaderProps {
  maxImages?: number;
  images: string[];
  onImagesChange: (images: string[]) => void;
  allowGallery?: boolean;
}

const AdsImageUploader: React.FC<ImageCaptureUploaderProps> = ({
  maxImages = 4,
  images,
  onImagesChange,
  allowGallery = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  // ✅ Step 1: Ask permissions manually (like UserImageUpload)
  const requestPermission = async (type: 'camera' | 'gallery') => {
    if (Platform.OS !== 'android') return true;
    try {
      if (type === 'camera') {
        const res = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        return res === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // Android 13+ uses READ_MEDIA_IMAGES, below that uses READ_EXTERNAL_STORAGE
        const sdk = Platform.Version;
        const perm =
          sdk >= 33
            ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
            : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
        const res = await PermissionsAndroid.request(perm);
        return res === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.error('Permission error:', err);
      return false;
    }
  };

  // ✅ Step 2: Add image to list
  const addImage = (uris: string[]) => {
    const updated = [...images, ...uris].slice(0, maxImages);
    onImagesChange(updated);
  };

  // ✅ Step 3: Camera handler
  const handleCamera = async () => {
    const granted = await requestPermission('camera');
    if (!granted) {
      Alert.alert('Permission Denied', 'Camera access denied.');
      return;
    }

    setModalVisible(false);
    launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'back',
        quality: 0.8,
        saveToPhotos: true,
      },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          console.error('Camera error:', response.errorCode);
          Alert.alert('Camera Error', response.errorMessage || 'Unable to open camera.');
          return;
        }
        if (response.assets?.length) {
          const uris = response.assets.map(a => a.uri).filter(Boolean) as string[];
          addImage(uris);
        }
      },
    );
  };

  // ✅ Step 4: Gallery handler
  const handleGallery = async () => {
    const granted = await requestPermission('gallery');
    if (!granted) {
      Alert.alert('Permission Denied', 'Gallery access denied.');
      return;
    }

    setModalVisible(false);
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: maxImages - images.length,
      },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          console.error('Gallery error:', response.errorCode);
          Alert.alert('Gallery Error', response.errorMessage || 'Unable to open gallery.');
          return;
        }
        if (response.assets?.length) {
          const uris = response.assets.map(a => a.uri).filter(Boolean) as string[];
          addImage(uris);
        }
      },
    );
  };

  // ✅ Step 5: Upload press logic
  const handleUploadPress = () => {
    if (images.length >= maxImages) {
      Alert.alert('Limit Reached', `You can only upload ${maxImages} images.`);
      return;
    }

    if (!allowGallery) {
      handleCamera();
    } else {
      setModalVisible(true);
    }
  };

  // ✅ Step 6: Delete image
  const handleDeleteImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onImagesChange(updated);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.uploadBox}
        onPress={handleUploadPress}
        activeOpacity={0.7}>
        <Text style={styles.uploadText}>
          Upload Product Image ({images.length}/{maxImages})
        </Text>
      </TouchableOpacity>

      <View style={styles.previewContainer}>
        {images.map((uri, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image source={{ uri }} style={styles.previewImage} />
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteImage(index)}
              activeOpacity={0.6}>
              <Text style={styles.deleteButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* ✅ Modal with options */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Upload Image</Text>

            <Pressable style={styles.modalButton} onPress={handleCamera}>
              <Text style={styles.modalButtonText}>Take Photo</Text>
            </Pressable>

            <Pressable style={styles.modalButton} onPress={handleGallery}>
              <Text style={styles.modalButtonText}>Choose from Gallery</Text>
            </Pressable>

            <Pressable
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 5,
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  uploadText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: fonts['Poppins-Medium'],
  },
  previewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 12,
    marginBottom: 12,
  },
  previewImage: {
    width: Dimensions.get('window').width / 4.5,
    height: Dimensions.get('window').width / 4.5,
    borderRadius: 10,
    backgroundColor: Colors.backgroundGray,
  },
  deleteButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 2,
  },
  deleteButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 14,
    fontFamily: fonts['Poppins-Bold'],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000055',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    width: '80%',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    color: Colors.primary,
    fontFamily: fonts['Poppins-SemiBold'],
  },
  modalButton: {
    borderRadius: 12,
    width: '100%',
    paddingVertical: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderColor: Colors.primary,
    borderWidth: 1,
  },
  modalButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: fonts['Poppins-Medium'],
  },
  cancelButton: {
    marginTop: 4,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  cancelText: {
    color: Colors.white,
    fontSize: 13,
    fontFamily: fonts['Poppins-Regular'],
  },
});

export default AdsImageUploader;
