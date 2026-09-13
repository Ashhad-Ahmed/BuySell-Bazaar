import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
  Dimensions,
  Modal,
  Text,
} from 'react-native';
import ChatItem, { ChatItemProps } from './ChatItem';
import { Colors } from '../../constants/color';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface SwipeableChatItemProps extends ChatItemProps {
  onDelete: (id: string) => void;
  isModalOpen: boolean;
  setModalOpen: (isOpen: boolean) => void;
}

const { width: screenWidth } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;

const SwipeableChatItem: React.FC<SwipeableChatItemProps> = ({
  onDelete,
  isModalOpen,
  setModalOpen,
  ...chatItemProps
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef(0);

  const resetPosition = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start(() => {
      lastOffset.current = 0;
    });
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) =>
      Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10,
    onPanResponderGrant: () => translateX.setOffset(lastOffset.current),
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx <= 0) translateX.setValue(gestureState.dx);
    },
    onPanResponderRelease: (_, gestureState) => {
      translateX.flattenOffset();
      const offset = lastOffset.current + gestureState.dx;
      if (offset < -SWIPE_THRESHOLD) {
        Animated.spring(translateX, {
          toValue: -SWIPE_THRESHOLD,
          useNativeDriver: true,
        }).start(() => {
          lastOffset.current = -SWIPE_THRESHOLD;
        });
      } else {
        resetPosition();
      }
    },
  });

  const confirmDelete = () => {
    Animated.timing(translateX, {
      toValue: -screenWidth,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onDelete(chatItemProps.id);
    });
  };

  return (
    <View style={styles.container}>
      {/* Delete Background */}
      <View style={styles.deleteContainer}>
        <TouchableOpacity
          style={styles.deleteButton}
          activeOpacity={0.7}
          onPress={() => setModalOpen(true)}
        >
          <Icon name="delete" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[styles.chatItemContainer, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <ChatItem {...chatItemProps} />
      </Animated.View>

      {/* Modal */}
      <Modal visible={isModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Are you sure you want to delete this chat?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setModalOpen(false);
                  resetPosition();
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  setModalOpen(false);
                  confirmDelete();
                }}
              >
                <Text style={styles.confirmText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: 'transparent',
    marginBottom: 4,
  },
  deleteContainer: {
    position: 'absolute',
    right: 16,
    top: 4,
    bottom: 4,
    width: SWIPE_THRESHOLD,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    backgroundColor: '#FF5252',
    zIndex: 1,
  },
  deleteButton: {
    backgroundColor: '#FF5252',
    borderRadius: 22,
    padding: 10,
    elevation: 6,
  },
  chatItemContainer: {
    zIndex: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    width: '80%',
    borderRadius: 16,
    elevation: 10,
  },
  modalText: {
    fontSize: 16,
    color: Colors.title,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#ddd',
    borderRadius: 8,
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#FF5252',
    borderRadius: 8,
  },
  cancelText: {
    color: Colors.title,
    fontWeight: '600',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default SwipeableChatItem;
