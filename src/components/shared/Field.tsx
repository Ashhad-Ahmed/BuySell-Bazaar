import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors } from '../../constants/color';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomDatePickerModal from './CustomDatePickerModal';
import CustomDropdown, { DropdownOption } from './CustomDropDown';
import { fonts } from '../../config/themes/typography';

export interface FieldConfig {
  label: string;
  name: string;
  type: 'text' | 'number' | 'dropdown' | 'date';
  placeholder?: string;
  options?: DropdownOption[];
  multiline?: boolean;
  height?: number;
  searchable?: boolean;
}

interface Props {
  fields: FieldConfig[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  children?: React.ReactNode;
  compact?: boolean; // Add compact prop
}

const Field: React.FC<Props> = ({ fields, values, onChange, children, compact = false }) => {
  const [datePickerVisibleFor, setDatePickerVisibleFor] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // const getDropdownOptions = (options: string[] = []): DropdownOption[] => {
  //   return options.map(option => ({
  //     label: option,
  //     value: option,
  //   }));
  // };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View style={[styles.outerContainer, compact && styles.compactContainer]}>
        <View style={styles.innerContainer}>
          {fields.map((field, index) => (
            <View
              key={field.name}
              style={[
                styles.fieldContainer,
                compact && styles.compactFieldContainer,
                field.type === 'dropdown' && { zIndex: fields.length - index },
              ]}
            >
              {field.label && <Text style={styles.label}>{field.label}</Text>}

              {field.type === 'text' || field.type === 'number' ? (
                <TextInput
                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                  placeholderTextColor={Colors.textPlaceholder}
                  keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                  style={[
                    styles.input,
                    compact && styles.compactInput,
                    focusedField === field.name && styles.inputFocused,
                    field.multiline && {
                      height: field.height || 120,
                      textAlignVertical: 'top' as const,
                    },
                    { color: Colors.black }
                  ]}
                  multiline={field.multiline || false}
                  value={values[field.name] || ''}
                  onChangeText={(text) => onChange(field.name, text)}
                  onFocus={() => setFocusedField(field.name)}
                  onBlur={() => setFocusedField(null)}
                />
              ) : field.type === 'dropdown' ? (
                <CustomDropdown
                  placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`}
                 options={field.options || []} 
                  value={values[field.name]}
                  onSelect={(value) => onChange(field.name, value)}
                  searchable={field.searchable !== false}
                  style={[
                    focusedField === field.name && styles.inputFocused,
                  ]}
                  // zIndex={fields.length - index}
                />
              ) : field.type === 'date' ? (
                <>
                  <TouchableOpacity
                    style={[
                      styles.input,
                      styles.dateInput,
                      focusedField === field.name && styles.inputFocused,
                    ]}
                    onPress={() => {
                      setDatePickerVisibleFor(field.name);
                      setFocusedField(field.name);
                    }}
                  >
                    <Text
                      style={[
                        styles.dateText,
                        {
                          color: values[field.name] ? Colors.text : Colors.textPlaceholder,
                        },
                      ]}
                    >
                      {values[field.name]
                        ? new Date(values[field.name]).toLocaleDateString()
                        : field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    </Text>
                    <Icon name="calendar-month" size={20} color={Colors.primary} />
                  </TouchableOpacity>

                  <CustomDatePickerModal
                    visible={datePickerVisibleFor === field.name}
                    initialDate={
                      values[field.name] instanceof Date
                        ? values[field.name]
                        : values[field.name]
                        ? new Date(values[field.name])
                        : new Date()
                    }
                    onClose={() => {
                      setDatePickerVisibleFor(null);
                      setFocusedField(null);
                    }}
                    onDateSelect={(date) => {
                      onChange(field.name, date.toISOString());
                      setDatePickerVisibleFor(null);
                      setFocusedField(null);
                    }}
                  />
                </>
              ) : null}
            </View>
          ))}

          {children}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  outerContainer: {
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
  },
  compactContainer: {
    padding: 0,
    marginTop: 0,
  },
  innerContainer: {
    width: '100%',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  compactFieldContainer: {
    marginBottom: 0,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
    fontSize: 14,
    color: Colors.black,
    fontFamily: fonts['Poppins-Medium'],
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.grayBase,
    borderRadius: 20,
    padding: 16,
    fontSize: 12,
    backgroundColor: Colors.white,
    justifyContent: 'center' as const,
    fontFamily: fonts['Poppins-Regular'],
  },
  compactInput: {
    padding: 12,
    fontSize: 13,
    fontFamily: fonts['Poppins-Regular'],
  },
  inputFocused: {
    borderColor: Colors.black,
    borderWidth: 1.2,
  },
  dateInput: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  dateText: {
    fontSize: 14,
    flex: 1,
    fontFamily: fonts['Poppins-Regular'],
  },
});

export default Field;