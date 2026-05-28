import { faker } from '@faker-js/faker';

const VEHICLES = ['Motocicleta', 'Bicicleta', 'E-Bike'];
const STATUSES = ['En Ruta', 'Entregado', 'Buscando Pedido'];

/**
 * Elige un elemento al azar de un array.
 * @param {Array} array
 * @returns {*}
 */
const pickRandom = (array) => array[Math.floor(Math.random() * array.length)];

/**
 * Genera un array de logs de ruta simulados para repartidores.
 * @param {number} count - Cantidad de registros a generar.
 * @returns {Array<Object>}
 */
export const generateRouteLogs = (count) => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    rider: faker.person.fullName(),
    vehicle: pickRandom(VEHICLES),
    batteryLevel: faker.number.int({ min: 10, max: 100 }),
    status: pickRandom(STATUSES),
    coords: {
      lat: faker.location.latitude({ min: 4.4, max: 4.9 }),
      lng: faker.location.longitude({ min: -74.3, max: -73.9 }),
    },
  }));
};

/**
 * Filtra repartidores con batería crítica (menor al 20%).
 * @param {Array<Object>} logs
 * @returns {Array<Object>}
 */
export const filterLowBattery = (logs) =>
  logs.filter((log) => log.batteryLevel < 20);