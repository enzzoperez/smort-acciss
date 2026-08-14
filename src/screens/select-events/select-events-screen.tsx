import React from 'react';
import { ThemedText } from '@/components/themed-text';
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
import { ConnectionStatusBanner } from '@/components/connection-status-banner';
import { Header } from '@/components/header-logo';
import { useSelectEventsScreen } from './use-select-events-screen';

const SelectEventsScreen = () => {
  const {
    config,
    items,
    mode,
    issuedTicketsSyncEnabled,
    isOnline,
    lastSyncDate,
    showAllSections,
    visibleSections,
    hiddenSections,
    toggleShowAllSections,
    isLoadingConfiguration,
    onRefresh,
    handleLogout,
  } = useSelectEventsScreen();

  if (!config) {
    return (
      <Layer>
        <View style={styles.loadingContainer}>
          <ThemedText>No hay una configuración de acceso disponible.</ThemedText>
        </View>
      </Layer>
    );
  }

  if (isLoadingConfiguration) {
    return (
      <Layer>
        <StatusBar barStyle="dark-content" backgroundColor="white" translucent={false} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <ThemedText>Cargando configuracion</ThemedText>
        </View>
      </Layer>
    );
  }

  return (
    <Layer>
      <StatusBar barStyle="dark-content" backgroundColor="white" translucent={false} />
      <Header issuedTicketsSyncEnabled={issuedTicketsSyncEnabled} onRightPress={handleLogout} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoadingConfiguration} onRefresh={onRefresh} />
        }
      >
        <View style={styles.contentWrapper}>
          <ConnectionStatusBanner isOnline={isOnline} lastSyncDate={lastSyncDate} />
          <ThemedText type="title" style={styles.title}>
            Control de accesos en:
          </ThemedText>
          <View style={styles.eventsWrapper}>
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionLabel}>
                Eventos
              </ThemedText>
              {items.map((event) => (
                <View key={event.eventCode} style={styles.eventCard}>
                  <ThemedText style={styles.eventCardText}>{event.eventName}</ThemedText>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <ThemedText type="title" style={styles.title}>
                Método de lectura:
              </ThemedText>
              <View style={styles.readerModeBox}>
                <ThemedText>
                  {mode === 'CHECK' ? '→  Verificación de QR' : '→  Verificación y quemado de Qr'}
                </ThemedText>
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText type="title" style={styles.title}>
                Asignaciones
              </ThemedText>
              {visibleSections.map((section) => (
                <View key={section} style={styles.sectionCard}>
                  <MaterialIcons name="confirmation-number" size={16} color="#888" />
                  <ThemedText style={styles.sectionCardText}>{section}</ThemedText>
                </View>
              ))}
              {hiddenSections > 0 && (
                <TouchableOpacity style={styles.showMoreButton} onPress={toggleShowAllSections}>
                  <ThemedText style={styles.showMoreText}>
                    {showAllSections ? 'Mostrar menos' : `Mostrar ${hiddenSections} más`}
                  </ThemedText>
                  <Feather
                    name={showAllSections ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color="#1976D2"
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={styles.buttons}>
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
  eventCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  eventCardText: {
    fontSize: 16,
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
});

export default SelectEventsScreen;
