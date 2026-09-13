import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../../constants/color';

export interface ChatItemProps {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  avatar: any;
  unreadCount?: number;
  onPress?: () => void;
}

interface ChatItemComponentProps extends ChatItemProps {
  onPress?: () => void;
}

const ChatItem: React.FC<ChatItemComponentProps> = ({
  name,
  lastMessage,
  time,
  avatar,
  unreadCount,
  onPress,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.chatItem}
        onPress={onPress}
        activeOpacity={0.7}>
        <View style={styles.avatarContainer}>
          <Image source={avatar} style={styles.avatar} />
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.topRow}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.time}>{time}</Text>
          </View>
          
          <View style={styles.bottomRow}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {lastMessage}
            </Text>
            {unreadCount && unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>
                  {unreadCount > 99 ? '99+' : unreadCount.toString()}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  chatItem: {
    flexDirection: 'row',
    paddingHorizontal: 2,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    borderRadius: 16,
  },
  avatarContainer: {
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  contentContainer: {
    flex: 1,
    paddingVertical: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 17,
    fontWeight: '500',
    color: Colors.title,
    flex: 1,
    marginRight: 12,
    letterSpacing: -0.2,
  },
  time: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    opacity: 0.8,
    marginRight: 8,
  },
  lastMessage: {
    fontSize: 13,
    color: Colors.muted,
    flex: 1,
    marginRight: 12,
    lineHeight: 20,
    opacity: 0.9,
  },
  unreadBadge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    shadowColor: '#FF6B6B',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  unreadText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

export default ChatItem;