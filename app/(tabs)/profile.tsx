import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/constants/colors';
import { User, Crown, LogOut, Settings, Circle as HelpCircle, FileText, Calendar, Star } from 'lucide-react-native';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [isProUser, setIsProUser] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      // Check subscription status
      setIsProUser(false); // Default to free for demo
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleUpgrade = () => {
    Alert.alert(
      'Upgrade to Pro',
      'Unlock unlimited watchlist, advanced filters, ad-free experience, and more!',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Upgrade ₹199/month', onPress: () => console.log('Navigate to subscription') },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.userCard}>
          <View style={styles.userAvatar}>
            <User size={32} color={COLORS.primary[600]} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.user_metadata?.full_name || 'User'}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.planBadge}>
              {isProUser ? (
                <>
                  <Crown size={16} color={COLORS.gold[600]} />
                  <Text style={[styles.planText, { color: COLORS.gold[600] }]}>Pro Member</Text>
                </>
              ) : (
                <>
                  <Star size={16} color={COLORS.neutral[600]} />
                  <Text style={[styles.planText, { color: COLORS.neutral[600] }]}>Free Member</Text>
                </>
              )}
            </View>
          </View>
        </View>

        {!isProUser && (
          <TouchableOpacity style={styles.upgradeCard} onPress={handleUpgrade}>
            <Crown size={24} color={COLORS.gold[600]} />
            <View style={styles.upgradeInfo}>
              <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
              <Text style={styles.upgradeDescription}>
                Unlimited watchlist, advanced filters, ad-free experience
              </Text>
            </View>
            <Text style={styles.upgradePrice}>₹199/mo</Text>
          </TouchableOpacity>
        )}

        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <Settings size={20} color={COLORS.neutral[600]} />
            <Text style={styles.menuText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <FileText size={20} color={COLORS.neutral[600]} />
            <Text style={styles.menuText}>Download Reports</Text>
            {!isProUser && <View style={styles.proLabel}>
              <Text style={styles.proLabelText}>PRO</Text>
            </View>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Calendar size={20} color={COLORS.neutral[600]} />
            <Text style={styles.menuText}>Subscription</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <HelpCircle size={20} color={COLORS.neutral[600]} />
            <Text style={styles.menuText}>Help & Support</Text>
            {isProUser && <View style={styles.priorityLabel}>
              <Text style={styles.priorityLabelText}>Priority</Text>
            </View>}
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
            <LogOut size={20} color={COLORS.error[500]} />
            <Text style={[styles.menuText, { color: COLORS.error[500] }]}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Falah v1.0.0</Text>
          <Text style={styles.footerSubtext}>Made with ❤️ for the Muslim community</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[800],
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
  },
  userCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  userAvatar: {
    width: 64,
    height: 64,
    backgroundColor: COLORS.primary[50],
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    marginBottom: 8,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  upgradeCard: {
    backgroundColor: COLORS.gold[50],
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.gold[200],
  },
  upgradeInfo: {
    flex: 1,
    marginLeft: 16,
  },
  upgradeTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.gold[700],
    marginBottom: 4,
  },
  upgradeDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.gold[600],
  },
  upgradePrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: COLORS.gold[700],
  },
  menuSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  menuText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[700],
    marginLeft: 16,
    flex: 1,
  },
  proLabel: {
    backgroundColor: COLORS.gold[500],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  proLabelText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  priorityLabel: {
    backgroundColor: COLORS.primary[500],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityLabelText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[500],
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[400],
  },
});