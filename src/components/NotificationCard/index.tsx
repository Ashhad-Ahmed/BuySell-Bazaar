import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Colors } from '../../constants/color';
import { fonts } from '../../config/themes/typography';

interface Props {
  sellerName: string;
  itemTitle: string;
  imageUrl: any;
  status: string;
  onAccept?: (status: string) => void;
  onReject?: (status: string) => void;
  showActions?: boolean;
  text?: string;
  onPress?: () => void;
}

const NotificationCard: React.FC<Props> = ({
  sellerName,
  itemTitle,
  imageUrl,
  text,
  status,
  onAccept,
  onReject,
  showActions = false,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.row}>
        <Image source={imageUrl} style={styles.image} resizeMode="cover" />
        <View style={styles.textContainer}>
          <Text style={styles.message}>
            {text} <Text style={styles.bold}>{sellerName}</Text>
          </Text>
          <Text style={styles.itemTitle}>Item: {itemTitle}</Text>
          <Text style={styles.status}>
            Status: <Text style={styles.statusValue}>{status}</Text>
          </Text>
        </View>
      </View>

      {/* ✅ Show action buttons only if status is "pending" */}
      {showActions && status === 'pending' && (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() => onReject?.(status)}
          >
            <Text style={styles.rejectText}>Reject</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => onAccept?.(status)}
          >
            <Text style={styles.acceptText}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 15,
    marginVertical: 6,
    shadowColor: Colors.black,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
    marginHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 15,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: 15,
    color: Colors.text,
    marginBottom: 4,
    fontFamily: fonts['Poppins-Regular'],
  },
  bold: {
    fontWeight: '600',
    color: Colors.black,
    fontFamily: fonts['Poppins-SemiBold'],
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.title,
    fontFamily: fonts['Poppins-SemiBold'],
  },
  status: {
    fontSize: 14,
    marginTop: 5,
    color: '#888',
    fontFamily: fonts['Poppins-Regular'],
  },
  statusValue: {
    color: Colors.primary,
    fontWeight: '500',
    fontFamily: fonts['Poppins-Medium'],
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  acceptBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  rejectBtn: {
    backgroundColor: '#eee',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  acceptText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
    fontFamily: fonts['Poppins-SemiBold'],
  },
  rejectText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 15,
    fontFamily: fonts['Poppins-SemiBold'],
  },
});

export default NotificationCard;
