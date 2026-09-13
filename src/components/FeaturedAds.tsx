import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/color';
import AdCardApi from './shared/AdCardApi';
import AdCardSkeleton from './Skeleton/AdCardSkeleton';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';

interface FeaturedAdsProps {
    data: any[];
    isLoading: boolean;
}

const ItemSeparator = () => <View style={{ width: 16 }} />;

const FeaturedAds: React.FC<FeaturedAdsProps> = ({ data, isLoading }) => {
    const [favorites, setFavorites] = useState<Record<number, boolean>>({});
    const navigation = useNavigation<any>();

    const toggleFavorite = (adId: number) => {
        setFavorites((prev) => ({
            ...prev,
            [adId]: !prev[adId]
        }));
    };

    const handleSeeMore = () => {
        navigation.navigate('AllAds', { title: 'Featured Ads', is_featured: true });
    };

    const handleAdPress = (ad: any) => {
        navigation.navigate('AdDisplay', { adId: ad.ad_id });
    };

    const renderItem = useCallback(({ item }: { item: any }) => (
        <AdCardApi
            ad={item}
            isFavorite={!!favorites[item.ad_id]}
            onToggleFavorite={toggleFavorite}
            onPress={handleAdPress}
        />
    ), [favorites, toggleFavorite, handleAdPress]);

    if (isLoading) {
        return (
            <View>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Featured</Text>
                    <TouchableOpacity onPress={handleSeeMore}>
                        <Text style={styles.seeMore}>See More</Text>
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={[1, 2, 3, 4]} // Show 4 skeleton cards
                    keyExtractor={(item) => item.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    ItemSeparatorComponent={ItemSeparator}
                    contentContainerStyle={{ paddingLeft: wp('4%'), paddingRight: wp('4%') }}
                    renderItem={() => <AdCardSkeleton />}
                    removeClippedSubviews={true}
                    initialNumToRender={3}
                    maxToRenderPerBatch={3}
                    windowSize={5}
                />
            </View>
        );
    }

    if (!data || data.length === 0) {
        return (
            <View>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Featured</Text>
                    <TouchableOpacity onPress={handleSeeMore}>
                        <Text style={styles.seeMore}>See More</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.emptyContainer}>
                    <AntDesign name="search1" size={hp('4%')} color={Colors.textSecondary} style={{ marginBottom: hp('0.6%') }} />
                    <Text style={styles.emptyText}>No featured ads to show right now.</Text>
                </View>
            </View>
        );
    }

    return (
        <View>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>Featured</Text>
                <TouchableOpacity onPress={handleSeeMore}>
                    <Text style={styles.seeMore}>See More</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={data}
                keyExtractor={(item) => item.ad_id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                ItemSeparatorComponent={ItemSeparator}
                contentContainerStyle={{ paddingLeft: wp('4%'), paddingRight: wp('4%') }}
                removeClippedSubviews={true}
                initialNumToRender={3}
                maxToRenderPerBatch={3}
                windowSize={5}
                renderItem={renderItem}
            />
        </View>
    );
};

export default FeaturedAds;

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp('1.5%'),
        paddingLeft: wp('4%'),
        paddingRight: wp('4%'),
    },
    title: {
        fontSize: hp('2.3%'),
        // fontWeight: 'bold',
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
    loadingContainer: {
        paddingVertical: hp('4%'),
        alignItems: 'center',
    },
    loadingText: {
        marginTop: hp('1%'),
        fontSize: hp('1.6%'),
        color: Colors.textSecondary,
        fontFamily: "Poppins-Regular",
    },
    errorContainer: {
        paddingVertical: hp('4%'),
        alignItems: 'center',
    },
    errorText: {
        fontSize: hp('1.6%'),
        color: Colors.textSecondary,
        marginBottom: hp('2%'),
        fontFamily: "Poppins-Regular",
    },
    retryButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: wp('4%'),
        paddingVertical: hp('1%'),
        borderRadius: wp('2%'),
    },
    retryText: {
        color: 'white',
        fontSize: hp('1.4%'),
        fontWeight: '500',
        fontFamily: "Poppins-Medium",
    },
    emptyContainer: {
        paddingVertical: hp('3%'),
        alignItems: 'center',
    },
    emptyText: {
        fontSize: hp('1.6%'),
        color: Colors.textSecondary,
        fontFamily: "Poppins-Regular",
    },
});