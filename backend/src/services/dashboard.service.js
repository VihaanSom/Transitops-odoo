'use strict';

const prisma = require('../config/prisma');

/**
 * Fetches all KPI counts in a single batched Prisma call using $transaction.
 *
 * KPIs:
 *  - activeVehicles       → vehicles where status = 'on_trip'
 *  - availableVehicles    → vehicles where status = 'available'
 *  - vehiclesInMaintenance → vehicles where status = 'in_shop'
 *  - activeTrips          → trips where status = 'dispatched'
 *  - pendingTrips         → trips where status = 'draft'
 *  - driversOnDuty        → drivers where status = 'on_trip'
 *  - fleetUtilization (%) → activeVehicles / (activeVehicles + availableVehicles) * 100
 */
async function getKpis() {
  const [
    activeVehicles,
    availableVehicles,
    vehiclesInMaintenance,
    activeTrips,
    pendingTrips,
    driversOnDuty,
  ] = await prisma.$transaction([
    prisma.vehicles.count({ where: { status: 'on_trip' } }),
    prisma.vehicles.count({ where: { status: 'available' } }),
    prisma.vehicles.count({ where: { status: 'in_shop' } }),
    prisma.trips.count({ where: { status: 'dispatched' } }),
    prisma.trips.count({ where: { status: 'draft' } }),
    prisma.drivers.count({ where: { status: 'on_trip' } }),
  ]);

  // Fleet utilization: % of active vehicles out of all currently deployable vehicles
  const deployable = activeVehicles + availableVehicles;
  const fleetUtilization = deployable > 0
    ? Math.round((activeVehicles / deployable) * 100 * 10) / 10 // round to 1 decimal
    : 0;

  return {
    activeVehicles,
    availableVehicles,
    vehiclesInMaintenance,
    activeTrips,
    pendingTrips,
    driversOnDuty,
    fleetUtilization,
  };
}

module.exports = { getKpis };
