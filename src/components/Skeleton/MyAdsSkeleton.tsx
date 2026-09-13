// --- MyAdsSkeleton.tsx ---
import React from 'react';
import { View, StyleSheet } from 'react-native';

const MyAdsSkeleton: React.FC = () => {
  return (
    <View style={styles.card}>
      {/* Image placeholder */}
      <View style={styles.imageSkeleton} />

      {/* Text content placeholder */}
      <View style={styles.textContainer}>
        <View style={styles.titleSkeleton} />
        <View style={styles.priceSkeleton} />
        <View style={styles.row}>
          <View style={styles.tagSkeleton} />
          <View style={styles.ratingSkeleton} />
        </View>
        <View style={styles.locationSkeleton} />
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
    width: 90,
    height: 90,
    borderRadius: 6,
    backgroundColor: '#E1E9EE',
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
    justifyContent: 'center',
  },
  titleSkeleton: {
    width: '70%',
    height: 16,
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
    marginBottom: 8,
  },
  priceSkeleton: {
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
    marginBottom: 6,
  },
  tagSkeleton: {
    width: 60,
    height: 18,
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
  },
  ratingSkeleton: {
    width: 40,
    height: 18,
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
  },
  locationSkeleton: {
    width: '60%',
    height: 12,
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
  },
});

export default MyAdsSkeleton;
