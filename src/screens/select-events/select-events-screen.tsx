import React from 'react';
import { ThemedText } from '@/components/themed-text';
import { appVersion } from '@/utils/device-utils';
import { formatEventShortDate } from '@/utils/dates-utils';
import { theme } from '@/themes/theme';
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
import { UiButton } from '@/components/ui-button';
import { useSelectEventsScreen } from './use-select-events-screen';

const SelectEventsScreen = () => {
  const {
    config,
    totalEvents,
    totalAssignments,
    eventsWithPreview,
    mode,
    issuedTicketsSyncEnabled,
    isOnline,
    lastSyncDate,
    isLoadingConfiguration,
    onRefresh,
    toggleEventSections,
    handleScanQr,
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
      <Header
        issuedTicketsSyncEnabled={issuedTicketsSyncEnabled}
        onRightPress={handleLogout}
        onDownload={onRefresh}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoadingConfiguration} onRefresh={onRefresh} />
        }
      >
        <ConnectionStatusBanner isOnline={isOnline} lastSyncDate={lastSyncDate} />

        <View style={styles.contentWrapper}>
          <ThemedText type="title" style={styles.pageTitle}>
            Control de accesos
          </ThemedText>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <MaterialIcons name="badge" size={18} color="#333" />
              <ThemedText type="title" style={styles.summaryCode}>
                {config.label || config.code}
              </ThemedText>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Feather name="users" size={16} color="#666" />
              <ThemedText style={styles.summaryText}>
                {totalEvents} {totalEvents === 1 ? 'evento' : 'eventos'} · {totalAssignments}{' '}
                {totalAssignments === 1 ? 'asignación' : 'asignaciones'}
              </ThemedText>
            </View>
          </View>

          <View style={styles.methodChip}>
            <MaterialIcons name="qr-code-scanner" size={20} color={theme.colors.grayText} />
            <View>
              <ThemedText style={styles.methodLabel}>Método de lectura</ThemedText>
              <ThemedText type="title" style={styles.methodValue}>
                {mode === 'CHECK' ? 'Verificación de QR' : 'Verificación y quemado de Qr'}
              </ThemedText>
            </View>
          </View>

          <ThemedText type="title" style={styles.sectionTitle}>
            Eventos
          </ThemedText>

          <View style={styles.eventsWrapper}>
            {eventsWithPreview.map((event) => (
              <View key={event.eventCode} style={styles.eventCard}>
                <ThemedText type="title" style={styles.eventName}>
                  {event.eventName}
                </ThemedText>
                <View style={styles.eventSubtitleRow}>
                  <ThemedText style={styles.eventSubtitleText}>
                    {formatEventShortDate(event.eventDate)}
                  </ThemedText>
                  <View style={styles.sourceBadge}>
                    <ThemedText style={styles.sourceBadgeText}>{event.source}</ThemedText>
                  </View>
                </View>

                <View style={styles.divider} />

                <ThemedText style={styles.assignmentsLabel}>
                  Asignaciones · {event.sections.length}
                </ThemedText>

                {event.visibleSections.map((section) => (
                  <View key={section.code} style={styles.assignmentRow}>
                    <View style={styles.assignmentLeft}>
                      <MaterialIcons name="confirmation-number" size={16} color="#888" />
                      <ThemedText style={styles.assignmentText} numberOfLines={2}>
                        {section.code}
                      </ThemedText>
                    </View>
                    <View
                      style={[
                        styles.assignmentPill,
                        section.checkOutEnabled
                          ? styles.assignmentPillBlue
                          : styles.assignmentPillGreen,
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.assignmentPillText,
                          section.checkOutEnabled
                            ? styles.assignmentPillTextBlue
                            : styles.assignmentPillTextGreen,
                        ]}
                      >
                        {section.checkOutEnabled ? 'Entrada y salida' : 'Solo entrada'}
                      </ThemedText>
                    </View>
                  </View>
                ))}

                {event.hiddenCount > 0 && (
                  <TouchableOpacity
                    style={styles.showMoreButton}
                    onPress={() => toggleEventSections(event.eventCode)}
                  >
                    <ThemedText style={styles.showMoreText}>
                      {event.isExpanded
                        ? 'Mostrar menos'
                        : `Mostrar ${event.hiddenCount} asignaciones más`}
                    </ThemedText>
                    <Feather
                      name={event.isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={14}
                      color="#1976D2"
                    />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <View style={styles.buttons}>
        <UiButton variant="primary" text="Escanear" onPress={handleScanQr} />
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
  contentWrapper: {
    marginBottom: 16,
    gap: 16,
  },
  pageTitle: {
    fontSize: 28,
    marginTop: 12,
  },
  summaryCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryCode: {
    fontSize: 16,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#DCE1E8',
  },
  summaryText: {
    fontSize: 13,
    color: '#666',
  },
  methodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.gray100,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  methodLabel: {
    fontSize: 12,
    color: theme.colors.grayText,
  },
  methodValue: {
    fontSize: 15,
    color: theme.colors.gray600,
  },
  sectionTitle: {
    fontSize: 20,
  },
  eventsWrapper: {
    gap: 12,
  },
  eventCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 8,
  },
  eventName: {
    fontSize: 17,
  },
  eventSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventSubtitleText: {
    fontSize: 13,
    color: '#666',
  },
  sourceBadge: {
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sourceBadgeText: {
    fontSize: 11,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#DCE1E8',
  },
  assignmentsLabel: {
    fontSize: 13,
    color: '#666',
  },
  assignmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  assignmentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  assignmentText: {
    fontSize: 12,
    flexShrink: 1,
  },
  assignmentPill: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  assignmentPillText: {
    fontSize: 9,
  },
  assignmentPillGreen: {
    backgroundColor: theme.colors.success.background,
  },
  assignmentPillTextGreen: {
    color: theme.colors.success.text,
  },
  assignmentPillBlue: {
    backgroundColor: '#DCE8FB',
  },
  assignmentPillTextBlue: {
    color: theme.colors.blue,
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
