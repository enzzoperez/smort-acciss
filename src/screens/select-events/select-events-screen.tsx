import React from 'react';
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
import Layer from '@/components/layer';
import { Dropdown } from 'react-native-element-dropdown';
import { Header } from '@/components/header-logo';
import { ConnectionStatusBanner } from '@/components/connection-status-banner';
import { useSelectEventsScreen } from './use-select-events-screen';

const SelectEventsScreen = () => {
  const {
    dataEvents,
    availableEvents,
    selectedEvent,
    itemSelected,
    lastSyncDate,
    isOnline,
    isLoading,
    isFetching,
    isError,
    isSyncing,
    isDisabledButton,
    onChangeSelectedEvent,
    handleScanButton,
    handleDownload,
    onRefresh,
    closeSession,
  } = useSelectEventsScreen();

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
          <View style={styles.container}>
            <ThemedText style={styles.errorText}>
              Error al cargar los eventos. Por favor reinicia sesión o inténtalo de nuevo más tarde.
            </ThemedText>
            <UiButton variant="secondary" text="Cerrar sesión" onPress={closeSession} />
          </View>
        </ScrollView>
      </Layer>
    );
  }

  return (
    <Layer>
      <StatusBar barStyle="dark-content" backgroundColor="white" translucent={false} />

      <Header
        onRightPress={closeSession}
        onDownload={handleDownload}
        hasSelectedEvent={!!selectedEvent}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isFetching || isLoading} onRefresh={onRefresh} />
        }
      >
        <View style={styles.container}>
          <View style={styles.contentWrapper}>
            {!!selectedEvent && (
              <ConnectionStatusBanner isOnline={isOnline} lastSyncDate={lastSyncDate} />
            )}
            <ThemedText type="title" style={styles.title}>
              Control de accesos en:
            </ThemedText>

            {(dataEvents?.config || availableEvents.length > 0) && (
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
                    data={dataEvents?.config ?? availableEvents}
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
                    <View style={styles.section}>
                      <ThemedText type="title" style={styles.title}>
                        Asignaciones
                      </ThemedText>
                      <ScrollView indicatorStyle="black" style={styles.sectionsList}>
                        {itemSelected?.sections.map((section) => (
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
                  </>
                )}
              </View>
            )}
          </View>

          <View style={styles.buttons}>
            <UiButton
              disabled={isDisabledButton}
              loading={isSyncing}
              variant="tertiary"
              text="Escanear"
              onPress={handleScanButton}
            />
          </View>
        </View>

        <View style={styles.versionWrapper}>
          <ThemedText type="subtitle" style={styles.versionText}>
            {appVersion}
          </ThemedText>
        </View>
      </ScrollView>
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
  container: {
    justifyContent: 'space-between',
    flex: 1,
  },
  contentWrapper: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    color: 'black',
    marginTop: 24,
    marginBottom: 16,
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
  sectionsList: {
    backgroundColor: '#00000008',
    borderRadius: 16,
    padding: 20,
    maxHeight: 300,
  },
  readerModeBox: {
    backgroundColor: '#00000008',
    borderRadius: 16,
    gap: 8,
    padding: 20,
  },
  itemAsociatedSection: {
    fontSize: 20,
    marginBottom: 8,
  },
  buttons: {
    gap: 16,
  },
  versionWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  versionText: {
    color: 'black',
    fontSize: 12,
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
