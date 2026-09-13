import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Colors from '../constants/color';
import {categories} from '../data/categories';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

interface CategoryItemProps {
  item: any; // Replace 'any' with the correct type if available
  onPress: (category: any) => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({item, onPress}) => (
  <TouchableOpacity style={styles.categoryItem} onPress={() => onPress(item)}>
    <Image source={item.Image} style={styles.image} />
    <Text style={styles.categoryText}>{item.name}</Text>
  </TouchableOpacity>
);

const ItemSeparator = () => <View style={{width: 24}} />; // Gap between items

const BrowseCategories = () => {
  const navigation = useNavigation<any>();

  const handleCategoryPress = (category: any) => {
    navigation.navigate('AllAds', {
      title: category.name,
      category_id: category.id,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Browse Categories</Text>
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          keyExtractor={item => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={ItemSeparator}
          removeClippedSubviews={true}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
          contentContainerStyle={{
            paddingLeft: wp('4%'),
            paddingRight: wp('4%'),
          }}
          renderItem={({item}) => (
            <CategoryItem item={item} onPress={handleCategoryPress} />
          )}
        />
      </View>
    </View>
  );
};

export default BrowseCategories;

const styles = StyleSheet.create({
  container: {
    // paddingHorizontal: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: wp('4%'),
    paddingRight: wp('4%'),
  },
  title: {
    fontSize: hp('2.3%'),
    fontFamily: "Poppins-SemiBold",
    color: Colors.textPrimary,
  },
  seeMore: {
    fontSize: hp('1.5%'),
    fontWeight: '500',
    color: Colors.textPrimary,
    textDecorationLine: 'underline',
    fontFamily: "Poppins-Medium",
  },
  categoriesContainer: {
    marginTop: hp('1.5%'),
  },
  categoryItem: {
    alignItems: 'center',
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 34,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#000',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    fontFamily: "Poppins-Regular",
  },
});
