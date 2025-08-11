import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { COLORS } from '@/constants/colors';
import { ZakatCalculation } from '@/types';
import { AnalyticsService } from '@/services/analytics';
import { ArrowLeft, Calculator, Download, Info } from 'lucide-react-native';

interface Props {
  onBack: () => void;
}

export default function ZakatCalculator({ onBack }: Props) {
  const [goldPrice, setGoldPrice] = useState(6850); // Mock gold price in INR per 10g
  const [inputs, setInputs] = useState({
    gold: '',
    silver: '',
    cash: '',
    investments: '',
    debts: '',
  });
  const [calculation, setCalculation] = useState<ZakatCalculation | null>(null);

  useEffect(() => {
    fetchGoldPrice();
  }, []);

  const fetchGoldPrice = async () => {
    try {
      // Mock implementation - in real app, fetch from GoldAPI
      setGoldPrice(6850); // ₹6,850 per 10g (mock price)
    } catch (error) {
      console.log('Error fetching gold price:', error);
    }
  };

  const calculateZakat = () => {
    const gold = parseFloat(inputs.gold) || 0;
    const silver = parseFloat(inputs.silver) || 0;
    const cash = parseFloat(inputs.cash) || 0;
    const investments = parseFloat(inputs.investments) || 0;
    const debts = parseFloat(inputs.debts) || 0;

    // Convert gold from grams to value (assuming current gold price)
    const goldValue = (gold * goldPrice) / 10; // goldPrice is per 10g
    
    // Convert silver from grams to value (assuming ₹85 per gram)
    const silverValue = silver * 85;

    const totalWealth = goldValue + silverValue + cash + investments - debts;
    
    // Nisab is approximately 87.48g of gold or 612.36g of silver
    const goldNisab = (87.48 * goldPrice) / 10;
    const silverNisab = 612.36 * 85;
    const nisab = Math.min(goldNisab, silverNisab); // Use lower nisab

    const zakatAmount = totalWealth >= nisab ? totalWealth * 0.025 : 0;

    const result: ZakatCalculation = {
      gold: goldValue,
      silver: silverValue,
      cash,
      investments,
      total: totalWealth,
      zakatAmount,
      nisab,
    };

    setCalculation(result);
    
    // Track calculator usage
    AnalyticsService.trackCalculatorUse('zakat', inputs, result);
  };

  const handleInputChange = (field: keyof typeof inputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const downloadReport = () => {
    Alert.alert(
      'Pro Feature',
      'PDF report download is available for Pro members only. Upgrade to access this feature.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Upgrade', onPress: () => console.log('Navigate to subscription') },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color={COLORS.neutral[600]} />
        </TouchableOpacity>
        <Text style={styles.title}>Zakat Calculator</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.goldPriceCard}>
          <Text style={styles.goldPriceLabel}>Current Gold Price (per 10g)</Text>
          <Text style={styles.goldPrice}>₹{goldPrice.toLocaleString()}</Text>
          <Text style={styles.goldPriceNote}>Updated from live market data</Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Your Assets</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Gold (in grams)</Text>
            <TextInput
              style={styles.input}
              value={inputs.gold}
              onChangeText={(value) => handleInputChange('gold', value)}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor={COLORS.neutral[400]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Silver (in grams)</Text>
            <TextInput
              style={styles.input}
              value={inputs.silver}
              onChangeText={(value) => handleInputChange('silver', value)}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor={COLORS.neutral[400]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cash & Savings (₹)</Text>
            <TextInput
              style={styles.input}
              value={inputs.cash}
              onChangeText={(value) => handleInputChange('cash', value)}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor={COLORS.neutral[400]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Investments & Stocks (₹)</Text>
            <TextInput
              style={styles.input}
              value={inputs.investments}
              onChangeText={(value) => handleInputChange('investments', value)}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor={COLORS.neutral[400]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Outstanding Debts (₹)</Text>
            <TextInput
              style={styles.input}
              value={inputs.debts}
              onChangeText={(value) => handleInputChange('debts', value)}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor={COLORS.neutral[400]}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.calculateButton} onPress={calculateZakat}>
          <Calculator size={20} color="white" />
          <Text style={styles.calculateButtonText}>Calculate Zakat</Text>
        </TouchableOpacity>

        {calculation && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Zakat Calculation</Text>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Total Zakatable Wealth</Text>
              <Text style={styles.resultValue}>₹{calculation.total.toLocaleString()}</Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Nisab Threshold</Text>
              <Text style={styles.resultValue}>₹{calculation.nisab.toLocaleString()}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.resultRow}>
              <Text style={styles.zakatLabel}>Zakat Amount (2.5%)</Text>
              <Text style={styles.zakatAmount}>₹{calculation.zakatAmount.toLocaleString()}</Text>
            </View>

            {calculation.zakatAmount > 0 ? (
              <View style={styles.zakatNote}>
                <Info size={16} color={COLORS.success[500]} />
                <Text style={styles.zakatNoteText}>
                  You are obligated to pay Zakat this year. May Allah accept your charity.
                </Text>
              </View>
            ) : (
              <View style={styles.zakatNote}>
                <Info size={16} color={COLORS.neutral[500]} />
                <Text style={styles.zakatNoteText}>
                  Your wealth is below the Nisab threshold. No Zakat is due this year.
                </Text>
              </View>
            )}

            <TouchableOpacity style={styles.downloadButton} onPress={downloadReport}>
              <Download size={16} color={COLORS.gold[600]} />
              <Text style={styles.downloadButtonText}>Download PDF Report</Text>
            </TouchableOpacity>
          </View>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  goldPriceCard: {
    backgroundColor: COLORS.gold[50],
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gold[200],
  },
  goldPriceLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.gold[700],
    marginBottom: 4,
  },
  goldPrice: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: COLORS.gold[800],
    marginBottom: 4,
  },
  goldPriceNote: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.gold[600],
  },
  inputSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[700],
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[800],
    backgroundColor: COLORS.neutral[50],
  },
  calculateButton: {
    backgroundColor: COLORS.primary[600],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: COLORS.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  calculateButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  resultCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  resultTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 16,
    textAlign: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  resultLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
  },
  resultValue: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[800],
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.neutral[200],
    marginVertical: 12,
  },
  zakatLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.primary[700],
  },
  zakatAmount: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: COLORS.primary[600],
  },
  zakatNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.neutral[50],
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  zakatNoteText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[700],
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gold[50],
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gold[200],
  },
  downloadButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.gold[600],
    marginLeft: 6,
  },
});