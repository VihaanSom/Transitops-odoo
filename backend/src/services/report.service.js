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

/**
 * GET /api/reports/monthly-revenue
 * Aggregates revenue from completed trips grouped by month
 * for the last 12 months, ordered chronologically.
 *
 * Returns: [{ month: 'Jan', month_number: 1, year: 2026, revenue: 68000 }, ...]
 */
async function getMonthlyRevenue() {
  const rows = await prisma.$queryRaw`
    SELECT
      TO_CHAR(completed_at, 'Mon')   AS month,
      EXTRACT(MONTH FROM completed_at)::int AS month_number,
      EXTRACT(YEAR  FROM completed_at)::int AS year,
      COALESCE(SUM(revenue), 0)::float      AS revenue
    FROM trips
    WHERE status = 'completed'
      AND completed_at >= NOW() - INTERVAL '12 months'
    GROUP BY
      TO_CHAR(completed_at, 'Mon'),
      EXTRACT(MONTH FROM completed_at),
      EXTRACT(YEAR  FROM completed_at)
    ORDER BY year ASC, month_number ASC
  `;
  return rows;
}

module.exports = { getVehicleAnalytics, getMonthlyRevenue };
