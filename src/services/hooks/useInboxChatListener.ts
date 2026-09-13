import firestore from '@react-native-firebase/firestore';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';

export interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageSenderId: string;
  updatedAt?: FirebaseFirestoreTypes.Timestamp | null;
  unreadCounts?: Record<string, number>; // ✅ Add this line
  receiverName?: string;
  receiverAvatar?: string;
}

export const useInboxListener = (currentUserId: string) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUserId) return;
    console.log('Current UID type:', typeof currentUserId, currentUserId);

    const unsubscribe = firestore()
      .collection('chats')
      .where('participants', 'array-contains', currentUserId.toString())
      .orderBy('updatedAt', 'desc')
      .onSnapshot(async snapshot => {
        try {
          const list: Chat[] = await Promise.all(
            snapshot.docs.map(async doc => {
              const data = doc.data() as Chat;

              // find other participant
              const receiverId = data.participants.find(p => p !== currentUserId);

              // fetch receiver info
              let receiverName = 'Unknown User';
              let receiverAvatar = '';

              if (receiverId) {
                const userDoc = await firestore().collection('users').doc(receiverId).get();
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  receiverName = `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim();
                  receiverAvatar = userData?.avatar || '';
                  console.log('Current UID type:', typeof currentUserId, currentUserId);

                }
              }

              return {
                ...data,
                id: doc.id,
                receiverName,
                receiverAvatar,
              };
            })
          );

          setChats(list);
        } catch (e: any) {
          console.error('🔥 Firestore inbox fetch failed:', e);
          setError(e.message);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, [currentUserId]);

  return { chats, loading, error };
};
