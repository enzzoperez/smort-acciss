import React, { useEffect, useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import { UiButton } from '@/components/ui-button';
import { appVersion } from '@/utils/device-utils';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { useLogoutMutation } from '@/api/auth-api';
import { useAppDispatch, useAppSelector } from '@/libs/redux';
import {
  resetUserData,
  setConfigEventQr,
  setLogout,
  setSelectedEvent,
  setSelectedEventConfig,
  setServerOffset,
  setVerifyOnly,
} from '@/store/slices';
import { useRouter } from 'expo-router';
import Layer from '@/components/layer';
import { Dropdown } from 'react-native-element-dropdown';
import { useGetEventQrConfigMutation, useGetEventsQuery } from '@/api/events-api';
import { Header } from '@/components/header-logo';
import { useNetwork } from '@/providers/network-provider';
import { useSyncOfflineData } from '@/hooks/use-sync-offline-data';
import { logError } from '@/libs/crashlytics';
import { clearAllData, initialSyncTickets } from '@/db/utils';
import { useDb } from '@/hooks/use-db';

const SelectEventsScreen = () => {
  const router = useRouter();
  const { sync } = useSyncOfflineData();
  const { userData } = useAppSelector((state) => state.user);
  const { selectedEvent } = useAppSelector((state) => state.config);
  const dispatch = useAppDispatch();
  const { isOnline } = useNetwork();
  const [logout] = useLogoutMutation();
  const { data: dataEvents, isLoading, isFetching, isError, refetch } = useGetEventsQuery();
  const [getQrConfig] = useGetEventQrConfigMutation();
  const { db } = useDb();

  const [itemSelected, setItemSelected] = useState<{
    eventCode: string;
    eventName: string;
    mode: string;
    sections: string[];
  } | null>(null);

  const calculateServerOffset = (serverTime: string | undefined) => {
    if (serverTime) {
      const serverNow = new Date(serverTime).getTime();
      const deviceNow = Date.now();
      const offset = serverNow - deviceNow;

      dispatch(setServerOffset(offset));
    }
  };

  const saveQrConfig = async (eventCode: string) => {
    try {
      const data = await getQrConfig({ eventCode }).unwrap();
      if (data && data?.length === 1) {
        const serverTime = data[0]?.serverTime;

        calculateServerOffset(serverTime);

        dispatch(setConfigEventQr(data[0]));
      } else if (data?.length && data.length > 1) {
        const configObject = data.find((config) => config.code === eventCode);

        const serverTime = configObject?.serverTime;
        calculateServerOffset(serverTime);

        dispatch(setConfigEventQr(configObject!));
      }
    } catch (error) {
      logError(error as Error);
      return;
    }
  };

  const closeSession = () => {
    logout({ accountId: userData?.accountId });
    dispatch(setLogout());
    dispatch(resetUserData());
    dispatch(setSelectedEvent(null));
    if (db) {
      clearAllData(db);
    }
  };

  const onRefresh = () => {
    refetch();
  };

  const onChangeSelectedEvent = async (item: {
    eventCode: string;
    eventName: string;
    mode: string;
    sections: string[];
  }) => {
    setItemSelected(item);
  };

  const Buttons = () => (
    <View style={{ gap: 16 }}>
      <UiButton
        disabled={!selectedEvent}
        variant="tertiary"
        text={'Escanear'}
        onPress={() => router.push('/camera')}
      />
    </View>
  );

  //Si habia un evento seleccionado lo pone como default, sirve cuando vuelve a la screen de inicio
  useEffect(() => {
    if (selectedEvent && dataEvents) {
      const selected = dataEvents?.config.find((event) => event.eventCode === selectedEvent);
      setItemSelected(selected || null);
    }
  }, []);

  //Cada vez que cambia el event seleccionado trae la lista de tickets VALIDOS del event
  //y guarda la config del QR para saber si es dinamico o estatico y el offset del server para controlar la validez de los QR dinamicos
  useEffect(() => {
    const handleSelectedEventChange = async () => {
      if (itemSelected && dataEvents && db) {
        const selected = dataEvents?.config.find(
          (event) => event.eventCode === itemSelected.eventCode,
        );

        if (selected) {
          try {
            await initialSyncTickets(itemSelected.eventCode, db);

            saveQrConfig(selected.eventCode);

            setItemSelected(selected);
            dispatch(setSelectedEvent(selected.eventCode));
            dispatch(setSelectedEventConfig(dataEvents?.config[0]));
            dispatch(setVerifyOnly(selected.mode === 'CHECK'));
          } catch {
            setItemSelected(null);
          }
        }
      }
    };

    handleSelectedEventChange();
  }, [itemSelected, dataEvents, db]);

  //Trae la data de los eventos asignados al user y si solo tiene uno asignado lo selecciona por defecto
  useEffect(() => {
    try {
      if (dataEvents && dataEvents?.config.length === 1) {
        setItemSelected(dataEvents?.config[0]);
        dispatch(setSelectedEventConfig(dataEvents?.config[0]));
        dispatch(setSelectedEvent(dataEvents?.config[0].eventCode));
        dispatch(setVerifyOnly(dataEvents?.config[0].mode === 'CHECK'));
      }
    } catch (error) {
      logError(error as Error);
    }
  }, [dataEvents]);

  //Cuando recupera conexion y si tiene un evento seleccionado trata de hacer el sync de tickets leidos
  useEffect(() => {
    if (isOnline && selectedEvent && db) {
      sync();
    }
  }, [isOnline]);

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
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={isFetching || isLoading} onRefresh={onRefresh} />
          }
        >
          <View style={styles.container}>
            <ThemedText style={{ color: 'red', textAlign: 'center' }}>
              Error al cargar los eventos. Por favor reinicia sesión o inténtalo de nuevo más tarde.
            </ThemedText>
            <UiButton variant="secondary" text={'Cerrar sesión'} onPress={closeSession} />
          </View>
        </ScrollView>
      </Layer>
    );
  }

  return (
    <Layer>
      <StatusBar barStyle="dark-content" backgroundColor="white" translucent={false} />

      <Header onRightPress={closeSession} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={isFetching || isLoading} onRefresh={onRefresh} />
        }
      >
        <View style={styles.container}>
          <View style={{ marginBottom: 32 }}>
            <ThemedText type="title" style={styles.title}>
              Control de accesos en:
            </ThemedText>

            {dataEvents?.config && (
              <View style={{ gap: 24 }}>
                {/* Select event */}
                <View style={{ gap: 8 }}>
                  <ThemedText type="subtitle" style={{ fontSize: 16 }}>
                    Eventos
                  </ThemedText>
                  <Dropdown
                    style={styles.dropdown}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    iconStyle={styles.iconStyle}
                    data={dataEvents?.config}
                    maxHeight={300}
                    labelField="eventName"
                    valueField="eventCode"
                    placeholder="Elegir evento"
                    searchPlaceholder="Buscar..."
                    value={selectedEvent}
                    onChange={onChangeSelectedEvent}
                  />
                </View>

                {selectedEvent && (
                  <>
                    {/* Asociated Sections */}
                    <View style={{ gap: 8 }}>
                      <ThemedText type="title" style={styles.title}>
                        Asignaciones
                      </ThemedText>
                      <ScrollView
                        indicatorStyle="black"
                        style={{
                          backgroundColor: '#00000008',
                          borderRadius: 16,
                          padding: 20,
                          maxHeight: 300,
                        }}
                      >
                        {itemSelected &&
                          itemSelected.sections.map((section) => (
                            <ThemedText
                              key={section}
                              type="default"
                              style={styles.itemAsociatedSection}
                            >
                              → {section}
                            </ThemedText>
                          ))}
                      </ScrollView>
                    </View>

                    {/* Reader mode */}
                    <View style={{ gap: 8 }}>
                      <ThemedText type="title" style={styles.title}>
                        Método de lectura:
                      </ThemedText>
                      <View
                        style={{
                          backgroundColor: '#00000008',
                          borderRadius: 16,
                          gap: 8,
                          padding: 20,
                        }}
                      >
                        <ThemedText>
                          {itemSelected && itemSelected.mode === 'CHECK'
                            ? '→  Verificación de QR'
                            : '→  Verificación y quemado de Qr'}
                        </ThemedText>
                      </View>
                    </View>
                  </>
                )}
              </View>
            )}
          </View>

          <Buttons />
        </View>

        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <ThemedText type="subtitle" style={{ color: 'black', fontSize: 12 }}>
            {appVersion}
          </ThemedText>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 28,
    color: 'black',
    marginTop: 24,
    marginBottom: 16,
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
    borderColor: '#1D252D',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 16,
    fontFamily: 'UenoLogicalBook',
    opacity: 0.4,
  },
  selectedTextStyle: {
    fontSize: 16,
    fontFamily: 'UenoLogicalBook',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },

  itemAsociatedSection: {
    fontSize: 20,
    marginBottom: 8,
  },
});

export default SelectEventsScreen;
