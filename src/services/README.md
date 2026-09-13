# Authentication System with React Query and Zustand

This directory contains the complete authentication system setup using React Query for API management and Zustand for state management.

## Folder Structure

```
src/services/
├── api/
│   ├── client.ts          # Axios instance with interceptors
│   ├── endpoints.ts       # API endpoint constants
│   └── types.ts           # TypeScript types for API
├── mutations/
│   ├── auth.ts            # React Query mutations for auth
│   └── index.ts           # Export all mutations
├── hooks/
│   ├── useAuth.ts         # Custom hooks for auth
│   └── index.ts           # Export all hooks
└── README.md              # This file
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install @tanstack/react-query zustand axios @react-native-async-storage/async-storage
```

### 2. Configure API Base URL

Update the `API_BASE_URL` in `src/services/api/endpoints.ts`:

```typescript
export const API_BASE_URL = 'https://your-api-domain.com/api';
```

### 3. Set up React Query Provider

The `App.tsx` has been updated to include the QueryClientProvider.

### 4. Create Zustand Store

The auth store is already created in `src/stores/authStore.ts`.

## Usage Examples

### Basic Authentication Hook

```typescript
import { useAuth } from '../services/hooks/useAuth';

const MyComponent = () => {
  const { 
    user, 
    isAuthenticated, 
    signup, 
    login, 
    logout,
    isSigningUp,
    isLoggingIn,
    error 
  } = useAuth();

  const handleSignup = async () => {
    try {
      await signup({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  const handleLogin = async () => {
    try {
      await login({
        email: 'john@example.com',
        password: 'password123'
      });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <View>
      {isAuthenticated ? (
        <Text>Welcome, {user?.name}!</Text>
      ) : (
        <Text>Please login</Text>
      )}
    </View>
  );
};
```

### Individual Hooks

You can also use individual hooks for specific functionality:

```typescript
import { useSignupHook, useLoginHook } from '../services/hooks/useAuth';

const SignupComponent = () => {
  const { signup, isLoading, error, isSuccess } = useSignupHook();
  
  // Use the hook...
};
```

## API Response Format

The system expects the following API response format:

```typescript
{
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      phone?: string;
      avatar?: string;
      createdAt: string;
      updatedAt: string;
    };
    token: string;
    message?: string;
  };
  message?: string;
  error?: string;
}
```

## Error Handling

Errors are automatically handled and stored in the Zustand store. You can access them through the hooks:

```typescript
const { error, clearError } = useAuth();

// Clear error manually
clearError();
```

## Persistence

User authentication state is automatically persisted using AsyncStorage. The user will remain logged in even after app restart.

## Available Endpoints

The system includes endpoints for:

- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/forgot-password` - Forgot password
- `POST /auth/reset-password` - Reset password

## Next Steps

1. Update the `API_BASE_URL` to point to your actual API
2. Test the signup and login functionality
3. Add additional authentication features as needed (email verification, social login, etc.)
4. Implement protected routes based on `isAuthenticated` state 