import { useAuthStore } from '../../stores/authStore';
import { useSignup, useLogin, useLogout, useForgotPassword, useResetPassword } from '../mutations/auth';
import { SignupRequest, LoginRequest } from '../api/types';

// Custom hook for signup
export const useSignupHook = () => {
  const { isLoading, error, clearError } = useAuthStore();
  const signupMutation = useSignup();

  const signup = async (data: SignupRequest) => {
    clearError();
    return signupMutation.mutateAsync(data);
  };

  return {
    signup,
    isLoading: signupMutation.isPending || isLoading,
    error: error || signupMutation.error?.message,
    isSuccess: signupMutation.isSuccess,
    reset: () => {
      clearError();
      signupMutation.reset();
    },
  };
};

// Custom hook for login
export const useLoginHook = () => {
  const { isLoading, error, clearError } = useAuthStore();
  const loginMutation = useLogin();

  const login = async (data: LoginRequest) => {
    clearError();
    return loginMutation.mutateAsync(data);
  };

  return {
    login,
    isLoading: loginMutation.isPending || isLoading,
    error: error || loginMutation.error?.message,
    isSuccess: loginMutation.isSuccess,
    reset: () => {
      clearError();
      loginMutation.reset();
    },
  };
};

// Custom hook for logout
export const useLogoutHook = () => {
  const logoutMutation = useLogout();

  const logout = async () => {
    return logoutMutation.mutateAsync();
  };

  return {
    logout,
    isLoading: logoutMutation.isPending,
    isSuccess: logoutMutation.isSuccess,
    reset: () => logoutMutation.reset(),
  };
};

// Custom hook for forgot password
export const useForgotPasswordHook = () => {
  const { error, clearError } = useAuthStore();
  const forgotPasswordMutation = useForgotPassword();

  const forgotPassword = async (email: string) => {
    clearError();
    return forgotPasswordMutation.mutateAsync(email);
  };

  return {
    forgotPassword,
    isLoading: forgotPasswordMutation.isPending,
    error: error || forgotPasswordMutation.error?.message,
    isSuccess: forgotPasswordMutation.isSuccess,
    reset: () => {
      clearError();
      forgotPasswordMutation.reset();
    },
  };
};

// Custom hook for reset password
export const useResetPasswordHook = () => {
  const { error, clearError } = useAuthStore();
  const resetPasswordMutation = useResetPassword();

  const resetPassword = async (token: string, password: string) => {
    clearError();
    return resetPasswordMutation.mutateAsync({ token, password });
  };

  return {
    resetPassword,
    isLoading: resetPasswordMutation.isPending,
    error: error || resetPasswordMutation.error?.message,
    isSuccess: resetPasswordMutation.isSuccess,
    reset: () => {
      clearError();
      resetPasswordMutation.reset();
    },
  };
};

// Combined auth hook for easy access to all auth functionality
export const useAuth = () => {
  const authStore = useAuthStore();
  const signupHook = useSignupHook();
  const loginHook = useLoginHook();
  const logoutHook = useLogoutHook();
  const forgotPasswordHook = useForgotPasswordHook();
  const resetPasswordHook = useResetPasswordHook();

  return {
    // State
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading,
    error: authStore.error,
    
    // Actions
    signup: signupHook.signup,
    login: loginHook.login,
    logout: logoutHook.logout,
    forgotPassword: forgotPasswordHook.forgotPassword,
    resetPassword: resetPasswordHook.resetPassword,
    clearError: authStore.clearError,
    
    // Loading states
    isSigningUp: signupHook.isLoading,
    isLoggingIn: loginHook.isLoading,
    isLoggingOut: logoutHook.isLoading,
    isResettingPassword: resetPasswordHook.isLoading,
    
    // Success states
    signupSuccess: signupHook.isSuccess,
    loginSuccess: loginHook.isSuccess,
    logoutSuccess: logoutHook.isSuccess,
    resetPasswordSuccess: resetPasswordHook.isSuccess,
    
    // Reset functions
    resetSignup: signupHook.reset,
    resetLogin: loginHook.reset,
    resetLogout: logoutHook.reset,
    resetForgotPassword: forgotPasswordHook.reset,
    resetResetPassword: resetPasswordHook.reset,
  };
}; 