// src/utils/chatUtils.ts
import firestore from '@react-native-firebase/firestore';

export const resetUnreadCount = async (chatId: string, userId: string) => {
  try {
    await firestore()
      .collection('chats')
      .doc(chatId)
      .update({
        [`unreadCounts.${userId}`]: 0,
      });
    console.log('✅ Unread count reset for user:', userId);
  } catch (error) {
    console.error('Error resetting unread count:', error);
  }
};


export const markMessagesAsSeen = async (chatId: string, currentUserId: string) => {
  try {
    const q = firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .where('receiverId', '==', currentUserId)
      .where('status', 'in', ['sent', 'delivered']); // mark only incoming, not mine

    const snap = await q.get();
    if (snap.empty) {
      console.log('👁️ Marked 0 messages as seen');
      return;
    }

    const batch = firestore().batch();
    snap.forEach(doc => batch.update(doc.ref, { status: 'read' }));
    await batch.commit();

    console.log(`👁️ Marked ${snap.size} messages as seen`);
  } catch (error) {
    console.error('❌ Error marking messages as seen:', error);
  }
};
