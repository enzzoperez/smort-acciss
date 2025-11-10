import React from 'react';
import { ThemedText } from '@/components/themed-text';
import { UiButton } from '@/components/ui-button';
import { appVersion } from '@/utils/device-utils';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useLogoutMutation } from '@/api/auth-api';
import { useAppDispatch, useAppSelector } from '@/libs/redux';
import { resetUserData, setLogout, setSelectedEvent, setVerifyOnly } from '@/store/slices';
import { useRouter } from 'expo-router';
import Layer from '@/components/layer';
import { Dropdown } from 'react-native-element-dropdown';
import { useGetEventsQuery } from '@/api/events-api';

const modesVerify = [
  { label: 'Solo Verificar', value: true },
  { label: 'Verificar y Registrar', value: false },
];

const SelectEventsScreen = () => {
  const router = useRouter();
  const { userData } = useAppSelector((state) => state.user);
  const { selectedEvent } = useAppSelector((state) => state.config);

  const dispatch = useAppDispatch();
  const [logout] = useLogoutMutation();
  const { data: dataEvents, isLoading, isFetching, isError } = useGetEventsQuery();

  const closeSession = () => {
    logout({ accountId: userData?.accountId });
    dispatch(setLogout());
    dispatch(resetUserData());
  };

  const Buttons = () => (
    <View style={{ gap: 16 }}>
      <UiButton
        disabled={!selectedEvent}
        variant="tertiary"
        text={'Escanear'}
        onPress={() => router.push('/camera')}
      />

      <UiButton variant="secondary" text={'Cerrar sesión'} onPress={closeSession} />
    </View>
  );

  if (isLoading || isFetching) {
    return (
      <Layer>
        <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0000ff" />
          <ThemedText>Cargando eventos...</ThemedText>
        </View>
      </Layer>
    );
  }

  if (isError) {
    return (
      <Layer>
        <View style={styles.container}>
          <ThemedText style={{ color: 'red' }}>
            Error al cargar los eventos. Por favor, inténtalo de nuevo más tarde.
          </ThemedText>
          <UiButton variant="secondary" text={'Cerrar sesión'} onPress={closeSession} />
        </View>
      </Layer>
    );
  }

  return (
    <Layer>
      <View style={styles.container}>
        <View style={{ marginBottom: 32 }}>
          <ThemedText type="title" style={styles.title}>
            Selecciona el evento
          </ThemedText>

          {dataEvents && (
            <View style={{ gap: 32 }}>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={dataEvents}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Elegir evento"
                searchPlaceholder="Buscar..."
                value={selectedEvent}
                onChange={(item) => {
                  dispatch(setSelectedEvent(item.value));
                }}
              />

              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                iconStyle={styles.iconStyle}
                data={modesVerify}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Modo de lectura"
                value={selectedEvent}
                onChange={(item) => {
                  dispatch(setVerifyOnly(item.value));
                }}
              />
            </View>
          )}
        </View>

        <Buttons />
      </View>
      <View style={{ alignItems: 'center' }}>
        <ThemedText type="subtitle" style={{ color: 'black', fontSize: 12 }}>
          {appVersion}
        </ThemedText>
      </View>
    </Layer>
  );
};

const styles = StyleSheet.create({
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'space-between',
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 32,
    color: 'black',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: 'black',
    marginBottom: 16,
  },
  bold: {
    color: 'white',
    fontSize: 20,
  },
  buttonPrimary: {
    backgroundColor: 'white',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonPrimaryText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    borderColor: 'white',
    borderWidth: 2,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  //dropdown
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});

export default SelectEventsScreen;
