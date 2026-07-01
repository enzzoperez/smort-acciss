import React, { useState } from 'react';
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
import Layer from '@/components/layer';
import { Dropdown } from 'react-native-element-dropdown';
import { Header } from '@/components/header-logo';
import { ConnectionStatusBanner } from '@/components/connection-status-banner';
import { useSelectEventsScreen } from './use-select-events-screen';

const SECTIONS_PREVIEW = 5;

const SelectEventsScreen = () => {
  const [showAllSections, setShowAllSections] = useState(false);
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
          disabled={isDisabledButton}
          loading={isSyncing}
          variant="tertiary"
          text="Escanear"
          onPress={handleScanButton}
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
