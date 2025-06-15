import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthProvider, useAuth } from './Contexts/Authcontext';
import LandingScreen from './screens/LandingScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import DashboardScreen from './screens/DashboardScreen';
import RecordUploadScreen from './screens/RecordUploadScreen';
import ProfileScreen from './screens/ProfileScreen';
import FolderSystemScreen from './screens/FolderSystemScreen';
import RecordDetailScreen from './screens/RecordDetailScreen';
import RecordViewerScreen from './screens/RecordViewerScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Custom Tab Bar Background Component
const CustomTabBarBackground = () => (
  <LinearGradient
    colors={['rgba(0, 0, 0, 0.95)', 'rgba(30, 30, 30, 0.98)']}
    style={styles.tabBarBackground}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
  />
);

function MainTabNavigator() {
  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Upload') {
            iconName = focused ? 'cloud-upload' : 'cloud-upload-outline';
          } else if (route.name === 'Collections') {
            iconName = focused ? 'folder-open' : 'folder-outline';
          } else if (route.name === 'Records') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return (
            <View style={[
              styles.iconContainer, 
              focused && styles.iconContainerFocused
            ]}>
              <Ionicons 
                name={iconName} 
                size={focused ? 22 : 20} 
                color={color} 
                style={focused && styles.iconFocused}
              />
              {focused && <View style={styles.focusIndicator} />}
            </View>
          );
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarBackground: () => <CustomTabBarBackground />,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 30 : 20,
          left: 20,
          right: 20,
          borderRadius: 24,
          borderTopWidth: 0,
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? 20 : 12,
          paddingHorizontal: 8,
          height: Platform.OS === 'ios' ? 70 : 60,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 12,
          },
          shadowOpacity: 0.4,
          shadowRadius: 24,
          elevation: 20,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          backgroundColor: 'transparent',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 4,
          letterSpacing: 0.2,
          textTransform: 'capitalize',
        },
        tabBarItemStyle: {
          paddingTop: 6,
          paddingBottom: 4,
          borderRadius: 18,
          marginHorizontal: 2,
          overflow: 'hidden',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ 
          tabBarLabel: 'Home',
        }} 
      />
      <Tab.Screen 
        name="Upload" 
        component={RecordUploadScreen} 
        options={{ 
          tabBarLabel: 'Upload',
        }} 
      />
      <Tab.Screen 
        name="Collections" 
        component={FolderSystemScreen} 
        options={{ 
          tabBarLabel: 'Library',
        }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          tabBarLabel: 'Profile',
        }} 
      />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { isAuthenticated, loading, isFirstLaunch } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName={isFirstLaunch ? "Landing" : "Login"}
    >
      {isFirstLaunch ? (
        <>
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      ) : !isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen 
            name="RecordViewer" 
            component={RecordViewerScreen}
            options={{
              presentation: 'fullScreenModal',
              animation: 'slide_from_bottom'
            }}
          />
          <Stack.Screen 
            name="CollectionSystem" 
            component={FolderSystemScreen} 
            options={{ headerShown: false, presentation: 'modal' }} 
          />
          <Stack.Screen 
            name="RecordDetail" 
            component={RecordDetailScreen} 
            options={{ headerShown: false, presentation: 'card' }} 
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <AppContent />
        <StatusBar style="dark" />
      </AuthProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  iconContainerFocused: {
    transform: [{ scale: 1.1 }],
  },
  iconFocused: {
    textShadowColor: 'rgba(255, 255, 255, 0.2)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  focusIndicator: {
    position: 'absolute',
    bottom: -12,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
});
