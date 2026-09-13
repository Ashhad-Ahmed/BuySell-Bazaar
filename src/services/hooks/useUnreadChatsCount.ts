import { useState, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import { useAuthStore } from '../../stores/authStore';

/**
 * Hook to get total unread message count across all chats
 * Listens to Firestore in real-time
 */
export const useUnreadChatsCount = (): number => {
  const [unreadCount, setUnreadCount] = useState(0);
  const currentUserId = useAuthStore(state => state.user?.id?.toString());

  useEffect(() => {
    if (!currentUserId) {
      setUnreadCount(0);
      return;
    }

    // Listen to all chats where current user is a participant
    const unsubscribe = firestore()
      .collection('chats')
      .where('participants', 'array-contains', currentUserId)
      .onSnapshot(
        (snapshot) => {
          let totalUnread = 0;

          snapshot.forEach((doc) => {
            const data = doc.data();
            const userUnreadCount = data.unreadCounts?.[currentUserId] || 0;
            totalUnread += userUnreadCount;
          });

          setUnreadCount(totalUnread);
          console.log('📬 Total unread messages:', totalUnread);
        },
        (error) => {
          console.error('❌ Error listening to unread counts:', error);
        }
      );

    return () => unsubscribe();
  }, [currentUserId]);

  return unreadCount;
};

