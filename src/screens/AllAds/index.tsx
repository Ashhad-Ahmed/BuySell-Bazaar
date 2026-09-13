import 'react-native-reanimated';
import 'react-native-gesture-handler';

import React, {useState, useEffect, useRef, useMemo} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Animated,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useRoute, RouteProp, useNavigation} from '@react-navigation/native';
import {BottomSheetModal, BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../../components/shared/Header';
import AllAdsCard from '../../components/AllAds/AllAdsCard';
import AdCardSkeleton from '../../components/shared/AdCardSkeleton';
import FilterBottomSheet from '../../components/shared/FilterBottomSheet';
import PriceFilterBottomSheet from '../../components/shared/PriceFilterBottomSheet';
import RatingFilterBottomSheet from '../../components/shared/RatingFilterBottomSheet';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {getFilteredAds, searchAds} from '../../services/api/getFilteredAds';
import {useAuthStore} from '../../stores/authStore';
import {Ad} from '../../services/api/types';
import {Colors} from '../../constants/color';
import {useMasterData} from '../../services/hooks/useMasterData';

type AllAdsRouteParams = {
  title?: string;
  category_id?: number;
  searchText?: string;
  is_featured?: boolean;
};
type Filters = {
  is_featured?: boolean;
  category_id?: number;
  cities?: string[];
  min_price?: number;
  max_price?: number;
  brand?: number;
  brandName?: string;
  min_rating?: number;
  max_rating?: number;
};

const HEADER_MAX_HEIGHT = hp('17%');
const HEADER_MIN_HEIGHT = hp('12%');

const AllAds = () => {
  const citySheetRef = useRef<BottomSheetModal>(null);
  const priceSheetRef = useRef<BottomSheetModal>(null);
  const brandSheetRef = useRef<BottomSheetModal>(null);
  const ratingSheetRef = useRef<BottomSheetModal>(null);

  const route = useRoute<RouteProp<{params: AllAdsRouteParams}, 'params'>>();
  const navigation = useNavigation<any>();
  const {title, is_featured, category_id, searchText} = route.params || {};
  const {token} = useAuthStore();

  const {data: masterData} = useMasterData();
  const cities = masterData?.cities || [];
  const brands = masterData?.brands || [];

  const cityOptions = useMemo(() => {
    return cities.map(city => ({id: Number(city.value), name: city.label}));
  }, [cities]);

  const brandOptions = useMemo(() => {
    return brands.map(brand => ({id: Number(brand.value), name: brand.label}));
  }, [brands]);

  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [layoutType, setLayoutType] = useState<'grid' | 'list'>('grid');

  const [filters, setFilters] = useState<Filters>({
    is_featured: is_featured || undefined,
    category_id: category_id || undefined,
  });

  const [showStickyFilters, setShowStickyFilters] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const stickyOpacity = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const scrollDirection = useRef<'up' | 'down'>('down');

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

  const fetchAds = async () => {
    if (!token) {
      setError('No authentication token available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Combine search with filters
      const searchFilters = {
        ...filters,
        search_text: searchText || undefined,
      };

      const filteredAdsData = await getFilteredAds(token, searchFilters);

      setAds(filteredAdsData.ads || []);
    } catch (err: any) {
      console.error('Error fetching ads:', err);
      setError(err.message || 'Failed to fetch ads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, [token, filters, searchText]);

  const handleAdPress = (ad?: Ad) => {
    if (ad) navigation.navigate('AdDisplay', {adId: ad.ad_id});
  };

  const handleScroll = Animated.event(
    [{nativeEvent: {contentOffset: {y: scrollY}}}],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const diff = offsetY - lastScrollY.current;

        // Determine scroll direction (with threshold to avoid jitter)
        if (Math.abs(diff) > 2) {
          scrollDirection.current = diff > 0 ? 'down' : 'up';
        }

        // Show sticky filters only when:
        // 1. Scrolled past 100px (filters are out of view)
        // 2. Scrolling UP
        const shouldShow = offsetY > 100 && scrollDirection.current === 'up';

        if (shouldShow !== showStickyFilters) {
          setShowStickyFilters(shouldShow);
          Animated.timing(stickyOpacity, {
            toValue: shouldShow ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }

        lastScrollY.current = offsetY;
      },
    },
  );

  const renderFilterChips = () => {
    const hasCity   = Boolean(filters.cities && filters.cities.length > 0);
    const hasPrice  = filters.min_price != null || filters.max_price != null; // 0 allowed
    const hasBrand  = filters.brand != null;
    const hasRating = filters.min_rating != null || filters.max_rating != null;
  
    const hasAnyFilter = hasCity || hasPrice || hasBrand || hasRating;
  
    return (
      <View style={styles.filterChipsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10 }}
        >
          {/* City Chip */}
          <TouchableOpacity
            style={[styles.chip, hasCity && styles.chipActive]}
            onPress={() => {
              if (hasCity) setFilters(prev => ({ ...prev, cities: undefined }));
              else citySheetRef.current?.present();
            }}
          >
            <Text style={[styles.chipText, hasCity && styles.chipTextActive]}>
              {filters.cities?.[0] || 'City'}
            </Text>
            {hasCity && (
              <Icon name="close" size={16} color="#fff" style={styles.closeIcon} />
            )}
          </TouchableOpacity>
  
          {/* Price Chip */}
          <TouchableOpacity
            style={[styles.chip, hasPrice && styles.chipActive]}
            onPress={() => {
              if (hasPrice) {
                setFilters(prev => {
                  const n = { ...prev };
                  delete n.min_price;
                  delete n.max_price;
                  return n;
                });
              } else {
                priceSheetRef.current?.present();
              }
            }}
          >
            <Text style={[styles.chipText, hasPrice && styles.chipTextActive]}>
              Price
            </Text>
            {hasPrice && (
              <Icon name="close" size={16} color="#fff" style={styles.closeIcon} />
            )}
          </TouchableOpacity>
  
          {/* Brand Chip */}
          <TouchableOpacity
            style={[styles.chip, hasBrand && styles.chipActive]}
            onPress={() => {
              if (hasBrand) {
                setFilters(prev => ({ ...prev, brand: undefined, brandName: undefined }));
              } else {
                brandSheetRef.current?.present();
              }
            }}
          >
            <Text style={[styles.chipText, hasBrand && styles.chipTextActive]}>
              {filters.brandName || 'Brand'}
            </Text>
            {hasBrand && (
              <Icon name="close" size={16} color="#fff" style={styles.closeIcon} />
            )}
          </TouchableOpacity>
  
          {/* Rating Chip */}
          <TouchableOpacity
            style={[styles.chip, hasRating && styles.chipActive]}
            onPress={() => {
              if (hasRating) {
                setFilters(prev => ({ ...prev, min_rating: undefined, max_rating: undefined }));
              } else {
                ratingSheetRef.current?.present();
              }
            }}
          >
            <Text style={[styles.chipText, hasRating && styles.chipTextActive]}>
              Rating
            </Text>
            {hasRating && (
              <Icon name="close" size={16} color="#fff" style={styles.closeIcon} />
            )}
          </TouchableOpacity>
  
          {/* Clear All Chip */}
          {hasAnyFilter ? (
            <TouchableOpacity
              style={[styles.chip, { backgroundColor: '#E0E0E0' }]}
              onPress={() =>
                setFilters({
                  is_featured: is_featured || undefined,
                  category_id: category_id || undefined,
                })
              }
            >
              <Text style={[styles.chipText, { color: '#000' }]}>Clear All</Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      </View>
    );
  };
  
  return (
    <View style={styles.main}>
      <BottomSheetModalProvider>
        <Header
          type="listingsHeader"
          title={title}
          onPress={() => navigation.goBack()}
          onSearchPress={() => navigation.navigate('Search')}
          onLayoutToggle={() =>
            setLayoutType(layoutType === 'grid' ? 'list' : 'grid')
          }
          onSortPress={() => console.log('Sort pressed')}
          layoutType={layoutType}
          animatedHeight={headerHeight}
          fadeHeight={fadeHeight}
        />

        {/* Sticky Filter Chips - Shows when scrolled */}
        {showStickyFilters && (
          <Animated.View
            style={[styles.stickyFilterContainer, {opacity: stickyOpacity}]}>
            {renderFilterChips()}
          </Animated.View>
        )}

        {/* --- Ads List --- */}
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          scrollEventThrottle={16}
          onScroll={handleScroll}
          contentContainerStyle={styles.scrollViewContent}>
          {/* Filter Chips inside scroll - Initial position */}
          {renderFilterChips()}
          {loading ? (
            <FlatList
              data={[1, 2, 3, 4, 5, 6]}
              keyExtractor={item => item.toString()}
              numColumns={2}
              contentContainerStyle={styles.listContainer}
              renderItem={() => (
                <View style={styles.cardWrapper}>
                  <AdCardSkeleton />
                </View>
              )}
              ListFooterComponent={<View style={{height: hp('8%')}} />}
              scrollEnabled={false}
            />
          ) : error ? (
            <Text style={{textAlign: 'center', color: 'red'}}>{error}</Text>
          ) : ads.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Icon name="search-off" size={80} color={Colors.muted} />
              <Text style={styles.emptyStateTitle}>No Ads Found</Text>
              <Text style={styles.emptyStateText}>
                {searchText
                  ? `We couldn't find any ads matching "${searchText}"`
                  : 'No ads match your selected filters. Try adjusting your filters.'}
              </Text>
              {(filters.cities?.length ||
                filters.min_price ||
                filters.brand ||
                filters.min_rating !== undefined ||
                filters.max_rating !== undefined) && (
                <TouchableOpacity
                  style={styles.clearFiltersButton}
                  onPress={() =>
                    setFilters({
                      is_featured: is_featured || undefined,
                      category_id: category_id || undefined,
                    })
                  }>
                  <Text style={styles.clearFiltersButtonText}>
                    Clear All Filters
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsText}>
                  Showing results for:{' '}
                  <Text style={styles.resultsTitle}>{title}</Text>
                </Text>
              </View>
              <FlatList
                key={layoutType}
                data={ads}
                keyExtractor={item => item.ad_id.toString()}
                numColumns={layoutType === 'grid' ? 2 : 1}
                contentContainerStyle={styles.listContainer}
                renderItem={({item}) => (
                  <View style={styles.cardWrapper}>
                    <AllAdsCard
                      ad={item}
                      onPress={handleAdPress}
                      type={layoutType}
                    />
                  </View>
                )}
                ListFooterComponent={<View style={{height: hp('5%')}} />}
                removeClippedSubviews
                maxToRenderPerBatch={10}
                windowSize={10}
                initialNumToRender={6}
                getItemLayout={(data, index) => ({
                  length: 300,
                  offset:
                    300 *
                    (layoutType === 'grid' ? Math.floor(index / 2) : index),
                  index,
                })}
                scrollEnabled={false}
              />
            </>
          )}
        </Animated.ScrollView>

        {/* --- Bottom Sheets --- */}
        <FilterBottomSheet
          ref={citySheetRef}
          title="Select City"
          options={cityOptions}
          onSelect={city => {
            setFilters(prev => ({...prev, cities: [city.name]}));
            citySheetRef.current?.dismiss();
          }}
        />

        <PriceFilterBottomSheet
          ref={priceSheetRef}
          initialMinPrice={filters.min_price} // undefined if not set
          initialMaxPrice={filters.max_price} // undefined if not set
          onApply={(minPrice, maxPrice) => {
            setFilters(prev => {
              const next = {...prev};
              if (minPrice !== undefined) next.min_price = minPrice;
              else delete next.min_price;
              if (maxPrice !== undefined) next.max_price = maxPrice;
              else delete next.max_price;
              return next;
            });
            priceSheetRef.current?.dismiss();
          }}
        />

        <FilterBottomSheet
          ref={brandSheetRef}
          title="Select Brand"
          options={brandOptions}
          onSelect={brand => {
            setFilters(prev => ({
              ...prev,
              brand: brand.id,
              brandName: brand.name,
            }));
            brandSheetRef.current?.dismiss();
          }}
        />

        <RatingFilterBottomSheet
          ref={ratingSheetRef}
          initialMinRating={filters.min_rating || 0}
          initialMaxRating={filters.max_rating || 10}
          onApply={(minRating, maxRating) => {
            setFilters(prev => ({
              ...prev,
              min_rating: minRating > 0 ? minRating : undefined,
              max_rating: maxRating < 10 ? maxRating : undefined,
            }));
            ratingSheetRef.current?.dismiss();
          }}
        />
      </BottomSheetModalProvider>
    </View>
  );
};

export default AllAds;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    backgroundColor: '#fff',
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  cardWrapper: {
    flex: 1,
    margin: 6,
  },
  resultsHeader: {
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    paddingTop: hp('3%'),
  },
  resultsText: {
    fontSize: hp('1.8%'),
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  resultsTitle: {
    fontSize: hp('1.8%'),
    color: '#000',
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
  },
  filterChipsContainer: {
    marginTop: 10,
    marginBottom: 5,
    backgroundColor: '#fff',
  },
  stickyFilterContainer: {
    position: 'absolute',
    top: HEADER_MIN_HEIGHT,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    zIndex: 100,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingBottom: 5,
  },
  chip: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 20,
    paddingVertical: 3.5,
    paddingHorizontal: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: '#49008F',
  },
  chipText: {
    color: '#333',
    fontFamily: 'Poppins-Regular',
    fontSize: hp('1.45%'),
  },
  chipTextActive: {
    color: '#fff',
    fontFamily: 'Poppins-Regular',
    fontSize: hp('1.4%'),
  },
  closeIcon: {
    marginLeft: 2,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp('8%'),
    paddingVertical: hp('10%'),
  },
  emptyStateTitle: {
    fontSize: hp('2.5%'),
    fontFamily: 'Poppins-SemiBold',
    color: Colors.textPrimary,
    marginTop: hp('2%'),
    marginBottom: hp('1%'),
  },
  emptyStateText: {
    fontSize: hp('1.8%'),
    fontFamily: 'Poppins-Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: hp('2.8%'),
  },
  clearFiltersButton: {
    marginTop: hp('3%'),
    backgroundColor: Colors.primary,
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('8%'),
    borderRadius: 25,
  },
  clearFiltersButtonText: {
    color: Colors.white,
    fontSize: hp('1.8%'),
    fontFamily: 'Poppins-Medium',
  },
});
