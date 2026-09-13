import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  StatusBar,
  Linking,
  FlatList,
  Dimensions,
  Modal,
  Platform,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/color';
import { getAdById } from '../../services/api/getAdById';
import { useAuthStore } from '../../stores/authStore';
import Button from '../../components/shared/Button';
import { useFavoriteAd } from '../../services/mutations/favAd';
import { useIsFavorite } from '../../services/api/getFavAds';
// import { isProfileComplete } from '../../utils/profileCheck';
import DynamicModal from '../../components/shared/DynamicModal';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');
const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

const AdDisplay = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { token,user  } = useAuthStore();
  const { adId } = route.params || {};
  const [modalVisible, setModalVisible] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [timeAgo, setTimeAgo] = useState<string>('');

  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  });

const isProfileComplete = useAuthStore(state => state.isProfileComplete);



console.log(showAIAnalysis,'ai analysis')
  const { mutate: toggleFavorite, isPending: isFavoritePending } = useFavoriteAd();
  const isFavorite = useIsFavorite(adId);

  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['45%', '80%'], []); // Removed the middle point since it's too close to 45%

  const flatListRef = useRef<FlatList>(null);
  const modalListRef = useRef<FlatList>(null);

  const { data: ad, isLoading, isError } = useQuery({
    queryKey: ['ad', adId],
    queryFn: () => getAdById(token || '', adId),
    enabled: !!token && !!adId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const productImages = ad?.images?.map((img: any) => ({ uri: img.img_url })) || [];

  const handleBackPress = () => navigation.goBack();

  const handleImagePress = (index: number) => {
    setActiveImageIndex(index);
    setFullscreenVisible(true);
  };

  const truncateText = (text: string, length: number) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  };

  const getIconSize = (size: number) => {
    return wp(size * 0.25); // This will make icon sizes responsive
  };

  useEffect(() => {
    const updateLayout = () => {
      const { width: newWidth, height: newHeight } = Dimensions.get('window');
      // Force a re-render when orientation changes
      setDimensions({ width: newWidth, height: newHeight });
    };

    const subscription = Dimensions.addEventListener('change', updateLayout);

    return () => {
      subscription.remove(); // This is the correct way to remove the listener
    };
  }, []);

useEffect(() => {
  if (!ad?.timestamp) return;

  const updateTime = () => {
    const timestamp = ad.timestamp;
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) setTimeAgo('Just now');
    else if (diffInMinutes < 60) setTimeAgo(`${diffInMinutes} mins ago`);
    else if (diffInMinutes < 1440) {
      const diffInHours = Math.floor(diffInMinutes / 60);
      setTimeAgo(`${diffInHours} hour(s) ago`);
    } else {
      const diffInDays = Math.floor(diffInMinutes / 1440);
      setTimeAgo(`${diffInDays} day(s) ago`);
    }
  };

  updateTime(); 
  const interval = setInterval(updateTime, 60000); 

  return () => clearInterval(interval);
}, [ad?.timestamp]);


const isOwner = ad?.email === user?.email;

  // Image Gallery Component
  const ImageGallery = () => (      
    <View style={styles.imageGalleryContainer}>
      <FlatList
        ref={flatListRef}
        data={productImages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveImageIndex(index);
        }}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleImagePress(index)}
          >
            <Image
              source={item}
              style={styles.galleryImage}
              defaultSource={require('../../images/placeholder.jpg')}
            />
          </TouchableOpacity>
        )}
      />

      {/* Navigation Dots */}
      {productImages.length > 1 && (
        <View style={styles.dotsContainer}>
          {productImages.map((_: any, index: number) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeImageIndex ? styles.activeDot : styles.inactiveDot
              ]}
            />
          ))}
        </View>
      )}

      {/* Top Icons */}
      <View style={styles.topIcons}>
        <TouchableOpacity onPress={handleBackPress} style={styles.iconButton}>
          <Icon name="keyboard-arrow-left" size={getIconSize(24)} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => adId && toggleFavorite(adId, !isFavorite)}
          style={styles.iconButton}
        >
          <Icon
            name={isFavorite ? 'favorite' : 'favorite-border'}
            size={getIconSize(22)}
            color={isFavorite ? '#ff4757' : '#000'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading || !ad) {
    return (
      <>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <View style={styles.mainContainer}>
          {/* Skeleton for image gallery */}
          <View style={styles.skeletonImageGallery} />
          {/* Skeleton for main content */}
          <View style={styles.skeletonContent}>
            <View style={styles.skeletonUserRow} />
            <View style={styles.skeletonPrice} />
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonDetails} />
          </View>
        </View>
      </>
    );
  }

  // const formatTimestamp = (timestamp: string) => {
  //   const date = new Date(timestamp);
  //   const now = new Date();
  //   const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
  //   if (diffInMinutes < 1) return 'Just now';
  //   if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
  //   const diffInHours = Math.floor(diffInMinutes / 60);
  //   if (diffInHours < 24) return `${diffInHours} hours ago`;
  //   const diffInDays = Math.floor(diffInHours / 24);
  //   return `${diffInDays} days ago`;
  // };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <View style={styles.mainContainer}>
        <ImageGallery />

        <BottomSheet
          ref={bottomSheetRef}
          index={0}  // This will start at the first snap point (45%)
          snapPoints={snapPoints}
          enablePanDownToClose={false}
          backgroundStyle={{ backgroundColor: Colors.white }}
          handleIndicatorStyle={{ backgroundColor: '#ccc' }}
        >
          <BottomSheetScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* User Info Section */}
            <View style={styles.userInfoContainer}>
              <View style={styles.userRow}>
                <Image
                  source={ad.profile_picture ? { uri: ad.profile_picture } : require('../../images/avatar.png')}
                  defaultSource={require('../../images/avatar.png')}
                  style={styles.userAvatar}
                />
                <View style={styles.userDetails}>
             <Text style={styles.userName}>
                  {[ad.f_name, ad.l_name].filter(Boolean).join(' ')}
                </Text>

                  <Text style={styles.userMeta}>
                    Placed ad {timeAgo}
                  </Text>
                </View>
              </View>

              

              <View style={styles.titleContainer}>
                <Text style={styles.adTitle}>{ad.title}</Text>
              </View>

            <View style={styles.priceContainer}>
                <Text style={styles.priceText}>Rs. {ad.price.toLocaleString()}</Text>
              </View>

            </View>

            {/* Product Details Section */}
            <View style={styles.productDetailsSection}>
              <View style={styles.detailsCard}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Model:</Text>
                  <Text style={styles.detailValue}>{ad.model}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Category:</Text>
                  <Text style={styles.detailValue}>{ad.category_name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Brand:</Text>
                  <Text style={styles.detailValue}>{ad.brand_name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Rating:</Text>
                  <Text style={styles.detailValue}>
                    {showAIAnalysis ? `${ad.gen_rating}/10` : `${ad.rating}/10`}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Location:</Text>
                  <Text style={styles.detailValue}>{ad.city}</Text>
                </View>

                {/* Description Toggle */}
                <View style={styles.toggleContainer}>
                  <TouchableOpacity
                    style={[styles.toggleButton, !showAIAnalysis && styles.toggleButtonActive]}
                    onPress={() => setShowAIAnalysis(false)}
                  >
                    <Text style={[styles.toggleText, !showAIAnalysis && styles.toggleTextActive]}>
                      User Description
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleButton, showAIAnalysis && styles.toggleButtonActive]}
                    onPress={() => setShowAIAnalysis(true)}
                  >
                    <Text style={[styles.toggleText, showAIAnalysis && styles.toggleTextActive]}>
                      AI Analysis
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.descriptionContainer}>
                  <Text style={styles.descriptionText}>
                    {showAIAnalysis
                      ? showFullDescription
                        ? ad.gen_description
                        : truncateText(ad.gen_description || '', 150)
                      : showFullDescription
                        ? ad.description
                        : truncateText(ad.description || '', 150)
                    }
                  </Text>
                  {((showAIAnalysis && ad.gen_description?.length > 150) ||
                    (!showAIAnalysis && ad.description?.length > 150)) && (
                      <TouchableOpacity
                        onPress={() => setShowFullDescription(!showFullDescription)}
                        style={styles.seeMoreButton}
                      >
                        <Text style={styles.seeMoreText}>
                          {showFullDescription ? 'See less' : 'See more'}
                        </Text>
                      </TouchableOpacity>
                    )}
                </View>
              </View>
              
              {/* Chat Button */}
              {!isOwner && (
              <View style={styles.chatButton}> 
              <Button
            text={`Chat with ${ad.f_name}`}
            icon={<Ionicons name="chatbubble-outline" size={20} color={Colors.white} />}
            onPress={() => {
              if (!isProfileComplete()) {
              setProfileModalVisible(true);
              return;
            }

              const currentUserId = user?.id?.toString();
              if (currentUserId && ad.user_id) {
                const chatId = [currentUserId, ad.user_id.toString()].sort().join('_');
                (navigation as any).navigate('ChatDetail', {
                  chatId,
                  receiverId: ad.user_id.toString(),
                  receiverName: `${ad.f_name} ${ad.l_name}`,
                  adId: ad.ad_id,
                  adTitle: ad.title,
                  adPrice: ad.price,
                });
              }
            }}
          />
          </View>
              )}
            </View>

            {/* Map Section */}
            <View style={styles.staticMapContainer}>
              <Text style={styles.mapHeading}>Ad Location</Text>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${ad.latitude},${ad.longitude}`;
                  Linking.openURL(googleMapsUrl);
                }}
              >
                <Image
                  source={{
                    uri: `https://static-maps.yandex.ru/1.x/?lang=en-US&ll=${ad.longitude},${ad.latitude}&size=600,300&z=15&l=map&pt=${ad.longitude},${ad.latitude},pm2rdm`,
                  }}
                  style={styles.staticMap}
                />
              </TouchableOpacity>
            </View>
          </BottomSheetScrollView>
        </BottomSheet>

        {/* Fullscreen Modal */}
        <Modal visible={fullscreenVisible} transparent>
          <View style={styles.modalContainer}>
            <FlatList
              ref={modalListRef}
              data={productImages}
              horizontal
              pagingEnabled
              initialScrollIndex={activeImageIndex}
              keyExtractor={(_, index) => index.toString()}
              getItemLayout={(_, index) => ({
                length: width,
                offset: width * index,
                index,
              })}
              onScrollToIndexFailed={(info) => {
                const wait = new Promise(resolve => setTimeout(resolve, 500));
                wait.then(() => {
                  modalListRef.current?.scrollToIndex({ index: info.index, animated: true });
                });
              }}
              renderItem={({ item }) => (
                <Image
                  source={item}
                  style={styles.fullscreenImage}
                  resizeMode="contain"
                />
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setFullscreenVisible(false)}
            >
              <Icon name="close" size={getIconSize(28)} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
      <DynamicModal
  visible={profileModalVisible}
  icon={<Icon name="warning" size={40} color={Colors.primary} />}
  text="Please complete your profile before starting a chat."
  acceptText="OK"
  rejectText=""
  onAccept={() => setProfileModalVisible(false)}
/>

    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContentContainer: {
    paddingBottom: hp('1%'),
  },
  imageGalleryContainer: {
    height: hp('100%'), // Changed from height
    backgroundColor: Colors.black,
    borderBottomLeftRadius: wp('7%'), // Changed from fixed 28
    borderBottomRightRadius: wp('7%'),
    overflow: 'hidden',
    paddingTop: statusBarHeight,
    marginTop: -statusBarHeight,
  },
  galleryImage: {
    width: wp('100%'), // Changed from width
    height: hp('60%'), // Changed from height
    resizeMode: 'cover',
    marginTop: statusBarHeight,
  },
  topIcons: {
    position: 'absolute',
    top: statusBarHeight + hp('6%'), // Changed from fixed 50
    left: wp('5%'), // Changed from fixed 20
    right: wp('5%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  iconButton: {
    width: wp('9%'), // Changed from fixed 36
    height: wp('9%'),
    borderRadius: wp('4.5%'),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: hp('2%'), // Changed from fixed 16
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: wp('2%'), // Changed from fixed 8
    height: wp('2%'),
    borderRadius: wp('1%'),
    marginHorizontal: wp('1%'),
  },
  activeDot: {
    backgroundColor: Colors.white,
  },
  inactiveDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  fullscreenImage: {
    width: wp('100%'),
    height: hp('100%'),
  },
  closeButton: {
    position: 'absolute',
    top: hp('5%'), // Changed from fixed 40
    right: wp('5%'),
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: wp('1.5%'),
    borderRadius: wp('5%'),
  },
  userInfoContainer: {
    paddingHorizontal: wp('4%'),
    paddingTop: hp('1.5%'),
    paddingBottom: hp('1.5%'),
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: wp('13%'),
    height: wp('13%'),
    borderRadius: wp('6.5%'),
    borderWidth: 2,
    borderColor: Colors.primary,
    marginRight: wp('3%'),
  },
  chatButton:{
    marginTop: hp('2%'),
  },
  userDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: wp('4.2%'),
    fontFamily: 'Poppins-SemiBold',
    color: Colors.primary,
    marginBottom: hp('0.5%'),
  },
  userMeta: {
    fontSize: wp('3.3%'),
    fontFamily: 'Poppins-Regular',
    color: Colors.muted,
  },

  
  productDetailsSection: {
    paddingHorizontal: wp('4%'),
  },
  loadingText: {
    marginTop: 100,
    textAlign: 'center',
    fontSize: wp('4.5%'),
    fontFamily: 'Poppins-Medium',
    color: Colors.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  errorText: {
    fontSize: wp('4.5%'),
    fontFamily: 'Poppins-Bold',
    color: Colors.red,
    fontWeight: 'bold',
  },
  priceContainer: {
    paddingHorizontal: wp('2%'),

  },
  priceText: {
    fontSize: wp('5.5%'),
    fontFamily: 'Poppins-Bold',
    color: Colors.primary,
  },
  titleContainer: {
    paddingTop: hp('0.5%'),
    paddingHorizontal: wp('2%'),
    marginTop: hp('1%'),

  },
  adTitle: {
    fontSize: wp('4.4%'),
    fontFamily: 'Poppins-Medium',
    color: Colors.black,

  },
  staticMapContainer: {
    marginTop: hp('2.5%'),
    paddingHorizontal: wp('4%'),
    marginBottom: hp('2%'),
  },
  mapHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  staticMap: {
    width: '100%',
    height: hp('22%'), // Changed from fixed 180
    borderRadius: wp('3%'),
    marginTop: hp('1.2%'),
    borderWidth: 1,
    borderColor: Colors.backgroundGray,

    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Shadow for Android
    elevation: 3,
  },
  bottomSheetContent: {
    flex: 1,
  },
  detailsCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: wp('4%'),
    marginTop: hp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('1%'),
    paddingVertical: hp('0.5%'),
  },
  detailLabel: {
    fontSize: wp('3.8%'),
    fontFamily: 'Poppins-Medium',
    color: Colors.black,
  },
  detailValue: {
    fontSize: wp('3.8%'),
    fontFamily: 'Poppins-SemiBold',
    color: Colors.black,
  },
  descriptionContainer: {
    marginTop: hp('2%'),
  },
  descriptionLabel: {
    fontSize: wp('3.8%'),
    fontFamily: 'Poppins-Medium',
    color: Colors.muted,
    marginBottom: hp('1%'),
  },
  descriptionText: {
    fontSize: wp('3.8%'),
    fontFamily: 'Poppins-Regular',
    color: Colors.black,
    lineHeight: wp('5.5%'),
  },
  toggleContainer: {
    flexDirection: 'row',
    marginVertical: hp('2%'),
    backgroundColor: Colors.backgroundGray,
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: hp('1%'),
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: wp('3.5%'),
    fontFamily: 'Poppins-Medium',
    color: Colors.muted,
  },
  toggleTextActive: {
    color: Colors.primary,
  },
  seeMoreButton: {
    marginTop: hp('1%'),
  },
  seeMoreText: {
    fontSize: wp('3.5%'),
    fontFamily: 'Poppins-Medium',
    color: Colors.primary,
  },
  skeletonImageGallery: {
    height: hp('35%'),
    backgroundColor: '#ececec',
    borderBottomLeftRadius: wp('7%'),
    borderBottomRightRadius: wp('7%'),
    marginBottom: hp('2%'),
  },
  skeletonContent: {
    paddingHorizontal: wp('4%'),
    paddingTop: hp('2%'),
  },
  skeletonUserRow: {
    height: hp('7%'),
    backgroundColor: '#ececec',
    borderRadius: 12,
    marginBottom: hp('2%'),
  },
  skeletonPrice: {
    height: hp('3%'),
    width: wp('30%'),
    backgroundColor: '#ececec',
    borderRadius: 8,
    marginBottom: hp('1.5%'),
  },
  skeletonTitle: {
    height: hp('3%'),
    width: wp('60%'),
    backgroundColor: '#ececec',
    borderRadius: 8,
    marginBottom: hp('2%'),
  },
  skeletonDetails: {
    height: hp('12%'),
    backgroundColor: '#ececec',
    borderRadius: 12,
    marginBottom: hp('2%'),
  },
});

export default AdDisplay;

