import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/HapticTab';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

// Custom Tab Bar Background Component
const CustomTabBarBackground = () => (
  <LinearGradient
    colors={['rgba(0, 0, 0, 0.95)', 'rgba(30, 30, 30, 0.98)']}
    style={styles.tabBarBackground}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
  />
);

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { getUserRole } = useAuth();
  const userRole = getUserRole();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          
          if (route.name === 'index') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'doctor-dashboard') {
            iconName = focused ? 'medical' : 'medical-outline';
          } else if (route.name === 'admin-dashboard') {
            iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
          } else if (route.name === 'upload') {
            iconName = focused ? 'cloud-upload' : 'cloud-upload-outline';
          } else if (route.name === 'collections') {
            iconName = focused ? 'folder-open' : 'folder-outline';
          } else if (route.name === 'scanner') {
            iconName = focused ? 'qr-code' : 'qr-code-outline';
          } else if (route.name === 'profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
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
        tabBarButton: HapticTab,
      })}>
      
      {/* Home tab - Dashboard (available for all roles) */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: userRole === UserRole.DOCTOR ? 'Patients' : 
                      userRole === UserRole.ADMIN ? 'System' : 'Dashboard',
        }}
      />
      
      {/* Doctor-specific Dashboard */}
      {userRole === UserRole.DOCTOR && (
        <Tabs.Screen
          name="doctor-dashboard"
          options={{
            tabBarLabel: 'Practice',
          }}
        />
      )}
      
      {/* Admin-specific Dashboard */}
      {userRole === UserRole.ADMIN && (
        <Tabs.Screen
          name="admin-dashboard"
          options={{
            tabBarLabel: 'Admin',
          }}
        />
      )}
      
      {/* Patient and Doctor tabs */}
      {(userRole === UserRole.PATIENT || userRole === UserRole.DOCTOR) && (
        <>
          <Tabs.Screen
            name="upload"
            options={{
              tabBarLabel: 'Upload',
            }}
          />
          <Tabs.Screen
            name="collections"
            options={{
              tabBarLabel: 'Library',
            }}
          />
        </>
      )}
      
      {/* Scanner - available for all roles */}
      <Tabs.Screen
        name="scanner"
        options={{
          tabBarLabel: 'Scan',
        }}
      />
      
      {/* Profile - available for all roles */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
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
