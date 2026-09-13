import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';

import { Colors } from '../../constants/color';
import Header from '../../components/shared/Header';
import ToggleTabs from '../../components/shared/ToggleTabs';
import CardItem from '../../components/shared/CardItem';
import BottomButton from '../../components/shared/BottomButton';

const tabOptions = [
  { label: 'Demands', value: 'demand', icon: 'shopping-cart' },
  { label: 'Ads', value: 'ad', icon: 'ads-click' },
];

const MyDemandsScreen = () => {
  const [activeTab, setActiveTab] = useState<'demand' | 'ad'>('demand');

  const demands = [
    {
      title: 'Nike Gold Metcon',
      price: 'Rs 7500.00',
      condition: 'New',
      location: 'Gulberg Phase 4, Khi',
      image: require('../../images/ShoeImage.png'),
    },
    {
      title: 'Nike Gold Metcon',
      price: 'Rs 7500.00',
      condition: 'New',
      location: 'Gulberg Phase 4, Khi',
      image: require('../../images/ShoeImage.png'),
    },
    {
      title: 'Nike Gold Metcon',
      price: 'Rs 7500.00',
      condition: 'New',
      location: 'Gulberg Phase 4, Khi',
      image: require('../../images/ShoeImage.png'),
    },
    {
      title: 'Nike Gold Metcon',
      price: 'Rs 7500.00',
      condition: 'New',
      location: 'Gulberg Phase 4, Khi',
      image: require('../../images/ShoeImage.png'),
    },
    {
      title: 'Nike Gold Metcon',
      price: 'Rs 7500.00',
      condition: 'New',
      location: 'Gulberg Phase 4, Khi',
      image: require('../../images/ShoeImage.png'),
    },
  ];

  return (
    <View style={styles.container}>
      <Header type="navigation" title="My Demands" icon="arrow-back-ios" onPress={() => {}} />
      <View style={styles.contentWrapper}>
        <ToggleTabs
          activeTab={activeTab}
          onTabChange={(val) => setActiveTab(val as 'ad' | 'demand')}
          options={tabOptions}
        />
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>List of demands posted by you this month</Text>
          {demands.map((item, idx) => (
            <CardItem key={`demand-${idx}`} {...item} />
          ))}

          <Text style={styles.sectionTitle}>Ads from last month</Text>
          <CardItem {...demands[0]} />
        </ScrollView>
      </View>
      <BottomButton
        label={activeTab === 'demand' ? 'Create New Demand' : 'Create New Ad'}
        onPress={() => {}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  contentWrapper: {
    paddingHorizontal: 16,
    marginTop: 8,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.title,
    marginTop: 12,
    marginBottom: 15,
    lineHeight: 16,
  },
});

export default MyDemandsScreen;