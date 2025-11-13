import React, { useEffect } from 'react';
import { ThemedText } from '@/components/themed-text';
import { UiButton } from '@/components/ui-button';
import { appVersion } from '@/utils/device-utils';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useLogoutMutation } from '@/api/auth-api';
import { useAppDispatch, useAppSelector } from '@/libs/redux';
import { resetUserData, setLogout, setSelectedEvent, setVerifyOnly } from '@/store/slices';
import { useRouter } from 'expo-router';
import Layer from '@/components/layer';
import { Dropdown } from 'react-native-element-dropdown';
import { useGetEventsQuery } from '@/api/events-api';
import { Header } from '@/components/header-logo';

const a = [
  {
    eventCode: 'EVENT_1',
    eventName: 'Nombre del evento 1',
    mode: 'CHECK',
    sections: ['GENERAL', 'VIP'],
  },
  {
    eventCode: 'EVENT_2',
    eventName: 'Nombre del evento 2',
    mode: 'SCAN',
    sections: ['GENERAL'],
  },
  {
    eventCode: 'EVENT_3',
    eventName: 'Festival Primavera Sound',
    mode: 'CHECK',
    sections: ['ESCENARIO PRINCIPAL', 'CAMPO', 'BACKSTAGE'],
  },
];

const SelectEventsScreen = () => {
  const router = useRouter();
  const { userData } = useAppSelector((state) => state.user);
  const { selectedEvent } = useAppSelector((state) => state.config);

  const dispatch = useAppDispatch();
  const [logout] = useLogoutMutation();
  const { data: dataEvents, isLoading, isFetching, isError, refetch } = useGetEventsQuery();

  const closeSession = () => {
    logout({ accountId: userData?.accountId });
    dispatch(setLogout());
    dispatch(resetUserData());
  };

  const onRefresh = () => {
    refetch();
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

  useEffect(() => {
    if (selectedEvent) {
      const selected = a.find((event) => event.eventCode === selectedEvent);
      if (selected) {
        dispatch(setVerifyOnly(selected.mode === 'CHECK'));
      }
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (dataEvents && dataEvents.length === 1) {
      dispatch(setSelectedEvent(dataEvents[0].value));
    }
  }, [dataEvents]);

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
      <Header onRightPress={closeSession} />
      <ScrollView
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

            {dataEvents && (
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
                    data={dataEvents}
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
                </View>

                {selectedEvent && (
                  <>
                    {/* Asociated Sections */}
                    <View style={{ gap: 8 }}>
                      <ThemedText type="title" style={styles.title}>
                        Asignaciones
                      </ThemedText>
                      <ScrollView
                        style={{
                          backgroundColor: '#00000008',
                          borderRadius: 16,
                          padding: 20,
                          maxHeight: 300,
                        }}
                      >
                        {a[2].sections.map((section) => (
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
                          {a[2].mode === 'CHECK'
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
