'use strict';

const { Router } = require('express');
const controller = require('../controllers/expense.controller');
const validate = require('../middlewares/validate');
const { verifyToken, requireRole } = require('../middlewares/auth');
const { createFuelLogSchema, createExpenseSchema } = require('../validations/expense.validation');

const router = Router();

// ── Fuel Logs ─────────────────────────────────────────────────────────────────

// GET  /api/expenses/fuel   — list all fuel logs (?vehicle_id= ?trip_id=)
// Access: Financial Analyst only (full access per RBAC)
router.get(
  '/fuel',
  verifyToken,
  requireRole('Financial Analyst'),
  controller.getAllFuelLogs,
);

// POST /api/expenses/fuel   — record a fuel fill-up
// Access: Financial Analyst only
router.post(
  '/fuel',
  verifyToken,
  requireRole('Financial Analyst'),
  validate(createFuelLogSchema),
  controller.createFuelLog,
);

// ── General Expenses ──────────────────────────────────────────────────────────

// GET  /api/expenses/general — list all expenses (?vehicle_id= ?trip_id= ?expense_type=)
// Access: Financial Analyst only (full access per RBAC)
router.get(
  '/general',
  verifyToken,
  requireRole('Financial Analyst'),
  controller.getAllExpenses,
);

// POST /api/expenses/general — record a miscellaneous expense
// Access: Financial Analyst only
router.post(
  '/general',
  verifyToken,
  requireRole('Financial Analyst'),
  validate(createExpenseSchema),
  controller.createExpense,
);

module.exports = router;
