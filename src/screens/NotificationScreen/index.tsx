import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Animated,
  Text,
  RefreshControl,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../../components/shared/Header';
import ToggleTabs from '../../components/shared/ToggleTabs';
import NotificationCard from '../../components/NotificationCard';
import { getMyTransactions } from '../../services/api/getTransaction';
import { updateTransactionStatus } from '../../services/mutations/TransactionStatus';
import { getInvoiceByTransactionId } from '../../services/api/getInvoiceByTransactionId';
import { useAuthStore } from '../../stores/authStore';
import { Colors } from '../../constants/color';
import DynamicModal from '../../components/shared/DynamicModal';
import NotificationSkeleton from '../../components/Skeleton/NotificationSkeleton';
import RNFetchBlob from 'react-native-blob-util';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';

type Transaction = {
  transaction_id: number;
  ad_id?: number;
  ad_title?: string;
  thumbnail_url?: string;
  seller_fname?: string;
  seller_lname?: string;
  buyer_fname?: string;
  buyer_lname?: string;
  is_approved?: 'pending' | 'approved' | 'rejected';
};

type TransactionsState = {
  as_buyer: Transaction[];
  as_seller: Transaction[];
};

const HEADER_MAX_HEIGHT = hp('17%');
const HEADER_MIN_HEIGHT = hp('12%');

const NotificationScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('buyer');
  const [transactions, setTransactions] = useState<TransactionsState>({
    as_buyer: [],
    as_seller: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<any>(null);

  const { token } = useAuthStore.getState();
  const scrollY = new Animated.Value(0);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const fadeHeight = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [60, 30],
    extrapolate: 'clamp',
  });

  const clearUnread = useAuthStore(state => state.clearUnread);

  // 🟢 Fetch transactions
  const fetchTransactions = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await getMyTransactions(token);
      setTransactions(response);
    } catch (error) {
      console.error('❌ Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    clearUnread();
  }, [clearUnread]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // 🔄 Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  }, [fetchTransactions]);

  const showModal = (
    text: string,
    onAccept?: () => void,
    iconName: string = 'info',
    singleButton: boolean = false
  ) => {
    setModalData({
      text,
      icon: <Icon name={iconName} size={40} color={Colors.primary} />,
      acceptText: singleButton ? 'OK' : 'Yes',
      rejectText: singleButton ? '' : 'No',
      onAccept: onAccept || (() => setModalVisible(false)),
    });
    setModalVisible(true);
  };

  const handleDownloadInvoice = async (transaction_id: number) => {
    if (!token) return;
    try {
      const res = await getInvoiceByTransactionId(token, transaction_id);
      const url = res?.data?.url || res?.url;
      if (!url) {
        console.log('❌ No invoice URL found');
        return;
      }

      const fileName = `invoice_${transaction_id}.pdf`;
      const dirs = RNFetchBlob.fs.dirs;
      const path = `${dirs.DownloadDir}/${fileName}`;

      RNFetchBlob.config({
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          path: path,
          description: 'Invoice PDF',
        },
      })
        .fetch('GET', url)
        .then(res => console.log('✅ Invoice saved to:', res.path()))
        .catch(err => console.log('❌ Download error:', err));
    } catch (err) {
      console.log('❌ Error fetching invoice URL:', err);
    }
  };

  const updateLocalStatus = (transaction_id: number, status: 'approved' | 'rejected') => {
    setTransactions(prev => ({
      as_buyer: prev.as_buyer.map(t =>
        t.transaction_id === transaction_id ? { ...t, is_approved: status } : t
      ),
      as_seller: prev.as_seller.map(t =>
        t.transaction_id === transaction_id ? { ...t, is_approved: status } : t
      ),
    }));
  };

  const confirmAccept = (transaction_id: number) => {
    showModal('Are you sure you want to accept this offer?', async () => {
      setModalVisible(false);
      try {
        await updateTransactionStatus(transaction_id, token, 'approved');
        updateLocalStatus(transaction_id, 'approved');
        showModal('Offer accepted. Downloading invoice...', () => {}, 'check-circle', true);
        await handleDownloadInvoice(transaction_id);
      } catch {
        showModal('Could not accept the offer.', () => {}, 'error-outline', true);
      }
    }, 'check-circle');
  };

  const confirmReject = (transaction_id: number) => {
    showModal('Are you sure you want to reject this offer?', async () => {
      setModalVisible(false);
      try {
        await updateTransactionStatus(transaction_id, token, 'rejected');
        updateLocalStatus(transaction_id, 'rejected');
        showModal('Offer rejected.', () => {}, 'close', true);
      } catch {
        showModal('Could not reject the offer.', () => {}, 'error-outline', true);
      }
    }, 'close');
  };

  const handleCardPress = (adId?: number) => {
    if (adId) (navigation as any).navigate('AdDisplay', { adId });
  };

  const renderCards = () => {
    const list = activeTab === 'buyer' ? transactions.as_buyer : transactions.as_seller;

   if (!list || list.length === 0) {
  return (
    <View style={{ alignItems: 'center', marginTop: 40 }}>
      <Image
        source={require('../../images/notif_mascot.png')}
        style={{ width: 120, height: 120, resizeMode: 'contain',}}
          />
      <Text style={styles.noListText}>Looks like BuySell Bazaar’s taking a nap, no alerts for now!</Text>
    </View>
  );
}


    return list.map((item, index) => (
      <NotificationCard
        key={index}
        sellerName={`${activeTab === 'buyer' ? item.seller_fname : item.buyer_fname} ${
          activeTab === 'buyer' ? item.seller_lname : item.buyer_lname
        }`}
        itemTitle={item.ad_title || 'Untitled Ad'}
        imageUrl={
          item.thumbnail_url
            ? { uri: item.thumbnail_url }
            : require('../../images/placeholder.jpg')
        }
        text={activeTab === 'buyer' ? 'You got an offer from' : 'You sold the item to'}
        status={item.is_approved || 'pending'}
        showActions={activeTab === 'buyer'}
        onAccept={status => (status === 'pending' ? confirmAccept(item.transaction_id) : null)}
        onReject={status => (status === 'pending' ? confirmReject(item.transaction_id) : null)}
        onPress={() => handleCardPress(item.ad_id)}
      />
    ));
  };

  return (
    <View style={styles.main}>
      <Header
        type="navigation"
        title="Order History"
        icon="arrow-back"
        onPress={() => navigation.goBack()}
        backgroundColor="#fff"
        textColor={Colors.textPrimary}
        iconColor={Colors.textPrimary}
        animatedHeight={headerHeight}
        fadeHeight={fadeHeight}
      />

      <Animated.ScrollView
        contentContainerStyle={styles.container}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        <View style={styles.parentContainer}>
          <View style={styles.toggleTabs}>
            <ToggleTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              options={[
                { label: 'As Buyer', value: 'buyer', icon: 'person-outline' },
                { label: 'As Seller', value: 'seller', icon: 'storefront-outline' },
              ]}
            />
          </View>

          <View style={styles.cards}>
            {loading ? <NotificationSkeleton /> : renderCards()}
          </View>
        </View>

        <View style={{ height: hp('11%') }} />
      </Animated.ScrollView>

      {modalData && (
        <DynamicModal
          visible={modalVisible}
          icon={modalData.icon}
          text={modalData.text}
          onAccept={modalData.onAccept}
          onReject={() => setModalVisible(false)}
          acceptText={modalData.acceptText}
          rejectText={modalData.rejectText}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingBottom: 30,
  },
  noListText: {
    // marginTop: 10,
    paddingHorizontal: 20,
    fontSize: 16,
    color: Colors.black,
    fontFamily: "Poppins-Medium",
    
  },
  parentContainer: {
    flex: 1,
    paddingTop: hp('2%'),
    gap: hp('0.1%'),
  },
  toggleTabs: {
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  cards: {
    marginTop: 10,
  },
});

export default NotificationScreen;
