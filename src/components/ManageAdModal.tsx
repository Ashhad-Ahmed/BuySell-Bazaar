import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../constants/color';
import { useAuthStore } from '../stores/authStore';
import { getUserByEmail } from '../services/api/getUserByEmail';
import { markAdAsSold } from '../services/mutations/invoice';
import DynamicModal from './shared/DynamicModal';
import { useQueryClient } from '@tanstack/react-query';
import LottieView from 'lottie-react-native';

const { height } = Dimensions.get('window');

interface ManageAdOptionsModalProps {
  visible: boolean;
  onCancel: () => void;
  onDelete: () => void;
  adId: number;
  price: string;
  isSold?: number;
  isDemand?: boolean;
}

const ManageAdModal: React.FC<ManageAdOptionsModalProps> = ({
  visible,
  onCancel,
  onDelete,
  adId,
  price: priceProp,
  isSold,
  isDemand,
}) => {
  const [showEmailDrawer, setShowEmailDrawer] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [buyer_email, setBuyerEmail] = useState('');
  const [fetchedUser, setFetchedUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [markingSold, setMarkingSold] = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(priceProp);
  const [savingPrice, setSavingPrice] = useState(false);
  const priceInputRef = useRef<TextInput>(null);
  const drawerAnim = useRef(new Animated.Value(height)).current;
  const token = useAuthStore((state) => state.token);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<{
    text: string;
    icon: React.ReactNode;
    acceptText: string;
    onAccept: () => void;
  } | null>(null);

  const queryClient = useQueryClient();

  const showSingleButtonModal = (
    text: string,
    iconName: string = 'info',
    onOk: () => void = () => {}
  ) => {
    setModalData({
      text,
      icon: <Icon name={iconName} size={40} color={Colors.primary} />,
      acceptText: 'OK',
      onAccept: () => {
        setModalVisible(false);
        onOk();
      },
    });
    setModalVisible(true);
  };

  useEffect(() => {
    Animated.timing(drawerAnim, {
      toValue: visible && showEmailDrawer ? 0 : height,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible, showEmailDrawer, drawerAnim]);

  const fetchUserDetails = useCallback(
    async (email: string) => {
      try {
        setLoadingUser(true);
        const res = await getUserByEmail(token, email);
        setFetchedUser(res);
      } catch (error) {
        console.error('Error fetching user:', error);
        setFetchedUser(null);
      } finally {
        setLoadingUser(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (buyer_email.trim().endsWith('.com')) {
      fetchUserDetails(buyer_email.trim());
    } else {
      setFetchedUser(null);
    }
  }, [buyer_email, fetchUserDetails]);

  const handleConfirmMarkSold = async () => {
    if (!buyer_email || !buyer_email.includes('@') || !buyer_email.endsWith('.com')) {
      showSingleButtonModal(
        'Please enter a valid buyer email before confirming.',
        'info'
      );
      return;
    }

    if (isSold === 1) {
      showSingleButtonModal(
        'This ad is already marked as sold. Contact the team for more info.',
        'info',
        resetState
      );
      return;
    }

    try {
      setMarkingSold(true);
      const numericPrice = parseFloat(currentPrice.replace(/,/g, ''));
      console.log(`🔢 Converted price "${currentPrice}" to float:`, numericPrice);

      const res = await markAdAsSold(adId, token, buyer_email, numericPrice);
      showSingleButtonModal('Ad marked as sold!', 'check-circle', resetState);
    } catch (err: any) {
      console.error('❌ Failed to mark ad as sold:', err);

      if (
        err?.response?.status === 400 ||
        err?.message?.includes('already sold')
      ) {
        showSingleButtonModal(
          'This ad is already marked as sold. Contact the team for more info.',
          'info',
          resetState
        );
      } else {
        showSingleButtonModal('Could not mark ad as sold. Try again.', 'error');
      }
    } finally {
      setMarkingSold(false);
    }
  };

  const resetState = () => {
    setBuyerEmail('');
    setShowEmailDrawer(false);
    setShowDeleteConfirm(false);
    setFetchedUser(null);
    onCancel();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={resetState}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.wrapper}
        >
          {!showEmailDrawer && !showDeleteConfirm && (
            <View style={styles.modal}>
              <Text style={styles.title}>What would you like to do?</Text>
              <Text style={styles.subtitle}>Choose an action for this post.</Text>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => setShowDeleteConfirm(true)}
              >
                <Text style={styles.primaryButtonText}>Delete Post</Text>
              </TouchableOpacity>

             {!isDemand && (
          <TouchableOpacity
            style={[styles.primaryButton]}
            onPress={() => setShowEmailDrawer(true)}
          >
            <Text style={styles.primaryButtonText}>Mark as Sold</Text>
          </TouchableOpacity>
        )}


              <TouchableOpacity onPress={resetState}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          {showDeleteConfirm && (
            <View style={styles.modal}>
              <Text style={styles.title}>Are you sure?</Text>
              <Text style={styles.subtitle}>
                You won’t be able to undo this action.
              </Text>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  onDelete();
                  resetState();
                }}
              >
                <Text style={styles.primaryButtonText}>Confirm Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={resetState}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>

        {/* Bottom Drawer */}
        <Animated.View
          style={[styles.drawer, { transform: [{ translateY: drawerAnim }] }]}
        >
         <View style={{ flex: 1, maxHeight: height * 0.8 }}>
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
              <Text style={styles.drawerTitle}>Buyer’s Email Address</Text>

              <TextInput
                style={styles.input}
                placeholder="Enter buyer's email"
                placeholderTextColor="#aaa"
                keyboardType="email-address"
                autoCapitalize="none"
                value={buyer_email}
                onChangeText={(text) => setBuyerEmail(text)}
              />

              <View style={styles.priceView}>
                <Text style={styles.drawerLabel}>Price</Text>
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => {
                    if (editingPrice) {
                      priceInputRef.current?.focus();
                    }
                  }}
                >
                  <View style={styles.priceRow}>
                    {editingPrice ? (
                      <>
                        <Text style={styles.pricePrefix}>Rs</Text>
                        <TextInput
                          ref={priceInputRef}
                          style={[styles.priceInput]}
                          keyboardType="numeric"
                          value={currentPrice}
                          onChangeText={setCurrentPrice}
                        />
                      </>
                    ) : (
                      <Text style={styles.priceText}>
                        Rs{' '}
                        {Number(
                          currentPrice.replace(/,/g, '')
                        ).toLocaleString()}
                      </Text>
                    )}

                    <TouchableOpacity
                      onPress={async () => {
                        if (editingPrice) {
                          setSavingPrice(true);
                          try {
                            // await updateAdPrice(adId, currentPrice, token);
                            queryClient.setQueryData(
                              ['user-ads'],
                              (oldData: any) => {
                                if (!oldData) return oldData;
                                return oldData.map((item: any) =>
                                  item.ad_id === adId
                                    ? { ...item, price: currentPrice }
                                    : item
                                );
                              }
                            );

                            setEditingPrice(false);
                          } catch (err) {
                            console.error('❌ Failed to update price:', err);
                            showSingleButtonModal(
                              'Failed to update price. Try again.',
                              'error'
                            );
                          } finally {
                            setSavingPrice(false);
                          }
                        } else {
                          setEditingPrice(true);
                          setTimeout(
                            () => priceInputRef.current?.focus(),
                            100
                          );
                        }
                      }}
                    >
                      <Text style={styles.editPriceBtn}>
                        {savingPrice
                          ? 'Saving...'
                          : editingPrice
                          ? 'Save'
                          : 'Edit Price'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </View>

              {loadingUser ? (
  <ActivityIndicator size="small" color={Colors.primary} />
) : fetchedUser ? (
  <View style={styles.buyerCard}>
    <Text style={styles.buyerCardTitle}>Buyer Details</Text>

    <View style={styles.buyerDetailRow}>
      <Text style={styles.buyerLabel}>Full Name</Text>
      <Text style={styles.buyerValue}>
        {fetchedUser.f_name} {fetchedUser.l_name}
      </Text>
    </View>

    <View style={styles.buyerDetailRow}>
      <Text style={styles.buyerLabel}>Phone</Text>
      <Text style={styles.buyerValue}>{fetchedUser.phone_no}</Text>
    </View>

    <View style={styles.buyerDetailRow}>
      <Text style={styles.buyerLabel}>Email</Text>
      <Text style={styles.buyerValue}>{fetchedUser.email}</Text>
    </View>
  </View>
) : buyer_email.trim() &&
  buyer_email.includes('@') &&
  buyer_email.endsWith('.com') ? (
  <View style={styles.noBuyerCard}>
    <Image
      source={require('../images/noUser_mas.png')}
      style={styles.noBuyerImage}
    />
    <Text style={styles.noBuyerTitle}>No Buyer Found</Text>
    <Text style={styles.noBuyerSubtitle}>
      No account matches this email. Double-check the address or try another.
    </Text>
  </View>
) : null}


              <TouchableOpacity
                style={[styles.primaryButton]}
                disabled={markingSold}
                onPress={handleConfirmMarkSold}
              >
                {markingSold && (
                  <ActivityIndicator
                    size="small"
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                )}
                <Text style={styles.primaryButtonText}>
                  {markingSold ? 'Marking...' : 'Confirm'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={resetState}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
            </View>
        </Animated.View>

        {modalData && (
          <DynamicModal
            visible={modalVisible}
            icon={modalData.icon}
            text={modalData.text}
            onAccept={modalData.onAccept}
            acceptText={modalData.acceptText}
            onReject={undefined}
            rejectText=""
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wrapper: {
    width: '100%',
    paddingHorizontal: 24,
  },
  modal: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    elevation: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.title,
    marginBottom: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.title,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Poppins-Medium',
  },
  primaryButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    marginBottom: 12,
    borderColor: Colors.black,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
  },
  cancelText: {
    backgroundColor: Colors.primary,
    fontSize: 13,
    color: Colors.textWhite,
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    fontFamily: 'Poppins-Medium',
  },
  drawer: {
    backgroundColor: Colors.white,
    padding: 28,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    minHeight: height * 0.4,
    maxHeight: height * 0.85, // important so it can shrink & scroll
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
  },
  drawerTitle: {
    fontSize: 18,
    color: Colors.title,
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  drawerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.title,
    marginBottom: 6,
    fontFamily: 'Poppins-Medium',
  },
  priceView: {
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  pricePrefix: {
    fontSize: 14,
    color: Colors.text,
    marginRight: 4,
    fontFamily: 'Poppins-Regular',
  },
  priceInput: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
    fontFamily: 'Poppins-Regular',
  },
  priceText: {
    fontSize: 14,
    color: Colors.text,
  },
  editPriceBtn: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: 'Poppins-Medium',
  },
  input: {
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
    fontFamily: 'Poppins-Regular',
  },

  userInfoBox: {
    backgroundColor: '#f9fafc',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e1e5eb',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  userInfoHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.3,
    fontFamily: 'Poppins-SemiBold',
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 1,
    elevation: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.title,
    width: 100,
    fontFamily: 'Poppins-Medium',
  },
  value: {
    fontSize: 14,
    color: '#555',
    flexShrink: 1,
    textAlign: 'right',
    fontFamily: 'Poppins-Regular',
  },

  noUserBox: {
    backgroundColor: Colors.white,
    borderColor: '#f5c2c2',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 24,
    shadowColor: Colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  noUserTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.red,
    fontFamily: 'Poppins-SemiBold',
  },
  noUserText: {
    fontSize: 13,
    color: Colors.gray,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    fontFamily: 'Poppins-Regular',
  },

  buyerCard: {
  width: '100%',
  backgroundColor: '#fafafa',
  borderRadius: 12,
  paddingVertical: 10,
  paddingHorizontal: 14,
  borderWidth: 1,
  borderColor: '#e5e5e5',
  marginBottom: 16,
},
buyerCardTitle: {
  fontSize: 15,
  fontFamily: 'Poppins-SemiBold',
  color: Colors.primary,
  marginBottom: 6,
  textAlign: 'center',
},
buyerDetailRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 4,
  borderBottomWidth: 0.5,
  borderColor: '#ececec',
},
buyerLabel: {
  fontSize: 13,
  fontFamily: 'Poppins-Medium',
  color: Colors.black,
},
buyerValue: {
  fontSize: 13,
  fontFamily: 'Poppins-Regular',
  color: Colors.black,
  flexShrink: 1,
  textAlign: 'right',
},

noBuyerCard: {
  width: '100%',
  backgroundColor: '#fff9f9',
  borderRadius: 10,
  borderWidth: 1,
  borderColor: '#f2caca',
  paddingVertical: 14,
  paddingHorizontal: 10,
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 16,
},
noBuyerImage: {
  width: 80,
  height: 80,
  resizeMode: 'contain',
},
noBuyerTitle: {
  fontSize: 14,
  fontFamily: 'Poppins-SemiBold',
  color: Colors.red,
  marginBottom: 2,
},
noBuyerSubtitle: {
  fontSize: 12,
  fontFamily: 'Poppins-Regular',
  color: '#777',
  textAlign: 'center',
  lineHeight: 16,
  paddingHorizontal: 6,
},

});

export default ManageAdModal;
