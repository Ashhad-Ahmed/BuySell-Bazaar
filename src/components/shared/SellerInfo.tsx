import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Theme } from '../../constants/color'; // adjust path if needed
import { truncateCharacters } from '../../constants/helperFunctions';

interface SellerInfoProps {
  profileImage: ImageSourcePropType;
  sellerName: string;
  timeText: string;
  showOnlineIndicator?: boolean;
  onChatPress: () => void;
  onProfilePress?: () => void;
}

const SellerInfo: React.FC<SellerInfoProps> = ({
  profileImage,
  sellerName,
  timeText,
  showOnlineIndicator = true,
  onChatPress,
  onProfilePress,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.profileSection}
        onPress={onProfilePress}
        activeOpacity={0.7}
      >
        <View style={styles.profileImageContainer}>
          <Image
            source={profileImage}
            style={styles.profileImage}
            resizeMode="cover"
          />
          {showOnlineIndicator && (
            <View style={styles.onlineIndicator} />
          )}
        </View>
        
        <View style={styles.textContainer}>
           <Text
            style={styles.sellerName}
            numberOfLines={1}
            ellipsizeMode="tail"
        >
            {truncateCharacters(sellerName, 14)}
        </Text>
          <Text style={styles.timeText}>{timeText}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.chatButton}
        onPress={onChatPress}
        activeOpacity={0.8}
      >
        <Icon
          name="chat"
          size={20}
          color={Colors.textWhite}
          style={styles.chatIcon}
        />
        <Text style={styles.chatButtonText}>Chat with Seller</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 365,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    paddingHorizontal: 14,
    marginTop:15,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: Theme.spacing.sm,
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.round,
    borderWidth: 1.07,
    borderColor: Colors.border,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.green,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  textContainer: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary,
    lineHeight:18,
    marginBottom: 2,
    width:157,
    height:18,
  },
  timeText: {
    fontSize: 13,
    color: Colors.gray,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 11,
    width: 110,
    justifyContent: 'center',
  },
  chatIcon: {
    marginRight: 4,
    width: 20,
    height: 20,
  },
  chatButtonText: {
    width:78,
    height:20,
    color: Colors.textWhite,
    fontSize: 11,
    fontWeight: '700',
    lineHeight:18,
  },
});

export default SellerInfo;
