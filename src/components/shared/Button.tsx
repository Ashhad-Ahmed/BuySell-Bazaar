import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../constants/color';
import { fonts } from '../../config/themes/typography';

interface ButtonProps {
  text: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  text,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
  textStyle,
  icon,
}) => {
  const getButtonStyle = () => {
    const baseStyle: ViewStyle[] = [styles.button];
    
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primary);
        break;
      case 'secondary':
        baseStyle.push(styles.secondary);
        break;
      default:
        baseStyle.push(styles.primary);
    }

    if (disabled || loading) {
      baseStyle.push(styles.disabled);
    }

    if (style) {
      baseStyle.push(style);
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseTextStyle: TextStyle[] = [styles.text];
    
    switch (variant) {
      case 'primary':
        baseTextStyle.push(styles.primaryText);
        break;
      case 'secondary':
        baseTextStyle.push(styles.secondaryText);
        break;
      default:
        baseTextStyle.push(styles.primaryText);
    }

    if (disabled || loading) {
      baseTextStyle.push(styles.disabledText);
    }

    if (textStyle) {
      baseTextStyle.push(textStyle);
    }

    return baseTextStyle;
  };

  const renderButtonContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          color={variant === 'primary' ? Colors.white : Colors.primary}
          size="small"
        />
      );
    }

    return (
      <View style={styles.content}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={getTextStyle()}>{text}</Text>
      </View>
    );
  };

  if (variant === 'primary' && !disabled && !loading) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
                 <LinearGradient
           colors={[Colors.primary, '#20447A']} // Primary to lighter blue (matching Auth.tsx)
           start={{ x: 0, y: 0 }}
           end={{ x: 1, y: 0 }}
           style={[styles.button, styles.primary, style]}
         >
          {renderButtonContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {renderButtonContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999, // Full rounded radius
    flexDirection: 'row',
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  iconContainer: {
    marginRight: 8,
  },

  primary: {
    borderColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
  },

  text: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '400',
    fontFamily: fonts['Poppins-Medium'],
  },

  primaryText: {
    color: Colors.white,
  },
  secondaryText: {
    color: Colors.primary,
  },

  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: Colors.muted,
  },
});

export default Button;