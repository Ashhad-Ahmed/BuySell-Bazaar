import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Auth from '../../screens/Auth/Auth';
import ResetPassword from '../../screens/Auth/ResetPassword';
import OTPVerification from '../../screens/Auth/OTPVerification';
import SignupStep1 from '../../screens/Auth/SignupFlow/SignupStep1';
import SignupStep2 from '../../screens/Auth/SignupFlow/SignupStep2';
import SignupStep3 from '../../screens/Auth/SignupFlow/SignupStep3';
import { AuthStackParamList } from './type';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Auth" component={Auth} />
    <Stack.Screen name="ResetPassword" component={ResetPassword} />
    <Stack.Screen name="OTPVerification" component={OTPVerification} />
    <Stack.Screen name="SignupStep1" component={SignupStep1} />
    <Stack.Screen name="SignupStep2" component={SignupStep2} />
    <Stack.Screen name="SignupStep3" component={SignupStep3} />
  </Stack.Navigator>
);

export default AuthStack;
