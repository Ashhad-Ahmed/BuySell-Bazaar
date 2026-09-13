import React, { useState, memo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Colors from '../../constants/color';
import MessageStatus from './MessageStatus';

type Props = {
  message: {
    id: string;
    sender: 'me' | 'other';
    text: string;
    image?: string;
    timestamp?: string;
    status?: 'sending' | 'sent' | 'delivered' | 'read';
    avatar?: string;
    adId?: number; // Optional ad ID for linking
  };
  onImagePress: (imageUrl: string) => void;
  onAdPress?: (adId: number) => void; // Callback for when ad link is pressed
};

const MessageBubble: React.FC<Props> = ({ message, onImagePress, onAdPress }) => {
  const isMe = message.sender === 'me';
  const [loadingImage, setLoadingImage] = useState(false);
  
  // Check if this message has an ad link
  const hasAdLink = !!message.adId;

  // 🕓 Format timestamp
  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <View
      style={[
        styles.messageContainer,
        isMe ? styles.alignRight : styles.alignLeft,
      ]}
    >
      {/* 👤 Avatar (only show on left messages) */}
      {!isMe && (
        <Image
          source={{
            uri:
              message.avatar ||
              'https://cdn-icons-png.flaticon.com/512/149/149071.png',
          }}
          style={styles.avatar}
        />
      )}

      {/* 💬 Message bubble */}
      <View style={[styles.bubbleWrapper, isMe && styles.bubbleWrapperRight]}>
        <View
          style={[
            styles.bubble,
            isMe ? styles.bubbleMe : styles.bubbleOther,
            styles.shadow,
          ]}
        >
          {/* 🖼️ Image message */}
          {message.image && (
            <TouchableOpacity
              onPress={() => onImagePress(message.image!)}
              style={styles.imageWrapper}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: message.image }}
                style={styles.messageImage}
                onLoadStart={() => setLoadingImage(true)}
                onLoadEnd={() => setLoadingImage(false)}
              />
              {loadingImage && (
                <ActivityIndicator
                  size="small"
                  color={Colors.primary}
                  style={styles.imageLoader}
                />
              )}
            </TouchableOpacity>
          )}

          {/* 📝 Text message */}
          {!!message.text && (
            <>
              {hasAdLink ? (
                <TouchableOpacity
                  onPress={() => message.adId && onAdPress?.(message.adId)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.messageText,
                      isMe && styles.messageTextMe,
                      styles.adLinkText,
                    ]}
                  >
                    {message.text}
                  </Text>
                  <View style={styles.adLinkIndicator}>
                    <Text style={styles.adLinkLabel}>📌 Tap to view ad</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <Text
                  style={[styles.messageText, isMe && styles.messageTextMe]}
                  selectable
                >
                  {message.text}
                </Text>
              )}
            </>
          )}

          {/* 🕓 Timestamp & Status */}
          <View style={styles.messageFooter}>
            <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>
            {isMe && message.status && (
              <MessageStatus
                status={message.status}
                size={14}
              />
            )}
          </View>
        </View>

        {/* 🎯 Bubble Tail */}
        <View
          style={[
            styles.bubbleTail,
            isMe ? styles.bubbleTailRight : styles.bubbleTailLeft,
          ]}
        />
      </View>

      {/* 👤 My avatar (optional) */}
      {isMe && (
        <Image
          source={{
            uri:
              message.avatar ||
              'https://cdn-icons-png.flaticon.com/512/219/219983.png',
          }}
          style={styles.avatar}
        />
      )}
    </View>
  );
};

/* 💎 Styles */
const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 14,
    paddingHorizontal: 8,
  },
  alignLeft: { justifyContent: 'flex-start' },
  alignRight: { justifyContent: 'flex-end' },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray,
  },

  bubbleWrapper: {
    maxWidth: '75%',
    position: 'relative',
    marginHorizontal: 8,
  },
  bubbleWrapperRight: {
    alignItems: 'flex-end',
  },

  bubble: {
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  bubbleOther: {
    backgroundColor: Colors.bubbleOther,
    borderBottomLeftRadius: 4,
  },
  bubbleMe: {
    backgroundColor: Colors.bubbleMe,
    borderBottomRightRadius: 4,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },

  messageText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 20,
  },
  messageTextMe: {
    color: Colors.black,
  },
  adLinkText: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  adLinkIndicator: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  adLinkLabel: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },

  messageImage: {
    width: 220,
    height: 150,
    borderRadius: 12,
  },
  imageWrapper: {
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  imageLoader: {
    position: 'absolute',
    alignSelf: 'center',
    top: '40%',
  },

  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  timestamp: {
    fontSize: 11,
    color: Colors.textSecondary,
  },

  bubbleTail: {
    position: 'absolute',
    bottom: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
  },
  bubbleTailLeft: {
    left: -6,
    borderTopWidth: 8,
    borderRightWidth: 8,
    borderTopColor: 'transparent',
    borderRightColor: Colors.bubbleOther,
  },
  bubbleTailRight: {
    right: -6,
    borderTopWidth: 8,
    borderLeftWidth: 8,
    borderTopColor: 'transparent',
    borderLeftColor: Colors.bubbleMe,
  },
});

export default memo(
  MessageBubble,
  (prev, next) =>
    prev.message.id === next.message.id &&
    prev.message.status === next.message.status &&
    prev.message.text === next.message.text &&
    prev.message.image === next.message.image
);
