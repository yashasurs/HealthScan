import Toast from 'react-native-toast-message';

export const showToast = {
  success: (title, message = '') => {
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

  error: (title, message = '') => {
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

  info: (title, message = '') => {
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

  warning: (title, message = '') => {
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

export const showConfirmToast = (title, message, onConfirm, onCancel) => {
  // For confirmations, we'll still need to use Alert as Toast doesn't support interactive buttons
  // But we can make it look better
  import('react-native').then(({ Alert }) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel', onPress: onCancel },
        { text: 'Confirm', style: 'destructive', onPress: onConfirm }
      ],
      { cancelable: true }
    );
  });
};
