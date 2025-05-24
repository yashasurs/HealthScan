import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import Screens
import DashboardScreen from './screens/DashboardScreen';
import QRGeneratorScreen from './screens/QRGeneratorScreen';
import DocumentUploadScreen from './screens/DocumentUploadScreen';
import ProfileScreen from './screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
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
    </NavigationContainer>
  );
}
