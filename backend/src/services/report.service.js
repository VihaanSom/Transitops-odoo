'use strict';

const prisma = require('../config/prisma');

/**
 * GET /api/reports/vehicle-analytics
 * Queries the `v_vehicle_analytics` PostgreSQL view.
 *
 * The view aggregates per vehicle:
 *   - total_revenue       (from completed trips)
 *   - total_maintenance_cost
 *   - total_fuel_cost / total_fuel_liters
 *   - total_distance      (sum of planned_distance on completed trips)
 *   - vehicle_roi         (revenue - maintenance - fuel) / acquisition_cost * 100
 *
 * Since Prisma v7 supports views via previewFeatures=["views"], we use the
 * generated model directly instead of $queryRaw.
 */
async function getVehicleAnalytics() {
  return prisma.v_vehicle_analytics.findMany({
    orderBy: { vehicle_roi: 'desc' },
  });
}

module.exports = { getVehicleAnalytics };
