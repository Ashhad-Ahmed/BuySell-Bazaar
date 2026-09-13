import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../constants/color';

const { width, height } = Dimensions.get('window');
const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

interface ProductImageProps {
  images: (string | { uri: string })[];
  showFavoriteIcon?: boolean;
  onBackPress?: () => void;
}

const ProductImage: React.FC<ProductImageProps> = ({
  images = [],
  showFavoriteIcon = true,
  onBackPress,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const flatListRef = useRef<FlatList<any>>(null);
  const modalListRef = useRef<FlatList<any>>(null);

  const parsedImages = images.map((img) => (typeof img === 'string' ? img : img.uri));

  const scrollToIndex = (index: number) => {
    if (flatListRef.current && index >= 0 && index < parsedImages.length) {
      flatListRef.current.scrollToIndex({ index, animated: true });
      setActiveIndex(index);
    }
  };

  const handleImagePress = (index: number) => {
    setActiveIndex(index);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={parsedImages}
        horizontal
        pagingEnabled
        keyExtractor={(_, index) => index.toString()}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setActiveIndex(index);
        }}
        renderItem={({ item, index }) => (
          <TouchableOpacity activeOpacity={0.9} onPress={() => handleImagePress(index)}>
            <Image 
              source={{ uri: item }} 
              style={styles.image}
              onError={(error) => console.log('Image loading error:', error)}
              defaultSource={require('../../images/placeholder.jpg')}
            />
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
      />

      {/* Back and Favorite Icons */}
      <View style={styles.topIcons}>
        <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
          <Icon name="keyboard-arrow-left" size={24} color="#000" />
        </TouchableOpacity>

        {showFavoriteIcon && (
          <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)} style={styles.iconButton}>
            <Icon
              name={isFavorite ? 'favorite' : 'favorite-border'}
              size={22}
              color={isFavorite ? '#ff4757' : '#000'}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Dots */}
      {parsedImages.length > 1 && (
        <View style={styles.dotContainer}>
          {parsedImages.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dot,
                activeIndex === index ? styles.activeDot : styles.inactiveDot,
              ]}
              onPress={() => scrollToIndex(index)}
            />
          ))}
        </View>
      )}

      {/* Fullscreen Modal */}
      <Modal visible={modalVisible} transparent>
        <View style={styles.modalContainer}>
          <FlatList
            ref={modalListRef}
            data={parsedImages}
            horizontal
            pagingEnabled
            initialScrollIndex={activeIndex >= 0 && activeIndex < parsedImages.length ? activeIndex : 0}
            keyExtractor={(_, index) => index.toString()}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            renderItem={({ item }) => (
              <Image 
                source={{ uri: item }} 
                style={styles.fullscreenImage} 
                resizeMode="contain"
                onError={(error) => console.log('Fullscreen image loading error:', error)}
                defaultSource={require('../../images/placeholder.jpg')}
              />
            )}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setActiveIndex(index);
            }}
          />

          <TouchableOpacity
            style={styles.closeIcon}
            onPress={() => setModalVisible(false)}
          >
            <Icon name="close" size={28} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: height * 0.7,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    backgroundColor: Colors.black,
    paddingTop: statusBarHeight,
    marginTop: -statusBarHeight,
  },
  image: {
    width: width,
    height: height * 0.6,
    resizeMode: 'contain',
  },
  topIcons: {
    position: 'absolute',
    top: statusBarHeight + 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    padding: 0,
  },
  dotContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.white,
  },
  inactiveDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  fullscreenImage: {
    width: width,
    height: height,
  },
  closeIcon: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 6,
    borderRadius: 20,
  },
});

export default ProductImage;
