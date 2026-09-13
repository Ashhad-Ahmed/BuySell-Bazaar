import React, {
  useMemo,
  forwardRef,
  useCallback,
  useState,
  useEffect,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Colors} from '../../constants/color';

type PriceFilterBottomSheetProps = {
  initialMinPrice?: number; // can be undefined
  initialMaxPrice?: number; // can be undefined
  onApply: (minPrice?: number, maxPrice?: number) => void; // <-- optional
};

const PriceFilterBottomSheet = forwardRef<
  BottomSheetModal,
  PriceFilterBottomSheetProps
>(
  (
    {initialMinPrice, initialMaxPrice, onApply},
    ref,
  ) => {
    const snapPoints = useMemo(() => ['60%'], []);
    const insets = useSafeAreaInsets();

    // Keep both the display strings and numeric mirrors
    const [minInputValue, setMinInputValue] = useState(
      initialMinPrice != null ? String(initialMinPrice) : '',
    );
    const [maxInputValue, setMaxInputValue] = useState(
      initialMaxPrice != null ? String(initialMaxPrice) : '',
    );
    const [minPrice, setMinPrice] = useState<number | undefined>(
      initialMinPrice,
    );
    const [maxPrice, setMaxPrice] = useState<number | undefined>(
      initialMaxPrice,
    );

    // Re-sync when parent passes new initial values
    useEffect(() => {
      setMinInputValue(initialMinPrice != null ? String(initialMinPrice) : '');
      setMaxInputValue(initialMaxPrice != null ? String(initialMaxPrice) : '');
      setMinPrice(initialMinPrice);
      setMaxPrice(initialMaxPrice);
    }, [initialMinPrice, initialMaxPrice]);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
          pressBehavior="close"
          style={{zIndex: 9999}}
        />
      ),
      [],
    );

    const priceRanges = [
      {label: 'Under 10K', value: [0, 10000]},
      {label: '10K - 25K', value: [10000, 25000]},
      {label: '25K - 50K', value: [25000, 50000]},
      {label: '50K - 1L', value: [50000, 100000]},
      {label: '1L - 2L', value: [100000, 200000]},
    ];

    const handleQuickSelect = (min: number, max: number) => {
      setMinInputValue(String(min));
      setMaxInputValue(String(max));
      setMinPrice(min);
      setMaxPrice(max);
    };

    const cleanToNumber = (s: string): {text: string; num?: number} => {
      const cleaned = s.replace(/[^0-9]/g, '');
      if (!cleaned) return {text: '', num: undefined};
      const n = parseInt(cleaned, 10);
      return {text: cleaned, num: Number.isNaN(n) ? undefined : n};
    };

    const handleMinInputChange = (text: string) => {
      const {text: cleaned, num} = cleanToNumber(text);
      setMinInputValue(cleaned);
      setMinPrice(num);
    };

    const handleMaxInputChange = (text: string) => {
      const {text: cleaned, num} = cleanToNumber(text);
      setMaxInputValue(cleaned);
      setMaxPrice(num);
    };

    const handleApply = () => {
      let minNum =
        minInputValue.trim() === '' ? undefined : parseInt(minInputValue, 10);
      let maxNum =
        maxInputValue.trim() === '' ? undefined : parseInt(maxInputValue, 10);
      if (Number.isNaN(minNum)) minNum = undefined;
      if (Number.isNaN(maxNum)) maxNum = undefined;

      // Swap only if both exist and min > max
      if (minNum != null && maxNum != null && minNum > maxNum) {
        const t = minNum;
        minNum = maxNum;
        maxNum = t;
      }

      console.log('🧾 Price Filter Apply:', {
        minInputValue,
        maxInputValue,
        minNum,
        maxNum,
        swapped:
          minNum != null && maxNum != null && minNum > maxNum ? 'yes' : 'no',
      });

      onApply(minNum, maxNum); // <-- undefineds will mean “don’t send” in parent
    };

    const handleReset = () => {
      setMinInputValue('');
      setMaxInputValue('');
      setMinPrice(undefined);
      setMaxPrice(undefined);
    };

    const isRangeSelected = minPrice != null || maxPrice != null;

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
        enableDismissOnClose
        containerStyle={{zIndex: 10000}}>
        <BottomSheetView
          style={[styles.sheetContent, {paddingBottom: insets.bottom + 20}]}>
          <Text style={styles.sheetTitle}>Price Range</Text>

          {/* Quick Select Buttons */}
          <View style={styles.quickSelectSection}>
            <Text style={styles.sectionLabel}>Quick Select</Text>
            <View style={styles.quickSelectButtons}>
              {priceRanges.map((range, index) => {
                const [min, max] = range.value;
                const isSelected = minPrice === min && maxPrice === max;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.quickSelectButton,
                      isSelected && styles.quickSelectButtonActive,
                    ]}
                    onPress={() => handleQuickSelect(min, max)}>
                    <Text
                      style={[
                        styles.quickSelectText,
                        isSelected && styles.quickSelectTextActive,
                      ]}>
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Inputs */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Min Price</Text>
              <TextInput
                style={styles.input}
                value={minInputValue}
                onChangeText={handleMinInputChange}
                keyboardType="numeric"
                placeholder="Min"
                placeholderTextColor="#999"
              />
            </View>

            <Text style={styles.separator}>—</Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Max Price</Text>
              <TextInput
                style={styles.input}
                value={maxInputValue}
                onChangeText={handleMaxInputChange}
                keyboardType="numeric"
                placeholder="Max"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Actions */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={handleReset}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.applyButton]}
              onPress={handleApply}>
              <Text style={styles.applyButtonText}>
                {isRangeSelected ? 'Apply Filter' : 'Apply Default'}
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

export default PriceFilterBottomSheet;

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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
    flex: 1,
    backgroundColor: '#fff',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'left',
    color: Colors.textPrimary,
  },
  quickSelectSection: {
    marginBottom: 25,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#666',
    marginBottom: 12,
  },
  quickSelectButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickSelectButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F4F4F4',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quickSelectButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  quickSelectText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  quickSelectTextActive: {
    color: '#fff',
    fontFamily: 'Poppins-Medium',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    backgroundColor: '#F9F9F9',
    color: Colors.textPrimary,
  },
  separator: {
    fontSize: 20,
    color: '#999',
    marginHorizontal: 10,
    marginTop: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    backgroundColor: '#F4F4F4',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 80,
  },
  resetButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#333',
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
