import React, { useState } from 'react';
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
import { InheritanceCalculation } from '@/types';
import { ArrowLeft, Scale, Download, Info, Users } from 'lucide-react-native';

interface Props {
  onBack: () => void;
}

export default function InheritanceCalculator({ onBack }: Props) {
  const [inputs, setInputs] = useState({
    totalWealth: '',
    debts: '',
    spouse: '',
    sons: '',
    daughters: '',
    father: '',
    mother: '',
  });
  const [calculation, setCalculation] = useState<InheritanceCalculation | null>(null);

  const calculateInheritance = () => {
    const totalWealth = parseFloat(inputs.totalWealth) || 0;
    const debts = parseFloat(inputs.debts) || 0;
    const netWealth = totalWealth - debts;

    if (netWealth <= 0) {
      Alert.alert('Error', 'Net wealth must be positive to calculate inheritance');
      return;
    }

    const heirs = {
      spouse: parseInt(inputs.spouse) || 0,
      sons: parseInt(inputs.sons) || 0,
      daughters: parseInt(inputs.daughters) || 0,
      father: parseInt(inputs.father) || 0,
      mother: parseInt(inputs.mother) || 0,
    };

    // Simplified Islamic inheritance calculation using fixed percentages
    // Note: This is a basic implementation. Real-world scenarios may require more complex calculations
    const distribution: Record<string, number> = {};

    let remainingWealth = netWealth;

    // Parents first (if alive)
    if (heirs.father > 0) {
      const fatherShare = netWealth * 0.1667; // 1/6th
      distribution['Father'] = fatherShare;
      remainingWealth -= fatherShare;
    }

    if (heirs.mother > 0) {
      const motherShare = netWealth * 0.1667; // 1/6th
      distribution['Mother'] = motherShare;
      remainingWealth -= motherShare;
    }

    // Spouse
    if (heirs.spouse > 0) {
      const spouseShare = (heirs.sons > 0 || heirs.daughters > 0) 
        ? netWealth * 0.125  // 1/8th if children exist
        : netWealth * 0.25;  // 1/4th if no children
      distribution['Spouse'] = spouseShare;
      remainingWealth -= spouseShare;
    }

    // Children - sons get double share of daughters
    const totalChildShares = (heirs.sons * 2) + heirs.daughters;
    if (totalChildShares > 0) {
      const perDaughterShare = remainingWealth / totalChildShares;
      const perSonShare = perDaughterShare * 2;

      if (heirs.daughters > 0) {
        distribution[`Daughters (${heirs.daughters})`] = perDaughterShare * heirs.daughters;
      }
      if (heirs.sons > 0) {
        distribution[`Sons (${heirs.sons})`] = perSonShare * heirs.sons;
      }
    }

    const result: InheritanceCalculation = {
      totalWealth,
      debts,
      netWealth,
      heirs,
      distribution,
    };

    setCalculation(result);
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
        <Text style={styles.title}>Inheritance Calculator</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.infoCard}>
          <Info size={20} color={COLORS.primary[600]} />
          <Text style={styles.infoText}>
            This calculator uses fixed percentage Islamic inheritance rules. 
            Complex cases may require consultation with a qualified Islamic scholar.
          </Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Estate Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Total Wealth (₹)</Text>
            <TextInput
              style={styles.input}
              value={inputs.totalWealth}
              onChangeText={(value) => handleInputChange('totalWealth', value)}
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

        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Heirs</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Spouse (0 or 1)</Text>
            <TextInput
              style={styles.input}
              value={inputs.spouse}
              onChangeText={(value) => handleInputChange('spouse', value)}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor={COLORS.neutral[400]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Number of Sons</Text>
            <TextInput
              style={styles.input}
              value={inputs.sons}
              onChangeText={(value) => handleInputChange('sons', value)}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor={COLORS.neutral[400]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Number of Daughters</Text>
            <TextInput
              style={styles.input}
              value={inputs.daughters}
              onChangeText={(value) => handleInputChange('daughters', value)}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor={COLORS.neutral[400]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Father (0 or 1)</Text>
            <TextInput
              style={styles.input}
              value={inputs.father}
              onChangeText={(value) => handleInputChange('father', value)}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor={COLORS.neutral[400]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mother (0 or 1)</Text>
            <TextInput
              style={styles.input}
              value={inputs.mother}
              onChangeText={(value) => handleInputChange('mother', value)}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor={COLORS.neutral[400]}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.calculateButton} onPress={calculateInheritance}>
          <Scale size={20} color="white" />
          <Text style={styles.calculateButtonText}>Calculate Inheritance</Text>
        </TouchableOpacity>

        {calculation && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Inheritance Distribution</Text>
            
            <View style={styles.wealthSummary}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Total Wealth</Text>
                <Text style={styles.resultValue}>₹{calculation.totalWealth.toLocaleString()}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Debts</Text>
                <Text style={styles.resultValue}>₹{calculation.debts.toLocaleString()}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.resultRow}>
                <Text style={styles.netWealthLabel}>Net Inheritable Wealth</Text>
                <Text style={styles.netWealthValue}>₹{calculation.netWealth.toLocaleString()}</Text>
              </View>
            </View>

            <View style={styles.distributionSection}>
              <Text style={styles.distributionTitle}>Distribution</Text>
              {Object.entries(calculation.distribution).map(([heir, amount]) => (
                <View key={heir} style={styles.heirRow}>
                  <Users size={16} color={COLORS.primary[600]} />
                  <Text style={styles.heirName}>{heir}</Text>
                  <Text style={styles.heirAmount}>₹{amount.toLocaleString()}</Text>
                </View>
              ))}
            </View>

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
  infoCard: {
    backgroundColor: COLORS.primary[50],
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.primary[700],
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
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
  wealthSummary: {
    marginBottom: 20,
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
  netWealthLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.primary[700],
  },
  netWealthValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: COLORS.primary[600],
  },
  distributionSection: {
    marginBottom: 20,
  },
  distributionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 12,
  },
  heirRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.neutral[50],
    borderRadius: 8,
    marginBottom: 8,
  },
  heirName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[700],
    marginLeft: 12,
    flex: 1,
  },
  heirAmount: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.primary[600],
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