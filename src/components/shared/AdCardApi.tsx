import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, Alert } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { Colors } from '../../constants/color';
import { Ad } from '../../services/api/types';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import { useFavoriteAd } from '../../services/mutations/favAd';
import { useIsFavorite } from '../../services/api/getFavAds';

interface AdCardApiProps {
  ad: Ad;
  isFavorite: boolean;
  onToggleFavorite: (adId: number) => void;
  onPress?: (ad: Ad) => void;
}

const AdCardApi: React.FC<AdCardApiProps> = ({
  ad,
  isFavorite: propIsFavorite,
  onToggleFavorite,
  onPress,
}) => {
  const navigation = useNavigation<any>();
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  const [localFavorite, setLocalFavorite] = useState(propIsFavorite);
  const { 
    mutate: toggleFavorite, 
    isPending, 
    error, 
    isPendingState, 
    getPendingState 
  } = useFavoriteAd();
  
  // Use the persistent favorite state from the server
  const serverIsFavorite = useIsFavorite(ad.ad_id);
  
  const formatDate = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  }, []);

  const getConditionLabel = useCallback((a: Partial<Ad>) => a.condition || 'Null', []);

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress(ad);
    }
  }, [onPress, ad]);

  // Determine the actual favorite state with pending state consideration
  const isFavorite = useMemo(() => {
    // Check if there's a pending state for this ad
    if (isPendingState(ad.ad_id)) {
      return getPendingState(ad.ad_id) ?? serverIsFavorite;
    }
    
    return serverIsFavorite;
  }, [ad.ad_id, serverIsFavorite, isPendingState, getPendingState]);

  // Update local state when prop changes (fallback)
  useEffect(() => {
    setLocalFavorite(propIsFavorite);
  }, [propIsFavorite]);

  // Show error alert if mutation fails
  useEffect(() => {
    if (error) {
      Alert.alert('Error', 'Failed to update favorite status. Please try again.');
    }
  }, [error]);

  const handleFavoritePress = useCallback(() => {
    // Toggle to the opposite state
    const newFavoriteState = !isFavorite;
    
    // Call the debounced mutation with the new state
    toggleFavorite(ad.ad_id, newFavoriteState);
    
    // Call the parent callback if provided
    if (onToggleFavorite) {
      onToggleFavorite(ad.ad_id);
    }
  }, [ad.ad_id, isFavorite, toggleFavorite, onToggleFavorite]);

  // Memoized values for performance
  const heartIconName = useMemo(() => 
    isFavorite ? 'heart' : 'hearto',
    [isFavorite]
  );

  const heartIconColor = useMemo(() => 
    isFavorite ? 'red' : 'white',
    [isFavorite]
  );

  const imageSource = useMemo(() => ({
    uri: ad.thumbnail_url,
    priority: FastImage.priority.normal,
    cache: FastImage.cacheControl.immutable,
  }), [ad.thumbnail_url]);

  const fallbackImage = useMemo(() => 
    imageError && (
      <FastImage
        source={require('../../images/fallback.png')}
        style={styles.image}
        resizeMode="cover"
      />
    ),
    [imageError]
  );

  const mainImage = useMemo(() => (
    <FastImage
      source={imageSource}
      style={[styles.image, imageError && { display: 'none' }]}
      onLoad={() => setImageLoaded(true)}
      onError={() => setImageError(true)}
      resizeMode={FastImage.resizeMode.cover}
    />
  ), [imageSource, imageLoaded, imageError, ad.ad_id]);

  return (
    <Pressable style={styles.card} onPress={() => navigation.navigate('AdDisplay', { adId: ad.ad_id })}>
      <View style={styles.imageContainer}>
        {fallbackImage}
        {mainImage}
        {ad.is_featured === 1 && (
          <View style={styles.featuredTag}>
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleFavoritePress}
          style={styles.heartIcon}
          disabled={isPending}
        >
          <AntDesign
            name={heartIconName}
            size={16}
            color={heartIconColor}
          />
        </TouchableOpacity>
      </View>
      <View style={{gap: hp('0%')}}>
        <Text style={styles.itemTitle} numberOfLines={1}>{ad.title}</Text>
        <Text style={styles.price}>Rs {ad.price.toLocaleString()}</Text>
        <View style={styles.tagRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{getConditionLabel(ad)}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{ad.rating.toFixed(1)}★</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.metaSmall}>{ad.city}</Text>
          <Text style={styles.metaSmall}>{formatDate(ad.timestamp)}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: wp('43%'),
    borderRadius: wp('2%'),
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: hp('20%'),
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: wp('2%'),
  },
  featuredTag: {
    position: 'absolute',
    bottom: hp('1%'),
    left: wp('2%'),
    backgroundColor: '#FDE68A',
    padding: wp('1%'),
    borderRadius: wp('2%'),
  },
  featuredText: {
    fontSize: hp('1.2%'),
    fontWeight: '400',
    color: '#000',
    fontFamily: "Poppins-Regular",
    lineHeight: hp('1.5%'),
  },
  heartIcon: {
    position: 'absolute',
    top: hp('1%'),
    right: wp('2%'),
    backgroundColor: 'rgba(0, 0, 0, 0.10)',
    borderRadius: wp('5%'),
    padding: wp('1.5%'),
  },
  itemTitle: {
    fontSize: hp('1.6%'),
    fontWeight: '400',
    marginTop: hp('1%'),
    fontFamily: "Poppins-Regular",
    color: Colors.textPrimary,
  },
  price: {
    color: Colors.primary,
    // fontWeight: 'bold',
    fontFamily: "Poppins-SemiBold",
    marginVertical: hp('0%'),
    fontSize: hp('2%'),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp('0.7%'),
  },
  metaSmall: {
    fontSize: hp('1.3%'),
    color: Colors.primary,
    marginTop: hp('0.3%'),
    fontWeight: '400',
    fontFamily: "Poppins-Regular",
  },
  tagRow: {
    flexDirection: 'row',
    gap: wp('2%'),
    marginTop: hp('0.8%'),
  },
  tag: {
    backgroundColor: '#EFEFEF',
    paddingVertical: hp('0.5%'),
    paddingHorizontal: wp('2.5%'),
    borderRadius: wp('3%'),
  },
  tagText: {
    fontSize: hp('1.4%'),
    color: Colors.black,
    fontFamily: "Poppins-Regular",
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp('0.5%'),
  },
  brandText: {
    fontSize: hp('1.2%'),
    color: Colors.textSecondary,
    fontWeight: '500',
    fontFamily: "Poppins-Regular",
  },
  categoryText: {
    fontSize: hp('1.2%'),
    color: Colors.textSecondary,
    fontWeight: '400',
    fontFamily: "Poppins-Regular",
  },
});

export default React.memo(AdCardApi); 