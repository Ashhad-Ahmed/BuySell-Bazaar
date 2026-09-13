import React, {useState} from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Colors} from '../../constants/color';
import ManageAdModal from '../ManageAdModal';

interface CardItemProps {
  adId: number;
  title: string;
  price: string;
  condition: string;
  location: string;
  image: any;
  rating: number | null;
  onDelete: (adId: number) => void;
  showRating: boolean;
  onPress?: () => void;
  isSold?: number;
  hideMenu?: boolean;
  isDemand?: boolean;
}

const CardItem: React.FC<CardItemProps> = ({
  adId,
  title,
  price,
  condition,
  location,
  image,
  onDelete,
  showRating,
  rating,
  isSold,
  onPress,
  hideMenu = false,
  isDemand,
}) => {
  const [showOptions, setShowOptions] = useState(false);

  const handleDelete = () => {
    onDelete(adId);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => {
        if (onPress) {
          console.log(`Navigating to AdDisplay for adId: ${adId}`);
          onPress();
        }
      }}>
      <View style={styles.card}>
        <Image source={image} style={styles.image} />
        <View style={styles.details}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{title}</Text>
            {!hideMenu && (
              <TouchableOpacity onPress={() => setShowOptions(true)}>
                <Icon name="more-vert" size={20} color={Colors.gray} />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.price}>{price}</Text>

          <View style={styles.row}>
            <Text style={styles.condition}>{condition}</Text>
            {showRating && <Text style={styles.ratingText}>{rating}/10</Text>}
          </View>

          <Text style={styles.location}>{location}</Text>
        </View>

        {!hideMenu && (
          <ManageAdModal
            visible={showOptions}
            onCancel={() => setShowOptions(false)}
            onDelete={handleDelete}
            adId={adId}
            price={price.replace(/^Rs\s*/, '').replace(/,/g, '')}
            isSold={isSold}
            isDemand={isDemand}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 6,
  },
  details: {
    marginLeft: 12,
    flex: 1,
    justifyContent: 'center',
    fontFamily: 'Poppins-Medium',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: '600',
    color: Colors.title,
    fontSize: 15,
    flex: 1,
    marginRight: 6,
    fontFamily: 'Poppins-Medium',
  },
  price: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'Poppins-Medium',
  },
  condition: {
    color: Colors.gray,
    fontSize: 12,
    backgroundColor: Colors.backgroundGray,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    fontFamily: 'Poppins-Medium',
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 6,
    color: Colors.gray,
    backgroundColor: Colors.backgroundGray,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    fontFamily: 'Poppins-Medium',
  },
  location: {
    color: Colors.primary,
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'Poppins-Medium',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
});

export default CardItem;
