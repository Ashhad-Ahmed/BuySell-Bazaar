import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../constants/color';
import { useNavigation } from '@react-navigation/native';

interface ProfileWarningProps {
  message?: string;
}

const ProfileWarning: React.FC<ProfileWarningProps> = ({
  message = 'Please complete your profile to post ads, create demands, or chat with other users.',
}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Icon name="warning" size={18} color={'#ffbf50ff'} />
      <Text style={styles.text}>
        {message}{' '}
        <TouchableOpacity onPress={() => navigation.navigate('User')}>
          <Text style={styles.link}>Complete Profile</Text>
        </TouchableOpacity>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffeeba',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 6,
  },
  text: {
    marginLeft: 8,
    color: '#856404',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    flexWrap: 'wrap',
    fontFamily: "Poppins-Medium",

  },
  link: {
    color: '#856404',
    fontWeight: '600',
    textDecorationLine: 'underline',
    fontFamily: "Poppins-Medium",

  },
});

export default ProfileWarning;
