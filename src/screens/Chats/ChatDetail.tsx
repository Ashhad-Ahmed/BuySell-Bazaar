import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view'; // ⬅️ add this
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../constants/color';
import MessageBubble from '../../components/chatsComponents/MessageBubble';
import ChatInput from '../../components/chatsComponents/ChatInput';
import TypingDots from '../../components/chatsComponents/TypingDots';
import { useAuthStore } from '../../stores/authStore';
import { useChatMessages } from '../../services/chat/useChatMessages';
import { sendMessage } from '../../services/chat/sendMessage';
import { resetUnreadCount, markMessagesAsSeen } from '../../utils/chatUtils';

const ChatDetail = ({ route, navigation }: any) => {
  const { chatId, receiverId, receiverName, adId, adTitle, adPrice } = route.params;
  const currentUser = useAuthStore(state => state.user);
  const currentUserId = currentUser?.id?.toString() || '';
  const flatListRef = useRef<any>(null);
  const { messages, loading, loadMore, loadingMore } = useChatMessages(chatId);
  
  const [inputText, setInputText] = useState('');
  const [isReceiverTyping, setIsReceiverTyping] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [currentAdId, setCurrentAdId] = useState<number | undefined>(adId); // Track ad ID for first message only

  const [receiverAvatar, setReceiverAvatar] = useState<string | null>(null);

// 🧠 Fetch receiver's avatar from Firestore once
useEffect(() => {
  const fetchReceiver = async () => {
    try {
      const doc = await firestore().collection('users').doc(receiverId.toString()).get();
      if (doc.exists()) {
        const data = doc.data();
        setReceiverAvatar(data?.avatar || null);
      }
    } catch (err) {
      console.error('❌ Failed to fetch receiver avatar:', err);
    }
  };

  if (receiverId) fetchReceiver();
}, [receiverId]);

  // 📝 Pre-fill input with ad details if coming from an ad
  useEffect(() => {
    if (adTitle && adPrice !== undefined) {
      const prefilledMessage = `Hi, I'm interested in "${adTitle}" - Rs. ${adPrice.toLocaleString()}`;
      setInputText(prefilledMessage);
    }
  }, []); // Empty dependency array - only run once on mount


  // ✅ Reset unread & mark as seen
  useEffect(() => {
    if (chatId && currentUserId) {
      resetUnreadCount(chatId, currentUserId);
      markMessagesAsSeen(chatId, currentUserId);
    }
  }, [chatId, currentUserId]);

  // 🔥 Listen to typing state in real-time
  useEffect(() => {
    if (!chatId || !receiverId) return;

    const unsubscribe = firestore()
      .collection('chats')
      .doc(chatId)
      .onSnapshot(doc => {
        const data = doc.data();
        if (data?.typing) {
          setIsReceiverTyping(!!data.typing[receiverId.toString()]);
        }
      });

    return () => unsubscribe();
  }, [chatId, receiverId]);

  // 🔥 Update typing state in Firestore
  const handleTypingChange = (isTyping: boolean) => {
    if (!chatId || !currentUserId) return;

    firestore()
      .collection('chats')
      .doc(chatId)
      .set(
        {
          typing: {
            [currentUserId]: isTyping,
          },
        },
        { merge: true }
      )
      .catch(err => console.error('Failed to update typing state:', err));
  };
  
  const handleSend = async (text: string) => {
    if (!text.trim() || !currentUserId || sendingMessage) return;
  
    const trimmed = text.trim();
    setInputText('');
    setSendingMessage(true);
  
    try {
      // Send to Firestore - listener will add it to UI automatically
      // Pass adId only for the first message (if it exists)
      await sendMessage(currentUserId, receiverId.toString(), trimmed, currentAdId);
      
      // Clear adId after first message so subsequent messages won't have the link
      if (currentAdId) {
        setCurrentAdId(undefined);
      }
    } catch (err) {
      console.error('❌ Message failed:', err);
      // Optionally show error toast
    } finally {
      setSendingMessage(false);
    }
  }; 
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current?._listRef?.scrollToOffset) {
      flatListRef.current._listRef.scrollToOffset({ offset: 0, animated: true });
    }
  }, [messages.length]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
  
      {/* ✅ HEADER */}
      <View style={styles.chatHeader}>
  <TouchableOpacity onPress={() => navigation.goBack()}>
    <Icon name="arrow-back" size={28} color={Colors.primary} />
  </TouchableOpacity>

  {/* Avatar + Name Row */}
  <View style={styles.chatHeaderContent}>
    {receiverAvatar ? (
      <Image source={{ uri: receiverAvatar }} style={styles.avatar} />
    ) : (
      <View style={[styles.avatar, styles.placeholderAvatar]}>
        <Icon name="person" size={22} color={Colors.white} />
      </View>
    )}
    <Text style={styles.name}>{receiverName}</Text>
  </View>
</View>

  
      {/* ✅ MAIN CHAT BODY */}
      <View style={styles.flex}>
        <KeyboardAwareFlatList
          ref={flatListRef}
          data={messages}
          inverted
          renderItem={({ item }) => (
            <MessageBubble
              message={{
                id: item.id,
                sender: item.senderId === currentUserId ? 'me' : 'other',
                text: item.text,
                timestamp: (
                  item.createdAt instanceof Date
                    ? item.createdAt
                    : item.createdAt?.toDate?.()
                ) ?.toISOString(),                
                status: item.status,
                adId: item.adId, // Pass adId if exists
              }}
              onImagePress={() => {}}
              onAdPress={(adId: number) => {
                // Navigate to ad when user taps on ad link
                navigation.navigate('AdDisplay', { adId });
              }}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            <>
              {loadingMore && (
                <ActivityIndicator color={Colors.primary} style={{ marginVertical: 10 }} />
              )}
            </>
          }
          ListHeaderComponent={
            <>
              {isReceiverTyping && (
                <View style={styles.typingBubble}>
                  <TypingDots />
                </View>
              )}
            </>
          }
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          enableAutomaticScroll={Platform.OS === 'ios'}
          extraScrollHeight={0}
          extraHeight={0}
        />
  
        {/* ✅ INPUT */}
        <ChatInput 
          inputText={inputText} 
          onChangeText={setInputText} 
          onSend={handleSend}
          onTypingChange={handleTypingChange}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.white,
  },
  flex: { flex: 1 },
  chatBody: {
    flex: 1,              // 🔹 Ensures FlatList fills the remaining space
    backgroundColor: Colors.white,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },  
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: Colors.gray,
  },
  placeholderAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
    chatHeaderContent: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 10,
    },
    name: { fontSize: 20, fontWeight: '600', color: Colors.primary },
    typingBubble: {
      alignSelf: 'flex-start',
      backgroundColor: '#F0F0F0',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginHorizontal: 16,
      marginBottom: 8,
    },
});


export default ChatDetail;
