import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { isAuthenticated, loading, isFirstLaunch } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('Index.tsx useEffect triggered - loading:', loading, 'isAuthenticated:', isAuthenticated, 'isFirstLaunch:', isFirstLaunch);
    
    if (loading) {
      console.log('Still loading, returning early');
      return; // Don't do anything while loading
    }

    console.log('Index.tsx navigation logic - isAuthenticated:', isAuthenticated, 'isFirstLaunch:', isFirstLaunch);

    // Handle navigation based on auth state
    if (isFirstLaunch) {
      console.log('First launch - redirecting to landing');
      router.replace('/landing');
    } else if (!isAuthenticated) {
      console.log('Not authenticated - redirecting to login');
      router.replace('/login');
    } else {
      console.log('Authenticated - redirecting to tabs');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, loading, isFirstLaunch, router]);

  // Show loading while determining route
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}
