import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Colors, Theme } from '../../constants/color';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { formatDescriptionAsParagraphs } from '../../constants/helperFunctions';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Linking } from 'react-native';

interface ProductCardProps {
  price: number;
  model: string;
  userRating: string;
  aiRating: string;
  location: string;
  postedOn: string;
  userDescription: string;
  aiDescription?: string;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  latitude: number;
  longitude: number;
}

const MAX_DESC_LENGTH = 250;

const ProductCard: React.FC<ProductCardProps> = ({
  price,
  model,
  userRating,
  aiRating,
  location,
  postedOn,
  userDescription,
  aiDescription = '',
  modalVisible,
  setModalVisible,
  latitude,
  longitude,
}) => {
  const [activeTab, setActiveTab] = useState<'user' | 'ai'>('user');

  const description = activeTab === 'user' ? userDescription : aiDescription;
  const rating = activeTab === 'user' ? userRating : aiRating;
  const heading = activeTab === 'user' ? 'User Specifications' : 'AI Specifications';

  const isTruncated = description.length > MAX_DESC_LENGTH;
  const truncatedText = isTruncated
    ? description.slice(0, MAX_DESC_LENGTH) + '...'
    : description;

  const toggleTab = () => {
    setActiveTab(prev => (prev === 'user' ? 'ai' : 'user'));
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionHeading}>{heading}</Text>
        <TouchableOpacity onPress={toggleTab} style={styles.toggleButton}>
          <Icon
            name={activeTab === 'user' ? 'sparkles' : 'person'}
            size={18}
            color={Colors.white}
          />
          <Text style={styles.toggleLabel}>
            {activeTab === 'user' ? 'AI View' : 'User View'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.detailsRow}><Text style={styles.label}>Price:</Text><Text style={styles.value}>Rs. {price.toFixed(2)}</Text></View>
        <View style={styles.detailsRow}><Text style={styles.label}>Model:</Text><Text style={styles.value}>{model}</Text></View>
        <View style={styles.detailsRow}><Text style={styles.label}>Rating:</Text><Text style={styles.value}>{rating}</Text></View>
        <View style={styles.detailsRow}><Text style={styles.label}>Location:</Text><Text style={styles.value}>{location.length > 30 ? location.slice(0, 30) + '...' : location}</Text></View>
        <View style={styles.detailsRow}><Text style={styles.label}>Posted on:</Text><Text style={styles.value}>{postedOn}</Text></View>
        
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={styles.descTitle}>
          {activeTab === 'user' ? 'User Generated Description' : 'AI Generated Description'}
        </Text>
        <Text style={styles.descText}>
          {truncatedText}{' '}
          {isTruncated && (
            <Text style={styles.readMore} onPress={() => setModalVisible(true)}>
              Read more
            </Text>
          )}
        </Text>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeading}>Description</Text>
            <ScrollView>
              <Text style={styles.modalText}>{formatDescriptionAsParagraphs(description)}</Text>
            </ScrollView>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '110%',
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    alignSelf: 'center',
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 18,
    color: Colors.primary,
    fontFamily: 'Poppins-SemiBold',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  toggleLabel: {
    color: Colors.white,
    fontSize: 13,
    marginLeft: 6,
    fontFamily: 'Poppins-Medium',
    marginBottom:'-4%',
  },
  infoContainer: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: Colors.backgroundGray,
    marginBottom: 12,
  },
  
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    color: Colors.black,
    fontSize: 13,
  },
  value: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  locationButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  locationButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  descriptionContainer: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.backgroundGray,
    marginTop: 4,
  },
  
  descTitle: {
    fontSize: 18,
    // fontWeight: '700',
    color: Colors.primary,
    marginBottom: 6,
    fontFamily: 'Poppins-SemiBold',
  },
  descText: {
    fontSize: 14,
    color: Colors.black,
    fontFamily: 'Poppins-Regular',
  },
  readMore: {
    color: Colors.primary,
    fontFamily: 'Poppins-Medium',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    color: Colors.primary,
    lineHeight: 22,
  },
  closeButton: {
    marginTop: 20,
    alignSelf: 'flex-end',
  },
  closeButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ProductCard;
