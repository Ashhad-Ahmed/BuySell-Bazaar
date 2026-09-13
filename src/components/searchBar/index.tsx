import React, { forwardRef } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../../constants/color';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

interface SearchBarProps {
  placeholder: string;
  leftIcon?: string;
  rightIcon?: string;
  onPress?: () => void;
  editable?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onSubmitEditing?: () => void;
}

const SearchBar = forwardRef<TextInput, SearchBarProps>(({ 
  placeholder, 
  leftIcon, 
  rightIcon, 
  onPress,
  editable = true ,
  value,
  onChangeText,
  returnKeyType = 'done',
  onSubmitEditing,
}, ref) => {
  if (onPress) {
    return (
      <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
        {leftIcon && (
          <Icon name={leftIcon} size={20} color="#6c7a92" style={styles.leftIcon} />
        )}
        <TextInput
          style={[styles.input, { color: '#6c7a92' }]}
          placeholder={placeholder}
          placeholderTextColor="#6c7a92"
          editable={false}
        />
        {/* {rightIcon && (
          <Icon name={rightIcon} size={20} color="#6c7a92" style={styles.rightIcon} />
        )} */}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {leftIcon && (
        <Icon name={leftIcon} size={20} color="#6c7a92" style={styles.leftIcon} />
      )}
      <TextInput
        ref={ref}
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#6c7a92"
        editable={editable}
        value={value}
        onChangeText={onChangeText}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
      />
      {/* {rightIcon && (
        <Icon name={rightIcon} size={20} color="#6c7a92" style={styles.rightIcon} />
      )} */}
    </View>
  );
});

SearchBar.displayName = 'SearchBar';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 58,
    paddingHorizontal: wp('4%'),
    backgroundColor: '#ffffff',
    height: hp('5.5%'),
  },
  leftIcon: {
    marginRight: wp('1%'),
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontFamily: "Poppins-Regular",
    fontSize: hp('1.5%'),
    marginBottom: hp('-0.4%'),
  },
  rightIcon: {
    marginLeft: wp('1%'),
  },
});

export default SearchBar;