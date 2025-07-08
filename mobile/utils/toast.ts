import Toast from 'react-native-toast-message';
import { Alert } from 'react-native';

interface ToastConfig {
  type: 'success' | 'error' | 'info';
  text1: string;
  text2?: string;
  position: 'top' | 'bottom';
  visibilityTime: number;
  autoHide: boolean;
  topOffset: number;
}

export const showToast = {
  success: (title: string, message: string = '') => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 60,
    });
  },

  error: (title: string, message: string = '') => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 60,
    });
  },

  info: (title: string, message: string = '') => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 60,
    });
  },

  warning: (title: string, message: string = '') => {
    Toast.show({
      type: 'info', // Using info type for warnings as react-native-toast-message doesn't have warning by default
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 3500,
      autoHide: true,
      topOffset: 60,
    });
  },
};

export const showConfirmToast = (
  title: string, 
  message: string, 
  onConfirm: () => void, 
  onCancel?: () => void
) => {
  // For confirmations, we'll still need to use Alert as Toast doesn't support interactive buttons
  Alert.alert(
    title,
    message,
    [
      { text: 'Cancel', style: 'cancel', onPress: onCancel },
      { text: 'Confirm', style: 'destructive', onPress: onConfirm }
    ],
    { cancelable: true }
  );
};
