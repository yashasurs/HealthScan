import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useApiService } from '@/services/apiService';
import { UserRole, AdminStats } from '@/types';
import { showToast } from '@/utils/toast';
import { router } from 'expo-router';

interface AdminUser {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  created_at: string;
  is_active: boolean;
}

export default function AdminDashboardScreen() {
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, getUserRole, isAdmin } = useAuth();
  const { getAuthenticatedApi } = useApiService();

  // Redirect if not an admin
  useEffect(() => {
    if (!isAdmin()) {
      router.replace('/(tabs)');
      return;
    }
  }, [isAdmin]);

  const loadAdminData = async () => {
    try {
      const api = await getAuthenticatedApi();
      
      // Load admin stats
      const statsResponse = await api.get('/admin/dashboard');
      setAdminStats(statsResponse.data);
      
      // Load recent users (limit to 10)
      const usersResponse = await api.get('/admin/users?limit=10');
      setRecentUsers(usersResponse.data);
      
    } catch (error: any) {
      console.error('Error loading admin data:', error);
      showToast.error('Error', 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAdminData();
    setRefreshing(false);
  };

  useEffect(() => {
    if (isAdmin()) {
      loadAdminData();
    }
  }, [isAdmin]);

  const handleManageUsers = () => {
    showToast.info('Coming Soon', 'User management interface will be available soon');
  };

  const handleSystemSettings = () => {
    showToast.info('Coming Soon', 'System settings will be available soon');
  };

  const handleViewUser = (userId: number) => {
    showToast.info('Coming Soon', 'User details view will be available soon');
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return '#FF6B6B';
      case UserRole.DOCTOR:
        return '#4ECDC4';
      case UserRole.PATIENT:
        return '#45B7D1';
      default:
        return '#8E8E93';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'shield-checkmark';
      case UserRole.DOCTOR:
        return 'medical';
      case UserRole.PATIENT:
        return 'person';
      default:
        return 'person-outline';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading admin dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            System Overview & Management
          </Text>
        </View>

        {/* System Stats */}
        {adminStats && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="people" size={24} color="#007AFF" />
              <Text style={styles.statNumber}>{adminStats.total_users}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="person" size={24} color="#45B7D1" />
              <Text style={styles.statNumber}>{adminStats.total_patients}</Text>
              <Text style={styles.statLabel}>Patients</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="medical" size={24} color="#4ECDC4" />
              <Text style={styles.statNumber}>{adminStats.total_doctors}</Text>
              <Text style={styles.statLabel}>Doctors</Text>
            </View>
          </View>
        )}

        {/* Secondary Stats */}
        {adminStats && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="folder" size={24} color="#34C759" />
              <Text style={styles.statNumber}>{adminStats.total_collections}</Text>
              <Text style={styles.statLabel}>Collections</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="document-text" size={24} color="#FF9500" />
              <Text style={styles.statNumber}>{adminStats.total_records}</Text>
              <Text style={styles.statLabel}>Records</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="person-add" size={24} color="#5856D6" />
              <Text style={styles.statNumber}>{adminStats.recent_registrations}</Text>
              <Text style={styles.statLabel}>New Users</Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#007AFF' }]}
              onPress={handleManageUsers}
            >
              <Ionicons name="people" size={20} color="#FFF" />
              <Text style={styles.actionButtonText}>Manage Users</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#34C759' }]}
              onPress={handleSystemSettings}
            >
              <Ionicons name="settings" size={20} color="#FFF" />
              <Text style={styles.actionButtonText}>System Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Users */}
        <View style={styles.usersSection}>
          <Text style={styles.sectionTitle}>Recent Users</Text>
          {recentUsers.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#8E8E93" />
              <Text style={styles.emptyStateText}>No users found</Text>
            </View>
          ) : (
            recentUsers.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={styles.userCard}
                onPress={() => handleViewUser(user.id)}
              >
                <View style={styles.userInfo}>
                  <View style={styles.userHeader}>
                    <Text style={styles.userName}>
                      {user.first_name} {user.last_name}
                    </Text>
                    <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) }]}>
                      <Ionicons 
                        name={getRoleIcon(user.role)} 
                        size={12} 
                        color="#FFF" 
                      />
                      <Text style={styles.roleText}>{user.role}</Text>
                    </View>
                  </View>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <Text style={styles.userDate}>
                    Joined: {new Date(user.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  actionsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  usersSection: {
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
    textAlign: 'center',
  },
  userCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  userEmail: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  userDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
});