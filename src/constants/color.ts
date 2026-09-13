export const Colors = {
  primary: '#152F54',
  background: '#ffffff',
  backgroundLight: '#f8f9fa',
  backgroundGray: '#f1f5f9',
  title: '#171515',
  black: '#000000',
  gray: '#696F79',
  muted: '#8692A6',
  text: '#0A0A0A',
  border: '#D3D8DF',
  placeholder: '#64748B',
  borderFocused: '#152F54',
  grayBase: '#F4F4F4',
  textPrimary: '#1f2937',
  textSecondary: '#6b7280',
  textPlaceholder: '#9CA3AF',
  textWhite: '#ffffff',
  white: '#ffffff',
  red: '#FF2C2C',
  borderGray: '##D1D5DB',
  bubbleMe: '#EAF2FB',
  bubbleOther: '#FFF8DC',
  inputBackground: '#F1F5F9',
  chatBackground: '#F8F9FA',
  green: '#22C55E',
} as const;

export const Theme = {
  colors: Colors,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
    round: 50,
  },
} as const;

export default Colors;