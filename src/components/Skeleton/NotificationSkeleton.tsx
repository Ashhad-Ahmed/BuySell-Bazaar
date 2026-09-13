import React from 'react';
import { View, StyleSheet } from 'react-native';

const NotificationSkeleton: React.FC = () => {
  return (
    <View style={styles.card}>
      {/* Image placeholder */}
      <View style={styles.imageSkeleton} />

      {/* Text content placeholder */}
      <View style={styles.textContainer}>
        <View style={styles.nameSkeleton} />
        <View style={styles.titleSkeleton} />
        <View style={styles.statusSkeleton} />
        <View style={styles.row}>
          <View style={styles.acceptButtonSkeleton} />
          <View style={styles.rejectButtonSkeleton} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  imageSkeleton: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: '#E1E9EE',
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
    justifyContent: 'center',
  },
  nameSkeleton: {
    width: '50%',
    height: 14,
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
    marginBottom: 6,
  },
  titleSkeleton: {
    width: '70%',
    height: 16,
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
    marginBottom: 8,
  },
  statusSkeleton: {
    width: '50%',
    height: 14,
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  acceptButtonSkeleton: {
    width: '45%',
    height: 36,
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
  },
  rejectButtonSkeleton: {
    width: '45%',
    height: 36,
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
  },
});

export default NotificationSkeleton;
