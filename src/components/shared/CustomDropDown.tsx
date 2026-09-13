import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  FlatList,
} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../constants/color';
import { fonts } from '../../config/themes/typography';

export interface DropdownOption {
  label: string;
  value: number | string;
}

interface CustomDropdownProps {
  placeholder?: string;
  options: DropdownOption[];
  value?: string | number;
  onSelect: (value: string | number) => void;
  searchable?: boolean;
  disabled?: boolean;
  style?: any;
  dropdownStyle?: any;
  textStyle?: any;
  placeholderStyle?: any;
}

const { height: screenHeight } = Dimensions.get('window');

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  placeholder = 'Select an option',
  options = [],
  value,
  onSelect,
  searchable = true,
  disabled = false,
  style,
  textStyle,
  placeholderStyle,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [masterOptions, setMasterOptions] = useState<DropdownOption[]>(options);
  const [displayedOptions, setDisplayedOptions] = useState<DropdownOption[]>([]);
  const [visibleCount, setVisibleCount] = useState(11);

  useEffect(() => {
    setMasterOptions(options);
    const filtered = searchText.trim()
      ? options.filter(opt =>
          opt.label.toLowerCase().includes(searchText.toLowerCase())
        )
      : options;
    setDisplayedOptions(filtered.slice(0, 12));
    setVisibleCount(12);
  }, [options]);

  useEffect(() => {
    const filtered = searchText.trim()
      ? masterOptions.filter(opt =>
          opt.label.toLowerCase().includes(searchText.toLowerCase())
        )
      : masterOptions;

    setDisplayedOptions(filtered.slice(0, 12));
    setVisibleCount(12);
  }, [searchText, masterOptions]);

  const applyFilter = (search: string) => {
    const filtered = search.trim()
      ? masterOptions.filter(opt =>
          opt.label.toLowerCase().includes(search.toLowerCase())
        )
      : masterOptions;

    setDisplayedOptions(filtered.slice(0, 12));
    setVisibleCount(12);
  };

  const handleLoadMore = () => {
    const filtered = searchText.trim()
      ? masterOptions.filter(opt =>
          opt.label.toLowerCase().includes(searchText.toLowerCase())
        )
      : masterOptions;

    const newCount = Math.min(visibleCount + 11, filtered.length);
    setDisplayedOptions(filtered.slice(0, newCount));
    setVisibleCount(newCount);
  };

  const openDropdown = () => {
    if (!disabled) setIsVisible(true);
  };

  const closeDropdown = () => {
    setIsVisible(false);
    setSearchText('');
  };

  const handleSelect = (selectedValue: string | number) => {
    onSelect(String(selectedValue));
    closeDropdown();
  };

  const getSelectedLabel = () => {
    const selectedOption = options.find(option => option.value === value);
    return selectedOption ? selectedOption.label : null;
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.dropdownTrigger, disabled && styles.disabled, style]}
        onPress={openDropdown}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <Text
          style={[
            styles.dropdownText,
            !getSelectedLabel() && [styles.placeholder, placeholderStyle],
            textStyle,
          ]}
          numberOfLines={1}
        >
          {getSelectedLabel() || placeholder}
        </Text>
        <Icon
          name={isVisible ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={24}
          color={disabled ? Colors.muted : Colors.gray}
        />
      </TouchableOpacity>

      <Modal
        isVisible={isVisible}
        onBackdropPress={closeDropdown}
        onBackButtonPress={closeDropdown}
        swipeDirection="down"
        style={styles.modal}
        backdropOpacity={0.5}
        useNativeDriverForBackdrop
        propagateSwipe
      >
        <KeyboardAvoidingView
          style={styles.dropdownModal}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeDropdown}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close" size={24} color={Colors.gray} />
            </TouchableOpacity>
          </View>

          {searchable && (
            <View style={styles.searchContainer}>
              <Icon name="search" size={20} color={Colors.muted} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder={placeholder}
                placeholderTextColor={Colors.textPlaceholder}
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>
          )}

          <FlatList
            data={displayedOptions}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.7}
            keyExtractor={(item, index) => `${item.value}-${index}`}
            renderItem={({ item, index }) => {
              const isSelected = value === item.value;
              return (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    isSelected && styles.selectedOption,
                    index === displayedOptions.length - 1 && styles.lastOption,
                  ]}
                  onPress={() => handleSelect(item.value)}
                  activeOpacity={0.6}
                >
                  <View style={styles.optionContent}>
                    <View
                      style={[
                        styles.radioButton,
                        isSelected && styles.radioButtonSelected,
                      ]}
                    >
                      {isSelected && <View style={styles.radioButtonInner} />}
                    </View>
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.selectedOptionText,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.noOptionsContainer}>
                <Text style={styles.noOptionsText}>No options found</Text>
              </View>
            }
            keyboardShouldPersistTaps="handled"
            style={styles.optionsList}
          />
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    minHeight: 35,
  },
  disabled: {
    backgroundColor: Colors.backgroundGray,
    opacity: 0.6,
  },
  dropdownText: {
    fontSize: 12,
    color: Colors.text,
    flex: 1,
    marginRight: 8,
    fontFamily: fonts['Poppins-Regular'],
  },
  placeholder: {
    color: Colors.textPlaceholder,
    fontFamily: fonts['Poppins-Regular'],
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  dropdownModal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    paddingTop: 8,
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.backgroundLight,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    paddingVertical: 12,
    paddingRight: 12,
    fontFamily: fonts['Poppins-Regular'],
  },
  optionsList: {
    flexGrow: 1,
  },
  optionItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  selectedOption: {
    backgroundColor: Colors.backgroundLight,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: Colors.primary,
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
    fontFamily: fonts['Poppins-Regular'],
  },
  selectedOptionText: {
    color: Colors.primary,
    fontWeight: '500',
    fontFamily: fonts['Poppins-Medium'],
  },
  noOptionsContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  noOptionsText: {
    fontSize: 14,
    color: Colors.muted,
    fontFamily: fonts['Poppins-Regular'],
  },
});

export default CustomDropdown;
