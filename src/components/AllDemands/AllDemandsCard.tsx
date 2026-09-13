import { View, Text, Image, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import React, { useState } from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { Colors } from '../../constants/color';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { Demand } from '../../services/api/types';

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

interface AllDemandsCardProps {
  demand?: Partial<Demand>;
  isFavorite?: boolean;
  onToggleFavorite?: (demandId: number) => void;
  onPress?: (demand?: Demand) => void;
  type?: 'grid' | 'list';
}

const AllDemandsCard: React.FC<AllDemandsCardProps> = ({
  demand = {},
  isFavorite = false,
  onToggleFavorite,
  onPress,
  type = 'grid',
}) => {
  const [favorite, setFavorite] = useState(isFavorite);
  
  const getConditionLabel = (d: Partial<Demand>) => d.condition || 'Null';

  if (type === 'list') {
    return (
      <Pressable style={[styles.card, styles.cardList]} onPress={() => onPress && onPress(demand as Demand)}>
        <View style={styles.imageContainer}>
          <Image
            source={
              demand.thumbnail_url
                ? { uri: demand.thumbnail_url }
                : require('../../images/fallback.png')
            }
            style={styles.imageList}
            defaultSource={require('../../images/fallback.png')}
          />
          {demand.is_featured === 1 && (
            <View style={styles.featuredTag}>
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setFavorite(fav => !fav);
              if (onToggleFavorite && demand.demand_id) onToggleFavorite(demand.demand_id);
            }}
            style={styles.heartIcon}
          >
            <AntDesign
              name={favorite ? 'heart' : 'hearto'}
              size={16}
              color={favorite ? 'red' : 'white'}
            />
          </TouchableOpacity>
        </View>
        <View>
          <Text style={styles.itemTitle} numberOfLines={1}>{demand.title}</Text>
          <Text style={styles.price}>Rs {demand.price?.toLocaleString?.()}</Text>
          
          <View style={styles.row}>
            <Text style={styles.metaSmall}>{demand.city}</Text>
            <Text style={styles.metaSmall}>{formatDate(demand.timestamp)}</Text>
          </View>
        </View>
      </Pressable>
    );
  }

  // grid view
  return (
    <Pressable style={styles.card} onPress={() => onPress && onPress(demand as Demand)}>
      <View style={styles.imageContainer}>
        <Image
          source={
            demand.thumbnail_url
              ? { uri: demand.thumbnail_url }
              : require('../../images/fallback.png')
          }
          style={styles.image}
          defaultSource={require('../../images/fallback.png')}
        />
        {demand.is_featured === 1 && (
          <View style={styles.featuredTag}>
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            setFavorite(fav => !fav);
            if (onToggleFavorite && demand.demand_id) onToggleFavorite(demand.demand_id);
          }}
          style={styles.heartIcon}
        >
          <AntDesign
            name={favorite ? 'heart' : 'hearto'}
            size={16}
            color={favorite ? 'red' : 'white'}
          />
        </TouchableOpacity>
      </View>
      <View>
        <Text style={styles.itemTitle} numberOfLines={1}>{demand.title}</Text>
        <Text style={styles.price}>Rs {demand.price?.toLocaleString?.()}</Text>
        
        <View style={styles.row}>
          <Text style={styles.metaSmall}>{demand.city}</Text>
          <Text style={styles.metaSmall}>{formatDate(demand.timestamp)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default React.memo(AllDemandsCard);

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
    height: hp('25%'),
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
