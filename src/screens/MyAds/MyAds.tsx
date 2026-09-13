import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Animated,
  RefreshControl,
  Image,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Header from '../../components/shared/Header';
import ToggleTabs from '../../components/shared/ToggleTabs';
import BottomButton from '../../components/shared/BottomButton';
import CardItem from '../../components/shared/CardItem';
import MyAdsSkeleton from '../../components/Skeleton/MyAdsSkeleton';
import { Colors } from '../../constants/color';
import { useAuthStore } from '../../stores/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserAdsAndDemands,
  deleteAd,
  AdItem,
} from '../../services/api/getUserAdsAndDemands';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const HEADER_MAX_HEIGHT = hp('17%');
const HEADER_MIN_HEIGHT = hp('12%');

const MyAds = () => {
  const [activeTab, setActiveTab] = useState<'postedAds' | 'postedDemands'>('postedAds');
  const [refreshing, setRefreshing] = useState(false);

  const token = useAuthStore((state) => state.token);
  const navigation = useNavigation();
  const queryClient = useQueryClient();

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

  const {
    data: ads = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery<AdItem[]>({
    queryKey: ['user-ads'],
    queryFn: () => getUserAdsAndDemands(token!),
    enabled: !!token,
  });

  useFocusEffect(
    useCallback(() => {
      if (token) refetch();
    }, [token, refetch])
  );

  const mutation = useMutation({
    mutationFn: (adId: number) => deleteAd(adId, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-ads'] });
    },
  });

  const filteredAds = useMemo(() => {
    const type = activeTab === 'postedAds' ? 'ad' : 'demand';
    return ads.filter((item) => item.ad_type_name === type);
  }, [ads, activeTab]);

  const handleDelete = (adId: number) => {
    mutation.mutate(adId);
  };

  // 🔄 Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (e) {
      console.error('❌ Refresh failed:', e);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  return (
    <View style={styles.main}>
      <Header
        type="navigation"
        title="My Ads"
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
        <View style={styles.content}>
          <ToggleTabs
            activeTab={activeTab}
            onTabChange={(value) => setActiveTab(value as 'postedAds' | 'postedDemands')}
            options={[
              { label: 'Ads', value: 'postedAds', icon: 'megaphone-outline' },
              { label: 'Demands', value: 'postedDemands', icon: 'cube-outline' },
            ]}
          />

          {isLoading ? (
            <>
              <MyAdsSkeleton />
              <MyAdsSkeleton />
              <MyAdsSkeleton />
            </>
          ) : isError ? (
            <Text style={{ textAlign: 'center', marginTop: 20 }}>
              ❌ Failed to load ads.
            </Text>
          ) : (
            <FlatList
              data={filteredAds}
              keyExtractor={(item) => item.ad_id.toString()}
              contentContainerStyle={styles.scrollContainer}
              ListEmptyComponent={
  <View style={{ alignItems: 'center', marginTop: 40 }}>
    <Image
      source={require('../../images/noAds_mas.png')} 
      style={{ width: 140, height: 140, resizeMode: 'contain' }}
    />
    <Text
      style={{
        fontSize: 16,
        color: Colors.black,
        fontFamily: 'Poppins-Medium',
        textAlign: 'center',
        paddingHorizontal: 10,
        marginTop: 10,
      }}
    >
      Looks like BuySell Bazaar’s showcase is empty. It's time to post your first{' '}
      {activeTab === 'postedAds' ? 'ad' : 'demand'} and make a trade happen!
    </Text>
  </View>
}

              renderItem={({ item }) => {
                console.log('MyAds -> FlatList item:', item);
                const showRating = activeTab === 'postedAds';
                return (
                  <CardItem
                    adId={item.ad_id}
                    rating={item.rating}
                    onDelete={handleDelete}
                    title={item.title || 'Untitled'}
                    price={
                      item.price
                        ? `Rs ${Number(item.price).toLocaleString('en-PK')}`
                        : 'Not specified'
                    }
                    condition={item.condition || 'N/A'}
                    location={item.city || item.address || 'Location not specified'}
                    image={
                      item.images?.length > 0
                        ? { uri: item.images[0].img_url }
                        : require('../../images/placeholder.jpg')
                    }
                    showRating={showRating}
                    isSold={item.is_sold}
                    onPress={() => {
                      if (activeTab === 'postedAds') {
                        (navigation as any).navigate('AdDisplay', { adId: item.ad_id });
                      } else {
                        (navigation as any).navigate('DemandDisplay', { demandId: item.ad_id });
                      }
                    }}
                    isDemand={activeTab === 'postedDemands'}
                  />
                );
              }}
              scrollEnabled={false}
            />
          )}
        </View>
        <View style={{ height: hp('11%') }} />
      </Animated.ScrollView>

      <BottomButton
        label={activeTab === 'postedAds' ? 'Create New Ad' : 'Create New Demand'}
        onPress={() => (navigation as any).navigate('PostAdOrDemandScreen')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  scrollContainer: {
    paddingBottom: 100,
  },
});

export default MyAds;
