// src/hooks/useChatMessages.ts
import { useEffect, useState, useCallback } from 'react';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  status: string;
  adId?: number; // Optional ad ID for clickable ad links
}

const PAGE_SIZE = 15;

export const useChatMessages = (chatId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<FirebaseFirestoreTypes.DocumentSnapshot | null>(null);

  // ✅ Initial load + listener
  useEffect(() => {
    if (!chatId) return;
    console.log('📡 Listening to messages:', chatId);

    const unsubscribe = firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(PAGE_SIZE)
      .onSnapshot(snapshot => {
        const list: Message[] = snapshot.docs.map(doc => ({
          ...(doc.data() as Message),
          id: doc.id,
        }));
        // Keep in descending order (newest first) for inverted FlatList
        setMessages(list);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        setLoading(false);
      });

    return () => unsubscribe();
  }, [chatId]);

  // ✅ Load older messages
  const loadMore = useCallback(async () => {
    if (!lastVisible || loadingMore) return;
    setLoadingMore(true);

    const snapshot = await firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .startAfter(lastVisible)
      .limit(PAGE_SIZE)
      .get();

    const older = snapshot.docs.map(doc => ({
      ...(doc.data() as Message),
      id: doc.id,
    }));

    // Append older messages to end (they're already in desc order from Firestore)
    setMessages(prev => [...prev, ...older]);
    setLastVisible(snapshot.docs[snapshot.docs.length - 1] || null);
    setLoadingMore(false);
  }, [chatId, lastVisible, loadingMore]);

  return { messages, loading, loadMore, loadingMore };
};
