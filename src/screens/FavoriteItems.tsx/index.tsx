import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  Animated,
  RefreshControl,
  Image,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/color';
import Header from '../../components/shared/Header';
import ToggleTabs from '../../components/shared/ToggleTabs';
import CardItem from '../../components/shared/CardItem';
import { useAuthStore } from '../../stores/authStore';
import { getFavoriteAds } from '../../services/api/getFavAds';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const HEADER_MAX_HEIGHT = hp('17%');
const HEADER_MIN_HEIGHT = hp('12%');

const FavoriteScreen = () => {
  const [activeTab, setActiveTab] = useState<'ads' | 'demands'>('ads');
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useAuthStore();
  const navigation = useNavigation();

  const scrollY = useRef(new Animated.Value(0)).current;

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

  const tabOptions = [
    { label: 'Ads', value: 'ads', icon: 'megaphone-outline' },
    { label: 'Demands', value: 'demands', icon: 'cube-outline' },
  ];

  const {
    data: favoriteAds = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['favorite-ads'],
    queryFn: () => getFavoriteAds(token!),
    enabled: !!token,
  });

  // 🌀 Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      console.error('❌ Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const filteredFavorites = useMemo(() => {
    const type = activeTab === 'ads' ? 'ad' : 'demand';
    return favoriteAds.filter(item => item.ad_type_name === type);
  }, [favoriteAds, activeTab]);

  const handleItemPress = (item: any) => {
    if (activeTab === 'ads') {
      (navigation as any).navigate('AdDisplay', { adId: item.ad_id });
    } else {
      (navigation as any).navigate('DemandDisplay', { demandId: item.ad_id });
    }
  };

  return (
    <View style={styles.container}>
      <Header
        type="navigation"
        title="Favorites"
        onPress={() => navigation.goBack()}
        animatedHeight={headerHeight}
        fadeHeight={fadeHeight}
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isFetching}
            onRefresh={onRefresh}
            colors={[Colors.primary]} // Android
            tintColor={Colors.primary} // iOS
          />
        }
      >
        <View style={styles.parentContainer}>
          <ToggleTabs
            activeTab={activeTab}
            onTabChange={val => setActiveTab(val as 'ads' | 'demands')}
            options={tabOptions}
          />

          {isLoading ? (
            <View style={styles.centerContainer}>
              <Text style={styles.loadingText}>Loading favorites...</Text>
            </View>
          ) : isError ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>❌ Failed to load favorites.</Text>
            </View>
          ) : (
            <FlatList
              data={filteredFavorites}
              keyExtractor={item => item.ad_id.toString()}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
               ListEmptyComponent={
                <View style={styles.centerContainer}>
                  <Text style={styles.emptyText}>
                   No favorites yet! Find something worth snapping and tap that heart!
                  </Text>
                  <Image
                    source={require('../../images/noAds_mass.png')} 
                    style={{
                      width: 120,
                      height: 120,
                      resizeMode: 'contain',
                      marginTop: 15,
                    }}
                  />
                </View>
              }
              renderItem={({ item }) => {
                const showRating = activeTab === 'ads';
                return (
                  <CardItem
                    adId={item.ad_id}
                    rating={item.rating}
                    title={item.title || 'Untitled'}
                    price={
                      item.price
                        ? `Rs ${Number(item.price).toLocaleString('en-PK')}`
                        : 'Not specified'
                    }
                    condition={item.condition || 'N/A'}
                    location={item.city || 'Location not specified'}
                    image={
                      item.images?.length > 0
                        ? { uri: item.images[0].img_url }
                        : require('../../images/placeholder.jpg')
                    }
                    showRating={showRating}
                    isSold={0}
                    onPress={() => handleItemPress(item)}
                    onDelete={() => {}}
                    hideMenu={true}
                  />
                );
              }}
            />
          )}
        </View>

        <View style={{ height: hp('11%') }} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  parentContainer: {
    flex: 1,
    paddingTop: hp('2%'),
    gap: hp('2.5%'),
    paddingHorizontal: wp('4%'),
  },
  scrollContent: {
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp('6%'),
  },
  loadingText: {
    fontSize: wp('4%'),
    fontFamily: 'Poppins-Medium',
    color: Colors.primary,
  },
  errorText: {
    fontSize: wp('4%'),
    fontFamily: 'Poppins-Medium',
    color: Colors.red,
  },
  emptyText: {
    fontSize: wp('4%'),
    fontFamily: 'Poppins-Medium',
    color: Colors.black,
    textAlign: 'center',
  },
});

export default FavoriteScreen;
