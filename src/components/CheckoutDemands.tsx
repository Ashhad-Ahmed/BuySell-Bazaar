import React, {useState, useCallback} from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import {Colors} from '../constants/color';
import AdCard from './shared/AdsCard';
import AdCardSkeleton from './Skeleton/AdCardSkeleton';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useNavigation} from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';

const ItemSeparator = () => <View style={{width: 16}} />;

const gradientSets = [
  ['#fef0da', '#eadac4', '#a8c1fe'],
  ['#FFD2CA', '#FFD2CA', '#f8a1d1'],
];

interface CheckoutDemandsProps {
  data: any[];
  isLoading: boolean;
}

const CheckoutDemands: React.FC<CheckoutDemandsProps> = ({data, isLoading}) => {
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});
  const navigation = useNavigation<any>();

  const toggleFavorite = (demandId: number) => {
    setFavorites(prev => ({
      ...prev,
      [demandId]: !prev[demandId],
    }));
  };

  const handleDemandPress = (demandId: number) => {
    navigation.navigate('DemandDisplay', {demandId});
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  const renderItem = useCallback(({item, index}: {item: any; index: number}) => {
    // Get the first image URL from demand_images array

    return (
      <AdCard
        id={item.demand_id.toString()}
        image={item.thumbnail_url ? {uri: item.thumbnail_url} : require('../images/fallback.png')}
        thumbnail_url={item.thumbnail_url}
        isFeatured={item.is_featured === 1}
        title={item.title}
        price={item.price}
        condition="Good"
        rating={`${item.rating.toFixed(1)}★`}
        location={item.city}
        datePosted={formatDate(item.timestamp)}
        isFavorite={!!favorites[item.demand_id]}
        onToggleFavorite={(id: string) => toggleFavorite(parseInt(id))}
        type="demands"
        gradientColors={gradientSets[index % gradientSets.length]}
        onPress={() => handleDemandPress(item.demand_id)}
      />
    );
  }, [favorites, toggleFavorite, handleDemandPress]);

  if (isLoading) {
    return (
      <View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Check out Demands</Text>
          <Text style={styles.seeMore}>See More</Text>
        </View>
        <FlatList
          removeClippedSubviews={true}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
          data={[1, 2, 3, 4]}
          keyExtractor={item => item.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={ItemSeparator}
          contentContainerStyle={{
            paddingLeft: wp('4%'),
            paddingRight: wp('4%'),
          }}
          renderItem={() => <AdCardSkeleton />}
        />
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Check out Demands</Text>
          <Text style={styles.seeMore} onPress={() => navigation.navigate('AllDemands')}>See More</Text>
        </View>
        <View style={styles.emptyContainer}>
          <AntDesign name="search1" size={hp('4%')} color={Colors.textSecondary} style={{ marginBottom: hp('0.6%') }} />
          <Text style={styles.emptyText}>No demands to show right now.</Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Check out Demands</Text>
        <Text style={styles.seeMore} onPress={() => navigation.navigate('AllDemands')}>See More</Text>
      </View>

      <FlatList
        data={data || []}
        keyExtractor={item => item.demand_id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={{paddingLeft: wp('4%'), paddingRight: wp('4%')}}
        removeClippedSubviews={true}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        renderItem={renderItem}
      />
    </View>
  );
};

export default CheckoutDemands;

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1.3%'),
    paddingLeft: wp('4%'),
    paddingRight: wp('4%'),
  },
  title: {
    fontSize: hp('2.3%'),
    fontFamily: "Poppins-SemiBold",
    color: Colors.textPrimary,
  },
  seeMore: {
    fontSize: hp('1.5%'),
    fontWeight: '500',
    color: Colors.textPrimary,
    textDecorationLine: 'underline',
    fontFamily: "Poppins-Medium",
  },
  errorContainer: {
    paddingVertical: hp('4%'),
    alignItems: 'center',
  },
  errorText: {
    fontSize: hp('1.6%'),
    color: Colors.textSecondary,
    fontFamily: "Poppins-Regular",
  },
  emptyContainer: {
    paddingVertical: hp('3%'),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: hp('1.6%'),
    color: Colors.textSecondary,
    fontFamily: "Poppins-Regular",
  },
});
