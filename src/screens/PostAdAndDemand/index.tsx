import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ToggleTabs from '../../components/shared/ToggleTabs';
import Field, { FieldConfig } from '../../components/shared/Field';
import Button from '../../components/shared/Button';
import Colors from '../../constants/color';
import Header from '../../components/shared/Header';
import AdsImageUploader from '../../components/shared/AdsImageUploader';
// import { storage } from '../../../firebaseConfig';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { createAd, createDemand } from '../../services/mutations/post';
import { useAuthStore  } from '../../stores/authStore';
import AdLoaderModal from '../../components/shared/LoaderModal';
import AdSuccessModal from '../../components/shared/SuccessModal';
import { DropdownOption } from '../../components/shared/CustomDropDown';
import ValidationModal from '../../components/shared/ValidationModal';
import { useMasterData } from '../../services/hooks/useMasterData';
import LocationPermissionModal from '../../components/LocationModal';
import Geolocation from 'react-native-geolocation-service';
import ImageCompressor from 'react-native-compressor';
import storage from '@react-native-firebase/storage';
import { PermissionsAndroid } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { fonts } from '../../config/themes/typography';

import RNFS from 'react-native-fs';
import ProfileWarning from '../../components/shared/ProfileWarning';
import DynamicModal from '../../components/shared/DynamicModal';
import Icon from 'react-native-vector-icons/MaterialIcons';
// import { isProfileComplete } from '../../utils/profileCheck';


const tabOptions = [
  { label: 'Post an Ad', value: 'ad', icon: 'add-circle' },
  { label: 'Post a Demand', value: 'demand', icon: 'search' },
];

const HEADER_MAX_HEIGHT = hp('17%');
const HEADER_MIN_HEIGHT = hp('12%');

const PostAdOrDemandScreen = () => {
  interface FormState {
    fullName?: string;
    description?: string;
    model?: string | number;
    category_id?: number;
    brand_id?: number;
    city?: string;
    price?: string;
    images?: any[];
    condition?: string;
    rating?: number;
    latitude?: number;
    longitude?: number;
  }
  const navigation = useNavigation();

  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'ad' | 'demand'>('ad');
  const [formValues, setFormValues] = useState<FormState>({});
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [postSuccess, setPostSuccess] = useState(true);
  
  // Use React Query for master data - cached and shared across screens
  const { data: masterData, isLoading: isMasterDataLoading } = useMasterData();
  const categories = masterData?.categories || [];
  const brands = masterData?.brands || [];
  const cities = masterData?.cities || [];
  
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
const scrollY = useRef(new Animated.Value(0)).current;

const fadeAnim = useRef(new Animated.Value(1)).current;
const slideAnim = useRef(new Animated.Value(0)).current;


const animateTabChange = (newTab: 'ad' | 'demand') => {
  // Animate current content out
  Animated.parallel([
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }),
    Animated.timing(slideAnim, {
      toValue: 20, // slide down a bit
      duration: 150,
      useNativeDriver: true,
    }),
  ]).start(() => {
    // After fade-out completes, switch tab
    setActiveTab(newTab);

    // Animate new content in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  });
};



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

  const token = useAuthStore(state => state.token);
  const user = useAuthStore(state => state.user);
  const isProfileComplete = useAuthStore(state => state.isProfileComplete);

  useEffect(() => {
    if (locationDenied) {
      setLocationModalVisible(true);
    }
  }, [locationDenied]);

  const handleChange = (name: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const resetFormValues = () => {
  setFormValues({});
};
useEffect(() => {
  resetFormValues();
}, [activeTab]);


  const conditions: DropdownOption[] = [
  { label: 'New', value: 'New' },
  { label: 'Used', value: 'Used' },
  { label: 'Slighlty Used', value: 'Slighlty Used'},
];


const getFields = (): FieldConfig[] => {
  const isAd = activeTab === 'ad';

  return [
    {
      label: isAd ? 'Ad Name' : 'Demand Name',
      name: 'fullName',
      type: 'text',
      placeholder: isAd ? 'Enter your Ad title' : 'Enter your Demand title',
    },
    {
      label: isAd ? 'Ad Description' : 'Demand Description',
      name: 'description',
      type: 'text',
      placeholder: isAd
        ? 'Describe your item for sale'
        : 'Describe what you are looking for',
      multiline: true,
      height: 100,
    },
    {
      label: 'Model',
      name: 'model',
      type: 'text',
      placeholder: isAd
        ? 'Enter item model '
        : 'Mention preferred model',
    },
    {
      label: 'Category',
      name: 'category_id',
      type: 'dropdown',
      options: categories,
    },
    {
      label: 'Brand',
      name: 'brand_id',
      type: 'dropdown',
      options: brands,
    },
    {
      label: 'City',
      name: 'city',
      type: 'dropdown',
      options: cities,
    },
    {
      label: isAd ? 'Condition' : 'Preferred Condition',
      name: 'condition',
      type: 'dropdown',
      options: conditions,
    },
    {
      label: isAd ? 'Price' : 'Budget',
      name: 'price',
      type: 'text',
      placeholder: isAd
        ? 'Enter price (PKR)'
        : 'Enter your desired price (PKR)',
    },
  ];
};

  const renderRating = () => (
    <View style={styles.ratingContainer}>
      <Text style={styles.ratingLabel}>Rate your device</Text>
      <View style={styles.ratingOptions}>
        {Array.from({ length: 10 }, (_, i) => {
          const rating = i + 1;
          const selected = formValues.rating === rating;
          return (
            <TouchableOpacity
              key={rating}
              style={[styles.ratingCircle, selected && styles.ratingCircleSelected]}
              onPress={() => handleChange('rating', rating)}
            >
              <Text style={[styles.ratingText, selected && styles.ratingTextSelected]}>
                {rating}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const formatDateTime = (date: Date) => {
    return date.toISOString().slice(0, 19).replace('T', ' ');
  };

  const resetForm = () => {
    setFormValues({});
    setActiveTab('ad');
  };

  const validateForm = () => {
  const errors: string[] = [];

  const rules = [
    { valid: !!formValues.fullName?.trim(), message: 'Product Name is required.' },
    { valid: !!formValues.description?.trim(), message: 'Description is required.' },
    { valid: !!formValues.model, message: 'Model is required.' },
    { valid: !!formValues.category_id, message: 'Category is required.' },
    { valid: !!formValues.brand_id, message: 'Brand is required.' },
    { valid: !!formValues.city, message: 'City is required.' },
    {
      valid: !!formValues.condition,
    message: 'Condition is required .',
  },
    {
      valid: formValues.price && !isNaN(Number(formValues.price)),
      message: 'Price must be a valid number.',
    },
    {
      valid: !!formValues.images && formValues.images.length > 0,
      message: 'At least one image must be uploaded.',
    },
    {
      valid:
        activeTab !== 'ad' ||
        (formValues.rating && !isNaN(Number(formValues.rating))),
      message: 'Rating is required for ads.',
    },
  ];

  for (const rule of rules) {
    if (!rule.valid) {
      errors.push(rule.message);
    }
  }

  return errors;
};

const compressImage = async (uri: string) => {
  try {
    const result = await ImageCompressor.Image.compress(uri, {
      compressionMethod: 'auto',
      quality: 0.6,
      maxWidth: 1080,
      maxHeight: 1080,
    });
    console.log('📦 Compressed image path:', result);
    return result;
  } catch (error) {
    console.error('❌ Compression error:', error);
    return uri
  }
};

const getUserLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      setLocationDenied(true);
      return null;
    }

    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Location Error:', error.message);
          setLocationDenied(true);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  } catch (error) {
    console.warn('Permission error:', error);
    setLocationDenied(true);
    return null;
  }
};


const handleSubmit = async () => {
  Keyboard.dismiss();

  if (!isProfileComplete()) {
    setProfileModalVisible(true);
    return;
  }

  const errors = validateForm();
  if (errors.length > 0) {
    setValidationErrors(errors);
    setShowErrorModal(true);
    return;
  }

  if (!user?.id) {
    console.error('❌ User not authenticated');
    return;
  }

  setLoading(true);

  try {
    const location = await getUserLocation();
    if (!location) {
      setLocationModalVisible(true);
      return;
    }

    console.log(location.latitude, location.longitude, '📍 LOCATION');

    const uploadedImageURLs: string[] = [];
    for (const image of formValues.images || []) {
      try {
        const uri = image.uri || image;
        console.log('🖼️ Original URI:', uri);

        const compressedUri = await compressImage(uri);
        const filename = compressedUri.substring(compressedUri.lastIndexOf('/') + 1);
        const path = `ads/${Date.now()}_${filename}`;
        const reference = storage().ref(path);

        console.log('⏫ Uploading to path:', path);
        await reference.putFile(compressedUri);
        const downloadURL = await reference.getDownloadURL();

        console.log('✅ Uploaded. Download URL:', downloadURL);
        uploadedImageURLs.push(downloadURL);
      } catch (uploadErr) {
        console.error('❌ Firebase upload failed:', uploadErr);
        throw new Error('Image upload failed. Please try again.');
      }
    }

    const basePayload: any = {
      title: formValues.fullName || '',
      description: formValues.description || '',
      brand_id: Number(formValues.brand_id) || 1,
      model: formValues.model || '',
      imageURLs: uploadedImageURLs,
      city_id: Number(formValues.city) || 0,
      timestamp: formatDateTime(new Date()),
      longitude: location.longitude || 0,
      latitude: location.latitude || 0,
      category_id: Number(formValues.category_id) || 1,
      condition: typeof formValues.condition === 'string' ? formValues.condition : '',
      price: Number(formValues.price) || 0,
      user_id: Number(user?.id) || 0,
      prompt:
        'You are given an image containing a single product intended for marketplace listing. Focus only on the product itself — completely ignore the background, lighting, reflections, people, text, or any environmental elements. Analyze the object’s visible qualities such as design, build, material, condition, cleanliness, and overall visual appeal. Be brutally honest and objective: if it looks cheap, scratched, poorly photographed, or unappealing, say so directly; if it looks premium, clean, or well-presented, highlight that clearly. Do not mention anything unrelated to the product. Return your response strictly in JSON format with two keys: “rating” (a number between 1 and 10) and “description” (a short, clear, marketplace-ready summary that mentions both strengths and weaknesses). The description should sound like something written by a real seller or reviewer — concise, factual, and straightforward, without extra commentary or formatting outside the JSON structure..',
    };
    if (activeTab === 'ad') {
      basePayload.rating = parseInt(String(formValues.rating ?? ''), 10) || 1;
    }

    console.log('📦 Final Payload:', basePayload);

    const res =
      activeTab === 'ad'
        ? await createAd(basePayload, token)
        : await createDemand(basePayload, token);

    if (!res || res.status >= 400) {
      throw new Error(res?.data?.message || 'Server rejected the post.');
    }

    console.log('✅ Post created successfully:', res);
    setPostSuccess(true);
    setErrorMessage('');
    resetForm();

  } catch (error: any) {
    console.error('❌ Failed to create post:', error.message);
    setPostSuccess(false);
    setErrorMessage(error.message || 'Something went wrong while posting.');
  } finally {
    setLoading(false);
    setModalVisible(true); 
  }
};


  const handleCloseModal = () => {
    setLocationModalVisible(false);
    setLocationDenied(false); 
  };
  const [errorMessage, setErrorMessage] = useState<string>('');

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <Header
        type="navigation"
        title="Create Your Post"
        icon="arrow-back"
        onPress={() => navigation.goBack()}
        backgroundColor="#fff"
        textColor={Colors.textPrimary}
        iconColor={Colors.textPrimary}
        animatedHeight={headerHeight}
        fadeHeight={fadeHeight}
      />
       {!isProfileComplete && <ProfileWarning />}

      <Animated.ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
      <View style={styles.parentContainer}>
  <View style={styles.tabWrapper}>
    <ToggleTabs
      activeTab={activeTab}
      onTabChange={(val) => animateTabChange(val as 'ad' | 'demand')}
      options={tabOptions}
    />
  </View>

  <Animated.View
    style={[
      styles.introWrapper,
      {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      },
    ]}
  >
    <Text style={styles.introTitle}>
      {activeTab === 'ad'
        ? 'Looking to sell your item?'
        : 'Looking to buy your wishlist?'}
    </Text>
    <Text style={styles.introSubText}>
      {activeTab === 'ad'
        ? 'Add the details of your item.'
        : 'Add the details of what you want to buy.'}
    </Text>
  </Animated.View>

  <Field fields={getFields()} values={formValues} onChange={handleChange}>
    <AdsImageUploader
      images={formValues.images || []}
      onImagesChange={(imgs) => handleChange('images', imgs)}
      allowGallery={activeTab === 'demand'}
    />

    {activeTab === 'ad' && renderRating()}

    <View>
      <Button text="Submit Post" onPress={handleSubmit} />
    </View>
  </Field>
</View>

     
      </Animated.ScrollView>

      <AdLoaderModal visible={loading} />
      <AdSuccessModal visible={modalVisible} message={errorMessage}  success={postSuccess} onClose={() => setModalVisible(false)} />
      <ValidationModal
        visible={showErrorModal}
        errors={validationErrors}
        onClose={() => setShowErrorModal(false)}
      />
      <LocationPermissionModal
        visible={locationModalVisible}
        onClose={handleCloseModal}
      />
       <DynamicModal
        visible={profileModalVisible}
        icon={<Icon name="warning" size={40} color={Colors.primary} />}
        text="Please complete your profile before posting an ad or demand."
        acceptText="OK"
        rejectText=""
        onAccept={() => setProfileModalVisible(false)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.white },
  scroll: { flex: 1 },
  scrollContainer: { paddingBottom: 100 },
  parentContainer: {
    flex: 1,
    paddingTop: hp('2%'),
    gap: hp('2.5%'),
  },
  tabWrapper: { paddingHorizontal: 20 },
  introWrapper: { paddingHorizontal: 22 },
  introTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
    fontFamily: fonts['Poppins-Bold'],
  },
  introSubText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '400',
    fontFamily: fonts['Poppins-Regular'],

  },
  ratingContainer: {
    marginTop: 5,
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.black,
    marginBottom: 12,
    fontFamily: fonts['Poppins-Medium'],
  },
  ratingOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ratingCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    backgroundColor: Colors.white,
  },
  ratingCircleSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  ratingText: {
    fontSize: 14,
    color: Colors.black,
    fontFamily: fonts['Poppins-Regular'],
  },
  ratingTextSelected: {
    color: Colors.white,
    fontWeight: '600',
    fontFamily: fonts['Poppins-SemiBold'],
  },
});

export default PostAdOrDemandScreen;