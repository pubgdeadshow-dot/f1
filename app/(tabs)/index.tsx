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
import { AnalyticsService } from '@/services/analytics';
import { Stock } from '@/types';
import { apiService } from '@/services/api';
import { TrendingUp, TrendingDown, Plus, Star, DollarSign } from 'lucide-react-native';

export default function DashboardScreen() {
  const [user, setUser] = useState<any>(null);
  const [marketSummary, setMarketSummary] = useState({
    nifty: { price: 24635.75, change: 156.23, changePercent: 0.64 },
    sensex: { price: 81559.54, change: 514.34, changePercent: 0.63 },
  });
  const [topStocks, setTopStocks] = useState<Stock[]>([
    { symbol: 'TCS', name: 'Tata Consultancy Services', price: 0, change: 0, changePercent: 0, isHalal: true },
    { symbol: 'INFY', name: 'Infosys Limited', price: 0, change: 0, changePercent: 0, isHalal: true },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', price: 0, change: 0, changePercent: 0, isHalal: false },
    { symbol: 'RELIANCE', name: 'Reliance Industries', price: 0, change: 0, changePercent: 0, isHalal: false },
  ]);

  useEffect(() => {
    checkUser();
    loadTopStocks();
    AnalyticsService.trackScreenView('dashboard');
    AnalyticsService.trackAppStart();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshTopStocks();
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [topStocks]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace('/(auth)/login');
    } else {
      setUser(user);
    }
  };

  const loadTopStocks = async () => {
    await refreshTopStocks();
  };

  const refreshTopStocks = async () => {
    try {
      const symbols = topStocks.map(stock => stock.symbol);
      const livePrices = await apiService.getLivePrices(symbols);
      
      const updatedStocks = topStocks.map(stock => {
        const liveData = livePrices.find(price => price.symbol === stock.symbol);
        if (liveData) {
          return {
            ...stock,
            price: liveData.price,
            change: liveData.change,
            changePercent: liveData.changePercent,
          };
        }
        return stock;
      });
      
      setTopStocks(updatedStocks);
    } catch (error) {
      console.error('Error refreshing top stocks:', error);
    }
  };

  const renderStockCard = (stock: Stock) => (
    <TouchableOpacity 
      key={stock.symbol} 
      style={styles.stockCard}
      onPress={() => AnalyticsService.trackStockView(stock.symbol, stock.name)}
    >
      <View style={styles.stockHeader}>
        <View style={styles.stockInfo}>
          <Text style={styles.stockSymbol}>{stock.symbol}</Text>
          <Text style={styles.stockName} numberOfLines={1}>{stock.name}</Text>
        </View>
        <View style={[styles.halalBadge, { backgroundColor: stock.isHalal ? COLORS.success[500] : COLORS.error[500] }]}>
          <Text style={styles.halalText}>{stock.isHalal ? 'Halal' : 'Haram'}</Text>
        </View>
      </View>
      <View style={styles.stockPricing}>
        <Text style={styles.stockPrice}>₹{stock.price.toFixed(2)}</Text>
        <View style={styles.stockChange}>
          {stock.change >= 0 ? (
            <TrendingUp size={16} color={COLORS.success[500]} />
          ) : (
            <TrendingDown size={16} color={COLORS.error[500]} />
          )}
          <Text style={[styles.changeText, { color: stock.change >= 0 ? COLORS.success[500] : COLORS.error[500] }]}>
            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Assalamu Alaikum, {user.user_metadata?.full_name || 'Brother'}</Text>
        <Text style={styles.subtitle}>May your investments be blessed</Text>
      </View>

      <View style={styles.marketSummary}>
        <Text style={styles.sectionTitle}>Market Overview</Text>
        <View style={styles.indexContainer}>
          <View style={styles.indexCard}>
            <Text style={styles.indexName}>NIFTY 50</Text>
            <Text style={styles.indexPrice}>₹{marketSummary.nifty.price.toFixed(2)}</Text>
            <View style={styles.indexChange}>
              <TrendingUp size={14} color={COLORS.success[500]} />
              <Text style={[styles.indexChangeText, { color: COLORS.success[500] }]}>
                +{marketSummary.nifty.change.toFixed(2)} ({marketSummary.nifty.changePercent.toFixed(2)}%)
              </Text>
            </View>
          </View>
          <View style={styles.indexCard}>
            <Text style={styles.indexName}>SENSEX</Text>
            <Text style={styles.indexPrice}>₹{marketSummary.sensex.price.toFixed(2)}</Text>
            <View style={styles.indexChange}>
              <TrendingUp size={14} color={COLORS.success[500]} />
              <Text style={[styles.indexChangeText, { color: COLORS.success[500] }]}>
                +{marketSummary.sensex.change.toFixed(2)} ({marketSummary.sensex.changePercent.toFixed(2)}%)
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/calculators')}>
            <Calculator size={24} color={COLORS.primary[600]} />
            <Text style={styles.actionText}>Zakat Calculator</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/calculators')}>
            <DollarSign size={24} color={COLORS.gold[600]} />
            <Text style={styles.actionText}>Inheritance Calculator</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/watchlist')}>
            <Star size={24} color={COLORS.primary[600]} />
            <Text style={styles.actionText}>Add to Watchlist</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Plus size={24} color={COLORS.neutral[600]} />
            <Text style={styles.actionText}>Explore Stocks</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.topStocks}>
        <Text style={styles.sectionTitle}>Top Halal Stocks</Text>
        {topStocks.map(renderStockCard)}
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
    paddingTop: 60,
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
  header: {
    marginBottom: 32,
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[800],
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
  },
  marketSummary: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 16,
  },
  indexContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  indexCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  indexName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
    marginBottom: 4,
  },
  indexPrice: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[800],
    marginBottom: 4,
  },
  indexChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indexChangeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  quickActions: {
    marginBottom: 32,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[700],
    textAlign: 'center',
    marginTop: 8,
  },
  topStocks: {
    marginBottom: 24,
  },
  stockCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stockInfo: {
    flex: 1,
  },
  stockSymbol: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 2,
  },
  stockName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
  },
  halalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  halalText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  stockPricing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockPrice: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[800],
  },
  stockChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
});