import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Colors from '../../constants/color';

interface MessageStatusProps {
  status: 'sending' | 'sent' | 'delivered' | 'read';
  size?: number;
}

const MessageStatus: React.FC<MessageStatusProps> = ({ status, size = 16 }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return 'schedule';
      case 'sent':
        return 'check';
      case 'delivered':
        return 'done';
      case 'read':
        return 'done-all';
      default:
        return 'schedule';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'sending':
        return Colors.textSecondary || Colors.text;
      case 'sent':
        return Colors.textSecondary || Colors.text;
      case 'delivered':
        return Colors.textSecondary || Colors.text;
      case 'read':
        return Colors.primary;
      default:
        return Colors.textSecondary || Colors.text;
    }
  };

  return (
    <View style={styles.container}>
      <Icon 
        name={getStatusIcon()} 
        size={size} 
        color={getStatusColor()} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MessageStatus;
