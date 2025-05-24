import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './utils/AuthContext';
import { useEffect, useState } from 'react';
import NetworkMonitor from './utils/NetworkMonitor';
import { NetworkStatusBanner } from './components/common';

// Import Screens
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import DashboardScreen from './screens/DashboardScreen';
import QRGeneratorScreen from './screens/QRGeneratorScreen';
import DocumentUploadScreen from './screens/DocumentUploadScreen';
import ProfileScreen from './screens/ProfileScreen';
import AuthTestScreen from './screens/AuthTestScreen';
import NetworkTestScreen from './screens/NetworkTestScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'QR Code') {
            iconName = focused ? 'qr-code' : 'qr-code-outline';
          } else if (route.name === 'Documents') {
            iconName = focused ? 'document' : 'document-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#777',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#f0f0f0',
          paddingTop: 5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="QR Code" component={QRGeneratorScreen} />
      <Tab.Screen name="Documents" component={DocumentUploadScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isConnected, setIsConnected] = useState(true);
  
  useEffect(() => {
    // Delay network monitoring setup to ensure all React components are ready
    const setupNetworkMonitoring = setTimeout(() => {
      try {
        // Set up network monitoring
        const unsubscribe = NetworkMonitor.addListener((state) => {
          setIsConnected(state.isConnected);
        });
        
        // Initial network check
        NetworkMonitor.isNetworkAvailable().then(connected => {
          setIsConnected(connected);
        });
        
        return () => {
          clearTimeout(setupNetworkMonitoring);
          if (unsubscribe) unsubscribe();
        };
      } catch (error) {
        console.error("Error setting up network monitoring:", error);
      }
    }, 1000); // Delay by 1 second
    
    return () => clearTimeout(setupNetworkMonitoring);
  }, []);
  
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <NetworkStatusBanner isConnected={isConnected} />
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

// App Navigator with authentication state
function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Auth screens
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      ) : (
        // App screens
        <>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen name="AuthTest" component={AuthTestScreen} options={{ headerShown: true, title: 'Auth Testing' }} />
          <Stack.Screen name="NetworkTest" component={NetworkTestScreen} options={{ headerShown: true, title: 'Network Testing' }} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  }
});
