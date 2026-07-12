'use strict';

const prisma = require('../config/prisma');

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Extracts the PostgreSQL RAISE EXCEPTION message from a Prisma error chain
 * and re-throws it as a clean 400 Error. If not a trigger error, re-throws
 * the original for the global errorHandler to handle.
 */
function handlePrismaError(err) {
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
  throw err;
}

// ── Service functions ─────────────────────────────────────────────────────────

/**
 * GET /api/maintenance
 * Returns all maintenance logs, most recent first.
 * Optional filter: ?status=open|closed
 */
async function getAllMaintenance(filters = {}) {
  const where = {};
  if (filters.status) where.status = filters.status;

  return prisma.maintenance_logs.findMany({
    where,
    orderBy: { opened_at: 'desc' },
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
    },
  });
}

/**
 * GET /api/maintenance/:id
 * Single maintenance log with full vehicle details.
 */
async function getMaintenanceById(id) {
  const log = await prisma.maintenance_logs.findUnique({
    where: { id },
    include: {
      vehicles: {
        select: {
          id: true,
          registration_number: true,
          name_model: true,
          vehicle_type: true,
          odometer: true,
          status: true,
        },
      },
    },
  });

  if (!log) {
    const err = new Error('Maintenance log not found.');
    err.statusCode = 404;
    throw err;
  }

  return log;
}

/**
 * POST /api/maintenance
 * Opens a new maintenance log (status defaults to `open`).
 *
 * DB Trigger A (BEFORE INSERT): Rejects if vehicle is NOT `available`
 *   — prevents opening maintenance while vehicle is on_trip or in_shop.
 * DB Trigger B (AFTER INSERT): Automatically sets vehicle status → `in_shop`.
 */
async function createMaintenance(data) {
  try {
    return await prisma.maintenance_logs.create({
      data: {
        vehicle_id: data.vehicle_id,
        description: data.description,
        status: 'open',
      },
      include: {
        vehicles: {
          select: {
            id: true,
            registration_number: true,
            name_model: true,
            status: true,
          },
        },
      },
    });
  } catch (err) {
    handlePrismaError(err);
  }
}

/**
 * PATCH /api/maintenance/:id/close
 * Closes an open maintenance log.
 *
 * DB Trigger B (AFTER UPDATE on status→closed):
 *   Automatically restores vehicle status → `available` (if not retired).
 */
async function closeMaintenance(id, data) {
  try {
    return await prisma.maintenance_logs.update({
      where: { id },
      data: {
        status: 'closed',
        cost: data.cost,
        closed_at: data.closed_at ? new Date(data.closed_at) : new Date(),
      },
      include: {
        vehicles: {
          select: {
            id: true,
            registration_number: true,
            name_model: true,
            status: true,
          },
        },
      },
    });
  } catch (err) {
    handlePrismaError(err);
  }
}

module.exports = {
  getAllMaintenance,
  getMaintenanceById,
  createMaintenance,
  closeMaintenance,
};
