import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, TextInput, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
  } from 'react-native-responsive-screen';
  
import Header from '../../components/shared/Header';
import SearchBar from '../../components/searchBar';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../constants/color';
import { searchAds } from '../../services/api/getFilteredAds';
import { useAuthStore } from '../../stores/authStore';

const SEARCH_HISTORY_KEY = 'search_history';
const HEADER_MAX_HEIGHT = hp('17%');
const HEADER_MIN_HEIGHT = hp('12%');

const SearchScreen = ({ navigation }: { navigation: any }) => {
  const [search, setSearch] = useState('');
  const [recent, setRecent] = useState<Array<{id: string, text: string}>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { token } = useAuthStore();
  const searchInputRef = useRef<TextInput>(null);
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

  // Load search history from AsyncStorage on component mount
  useEffect(() => {
    loadSearchHistory();
  }, []);

  // Auto-focus search bar and open keyboard when screen opens
  useEffect(() => {
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100); // Small delay to ensure component is fully mounted

    return () => clearTimeout(timer);
  }, []);

  const loadSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (history) {
        setRecent(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  const saveSearchHistory = async (searchHistory: any[]) => {
    try {
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  const clearAll = async () => {
    try {
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
      setRecent([]);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  };

  const removeRecent = async (id: string) => {
    const updatedRecent = recent.filter(item => item.id !== id);
    setRecent(updatedRecent);
    await saveSearchHistory(updatedRecent);
  };

  const handleSearch = async (searchText: string) => {
    if (!searchText.trim()) {
      Alert.alert('Error', 'Please enter a search term');
      return;
    }

    if (!token) {
      Alert.alert('Error', 'Authentication required');
      return;
    }

    try {
      setIsSearching(true);
      
      // Add to recent searches if not already there
      const searchExists = recent.find(item => item.text.toLowerCase() === searchText.toLowerCase());
      if (!searchExists) {
        const newSearch = { id: Date.now().toString(), text: searchText };
        const updatedRecent = [newSearch, ...recent.slice(0, 4)]; // Keep only last 5 searches
        setRecent(updatedRecent);
        await saveSearchHistory(updatedRecent);
      }

      // Navigate to AllAds with search results
      navigation.navigate('AllAds', {
        title: `Search: ${searchText}`,
        searchText: searchText
      });
      
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleRecentSearch = (searchText: string) => {
    setSearch(searchText);
    handleSearch(searchText);
  };

  return (
    <View style={styles.main}>
      <Header
        type="navigation"
        title="Search"
        icon="arrow-back"
        onPress={() => navigation.goBack()}
        backgroundColor="#fff"
        textColor={Colors.textPrimary}
        iconColor={Colors.textPrimary}
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
      >
        <View style={styles.parentContainer}>
          <View style={styles.searchBarRow}>
            <View style={{ flex: 1 }}>
              <SearchBar
                placeholder="I want to find ..."
                leftIcon="search"
                rightIcon="filter-outline"
                value={search}
                onChangeText={setSearch}
                returnKeyType="search"
                onSubmitEditing={() => handleSearch(search)}
                ref={searchInputRef}
              />
            </View>
          </View>

          {recent.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent searches</Text>
                <TouchableOpacity onPress={clearAll}>
                  <Text style={styles.clearAll}>Clear all</Text>
                </TouchableOpacity>
              </View>
              {recent.map(item => (
                <TouchableOpacity key={item.id} style={styles.recentRow} onPress={() => handleRecentSearch(item.text)}>
                  <Icon name="history" size={18} color={Colors.textSecondary} />
                  <Text style={styles.recentText}>{item.text}</Text>
                  <TouchableOpacity onPress={() => removeRecent(item.id)}>
                    <Icon name="close" size={18} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        <View style={{ height: hp('11%') }} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#fff',
  },
  parentContainer: {
    flex: 1,
    paddingTop: hp('2%'),
    gap: hp('2.5%'),
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: wp('4%'),
    marginBottom: 0,
  },
  section: {
    marginHorizontal: wp('4%'),
    marginTop: hp('1%'),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  sectionTitle: {
    fontWeight: '600',
    fontSize: hp('1.8%'),
    color: Colors.textPrimary,
  },
  clearAll: {
    color: Colors.textPrimary,
    fontWeight: '500',
    fontSize: hp('1.7%'),
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1%'),
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  recentText: {
    flex: 1,
    marginLeft: wp('3%'),
    color: Colors.textPrimary,
    fontSize: hp('1.8%'),
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
  

export default SearchScreen;