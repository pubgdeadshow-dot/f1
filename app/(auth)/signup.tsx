import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/constants/colors';
import { ISLAMIC_QUOTES } from '@/constants/quotes';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react-native';

export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % ISLAMIC_QUOTES.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleSignup = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        Alert.alert('Signup Error', error.message);
      } else {
        Alert.alert(
          'Success',
          'Account created successfully! Please check your email for verification.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const currentQuote = ISLAMIC_QUOTES[currentQuoteIndex];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>ف</Text>
          </View>
          <Text style={styles.appName}>Falah</Text>
          <Text style={styles.tagline}>Islamic Finance Made Simple</Text>
        </View>
      </View>

      <View style={styles.quoteContainer}>
        <Text style={styles.quoteText}>"{currentQuote.text}"</Text>
        <Text style={styles.quoteSource}>- {currentQuote.source}</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join thousands of Muslims investing halal</Text>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <User size={20} color={COLORS.neutral[400]} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full name"
              value={fullName}
              onChangeText={setFullName}
              placeholderTextColor={COLORS.neutral[400]}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Mail size={20} color={COLORS.neutral[400]} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor={COLORS.neutral[400]}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Lock size={20} color={COLORS.neutral[400]} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor={COLORS.neutral[400]}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20} color={COLORS.neutral[400]} />
              ) : (
                <Eye size={20} color={COLORS.neutral[400]} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <Lock size={20} color={COLORS.neutral[400]} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              placeholderTextColor={COLORS.neutral[400]}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff size={20} color={COLORS.neutral[400]} />
              ) : (
                <Eye size={20} color={COLORS.neutral[400]} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Link href="/(auth)/login" style={styles.loginLink}>
            <Text style={styles.loginLinkText}>Sign In</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: COLORS.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  appName: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: COLORS.primary[700],
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
  },
  quoteContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quoteText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[700],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  quoteSource: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.primary[600],
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[800],
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: 12,
    backgroundColor: COLORS.neutral[50],
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[800],
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    height: 50,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: COLORS.primary[600],
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: COLORS.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
  },
  loginLink: {
    // No additional styles needed - Link handles navigation
  },
  loginLinkText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.primary[600],
  },
});