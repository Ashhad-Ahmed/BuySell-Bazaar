import React, { useState, useCallback, useEffect } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  ListRenderItem,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  RefreshControl, 
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Swipeable } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../constants/color';
import { useInboxListener, Chat } from '../../services/hooks/useInboxChatListener';
import { useAuthStore } from '../../stores/authStore';
import { firestore } from '../../firebase/firebaseConfig';
import TypingDots from './TypingDots';
import DynamicModal from '../shared/DynamicModal';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';

const defaultAvatar = require('../../images/avatar.png');
const { height } = Dimensions.get('window');

const SkeletonRow: React.FC<{ delay: number }> = ({ delay }) => {
  const shimmerOpacity = useSharedValue(0.3);

  useEffect(() => {
    shimmerOpacity.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmerOpacity.value, [0.3, 1, 0.3], [0.3, 1, 0.3]),
  }));

  return <Animated.View style={[styles.skeletonRow, animatedStyle]} />;
};

interface ChatListProps {
  currentUserId: string;
  onScroll?: (...args: any[]) => void;
  scrollEventThrottle?: number;
}

const ChatList: React.FC<ChatListProps> = ({
  currentUserId,
  onScroll,
  scrollEventThrottle = 16,
}) => {
  const navigation = useNavigation<any>();
  const [activeModalId, setActiveModalId] = useState<string | null>(null);
  const { chats, loading, error } = useInboxListener(currentUserId);
  const [typingStates, setTypingStates] = useState<Record<string, boolean>>({});
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false); 

  useEffect(() => {
    if (!chats.length) return;

    const unsubscribers = chats.map(chat =>
      firestore
        .collection('chats')
        .doc(chat.id)
        .onSnapshot(doc => {
          const data = doc.data();
          if (data?.typing) {
            const isOtherUserTyping = chat.participants.some(
              participantId =>
                participantId !== currentUserId && data.typing[participantId] === true
            );

            setTypingStates(prev => ({
              ...prev,
              [chat.id]: isOtherUserTyping,
            }));
          }
        })
    );

    return () => unsubscribers.forEach(unsub => unsub());
  }, [chats, currentUserId]);

  const handleChatPress = (chat: Chat) => {
    const currentUserId = useAuthStore.getState().user?.id?.toString();
    const receiverId = chat.participants.find(id => id !== currentUserId);

    navigation.navigate('ChatDetail', {
      chatId: chat.id,
      receiverId,
      receiverName: chat.receiverName || '',
    });
  };

  const handleDeleteChat = useCallback((chatId: string) => {
    setSelectedChatId(chatId);
    setDeleteModalVisible(true);
  }, []);

  const confirmDeleteChat = async () => {
    if (!selectedChatId) return;
    try {
      await firestore.collection('chats').doc(selectedChatId).delete();
      console.log('🗑️ Chat deleted:', selectedChatId);
    } catch (error) {
      console.error('Error deleting chat:', error);
    } finally {
      setDeleteModalVisible(false);
      setSelectedChatId(null);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {

      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setRefreshing(false);
    }
  }, []);

  const renderRightActions = (chatId: string) => (
    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteChat(chatId)}>
      <Icon name="delete" size={24} color={Colors.white} />
      <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
  );

  const renderChatItem: ListRenderItem<Chat> = ({ item }) => {
    const unreadCount = item.unreadCounts?.[currentUserId] || 0;
    const isTyping = typingStates[item.id] || false;

    return (
      <Swipeable renderRightActions={() => renderRightActions(item.id)} overshootRight={false}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleChatPress(item)}
          style={[styles.chatItem, unreadCount > 0 && styles.unreadChatItem]}
        >
          <Image
            source={item.receiverAvatar ? { uri: item.receiverAvatar } : defaultAvatar}
            style={styles.avatar}
          />

          <View style={styles.chatContent}>
            <View style={styles.chatHeader}>
              <Text
                style={[styles.chatName, unreadCount > 0 && styles.unreadChatName]}
                numberOfLines={1}
              >
                {item.receiverName || 'Unknown User'}
              </Text>
              <Text style={styles.chatTime}>
                {item.updatedAt
                  ? item.updatedAt
                      .toDate()
                      .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : ''}
              </Text>
            </View>

            <View style={styles.messageRow}>
              {isTyping ? (
                <View>
                  <TypingDots />
                  <Text>typing...</Text>
                </View>
              ) : (
                <Text
                  style={[styles.chatMessage, unreadCount > 0 && styles.unreadChatMessage]}
                  numberOfLines={1}
                >
                  {item.lastMessage || 'Say hi 👋'}
                </Text>
              )}

              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{unreadCount}</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  if (loading) {
    return (
      <View style={styles.skeletonContainer}>
        {[1, 2, 3, 4, 5].map(n => (
          <SkeletonRow key={n} delay={n * 200} />
        ))}
      </View>
    );
  }

  if (!chats.length) {
    return (
      <View style={styles.emptyContainer}>
  <Text style={styles.emptyTitle}>No Messages Yet</Text>

  <Image
    source={require('../../images/message_mas.png')} 
    style={{
      width: 120,
      height: 120,
      resizeMode: 'contain',
      marginTop: 20,
    }}
  />
    <Text style={styles.emptySubtitle}>
      Start chatting with sellers and buyers, your conversations will appear here.
    </Text>
</View>

    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]} // Android
            tintColor={Colors.primary} // iOS
          />
        }
      />

      <DynamicModal
        visible={deleteModalVisible}
        icon={<Icon name="delete" size={48} color={Colors.red} />}
        text="Are you sure you want to delete this conversation? This action cannot be undone."
        acceptText="Delete"
        rejectText="Cancel"
        onAccept={confirmDeleteChat}
        onReject={() => setDeleteModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: height * 0.1,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    marginHorizontal: 10,
    marginVertical: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    maxWidth: '70%',
    fontFamily: Platform.OS === 'ios' ? 'Poppins-Medium' : 'Poppins-Medium',
  },
  chatTime: {
    fontSize: 12,
    color: Colors.gray,
    fontFamily: Platform.OS === 'ios' ? 'Poppins-Regular' : 'Poppins-Regular',
  },
  chatMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Poppins-Regular' : 'Poppins-Regular',
  },
  separator: { height: 0 },
  skeletonContainer: { padding: 20 },
  skeletonRow: {
    height: 72,
    borderRadius: 12,
    backgroundColor: '#E1E9EE',
    marginBottom: 12,
    marginHorizontal: 10,
  },
  emptyContainer: {
    marginTop: hp('15%'),
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.black,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily:'Poppins-Medium',
  },
  unreadChatItem: { backgroundColor: Colors.white },
  unreadChatName: { color: Colors.primary, fontWeight: '700' },
  unreadChatMessage: { color: Colors.text, fontWeight: '700' },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: Colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginVertical: 2,
    marginRight: 10,
    borderRadius: 8,
  },
  deleteText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});

export default ChatList;
