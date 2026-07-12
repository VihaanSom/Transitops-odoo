'use strict';

const prisma = require('../config/prisma');

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Extracts and re-throws a clean error message from a PostgreSQL trigger
 * RAISE EXCEPTION so the controller can catch it as a standard Error.
 * If not a trigger error, re-throws the original.
 */
function handlePrismaError(err) {
  // Walk the error / cause chain for a PostgreSQL ERROR: message
  let current = err;
  while (current) {
    const msg = current.message || '';
    const match = msg.match(/ERROR:\s+(.+?)(?:\n|$)/i);
    if (match) {
      const clean = new Error(match[1].trim());
      clean.statusCode = 400;
      throw clean;
    }
    current = current.cause;
  }
  // Not a trigger error — bubble the original
  throw err;
}

// ── Service functions ─────────────────────────────────────────────────────────

/**
 * GET /api/trips
 * Optional query: status (draft | dispatched | completed | cancelled)
 * Optional query: limit (integer) — max number of results to return
 */
async function getAllTrips(filters = {}) {
  const where = {};
  if (filters.status) where.status = filters.status;

  return prisma.trips.findMany({
    where,
    orderBy: { created_at: 'desc' },
    ...(filters.limit ? { take: parseInt(filters.limit, 10) } : {}),
    include: {
      vehicles: {
        select: {
          id: true,
          registration_number: true,
          name_model: true,
          vehicle_type: true,
          status: true,
        },
      },
      drivers: {
        select: {
          id: true,
          name: true,
          license_number: true,
          license_category: true,
          status: true,
        },
      },
    },
  });
}

/**
 * GET /api/trips/:id
 * Full trip detail with vehicle, driver, fuel logs, and expenses.
 */
async function getTripById(id) {
  const trip = await prisma.trips.findUnique({
    where: { id },
    include: {
      vehicles: {
        select: {
          id: true,
          registration_number: true,
          name_model: true,
          vehicle_type: true,
          max_load_capacity: true,
          status: true,
        },
      },
      drivers: {
        select: {
          id: true,
          name: true,
          license_number: true,
          license_category: true,
          license_expiry_date: true,
          status: true,
        },
      },
      fuel_logs: true,
      expenses: true,
    },
  });

  if (!trip) {
    const err = new Error('Trip not found.');
    err.statusCode = 404;
    throw err;
  }

  return trip;
}

/**
 * POST /api/trips
 * Creates a new trip in `draft` status.
 */
async function createTrip(data) {
  try {
    return await prisma.trips.create({
      data: {
        source: data.source,
        destination: data.destination,
        vehicle_id: data.vehicle_id,
        driver_id: data.driver_id,
        cargo_weight: data.cargo_weight,
        planned_distance: data.planned_distance,
        start_odometer: data.start_odometer,
        scheduled_at: data.scheduled_at ? new Date(data.scheduled_at) : null,
        status: 'draft',
      },
    });
  } catch (err) {
    handlePrismaError(err);
  }
}

/**
 * PATCH /api/trips/:id/dispatch
 * Transitions trip from `draft` → `dispatched`.
 * DB trigger `trg_validate_trip` fires and validates:
 *   - Vehicle is available and not in shop
 *   - Driver is available with a valid license
 *   - cargo_weight does not exceed vehicle's max_load_capacity
 * DB trigger `trg_sync_trip_statuses` then sets vehicle + driver → on_trip.
 */
async function dispatchTrip(id, data) {
  try {
    return await prisma.trips.update({
      where: { id },
      data: {
        status: 'dispatched',
        dispatched_at: data.dispatched_at ? new Date(data.dispatched_at) : new Date(),
      },
    });
  } catch (err) {
    handlePrismaError(err);
  }
}

/**
 * PATCH /api/trips/:id/complete
 * Transitions trip to `completed`.
 * DB trigger `trg_sync_trip_statuses` automatically frees vehicle + driver back to `available`.
 */
async function completeTrip(id, data) {
  try {
    return await prisma.trips.update({
      where: { id },
      data: {
        status: 'completed',
        final_odometer: data.final_odometer,
        revenue: data.revenue,
        completed_at: data.completed_at ? new Date(data.completed_at) : new Date(),
      },
    });
  } catch (err) {
    handlePrismaError(err);
  }
}

/**
 * PATCH /api/trips/:id/cancel
 * Transitions trip to `cancelled`.
 * DB trigger `trg_sync_trip_statuses` automatically restores vehicle + driver to `available`.
 */
async function cancelTrip(id, data) {
  try {
    return await prisma.trips.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancelled_at: data.cancelled_at ? new Date(data.cancelled_at) : new Date(),
      },
    });
  } catch (err) {
    handlePrismaError(err);
  }
}

module.exports = {
  getAllTrips,
  getTripById,
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
};
