import firestore from '@react-native-firebase/firestore';
import { useAuthStore } from '../../stores/authStore';

/**
 * Send a message between two users.
 * Automatically creates chat document (if not exists)
 * and adds the message in its messages subcollection.
 * 
 * ✅ Returns the Firestore message ID to support optimistic UI updates.
 */
export const sendMessage = async (
  senderId: string,
  receiverId: string,
  text: string,
  adId?: number // Optional ad ID for linking to ads
): Promise<string> => {
  if (!text.trim() || !senderId || !receiverId) return '';

  try {
    const sortedIds = [senderId, receiverId].sort();
    const chatId = sortedIds.join('_');
    const chatRef = firestore().collection('chats').doc(chatId);
    const msgRef = chatRef.collection('messages').doc(); // 👈 create a new Firestore message doc
    const sender = useAuthStore.getState().user;
const receiver = await firestore().collection('users').doc(receiverId).get();
const receiverData = receiver.data();

    await firestore().runTransaction(async (transaction) => {
      // 📨 Add message
      const messageData: any = {
        senderId,
        receiverId,
        text,
        createdAt: firestore.FieldValue.serverTimestamp(),
        status: 'sent',
      };
      
      // Add adId if provided (for clickable ad links)
      if (adId) {
        messageData.adId = adId;
      }
      
      transaction.set(msgRef, messageData);

      // 🧩 Ensure participants array is always valid
      const participants = Array.from(new Set([senderId, receiverId].filter(Boolean))).sort();

      // 🗂️ Create or update chat document
      transaction.set(
        chatRef,
        {
          participants,
          lastMessage: text,
          lastMessageSenderId: senderId,
          updatedAt: firestore.FieldValue.serverTimestamp(),
      
          // 🔥 add this
          receiverName: receiverData?.firstName + " " + (receiverData?.lastName || ""),
          receiverAvatar: receiverData?.avatar || null,
          senderName: sender.firstName + " " + (sender.lastName || ""),
          senderAvatar: sender.avatar || null,
      
          unreadCounts: {
            [receiverId]: firestore.FieldValue.increment(1),
          },
        },
        { merge: true }
      );
    });

    console.log('✅ Message sent successfully →', msgRef.id);
    return msgRef.id; // ✅ return the actual Firestore message ID
  } catch (error) {
    console.error('❌ Error sending message:', error);
    throw error;
  }
};
