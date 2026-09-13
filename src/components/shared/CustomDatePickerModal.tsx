import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Colors, Theme } from '../../constants/color';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DynamicModal from './DynamicModal'; // ✅ make sure path is correct (adjust if needed)

interface CustomDatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  initialDate?: Date;
  minDate?: Date;
  maxDate?: Date;
  title?: string;
}

const CustomDatePickerModal: React.FC<CustomDatePickerModalProps> = ({
  visible,
  onClose,
  onDateSelect,
  initialDate = new Date(),
  minDate,
  maxDate,
  title = 'ENTER YOUR DATE OF BIRTH',
}) => {
  const [selectedDay, setSelectedDay] = useState(initialDate.getDate());
  const [selectedMonth, setSelectedMonth] = useState(initialDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(initialDate.getFullYear());
  const [showAgeError, setShowAgeError] = useState(false); // ✅ control DynamicModal

  const currentYear = new Date().getFullYear();
  const startYear = Math.max(1970, minDate ? minDate.getFullYear() : 1970);
  const endYear = maxDate ? maxDate.getFullYear() : currentYear + 10;

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

  useEffect(() => {
    if (visible && initialDate) {
      setSelectedDay(initialDate.getDate());
      setSelectedMonth(initialDate.getMonth() + 1);
      setSelectedYear(initialDate.getFullYear());
    }
  }, [initialDate, visible]);

  const handleDone = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const validDay = Math.min(selectedDay, daysInMonth);
    const selectedDate = new Date(selectedYear, selectedMonth - 1, validDay);

    const today = new Date();
    const fourteenYearsAgo = new Date(
      today.getFullYear() - 14,
      today.getMonth(),
      today.getDate()
    );

    // ✅ 14-year validation
    if (selectedDate > fourteenYearsAgo) {
      setShowAgeError(true);
      return;
    }

    if (minDate && selectedDate < minDate) return;
    if (maxDate && selectedDate > maxDate) return;

    onDateSelect(selectedDate);
    onClose();
  };

  const renderScrollableColumn = (
    label: string,
    data: number[],
    selectedValue: number,
    onSelect: (value: number) => void,
    formatter?: (value: number) => string
  ) => {
    return (
      <View style={styles.columnContainer}>
        <Text style={styles.columnLabel}>{label}</Text>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {data.map(value => (
            <TouchableOpacity
              key={value}
              style={[
                styles.dateItem,
                selectedValue === value && styles.selectedDateItem,
              ]}
              onPress={() => onSelect(value)}>
              <Text
                style={[
                  styles.dateText,
                  selectedValue === value && styles.selectedDateText,
                ]}>
                {formatter ? formatter(value) : value.toString().padStart(2, '0')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const formatMonth = (month: number): string => {
    return month.toString().padStart(2, '0');
  };

  return (
    <>
      {/* Main Date Picker Modal */}
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="close" size={22} color={Colors.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.datePickerContainer}>
              {renderScrollableColumn('Day', days, selectedDay, setSelectedDay)}
              {renderScrollableColumn('Month', months, selectedMonth, setSelectedMonth, formatMonth)}
              {renderScrollableColumn('Year', years, selectedYear, setSelectedYear)}
            </View>

            <View style={styles.doneContainer}>
              <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ✅ Dynamic Modal for Age Validation */}
      <DynamicModal
        visible={showAgeError}
        icon={<Icon name="error-outline" size={40} color={Colors.primary} />}
        text="You must be at least 14 years old to sign up."
        acceptText="OK"
        rejectText=""
        onAccept={() => setShowAgeError(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    width: Dimensions.get('window').width * 0.85,
    maxHeight: Dimensions.get('window').height * 0.7,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: Colors.primary,
    paddingVertical: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 4,
  },
  datePickerContainer: {
    flexDirection: 'row',
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.sm,
    minHeight: 250,
  },
  columnContainer: {
    flex: 1,
    marginHorizontal: Theme.spacing.xs,
  },
  columnLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  scrollView: {
    maxHeight: 220,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  dateItem: {
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    marginVertical: 2,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDateItem: {
    backgroundColor: Colors.primary,
  },
  dateText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  selectedDateText: {
    color: Colors.white,
    fontWeight: '600',
  },
  doneContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray,
    padding: Theme.spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
  },
  doneButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
    borderRadius: Theme.borderRadius.md,
  },
  doneButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomDatePickerModal;
