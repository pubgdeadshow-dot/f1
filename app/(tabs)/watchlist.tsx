import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/constants/colors';
import { Stock } from '@/types';
import { AnalyticsService } from '@/services/analytics';
import { apiService } from '@/services/api';
import { Search, Plus, TrendingUp, TrendingDown, Star, Lock } from 'lucide-react-native';

export default function WatchlistScreen() {
  const [user, setUser] = useState<any>(null);
  const [watchlist, setWatchlist] = useState<Stock[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isProUser, setIsProUser] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    loadWatchlist();
    AnalyticsService.trackScreenView('watchlist');
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchStocks();
      AnalyticsService.trackStockSearch(searchQuery, searchResults.length);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (watchlist.length > 0) {
      const interval = setInterval(() => {
        refreshPrices();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [watchlist]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      // Check subscription status
      setIsProUser(false); // Default to free for demo
    }
  };

  const loadWatchlist = async () => {
    try {
      // Load initial watchlist with mock data
      const initialWatchlist = [
        { symbol: 'TCS', name: 'Tata Consultancy Services', price: 0, change: 0, changePercent: 0, isHalal: true },
        { symbol: 'INFY', name: 'Infosys Limited', price: 0, change: 0, changePercent: 0, isHalal: true },
      ];
      setWatchlist(initialWatchlist);
      
      // Fetch live prices
      await refreshPrices(initialWatchlist);
    } catch (error) {
      console.error('Error loading watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshPrices = async (currentWatchlist?: Stock[]) => {
    const stocksToUpdate = currentWatchlist || watchlist;
    if (stocksToUpdate.length === 0) return;

    try {
      const symbols = stocksToUpdate.map(stock => stock.symbol);
      const livePrices = await apiService.getLivePrices(symbols);
      
      const updatedWatchlist = stocksToUpdate.map(stock => {
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
      
      setWatchlist(updatedWatchlist);
    } catch (error) {
      console.error('Error refreshing prices:', error);
    }
  };

  const searchStocks = async () => {
    try {
      const results = await apiService.searchStocks(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching stocks:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshPrices();
    setRefreshing(false);
  };

  const canAddMoreStocks = () => {
    return isProUser || watchlist.length < 5;
  };

  const handleAddStock = (stock?: any) => {
    if (!canAddMoreStocks()) {
      Alert.alert(
        'Upgrade Required',
        'Free users can only add up to 5 stocks to their watchlist. Upgrade to Pro for unlimited stocks!',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => console.log('Navigate to subscription') },
        ]
      );
      return;
    }
    
    if (stock) {
      addStockToWatchlist(stock);
    }
  };

  const addStockToWatchlist = async (stock: any) => {
    try {
      const isHalal = await apiService.checkShariahCompliance(stock.symbol);
      
      const newStock: Stock = {
        symbol: stock.symbol,
        name: stock.name,
        price: 0,
        change: 0,
        changePercent: 0,
        isHalal,
      };
      
      setWatchlist(prev => [...prev, newStock]);
      setSearchQuery('');
      setSearchResults([]);
      
      // Track analytics
      AnalyticsService.trackWatchlistAdd(stock.symbol, stock.name);
      
      // Fetch live price for the new stock
      setTimeout(() => refreshPrices(), 1000);
    } catch (error) {
      console.error('Error adding stock:', error);
      // Add stock with default halal status if API fails
      const newStock: Stock = {
        symbol: stock.symbol,
        name: stock.name,
        price: 0,
        change: 0,
        changePercent: 0,
        isHalal: true, // Default to halal if check fails
      };
      
      setWatchlist(prev => [...prev, newStock]);
      setSearchQuery('');
      setSearchResults([]);
      
      setTimeout(() => refreshPrices(), 1000);
    }
  };

  const renderStockCard = (stock: Stock) => (
    <TouchableOpacity key={stock.symbol} style={styles.stockCard}>
      <View style={styles.stockHeader}>
        <View style={styles.stockInfo}>
          <View style={styles.stockTitleRow}>
            <Text style={styles.stockSymbol}>{stock.symbol}</Text>
            <Star size={16} color={COLORS.gold[500]} />
          </View>
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

  const renderSearchResult = (stock: any) => (
    <TouchableOpacity
      key={stock.instrumentKey}
      style={styles.searchResultItem}
      onPress={() => handleAddStock(stock)}
    >
      <View style={styles.searchResultInfo}>
        <Text style={styles.searchResultSymbol}>{stock.symbol}</Text>
        <Text style={styles.searchResultName} numberOfLines={1}>{stock.name}</Text>
        <Text style={styles.searchResultExchange}>{stock.exchange}</Text>
      </View>
      <Plus size={20} color={COLORS.primary[600]} />
    </TouchableOpacity>
  );

  const renderUpgradePrompt = () => (
    <View style={styles.upgradePrompt}>
      <Lock size={24} color={COLORS.gold[600]} />
      <Text style={styles.upgradeTitle}>Unlock Unlimited Watchlist</Text>
      <Text style={styles.upgradeText}>
        Free users can track up to 5 stocks. Upgrade to Pro for unlimited stocks and advanced features.
      </Text>
      <TouchableOpacity style={styles.upgradeButton}>
        <Text style={styles.upgradeButtonText}>Upgrade to Pro ₹199/month</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading watchlist...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Watchlist</Text>
        <Text style={styles.subtitle}>
          {watchlist.length}{!isProUser ? '/5' : ''} stocks tracked
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Search size={20} color={COLORS.neutral[400]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stocks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.neutral[400]}
          />
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddStock}>
          <Plus size={20} color="white" />
        </TouchableOpacity>
      </View>

      {searchResults.length > 0 && (
        <View style={styles.searchResults}>
          <Text style={styles.searchResultsTitle}>Search Results</Text>
          <ScrollView style={styles.searchResultsList} showsVerticalScrollIndicator={false}>
            {searchResults.map(renderSearchResult)}
          </ScrollView>
        </View>
      )}

      <ScrollView 
        style={styles.stocksList} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {watchlist.map(renderStockCard)}
        
        {!isProUser && watchlist.length >= 3 && renderUpgradePrompt()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
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
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[800],
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 12,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[800],
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.primary[600],
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary[600],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  searchResults: {
    backgroundColor: 'white',
    marginHorizontal: 24,
    marginBottom: 12,
    borderRadius: 12,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchResultsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[700],
    padding: 16,
    paddingBottom: 8,
  },
  searchResultsList: {
    maxHeight: 160,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultSymbol: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 2,
  },
  searchResultName: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    marginBottom: 2,
  },
  searchResultExchange: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary[600],
  },
  stocksList: {
    flex: 1,
    paddingHorizontal: 24,
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
  stockTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  stockSymbol: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginRight: 8,
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
  upgradePrompt: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 2,
    borderColor: COLORS.gold[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  upgradeTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginTop: 12,
    marginBottom: 8,
  },
  upgradeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  upgradeButton: {
    backgroundColor: COLORS.gold[500],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});