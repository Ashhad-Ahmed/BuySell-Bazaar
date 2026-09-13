import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../services/hooks/useAuth';
import { Colors, Theme } from '../constants/color';

const AuthExample: React.FC = () => {
  const { 
    user, 
    isAuthenticated, 
    logout, 
    isLoggingOut 
  } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      Alert.alert('Success', 'Logged out successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Not Authenticated</Text>
        <Text style={styles.subtitle}>Please login or signup to continue</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome!</Text>
      <Text style={styles.subtitle}>You are logged in as:</Text>
      
      <View style={styles.userInfo}>
        <Text style={styles.userText}>Name: {user?.name}</Text>
        <Text style={styles.userText}>Email: {user?.email}</Text>
        <Text style={styles.userText}>ID: {user?.id}</Text>
      </View>

      <TouchableOpacity 
        style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]}
        onPress={handleLogout}
        disabled={isLoggingOut}
      >
        <Text style={styles.logoutButtonText}>
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: Theme.spacing.lg,
    textAlign: 'center',
  },
  userInfo: {
    backgroundColor: Colors.backgroundLight,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.lg,
    width: '100%',
  },
  userText: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  logoutButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
  },
  logoutButtonDisabled: {
    backgroundColor: Colors.textSecondary,
    opacity: 0.7,
  },
  logoutButtonText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AuthExample; 