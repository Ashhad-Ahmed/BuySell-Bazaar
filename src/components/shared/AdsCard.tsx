import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { Colors } from '../../constants/color';
import LinearGradient from 'react-native-linear-gradient';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

interface FeaturedAdCardProps {
  thumbnail_url: string;
  id: string;
  image: any;
  isFeatured: boolean;
  title: string;
  price: number;
  condition: string;
  rating: string;
  location: string;
  datePosted: string;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  type?: 'demands' | 'ads';
  gradientColors?: string[]; 
   onPress?: () => void;
}

const AdCard: React.FC<FeaturedAdCardProps> = ({
  id,
  image,
  isFeatured,
  title,
  price,
  condition,
  rating,
  location,
  datePosted,
  isFavorite,
  onToggleFavorite,
  type = 'ads',
  gradientColors, 
  onPress = () => {}, 
}) => {
  const defaultGradient = ['#fef0da', '#eadac4', '#a8c1fe'];

 if (type === 'demands') {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <LinearGradient
        colors={gradientColors || defaultGradient}
        style={styles.demandCard}
      >
        <View style={styles.demandTextContainer}>
          <Text style={styles.demandBadge}>Buyers Demand</Text>
          <Text style={styles.brand} numberOfLines={2}>{title}</Text>
          <Text style={styles.demandPrice}>Rs. {price.toLocaleString()}</Text>
        </View>

          <Image source={image} style={styles.demandImage} />
      </LinearGradient>
    </TouchableOpacity>
  );
}

  return (
    <Pressable style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={image} style={styles.image} />
        {isFeatured && (
          <View style={styles.featuredTag}>
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}
        <TouchableOpacity activeOpacity={0.7}
          onPress={() => onToggleFavorite(id)}
          style={styles.heartIcon}
        >
          <AntDesign
            name={isFavorite ? 'heart' : 'hearto'}
            size={16}
            color={isFavorite ? 'red' : 'white'}
          />
        </TouchableOpacity>
      </View>
      <View>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.price}>Rs {price.toLocaleString()}</Text>
        <View style={styles.tagRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{condition}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{rating}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.metaSmall}>{location}</Text>
          <Text style={styles.metaSmall}>{datePosted}</Text>
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
  },
  image: {
    width: '100%',
    height: hp('20%'),
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
    fontSize: hp('1.3%'),
    fontWeight: '400',
    color: '#000',
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
  },
  price: {
    color: Colors.primary,
    // fontWeight: 'bold',
    marginVertical: hp('0.7%'),
    fontSize: hp('1.7%'),
    fontFamily: "Poppins-SemiBold",
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
    borderRadius: wp('6%'),
  },
  tagText: {
    fontSize: hp('1.4%'),
    color: Colors.black,
    fontFamily: "Poppins-Regular",
  },

  // Demand Card Styles
  demandCard: {
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('2%'),
    borderRadius: wp('4%'),
    width: wp('80%'),
    height: hp('18%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: wp('3%'),
  },
  demandTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  demandBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    color: Colors.primary,
    fontSize: hp('1.3%'),
    paddingHorizontal: wp('2.5%'),
    paddingVertical: hp('0.5%'),
    borderRadius: wp('6%'),
    fontWeight: '500',
    marginBottom: hp('1%'),
    fontFamily: "Poppins-Medium",
  },
  brand: {
    fontSize: hp('2.3%'),
    // fontWeight: '600',
    color: '#000',
    fontFamily: "Poppins-SemiBold",
    lineHeight: hp('2.5%'),
    paddingBottom:2,
    },
  demandPrice: {
    fontSize: hp('2%'),
    // fontWeight: '700',
    color: '#000',
    marginTop: hp('0.7%'),
    fontFamily: "Poppins-SemiBold",
  },
  demandImage: {
    width: wp('35%'),
    height: hp('15%'),
    borderRadius: wp('2%'),
    resizeMode: 'cover',
  },
});

export default AdCard;
