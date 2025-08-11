import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/constants/colors';
import { ISLAMIC_QUOTES } from '@/constants/quotes';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % ISLAMIC_QUOTES.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert('Login Error', error.message);
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (error) {
        Alert.alert('Google Login Error', error.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Google login failed');
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
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue your halal investment journey</Text>

        <View style={styles.inputContainer}>
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
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <Link href="/(auth)/signup" style={styles.signupLink}>
            <Text style={styles.signupLinkText}>Sign Up</Text>
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
    marginBottom: 20,
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.neutral[200],
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
  },
  googleButton: {
    backgroundColor: 'white',
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  googleButtonText: {
    color: COLORS.neutral[700],
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
  },
  signupLink: {
    // No additional styles needed - Link handles navigation
  },
  signupLinkText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.primary[600],
  },
});