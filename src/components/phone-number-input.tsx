import React, { useEffect, useState } from 'react';
import { View, TextInput, TextInputProps, StyleSheet } from 'react-native';
import CountryPicker, { Country } from 'react-native-country-picker-modal-v2';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { ThemedText } from './themed-text';

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
  const [code, setCountryCode] = useState<Country>({
    cca2: 'PY',
    callingCode: ['595'],
    currency: ['PYG'],
    flag: '🇵🇾',
    name: 'Paraguay',
    region: 'Americas',
    subregion: 'South America',
  });
  const [phoneNumber, setPhoneNumber] = useState('');

  const handlePhoneChange = (text: string) => {
    let sanitized = text;

    if (code?.callingCode?.[0] === PY_CALLING_CODE) {
      sanitized = sanitized.replace(/^0+/, '');
    }

    setPhoneNumber(sanitized);
  };

  useEffect(() => {
    if (code?.callingCode && phoneNumber) {
      onChangeText(`+${code.callingCode[0]}${phoneNumber}`);
    }
  }, [code, phoneNumber]);

  return (
    <View style={{ gap: 4 }}>
      {!!label && <ThemedText type="defaultSemiBold">{label}</ThemedText>}
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
        <View style={styles.pickerContainer}>
          <CountryPicker
            preferredCountries={['PY', 'AR', 'UY', 'BR']}
            countryCode={code?.cca2 ?? 'US'}
            i18nIsDynamicList
            withAlphaFilter={false}
            withFilter
            withCallingCode
            withCallingCodeButton
            onSelect={setCountryCode}
            theme={{
              fontSize: 14,
              fontFamily: 'UenoLogical-Book',
            }}
          />
        </View>
        <EvilIcons name="chevron-down" size={24} />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    height: 60,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerContainer: {
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'UenoLogical-Book',
  },
  line: { width: 1, height: 45, backgroundColor: 'black', marginHorizontal: 12 },
  errorText: {
    color: 'red',
  },
});

export default PhoneNumberInput;
