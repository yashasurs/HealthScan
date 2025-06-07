import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../Contexts/Authcontext';

export const useAuthNavigation = () => {
  const navigation = useNavigation();
  const { logout } = useAuth();

  useEffect(() => {
    const handleAuthError = async () => {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    };

    window.addEventListener('authError', handleAuthError);
    return () => window.removeEventListener('authError', handleAuthError);
  }, [navigation, logout]);
};
