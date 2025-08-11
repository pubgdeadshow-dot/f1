import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '@/constants/colors';
import { Calculator, Scale, BookOpen } from 'lucide-react-native';
import ZakatCalculator from '@/components/calculators/ZakatCalculator';
import InheritanceCalculator from '@/components/calculators/InheritanceCalculator';

export default function CalculatorsScreen() {
  const [activeCalculator, setActiveCalculator] = useState<'zakat' | 'inheritance' | null>(null);

  if (activeCalculator === 'zakat') {
    return <ZakatCalculator onBack={() => setActiveCalculator(null)} />;
  }

  if (activeCalculator === 'inheritance') {
    return <InheritanceCalculator onBack={() => setActiveCalculator(null)} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Islamic Calculators</Text>
        <Text style={styles.subtitle}>Tools to help you fulfill your Islamic obligations</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <TouchableOpacity
          style={styles.calculatorCard}
          onPress={() => setActiveCalculator('zakat')}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Calculator size={28} color={COLORS.primary[600]} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Zakat Calculator</Text>
              <Text style={styles.cardDescription}>
                Calculate your annual Zakat obligation based on current gold prices
              </Text>
            </View>
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.featureText}>• Live gold prices</Text>
            <Text style={styles.featureText}>• Detailed breakdown</Text>
            <Text style={styles.featureText}>• PDF report (Pro)</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.calculatorCard}
          onPress={() => setActiveCalculator('inheritance')}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Scale size={28} color={COLORS.gold[600]} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Inheritance Calculator</Text>
              <Text style={styles.cardDescription}>
                Calculate Islamic inheritance distribution according to Shariah law
              </Text>
            </View>
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.featureText}>• Fixed percentage method</Text>
            <Text style={styles.featureText}>• Multiple heirs support</Text>
            <Text style={styles.featureText}>• Detailed breakdown</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <BookOpen size={24} color={COLORS.primary[600]} />
          <Text style={styles.infoTitle}>Learn More</Text>
          <Text style={styles.infoText}>
            These calculators are designed to help you fulfill your Islamic financial obligations. 
            For complex situations, please consult with a qualified Islamic scholar.
          </Text>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  calculatorCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    backgroundColor: COLORS.primary[50],
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    lineHeight: 20,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[100],
    paddingTop: 16,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    marginBottom: 4,
  },
  infoCard: {
    backgroundColor: COLORS.primary[50],
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.primary[700],
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.primary[600],
    textAlign: 'center',
    lineHeight: 20,
  },
});