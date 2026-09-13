import React, { useMemo, forwardRef, useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/color';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RangeSlider from 'rn-range-slider';

type RatingFilterBottomSheetProps = {
  initialMinRating?: number;
  initialMaxRating?: number;
  onApply: (minRating: number, maxRating: number) => void;
};

const RatingFilterBottomSheet = forwardRef<BottomSheetModal, RatingFilterBottomSheetProps>(
  ({ initialMinRating = 0, initialMaxRating = 10, onApply }, ref) => {
    const snapPoints = useMemo(() => ['50%'], []);
    const insets = useSafeAreaInsets();
    
    const [minRating, setMinRating] = useState(initialMinRating);
    const [maxRating, setMaxRating] = useState(initialMaxRating);

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

    const handleValueChange = useCallback((low: number, high: number) => {
      setMinRating(low);
      setMaxRating(high);
    }, []);

    const handleApply = () => {
      onApply(minRating, maxRating);
    };

    const handleReset = () => {
      setMinRating(0);
      setMaxRating(10);
    };

    const renderThumb = useCallback(() => {
      return <View style={styles.thumb} />;
    }, []);

    const renderRail = useCallback(() => {
      return <View style={styles.rail} />;
    }, []);

    const renderRailSelected = useCallback(() => {
      return <View style={styles.railSelected} />;
    }, []);

    const renderStars = (count: number) => {
      return (
        <View style={styles.starsRow}>
          {[...Array(Math.min(count, 10))].map((_, index) => (
            <Icon
              key={index}
              name="star"
              size={16}
              color="#FFB800"
            />
          ))}
        </View>
      );
    };

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
      >
        <BottomSheetView style={[styles.sheetContent, { paddingBottom: insets.bottom + 20 }]}>
          <Text style={styles.sheetTitle}>Filter by Rating</Text>

          {/* Current Selection Display */}
          
        
          {/* Dual Range Slider */}
          <View style={styles.sliderSection}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>Rating Range</Text>
              <View style={styles.ratingBadgesContainer}>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingValue}>{minRating}</Text>
                </View>
                <Text style={styles.ratingSeparator}>-</Text>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingValue}>{maxRating}</Text>
                </View>
              </View>
            </View>
            <RangeSlider
              style={styles.rangeSlider}
              min={0}
              max={10}
              step={1}
              low={minRating}
              high={maxRating}
              onValueChanged={handleValueChange}
              renderThumb={renderThumb}
              renderRail={renderRail}
              renderRailSelected={renderRailSelected}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>0</Text>
              <Text style={styles.sliderLabelText}>10</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={handleReset}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.applyButton]}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

export default RatingFilterBottomSheet;

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
  sheetContent: {
    padding: 20,
    paddingTop: 10,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.textPrimary,
  },
  selectionDisplay: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  selectionText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.primary,
    marginBottom: 8,
  },
  starsDisplay: {
    flexDirection: 'row',
    gap: 3,
  },
  sliderSection: {
    marginBottom: 25,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sliderLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: Colors.textPrimary,
  },
  ratingBadgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  ratingValue: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  ratingSeparator: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: Colors.textPrimary,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  rangeSlider: {
    width: '100%',
    height: 40,
    marginVertical: 10,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  rail: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
  },
  railSelected: {
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  sliderLabelText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#999',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 80,
  },
  resetButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#666',
  },
  applyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 80,
  },
  applyButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
});

