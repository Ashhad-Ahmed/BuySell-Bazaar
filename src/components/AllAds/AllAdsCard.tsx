import { View, Text, Image, StyleSheet, TouchableOpacity, Pressable, Alert } from 'react-native';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { Colors } from '../../constants/color';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { Ad } from '../../services/api/types';
import { useFavoriteAd } from '../../services/mutations/favAd';
import { useIsFavorite } from '../../services/api/getFavAds';

// Helper function to format date
const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  } catch (error) {
    return '';
  }
};

interface AllAdsCardProps {
  ad?: Partial<Ad>;
  isFavorite?: boolean;
  onToggleFavorite?: (adId: number) => void;
  onPress?: (ad?: Ad) => void;
  type?: 'grid' | 'list';
}

const AllAdsCard: React.FC<AllAdsCardProps> = ({
  ad = {},
  isFavorite: propIsFavorite = false,
  onToggleFavorite,
  onPress,
  type = 'grid'
}) => {
  // Use the persistent favorite state from the server
  const serverIsFavorite = useIsFavorite(ad.ad_id || 0);
  const [localFavorite, setLocalFavorite] = useState(propIsFavorite);
  const { 
    mutate: toggleFavorite, 
    isPending, 
    error, 
    isPendingState, 
    getPendingState 
  } = useFavoriteAd();
  
  // Helper for condition from rating
  const getConditionLabel = useCallback((ad: Partial<Ad>) => ad.condition || 'Null', []);

  // Determine the actual favorite state with pending state consideration
  const isFavorite = useMemo(() => {
    if (!ad.ad_id) return localFavorite;
    
    // Check if there's a pending state for this ad
    if (isPendingState(ad.ad_id)) {
      return getPendingState(ad.ad_id) ?? serverIsFavorite;
    }
    
    return serverIsFavorite;
  }, [ad.ad_id, localFavorite, serverIsFavorite, isPendingState, getPendingState]);

  // Update local state when prop changes (fallback for non-server ads)
  useEffect(() => {
    if (!ad.ad_id) {
      setLocalFavorite(propIsFavorite);
    }
  }, [propIsFavorite, ad.ad_id]);

  // Show error alert if mutation fails
  useEffect(() => {
    if (error) {
      Alert.alert('Error', 'Failed to update favorite status. Please try again.');
    }
  }, [error]);

  const handleFavoritePress = useCallback(() => {
    if (!ad.ad_id) return;
    
    // Toggle to the opposite state
    const newFavoriteState = !isFavorite;
    
    // Call the debounced mutation with the new state
    toggleFavorite(ad.ad_id, newFavoriteState);
    
    // Call the parent callback if provided
    if (onToggleFavorite) {
      onToggleFavorite(ad.ad_id);
    }
  }, [ad.ad_id, isFavorite, toggleFavorite, onToggleFavorite]);

  // Memoized styles for performance
  const cardStyle = useMemo(() => [
    styles.card, 
    type === 'list' && styles.cardList
  ], [type]);

  const imageSource = useMemo(() => 
    ad.images && ad.images[0]?.img_url
      ? { uri: ad.images[0].img_url }
      : require('../../images/placeholder.jpg'),
    [ad.images]
  );

  const heartIconName = useMemo(() => 
    isFavorite ? 'heart' : 'hearto',
    [isFavorite]
  );

  const heartIconColor = useMemo(() => 
    isFavorite ? 'red' : 'white',
    [isFavorite]
  );

  if (type === 'list') {
    return (
      <Pressable style={cardStyle} onPress={() => onPress && onPress(ad as Ad)}>
        <View style={styles.imageContainer}>
          <Image
            source={imageSource}
            style={styles.imageList}
            defaultSource={require('../../images/placeholder.jpg')}
          />
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
        <View>
          <Text style={styles.itemTitle} numberOfLines={1}>{ad.title}</Text>
          <Text style={styles.price}>Rs {ad.price?.toLocaleString?.()}</Text>
          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{getConditionLabel(ad)}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{ad.rating?.toFixed(1)}★</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.metaSmall}>{ad.city}</Text>
            <Text style={styles.metaSmall}>{formatDate(ad.timestamp)}</Text>
          </View>
        </View>
      </Pressable>
    );
  } else {
    // grid view
    return (
      <Pressable style={styles.card} onPress={() => onPress && onPress(ad as Ad)}>
        <View style={styles.imageContainer}>
          <Image
            source={imageSource}
            style={styles.image}
            defaultSource={require('../../images/placeholder.jpg')}
          />
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
        <View>
          <Text style={styles.itemTitle} numberOfLines={1}>{ad.title}</Text>
          <Text style={styles.price}>Rs {ad.price?.toLocaleString?.()}</Text>
          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{getConditionLabel(ad)}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{ad.rating?.toFixed(1)}★</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.metaSmall}>{ad.city}</Text>
            <Text style={styles.metaSmall}>{formatDate(ad.timestamp)}</Text>
          </View>
        </View>
      </Pressable>
    );
  }
}

export default React.memo(AllAdsCard)

const styles = StyleSheet.create({
  card: {
    width: wp('43%'),
    borderRadius: wp('2%'),
  },
  cardList: {
    width: '100%',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: hp('20%'),
    borderRadius: wp('2%'),
  },
  imageList: {
    width: '100%',
    height: hp('25%'), // Increased height for list view
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
    fontFamily: "Poppins-Medium",
    color: Colors.black,
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
