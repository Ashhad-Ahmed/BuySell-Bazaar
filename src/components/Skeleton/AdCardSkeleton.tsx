import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const AdCardSkeleton: React.FC = () => {
  return (
    <View style={styles.card}>
      {/* Image skeleton */}
      <View style={styles.imageContainer}>
        <View style={styles.imageSkeleton} />
        {/* Heart icon skeleton */}
        <View style={styles.heartIcon} />
      </View>

      {/* Content skeleton */}
      <View style={styles.content}>
        {/* Title skeleton */}
        <View style={styles.titleSkeleton} />
        <View style={styles.titleSkeleton2} />

        {/* Price skeleton */}
        <View style={styles.priceSkeleton} />

        {/* Tags skeleton */}
        <View style={styles.tagRow}>
          <View style={styles.tagSkeleton} />
          <View style={styles.tagSkeleton2} />
        </View>

        {/* Meta info skeleton */}
        <View style={styles.row}>
          <View style={styles.metaSkeleton} />
          <View style={styles.metaSkeleton2} />
        </View>

        {/* Brand and category skeleton */}
        <View style={styles.brandRow}>
          <View style={styles.brandSkeleton} />
          <View style={styles.categorySkeleton} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: wp('43%'),
    borderRadius: wp('2%'),
  },
  imageContainer: {
    position: 'relative',
  },
  imageSkeleton: {
    width: '100%',
    height: hp('20%'),
    borderRadius: wp('2%'),
    backgroundColor: '#E1E9EE',
  },
  heartIcon: {
    position: 'absolute',
    top: hp('1%'),
    right: wp('2%'),
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('5%'),
    backgroundColor: '#E1E9EE',
  },
  content: {
    marginTop: hp('1%'),
  },
  titleSkeleton: {
    width: '90%',
    height: hp('2%'),
    backgroundColor: '#E1E9EE',
    borderRadius: 2,
    marginBottom: hp('0.3%'),
  },
  titleSkeleton2: {
    width: '60%',
    height: hp('2%'),
    backgroundColor: '#E1E9EE',
    borderRadius: 2,
    marginBottom: hp('0.7%'),
  },
  priceSkeleton: {
    width: '40%',
    height: hp('2.2%'),
    backgroundColor: '#E1E9EE',
    borderRadius: 2,
    marginVertical: hp('0.7%'),
  },
  tagRow: {
    flexDirection: 'row',
    gap: wp('2%'),
    marginTop: hp('0.8%'),
  },
  tagSkeleton: {
    width: wp('20%'),
    height: hp('2.5%'),
    borderRadius: wp('6%'),
    backgroundColor: '#E1E9EE',
  },
  tagSkeleton2: {
    width: wp('15%'),
    height: hp('2.5%'),
    borderRadius: wp('6%'),
    backgroundColor: '#E1E9EE',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp('0.7%'),
  },
  metaSkeleton: {
    width: '40%',
    height: hp('1.8%'),
    backgroundColor: '#E1E9EE',
    borderRadius: 2,
  },
  metaSkeleton2: {
    width: '30%',
    height: hp('1.8%'),
    backgroundColor: '#E1E9EE',
    borderRadius: 2,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp('0.5%'),
  },
  brandSkeleton: {
    width: '35%',
    height: hp('1.6%'),
    backgroundColor: '#E1E9EE',
    borderRadius: 2,
  },
  categorySkeleton: {
    width: '40%',
    height: hp('1.6%'),
    backgroundColor: '#E1E9EE',
    borderRadius: 2,
  },
});

export default AdCardSkeleton; 