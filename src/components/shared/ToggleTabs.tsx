// components/shared/ToggleTabs.tsx
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors} from '../../constants/color';
import {fonts} from '../../config/themes/typography';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';

interface TabOption {
  label: string;
  value: string;
  icon: string;
}

interface ToggleTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  options: TabOption[];
}

const ToggleTabs: React.FC<ToggleTabsProps> = ({
  activeTab,
  onTabChange,
  options,
}) => {
  return (
    <View style={styles.container}>
      {options.map(option => {
        const isActive = activeTab === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.tabButton,
              isActive ? styles.activeButton : styles.inactiveButton,
            ]}
            onPress={() => onTabChange(option.value)}>
            <Icon
              name={option.icon}
              size={16}
              color={isActive ? Colors.white : Colors.primary}
              style={{marginRight: 6}}
            />
            <Text
              style={[
                styles.buttonText,
                {color: isActive ? Colors.white : Colors.primary},
              ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: wp('4%'),
  },

  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 10,
    marginHorizontal: wp('1%'),
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: wp('5%'),
    flex: 1,
    maxWidth: wp('44%'),
  },

  activeButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  inactiveButton: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
  },
  buttonText: {
    fontSize: 13, // Same as Button.tsx
    fontWeight: '400', // Same as Button.tsx
    fontFamily: fonts['Poppins-Regular'],
  },
});

export default ToggleTabs;
