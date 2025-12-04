import React, { useEffect, useState } from 'react';
import { View, TextInput, TextInputProps, StyleSheet, TouchableOpacity } from 'react-native';

import { CountryPicker } from 'react-native-country-codes-picker';

import EvilIcons from '@expo/vector-icons/EvilIcons';
import { ThemedText } from './themed-text';

const defaultCountry = {
  callingCode: '+595',
  flag: '🇵🇾',
  country: 'PY',
};

type Props = {
  label?: string;
  error?: boolean;
  disabled?: boolean;
  onChangeText: (number: string) => void;
  errorMsg?: string;
} & Omit<TextInputProps, 'onChangeText'>;

const PY_CALLING_CODE = '595';

const PhoneNumberInput: React.FC<Props> = ({
  label,
  onChangeText,
  disabled,
  error,
  errorMsg,
  ...otherProps
}) => {
  const [modalCountryVisible, setModalCountryVisible] = useState(false);
  const [code, setCountryCode] = useState(defaultCountry.callingCode);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [flag, setflag] = useState(defaultCountry.flag);

  const handlePhoneChange = (text: string) => {
    let sanitized = text;

    if (code === PY_CALLING_CODE) {
      sanitized = sanitized.replace(/^0+/, '');
    }

    setPhoneNumber(sanitized);
  };

  useEffect(() => {
    if (code && phoneNumber) {
      onChangeText(`${code}${phoneNumber}`);
    }
  }, [code, phoneNumber]);

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
        <TouchableOpacity
          onPress={() => setModalCountryVisible(true)}
          style={styles.pickerContainer}
        >
          <ThemedText>
            {flag} {code}
          </ThemedText>
          <EvilIcons name="chevron-down" size={24} />
        </TouchableOpacity>
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

        <TextInput
          editable={!disabled}
          style={styles.input}
          keyboardType={'numeric'}
          value={phoneNumber}
          onChangeText={handlePhoneChange}
          {...otherProps}
        />
      </View>
      {!!errorMsg && <ThemedText style={styles.errorText}>{errorMsg}</ThemedText>}

      <CountryPicker
        show={modalCountryVisible}
        lang="es"
        onBackdropPress={() => setModalCountryVisible(false)}
        onRequestClose={() => setModalCountryVisible(false)}
        showOnly={['AR', 'PY', 'BR', 'CL', 'UY', 'BO', 'PE', 'CO', 'VE']}
        style={{
          modal: { height: '80%' },
        }}
        pickerButtonOnPress={(item) => {
          setCountryCode(item.dial_code);
          setflag(item.flag);
          setModalCountryVisible(false);
        }}
      />
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
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    gap: 2,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'UenoLogical-Book',
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

export default PhoneNumberInput;
