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
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useLogoutMutation } from '@/api/auth-api';
import { useAppDispatch, useAppSelector } from '@/libs/redux';
import {
  resetUserData,
  setAvailableEvents,
  setConfigEventQr,
  setLogout,
  setResetConfig,
  setScanDirection,
  setSelectedEvent,
  setSelectedEventConfig,
  setVerifyOnly,
} from '@/store/slices';
import { useRouter } from 'expo-router';
import Layer from '@/components/layer';
import { Dropdown } from 'react-native-element-dropdown';
import { useGetEventQrConfigMutation, useGetEventsQuery } from '@/api/events-api';
import { Header } from '@/components/header-logo';
import { useNetwork } from '@/providers/network-provider';
import { useSyncOfflineData } from '@/hooks/use-sync-offline-data';
import { reportError as logError, reportMessage as logMessage } from '@/utils/error-logger';
import { TrackingEvents } from '@/constants/tracking-events';
import { trackEvent } from '@/libs/tracking';
import { ConnectionStatusBanner } from '@/components/connection-status-banner';

const SECTIONS_PREVIEW = 5;

const SelectEventsScreen = () => {
  const [showAllSections, setShowAllSections] = useState(false);
  const router = useRouter();
  const { sync } = useSyncOfflineData();
  const { userData } = useAppSelector((state) => state.user);
  const { selectedEvent, availableEvents } = useAppSelector((state) => state.config);
  const dispatch = useAppDispatch();
  const { isOnline } = useNetwork();
  const [logout] = useLogoutMutation();
  const [getQrConfig] = useGetEventQrConfigMutation();
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

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const closeSession = async () => {
    setIsLoggingOut(true);
    try {
      await logout({ accountId: userData?.accountId }).unwrap();
    } catch (error) {
      logMessage('Logout request failed, proceeding with local logout');
      logError(error);
    }
    dispatch(setLogout());
    dispatch(resetUserData());
    dispatch(setResetConfig());
    trackEvent(TrackingEvents.LOGOUT_SUCCESS);
  };

  const saveQrConfig = async (eventCode: string) => {
    try {
      const data = await getQrConfig({ eventCode }).unwrap();
      if (data?.length) {
        dispatch(setConfigEventQr(data));
      }
    } catch (error) {
      logError(error as Error);
    }
  };

  const onRefresh = () => {
    if (isOnline) {
      refetch();
    }
  };

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
        dispatch(setSelectedEventConfig(selected));
      }
    }
  }, [itemSelected, dataEvents]);

  useEffect(() => {
    try {
      if (eventsList.length === 1 && !selectedEvent) {
        setItemSelected(eventsList[0]);
        dispatch(setSelectedEvent(eventsList[0].eventCode));
        dispatch(setVerifyOnly(eventsList[0].mode === 'CHECK'));
        dispatch(setSelectedEventConfig(eventsList[0]));
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
        <View style={styles.loadingContainer}>
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
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={isFetching || isLoading} onRefresh={onRefresh} />
          }
        >
          <ThemedText style={styles.errorText}>
            Error al cargar los eventos. Por favor reinicia sesión o inténtalo de nuevo más tarde.
          </ThemedText>
          <UiButton variant="secondary" text="Cerrar sesión" onPress={closeSession} />
        </ScrollView>
      </Layer>
    );
  }

  return (
    <Layer>
      <StatusBar barStyle="dark-content" backgroundColor="white" translucent={false} />

      <Header onRightPress={closeSession} isLoggingOut={isLoggingOut} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isFetching || isLoading} onRefresh={onRefresh} />
        }
      >
        <View style={styles.contentWrapper}>
          {!isOnline && <ConnectionStatusBanner isOnline={false} />}
          <ThemedText type="title" style={styles.title}>
            Control de accesos en:
          </ThemedText>

          {eventsList.length > 0 && (
            <View style={styles.eventsWrapper}>
              <View style={styles.section}>
                <ThemedText type="subtitle" style={styles.sectionLabel}>
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
                  onChange={(item) => {
                    trackEvent(TrackingEvents.EVENT_SELECTED, { event_code: item.eventCode });
                    setItemSelected(item);
                    setShowAllSections(false);
                    dispatch(setScanDirection('check_in'));
                    if (isOnline) {
                      saveQrConfig(item.eventCode);
                    }
                  }}
                />
              </View>

              {selectedEvent && (
                <>
                  <View style={styles.section}>
                    <ThemedText type="title" style={styles.title}>
                      Método de lectura:
                    </ThemedText>
                    <View style={styles.readerModeBox}>
                      <ThemedText>
                        {itemSelected?.mode === 'CHECK'
                          ? '→  Verificación de QR'
                          : '→  Verificación y quemado de Qr'}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.section}>
                    <ThemedText type="title" style={styles.title}>
                      Asignaciones
                    </ThemedText>
                    {(() => {
                      const sections = itemSelected?.sections ?? [];
                      const hidden = sections.length - SECTIONS_PREVIEW;
                      const visible = showAllSections
                        ? sections
                        : sections.slice(0, SECTIONS_PREVIEW);
                      return (
                        <>
                          {visible.map((section) => (
                            <View key={section} style={styles.sectionCard}>
                              <MaterialIcons name="confirmation-number" size={16} color="#888" />
                              <ThemedText style={styles.sectionCardText}>{section}</ThemedText>
                            </View>
                          ))}
                          {hidden > 0 && (
                            <TouchableOpacity
                              style={styles.showMoreButton}
                              onPress={() => setShowAllSections((v) => !v)}
                            >
                              <ThemedText style={styles.showMoreText}>
                                {showAllSections ? 'Mostrar menos' : `Mostrar ${hidden} más`}
                              </ThemedText>
                              <Feather
                                name={showAllSections ? 'chevron-up' : 'chevron-down'}
                                size={14}
                                color="#1976D2"
                              />
                            </TouchableOpacity>
                          )}
                        </>
                      );
                    })()}
                  </View>
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.buttons}>
        <UiButton
          disabled={!selectedEvent}
          variant="tertiary"
          text="Escanear"
          onPress={() => {
            trackEvent(TrackingEvents.SCAN_BUTTON_PRESSED);
            router.push('/camera');
          }}
        />
        <ThemedText type="subtitle" style={styles.versionText}>
          {appVersion}
        </ThemedText>
      </View>
    </Layer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    flex: 1,
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  contentWrapper: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    color: 'black',
    marginTop: 12,
    marginBottom: 8,
  },
  eventsWrapper: {
    gap: 24,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 16,
  },
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  sectionCardText: {
    fontSize: 13,
    color: '#1a1a1a',
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  showMoreText: {
    fontSize: 13,
    color: '#1976D2',
  },
  readerModeBox: {
    backgroundColor: '#00000008',
    borderRadius: 16,
    gap: 8,
    padding: 20,
  },
  buttons: {
    gap: 16,
    paddingVertical: 16,
  },
  versionText: {
    color: 'black',
    fontSize: 12,
    textAlign: 'center',
  },
  dropdown: {
    height: 50,
    borderColor: '#1D252D',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
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
});

export default SelectEventsScreen;
