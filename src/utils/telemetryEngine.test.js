import { generateRouteLogs, filterLowBattery } from './telemetryEngine';

// ─── TEST 1: Cantidad exacta de registros ───────────────────────────────────
describe('generateRouteLogs', () => {
  test('debe retornar exactamente 100 objetos cuando se solicitan 100 rutas', () => {
    const logs = generateRouteLogs(100);
    expect(Array.isArray(logs)).toBe(true);
    expect(logs).toHaveLength(100);
  });

  // ─── TEST 2: Regla de Alerta de Batería ──────────────────────────────────
  test('los repartidores filtrados por batería baja deben tener batteryLevel < 20', () => {
    const logs = generateRouteLogs(500);
    const lowBatteryRiders = filterLowBattery(logs);

    // Pueden ser 0 (si ninguno tiene baja batería) o más, pero NINGUNO debe superar 19
    lowBatteryRiders.forEach((rider) => {
      expect(rider.batteryLevel).toBeLessThan(20);
    });
  });

  // ─── TEST 3: Fuga de datos — campos críticos no deben ser undefined ───────
  test('ningún registro debe tener id, status o coords como undefined', () => {
    const logs = generateRouteLogs(100);

    logs.forEach((log) => {
      expect(log.id).toBeDefined();
      expect(log.status).toBeDefined();
      expect(log.coords).toBeDefined();
      expect(log.coords.lat).toBeDefined();
      expect(log.coords.lng).toBeDefined();
    });
  });

  // ─── TEST 4: Estructura completa del objeto ───────────────────────────────
  test('cada objeto debe tener todos los campos requeridos con tipos correctos', () => {
    const logs = generateRouteLogs(10);
    const validVehicles = ['Motocicleta', 'Bicicleta', 'E-Bike'];
    const validStatuses = ['En Ruta', 'Entregado', 'Buscando Pedido'];

    logs.forEach((log) => {
      // Tipos
      expect(typeof log.id).toBe('string');
      expect(typeof log.rider).toBe('string');
      expect(typeof log.batteryLevel).toBe('number');

      // Rangos
      expect(log.batteryLevel).toBeGreaterThanOrEqual(10);
      expect(log.batteryLevel).toBeLessThanOrEqual(100);

      // Valores permitidos
      expect(validVehicles).toContain(log.vehicle);
      expect(validStatuses).toContain(log.status);

      // Coordenadas realistas de Bogotá
      expect(log.coords.lat).toBeGreaterThanOrEqual(4.4);
      expect(log.coords.lat).toBeLessThanOrEqual(4.9);
      expect(log.coords.lng).toBeGreaterThanOrEqual(-74.3);
      expect(log.coords.lng).toBeLessThanOrEqual(-73.9);
    });
  });
});