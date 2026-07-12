'use strict';

const prisma = require('../config/prisma');

// ── Fuel Logs ─────────────────────────────────────────────────────────────────

/**
 * GET /api/expenses/fuel
 * Returns all fuel logs, most recent first.
 * Optional filters: ?vehicle_id=  ?trip_id=
 */
async function getAllFuelLogs(filters = {}) {
  const where = {};
  if (filters.vehicle_id) where.vehicle_id = parseInt(filters.vehicle_id, 10);
  if (filters.trip_id) where.trip_id = parseInt(filters.trip_id, 10);

  return prisma.fuel_logs.findMany({
    where,
    orderBy: { log_date: 'desc' },
    include: {
      vehicles: {
        select: {
          id: true,
          registration_number: true,
          name_model: true,
        },
      },
      trips: {
        select: {
          id: true,
          source: true,
          destination: true,
          status: true,
        },
      },
    },
  });
}

/**
 * POST /api/expenses/fuel
 * Logs a fuel fill-up against a vehicle (and optionally a trip).
 */
async function createFuelLog(data) {
  return prisma.fuel_logs.create({
    data: {
      vehicle_id: data.vehicle_id,
      trip_id: data.trip_id ?? null,
      liters: data.liters,
      cost: data.cost,
      log_date: data.log_date ? new Date(data.log_date) : new Date(),
    },
    include: {
      vehicles: {
        select: {
          id: true,
          registration_number: true,
          name_model: true,
        },
      },
      trips: {
        select: {
          id: true,
          source: true,
          destination: true,
        },
      },
    },
  });
}

// ── General Expenses ──────────────────────────────────────────────────────────

/**
 * GET /api/expenses/general
 * Returns all general expenses, most recent first.
 * Optional filters: ?vehicle_id=  ?trip_id=  ?expense_type=
 */
async function getAllExpenses(filters = {}) {
  const where = {};
  if (filters.vehicle_id) where.vehicle_id = parseInt(filters.vehicle_id, 10);
  if (filters.trip_id) where.trip_id = parseInt(filters.trip_id, 10);
  if (filters.expense_type) where.expense_type = filters.expense_type;

  return prisma.expenses.findMany({
    where,
    orderBy: { created_at: 'desc' },
    include: {
      vehicles: {
        select: {
          id: true,
          registration_number: true,
          name_model: true,
        },
      },
      trips: {
        select: {
          id: true,
          source: true,
          destination: true,
          status: true,
        },
      },
    },
  });
}

/**
 * POST /api/expenses/general
 * Records a miscellaneous expense against a vehicle (and optionally a trip).
 */
async function createExpense(data) {
  return prisma.expenses.create({
    data: {
      vehicle_id: data.vehicle_id,
      trip_id: data.trip_id ?? null,
      expense_type: data.expense_type,
      amount: data.amount,
    },
    include: {
      vehicles: {
        select: {
          id: true,
          registration_number: true,
          name_model: true,
        },
      },
      trips: {
        select: {
          id: true,
          source: true,
          destination: true,
        },
      },
    },
  });
}

module.exports = {
  getAllFuelLogs,
  createFuelLog,
  getAllExpenses,
  createExpense,
};
