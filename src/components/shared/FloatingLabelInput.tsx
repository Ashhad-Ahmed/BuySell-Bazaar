// components/shared/FloatingLabelInput.tsx
import React, {useState, useEffect, useRef} from 'react';
import {View, TextInput, Animated, StyleSheet} from 'react-native';
import {Colors} from '../../constants/color';

interface Props {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  keyboardType?: string;
  editable?: boolean;
  onBlur?: () => void;
  style?: any;
}

const FloatingLabelInput: React.FC<Props> = ({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  editable = true,
  onBlur,
  style,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: isFocused || value ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    position: 'absolute' as const,
    left: 18,
    top: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [22, -8], 
    }),
    fontSize: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [15, 11], 
    }),
    color: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [Colors.muted, Colors.primary],
    }),
    fontFamily: 'Poppins-Medium',
    backgroundColor: Colors.white,
    paddingHorizontal: 4,
  };

  return (
    <View style={[styles.container, style]}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      <TextInput
        value={value}
        editable={editable}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          onBlur?.();
        }}
        onChangeText={onChangeText}
        style={styles.input}
        keyboardType={keyboardType as any}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 60,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.white,
  },
  input: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'Poppins-Medium',
    paddingVertical: 6,
  },
});

export default FloatingLabelInput;
