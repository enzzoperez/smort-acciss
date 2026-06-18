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
  setAvailableEvents,
  setLogout,
  setResetConfig,
  setSelectedEvent,
  setVerifyOnly,
} from '@/store/slices';
import { useRouter } from 'expo-router';
import Layer from '@/components/layer';
import { Dropdown } from 'react-native-element-dropdown';
import { useGetEventsQuery } from '@/api/events-api';
import { Header } from '@/components/header-logo';
import { useNetwork } from '@/providers/network-provider';
import { useSyncOfflineData } from '@/hooks/use-sync-offline-data';
import { reportError as logError } from '@/utils/error-logger';
import { TrackingEvents } from '@/constants/tracking-events';
import { trackEvent } from '@/libs/tracking';
import { ConnectionStatusBanner } from '@/components/connection-status-banner';

const SelectEventsScreen = () => {
  const router = useRouter();
  const { sync } = useSyncOfflineData();
  const { userData } = useAppSelector((state) => state.user);
  const { selectedEvent, availableEvents } = useAppSelector((state) => state.config);
  const dispatch = useAppDispatch();
  const { isOnline } = useNetwork();
  const [logout] = useLogoutMutation();
  const {
    data: dataEvents,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetEventsQuery(undefined, { skip: !isOnline, refetchOnMountOrArgChange: isOnline });

  const [itemSelected, setItemSelected] = useState<{
    eventCode: string;
    eventName: string;
    mode: string;
    sections: string[];
  } | null>(null);

  const closeSession = () => {
    logout({ accountId: userData?.accountId });
    dispatch(setLogout());
    dispatch(resetUserData());
    dispatch(setResetConfig());
    trackEvent(TrackingEvents.LOGOUT_SUCCESS);
  };

  const onRefresh = () => {
    if (isOnline) {
      refetch();
    }
  };

  const onChangeSelectedEvent = async (item: {
    eventCode: string;
    eventName: string;
    mode: string;
    sections: string[];
  }) => {
    trackEvent(TrackingEvents.EVENT_SELECTED, { event_code: item.eventCode });
    setItemSelected(item);
  };

  const Buttons = () => (
    <View style={{ gap: 16 }}>
      <UiButton
        disabled={!selectedEvent}
        variant="tertiary"
        text={'Escanear'}
        onPress={() => {
          trackEvent(TrackingEvents.SCAN_BUTTON_PRESSED);
          router.push('/camera');
        }}
      />
    </View>
  );

  const eventsList = dataEvents?.config ?? availableEvents;

  useEffect(() => {
    if (dataEvents?.config && dataEvents.config.length > 0) {
      dispatch(setAvailableEvents(dataEvents.config));
    }
  }, [dataEvents]);

  useEffect(() => {
    if (selectedEvent && eventsList.length > 0) {
      const selected = eventsList.find((event) => event.eventCode === selectedEvent);
      setItemSelected(selected || null);
    }
  }, []);

  useEffect(() => {
    if (itemSelected) {
      const selected = eventsList.find((event) => event.eventCode === itemSelected.eventCode);

      if (selected) {
        setItemSelected(selected);
        dispatch(setSelectedEvent(selected.eventCode));
        dispatch(setVerifyOnly(selected.mode === 'CHECK'));
      }
    }
  }, [itemSelected, dataEvents]);

  useEffect(() => {
    try {
      if (eventsList.length === 1 && !selectedEvent) {
        setItemSelected(eventsList[0]);
        dispatch(setSelectedEvent(eventsList[0].eventCode));
        dispatch(setVerifyOnly(eventsList[0].mode === 'CHECK'));
      }
    } catch (error) {
      logError(error as Error);
    }
  }, [dataEvents]);

  useEffect(() => {
    if (isOnline && selectedEvent) {
      sync();
    }
  }, [isOnline, selectedEvent]);

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
            {!isOnline && <ConnectionStatusBanner isOnline={false} />}
            <ThemedText type="title" style={styles.title}>
              Control de accesos en:
            </ThemedText>

            {eventsList.length > 0 && (
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
                    data={eventsList}
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
