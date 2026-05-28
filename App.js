import React, { useState, useCallback, useRef, memo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { generateRouteLogs, filterLowBattery } from './src/utils/telemetryEngine';

// ─── Constantes ──────────────────────────────────────────────────────────────
const TOTAL_RIDERS = 300;
const MONKEY_INTERVAL_MS = 100;

// ─── Tarjeta de Repartidor (memoizada para evitar re-renders innecesarios) ───
const RiderCard = memo(({ item }) => {
  const statusColor =
    item.status === 'Entregado'
      ? '#22c55e'
      : item.status === 'En Ruta'
      ? '#eab308'
      : '#6b7280';

  const batteryColor =
    item.batteryLevel < 20 ? '#ef4444' : item.batteryLevel < 50 ? '#f97316' : '#22c55e';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.riderName} numberOfLines={1}>
          {item.rider}
        </Text>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      </View>

      <Text style={styles.cardSub}>🏍 {item.vehicle}</Text>
      <Text style={styles.cardSub}>📍 {item.coords.lat.toFixed(4)}, {item.coords.lng.toFixed(4)}</Text>

      <View style={styles.cardFooter}>
        <Text style={[styles.batteryText, { color: batteryColor }]}>
          🔋 {item.batteryLevel}%
        </Text>
        <Text style={[styles.statusText, { color: statusColor }]}>
          {item.status}
        </Text>
      </View>
    </View>
  );
});

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function App() {
  const [riders, setRiders] = useState(() => generateRouteLogs(TOTAL_RIDERS));
  const [isMonkeyRunning, setIsMonkeyRunning] = useState(false);
  const monkeyRef = useRef(null);

  // Contadores derivados
  const alertCount = filterLowBattery(riders).length;
  const criticalCount = riders.filter(
    (r) => r.batteryLevel < 20 || r.status === 'Buscando Pedido'
  ).length;

  // ─── Monkey Test ────────────────────────────────────────────────────────────
  const launchMonkeyTest = useCallback(() => {
    if (isMonkeyRunning) {
      clearInterval(monkeyRef.current);
      setIsMonkeyRunning(false);
      setRiders(generateRouteLogs(TOTAL_RIDERS));
      return;
    }

    setIsMonkeyRunning(true);
    monkeyRef.current = setInterval(() => {
      const action = Math.floor(Math.random() * 3);

      switch (action) {
        case 0:
          // Mutar todo el estado masivamente
          setRiders(generateRouteLogs(TOTAL_RIDERS));
          break;
        case 1:
          // Filtrar caóticamente entre estados
          setRiders((prev) => {
            const target = Math.random() > 0.5 ? 'En Ruta' : 'Entregado';
            const filtered = prev.filter((r) => r.status === target);
            return filtered.length > 0 ? filtered : generateRouteLogs(TOTAL_RIDERS);
          });
          break;
        case 2:
          // Vaciar y rellenar instantáneamente
          setRiders([]);
          setTimeout(() => setRiders(generateRouteLogs(TOTAL_RIDERS)), 0);
          break;
      }
    }, MONKEY_INTERVAL_MS);
  }, [isMonkeyRunning]);

  // ─── Render Key Extractor ────────────────────────────────────────────────────
  const keyExtractor = useCallback((item) => item.id, []);

  const renderItem = useCallback(({ item }) => <RiderCard item={item} />, []);

  // ─── UI ──────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🛰 LogiTrack</Text>
        <Text style={styles.subtitle}>Panel de Operaciones · Bogotá</Text>
      </View>

      {/* Indicadores de alerta */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{riders.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, styles.statCardWarning]}>
          <Text style={[styles.statNumber, { color: '#ef4444' }]}>{criticalCount}</Text>
          <Text style={styles.statLabel}>En Alerta</Text>
        </View>
        <View style={[styles.statCard, styles.statCardBattery]}>
          <Text style={[styles.statNumber, { color: '#f97316' }]}>{alertCount}</Text>
          <Text style={styles.statLabel}>Batería Baja</Text>
        </View>
      </View>

      {/* Lista principal */}
      <FlatList
        data={riders}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={15}
        maxToRenderPerBatch={20}
        windowSize={10}
        removeClippedSubviews={true}
        getItemLayout={(_, index) => ({
          length: 110,
          offset: 110 * index,
          index,
        })}
      />

      {/* Botón Monkey Test (debug, esquina inferior) */}
      <TouchableOpacity
        style={[styles.monkeyBtn, isMonkeyRunning && styles.monkeyBtnActive]}
        onPress={launchMonkeyTest}
        activeOpacity={0.8}
      >
        <Text style={styles.monkeyBtnText}>
          {isMonkeyRunning ? '🛑 Stop Monkey' : '🐒 Launch Monkey Test'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f1f5f9',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statCardWarning: {
    borderColor: '#7f1d1d',
    backgroundColor: '#1c0a0a',
  },
  statCardBattery: {
    borderColor: '#7c2d12',
    backgroundColor: '#1c1008',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#f1f5f9',
  },
  statLabel: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1f2937',
    height: 102,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  riderName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f1f5f9',
    flex: 1,
    marginRight: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  cardSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  batteryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  monkeyBtn: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 30,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  monkeyBtnActive: {
    backgroundColor: '#7f1d1d',
    borderColor: '#ef4444',
  },
  monkeyBtnText: {
    color: '#f1f5f9',
    fontWeight: '700',
    fontSize: 14,
  },
});