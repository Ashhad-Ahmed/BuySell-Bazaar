import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../../components/shared/Header';
import { Colors, Theme } from '../../constants/color';
import Field from '../../components/shared/Field';
import CustomDropdown from '../../components/shared/CustomDropDown';
import { useMasterData } from '../../services/hooks/useMasterData';

const conditions = [
  'New',
  'Used',
  'Open Box',
  'Refurbished',
  'For Parts or Not Working',
];

const FilterScreen = () => {
  const navigation = useNavigation();
  
  // Use React Query for cached master data
  const { data: masterData } = useMasterData();
  const locationOptions = masterData?.cities || [];
  const brandOptions = masterData?.brands || [];
  
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Header
        type="navigation"
        title="Filters"
        icon="arrow-back-ios"
        onPress={handleGoBack}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.fieldGroup}>
          <Text style={styles.sectionLabel}>Location</Text>
          <CustomDropdown
            placeholder="Select Location"
            options={locationOptions}
            value={formData.location}
            onSelect={(value) => handleChange('location', value)}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.sectionLabel}>Price</Text>
          <View style={styles.priceRow}>
            <View style={styles.priceField}>
              <Field
                fields={[{
                  label: '',
                  name: 'minPrice',
                  type: 'number',
                  placeholder: 'Min Rs',
                }]}
                values={formData}
                onChange={handleChange}
                compact
              />
            </View>
            <Text style={styles.toText}>to</Text>
            <View style={styles.priceField}>
              <Field
                fields={[{
                  label: '',
                  name: 'maxPrice',
                  type: 'number',
                  placeholder: 'Max Rs',
                }]}
                values={formData}
                onChange={handleChange}
                compact
              />
            </View>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.sectionLabel}>Brand & Model</Text>
          <CustomDropdown
            placeholder="Select Brand"
            options={brandOptions}
            value={formData.brandModel}
            onSelect={(value) => handleChange('brandModel', value)}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.sectionLabel}>Condition</Text>
          <View style={styles.conditionContainer}>
            {conditions.map((condition) => {
              const selected = condition === selectedCondition;
              return (
                <TouchableOpacity
                  key={condition}
                  style={[styles.conditionButton, selected && styles.conditionSelected]}
                  onPress={() => setSelectedCondition(condition)}
                >
                  <Text
                    style={[styles.conditionText, selected && styles.conditionTextSelected]}
                  >
                    {condition}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={() => {
          setFormData({});
          setSelectedCondition(null);
        }}>
          <Text style={styles.resetText}>Reset filters</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContainer: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  sectionLabel: {
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 15,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  priceField: {
    flex: 1,
  },
  toText: {
    fontSize: 15,
    color: Colors.text,
  },
  conditionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  conditionButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Theme.borderRadius.round,
    paddingVertical: 5,
    paddingHorizontal: 16,
  },
  conditionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  conditionText: {
    fontSize: 12,
    color: Colors.text,
  },
  conditionTextSelected: {
    color: Colors.white,
    fontWeight: '500',
  },
  resetButton: {
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  resetText: {
    color: Colors.primary,
    fontWeight: '500',
  },
});

export default FilterScreen;
