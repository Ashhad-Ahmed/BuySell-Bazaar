export interface ChatData {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  avatar: any;
  unreadCount?: number;
}

const mockAvatars = {
    ahmad: { uri: 'https://www.w3schools.com/howto/img_avatar.png' },
    muhammad: { uri: 'https://www.w3schools.com/howto/img_avatar.png' },
    ibrahim: { uri: 'https://www.w3schools.com/howto/img_avatar.png' },
    rauf: { uri: 'https://www.w3schools.com/howto/img_avatar.png' },
    farhan: { uri: 'https://www.w3schools.com/howto/img_avatar.png' },
    najla: { uri: 'https://www.w3schools.com/howto/img_avatar.png' },
};

export const mockChatData: ChatData[] = [
  {
    id: '1',
    name: 'Ahmad Ali',
    lastMessage: 'You can find today\'s check in threa...',
    time: '7:11 PM',
    avatar: mockAvatars.ahmad,
  },
  {
    id: '2',
    name: 'Muhammad Arzam',
    lastMessage: 'You can find yesterday\'s check in threa...',
    time: '7:30 PM',
    avatar: mockAvatars.muhammad,
  },
  {
    id: '3',
    name: 'Ibrahim Hassan',
    lastMessage: 'You can find chat in threa...',
    time: '5:10 PM',
    avatar: mockAvatars.ibrahim,
  },
  {
    id: '4',
    name: 'Rauf Ullah',
    lastMessage: 'You can find chat in 7 mess',
    time: '7:11 PM',
    avatar: mockAvatars.rauf,
  },
  {
    id: '5',
    name: 'Farhan Ali',
    lastMessage: 'You can find chat in threa...',
    time: '9:11 PM',
    avatar: mockAvatars.farhan,
  },
  {
    id: '6',
    name: 'Najla ul haq',
    lastMessage: 'You can find chat in threa...',
    time: '4:11 PM',
    avatar: mockAvatars.najla,
  },
    {
    id: '7',
    name: 'Najla ul haq',
    lastMessage: 'You can find chat in threa...',
    time: '4:11 PM',
    avatar: mockAvatars.najla,
  },  {
    id: '8',
    name: 'Najla ul haq',
    lastMessage: 'You can find chat in threa...',
    time: '4:11 PM',
    avatar: mockAvatars.najla,
  },
    {
    id: '9',
    name: 'Najla ul haq',
    lastMessage: 'You can find chat in threa...',
    time: '4:11 PM',
    avatar: mockAvatars.najla,
  },
    
];

export const defaultAvatar = {
  uri: 'https://via.placeholder.com/48x48/cccccc/666666?text=U'
};