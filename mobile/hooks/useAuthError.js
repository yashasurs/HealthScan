import { useEffect } from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useAuth } from '../Contexts/Authcontext';

export const useAuthError = () => {
  const navigation = useNavigation();
  const { logout } = useAuth();

  useEffect(() => {
    const handleAuthError = async () => {
      await logout();
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
    };

    // For React Native, we'll use a custom event emitter instead of window events
    const eventEmitter = require('react-native').DeviceEventEmitter;
    eventEmitter.addListener('authError', handleAuthError);

    return () => {
      eventEmitter.removeAllListeners('authError');
    };
  }, [navigation, logout]);
};
