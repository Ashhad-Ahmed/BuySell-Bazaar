
export type RootStackParamList = {
  MainTabs: undefined;
  AuthStack: undefined;
  GetStarted: undefined;
  Onboarding: undefined;
  Auth: undefined;
  ChatDetail: { chatId: string };
};

export type AuthStackParamList = {
  Auth: undefined;
  ResetPassword: undefined;
  OTPVerification: undefined;
  SignupStep1: {
    email: string;
    password: string;
  };
  SignupStep2: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    gender: string;
  };
  SignupStep3: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    gender: string;
    phone: string;
    city: string;
  };
};
