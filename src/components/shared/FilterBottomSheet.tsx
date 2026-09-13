import React, { useMemo, forwardRef, useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../constants/color';

type FilterBottomSheetProps = {
  title: string;
  options: (string | { id: number; name: string; value?: any })[];
  onSelect: (value: any) => void;
};

const FilterBottomSheet = forwardRef<BottomSheetModal, FilterBottomSheetProps>(
  ({ title, options, onSelect }, ref) => {
    const snapPoints = useMemo(() => ['50%', '75%'], []);
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const ITEM_HEIGHT = 50;
    const INITIAL_RENDER_COUNT = 20;

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop 
          {...props} 
          disappearsOnIndex={-1} 
          appearsOnIndex={0}
          opacity={0.5}
          pressBehavior="close"
          style={{ zIndex: 9999 }}
        />
      ),
      []
    );

    const filteredOptions = useMemo(() => {
      if (!searchQuery.trim()) return options;
      
      const query = searchQuery.toLowerCase();
      return options.filter((opt) => {
        const label = typeof opt === 'string' ? opt : opt.name;
        return label.toLowerCase().includes(query);
      });
    }, [options, searchQuery]);

    const handleSheetChanges = useCallback((index: number) => {
      if (index === -1) {
        setSearchQuery('');
      }
    }, []);

    const renderItem = useCallback(({ item }: { item: any }) => {
      const label = typeof item === 'string' ? item : item.name;
      return (
        <TouchableOpacity
          style={styles.option}
          onPress={() => {
            onSelect(item);
            setSearchQuery('');
          }}
        >
          <Text style={styles.optionText}>{label}</Text>
        </TouchableOpacity>
      );
    }, [onSelect]);

    const getItemLayout = useCallback(
      (_: any, index: number) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      }),
      []
    );

    const keyExtractor = useCallback((item: any, index: number) => {
      if (typeof item === 'string') {
        return `option-${item}-${index}`;
      }
      return `option-${item.id || item.name}-${index}`;
    }, []);

    const ListEmptyComponent = useCallback(() => (
      <View style={styles.noResultsContainer}>
        <Text style={styles.noResultsText}>No results found</Text>
      </View>
    ), []);

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
        enableDismissOnClose={true}
        containerStyle={{ zIndex: 10000 }}
        enableDynamicSizing={false}
        enableContentPanningGesture={true}
        enableHandlePanningGesture={true}
        android_keyboardInputMode="adjustResize"
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        onChange={handleSheetChanges}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.sheetTitle}>{title}</Text>
          
          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${title.toLowerCase()}...`}
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="clear" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <BottomSheetFlatList
          data={filteredOptions}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          ListEmptyComponent={ListEmptyComponent}
          contentContainerStyle={[
            styles.scrollViewContent,
            { paddingBottom: insets.bottom + 20 }
          ]}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={15}
          windowSize={10}
          initialNumToRender={INITIAL_RENDER_COUNT}
          updateCellsBatchingPeriod={50}
        />
      </BottomSheetModal>
    );
  }
);

export default FilterBottomSheet;

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleIndicator: {
    backgroundColor: '#ccc',
    width: 40,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: '#fff',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 15,
    color: Colors.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 5,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    paddingVertical: 0,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
  },
  option: {
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderColor: '#ddd',
    minHeight: 50,
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: Colors.textPrimary,
  },
  noResultsContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    fontSize: 15,
    color: '#999',
    fontFamily: 'Poppins-Regular',
  },
});
