import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Header from '../../components/shared/Header';
import SearchBar from '../../components/searchBar';
import BrowseCategories from '../../components/BrowseCategories';
import CheckoutDemands from '../../components/CheckoutDemands';
import FeatureAdBanner from '../../components/FeatureAdBanner/FeatureAdBanner';
import FeaturedAds from '../../components/FeaturedAds';
import MobileApps from '../../components/MobileApps';
import Laptops from '../../components/Laptops';
import { getHomeData } from '../../services/api/getHomeData';
import { useAuthStore } from '../../stores/authStore';
import { useQuery } from '@tanstack/react-query';
import ProfileWarning from '../../components/shared/ProfileWarning';

const HEADER_MAX_HEIGHT = hp('17%');
const HEADER_MIN_HEIGHT = hp('12%');

const Home = ({ navigation }: { navigation: any }) => {
  const token = useAuthStore(state => state.token);
  const user = useAuthStore(state => state.user);
  const isProfileComplete = useAuthStore(state => state.isProfileComplete);

  const scrollY = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);

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

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['home-feed', token],
    queryFn: () => (token ? getHomeData(token) : Promise.resolve(null)),
    enabled: !!token,
    staleTime: 3 * 60 * 1000,
    gcTime: 8 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  /** 🌀 Pull-to-refresh handler */
  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await refetch(); // triggers react-query re-fetch
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  return (
    <View style={styles.main}>
      <Header type="logo" animatedHeight={headerHeight} fadeHeight={fadeHeight} />

      {!isProfileComplete() && <ProfileWarning />}

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#152F54']}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <View style={styles.parentContainer}>
          <View style={styles.searchContainer}>
            <SearchBar
              placeholder="Search area, city or country"
              leftIcon="search"
              rightIcon="filter-outline"
              onPress={() => navigation.navigate('Search')}
            />
          </View>

          <BrowseCategories />
          <FeatureAdBanner />
          <FeaturedAds data={data?.featuredAds || []} isLoading={isLoading} />
          <CheckoutDemands data={data?.demands || []} isLoading={isLoading} />
          <MobileApps data={data?.mobile || []} isLoading={isLoading} />
          <Laptops data={data?.laptop || []} isLoading={isLoading} />
        </View>

        <View style={{ height: hp('13%') }} />
      </Animated.ScrollView>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: '#fff' },
  parentContainer: {
    flex: 1,
    paddingTop: hp('2%'),
    gap: hp('2.5%'),
  },
  searchContainer: {
    paddingLeft: wp('4%'),
    paddingRight: wp('4%'),
  },
});
