import React from 'react';
import { View, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { ThemedText } from './themed-text';
import { ECredentialType } from '@/types/user';
import { theme } from '@/themes/theme';

const DOCUMENT_TYPE_OPTIONS = [
  { label: 'Cédula', value: ECredentialType.CI },
  { label: 'DNI', value: ECredentialType.DNI },
  { label: 'Pasaporte', value: ECredentialType.PASSPORT },
];

type Props = {
  label?: string;
  error?: boolean;
  errorMsg?: string;
  documentType: ECredentialType;
  onChangeDocumentType: (type: ECredentialType) => void;
  onChangeText: (value: string) => void;
} & Omit<TextInputProps, 'onChangeText'>;

const DocumentIdInput: React.FC<Props> = ({
  label,
  error,
  errorMsg,
  documentType,
  onChangeDocumentType,
  onChangeText,
  ...otherProps
}) => {
  return (
    <View style={{ gap: 4 }}>
      {!!label && (
        <ThemedText type="defaultSemiBold" style={{ fontSize: 14 }}>
          {label}
        </ThemedText>
      )}
      <View
        style={[
          styles.container,
          error
            ? {
                borderColor: '#FF6858',
              }
            : null,
        ]}
      >
        <Dropdown
          style={styles.dropdown}
          selectedTextStyle={styles.selectedTextStyle}
          itemTextStyle={{ fontSize: 12, fontFamily: theme.typography.fonts.regular }}
          iconStyle={styles.iconStyle}
          data={DOCUMENT_TYPE_OPTIONS}
          maxHeight={200}
          labelField="label"
          valueField="value"
          value={documentType}
          onChange={(item) => onChangeDocumentType(item.value)}
        />
        <View
          style={[
            styles.line,
            error
              ? {
                  backgroundColor: '#FF6858',
                }
              : null,
          ]}
        />
        <TextInput style={styles.input} onChangeText={onChangeText} {...otherProps} />
      </View>
      {!!errorMsg && <ThemedText style={styles.errorText}>{errorMsg}</ThemedText>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#DCE1E8',
    borderRadius: 8,
    height: 45,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdown: {
    width: 90,
  },
  selectedTextStyle: {
    fontSize: 12,
    fontFamily: theme.typography.fonts.regular,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'UenoLogical-Book',
    color: 'black',
    paddingLeft: 8,
  },
  line: {
    width: 1,
    height: '100%',
    backgroundColor: '#DCE1E8',
    marginHorizontal: 8,
  },
  errorText: {
    color: 'red',
  },
});

export default DocumentIdInput;
