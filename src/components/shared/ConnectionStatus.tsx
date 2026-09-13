import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Colors from '../../constants/color';

interface ConnectionStatusProps {
  isConnected: boolean;
  isReconnecting: boolean;
  connectionStatus: string;
  onRetry?: () => void;
  showDetails?: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  isReconnecting,
  connectionStatus,
  onRetry,
  showDetails = false,
}) => {
  const getStatusColor = () => {
    if (isConnected) return Colors.green;
    if (isReconnecting) return Colors.orange;
    return Colors.red;
  };

  const getStatusIcon = () => {
    if (isConnected) return 'wifi';
    if (isReconnecting) return 'wifi-off';
    return 'wifi-off';
  };

  const getStatusText = () => {
    if (isConnected) return 'Connected';
    if (isReconnecting) return 'Reconnecting...';
    return 'Disconnected';
  };

  if (isConnected && !showDetails) {
    return null; // Don't show anything when connected unless details are requested
  }

  return (
    <View style={[styles.container, { backgroundColor: getStatusColor() }]}>
      <View style={styles.content}>
        <Icon name={getStatusIcon()} size={16} color={Colors.white} />
        <Text style={styles.statusText}>{getStatusText()}</Text>
        
        {showDetails && (
          <Text style={styles.detailsText}>{connectionStatus}</Text>
        )}
        
        {!isConnected && !isReconnecting && onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Icon name="refresh" size={16} color={Colors.white} />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  statusText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  detailsText: {
    color: Colors.white,
    fontSize: 12,
    opacity: 0.8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
  },
  retryText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ConnectionStatus;
