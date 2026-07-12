'use strict';

const { Router } = require('express');
const controller = require('../controllers/expense.controller');
const validate = require('../middlewares/validate');
const { verifyToken, requireRole } = require('../middlewares/auth');
const { createFuelLogSchema, createExpenseSchema } = require('../validations/expense.validation');

const router = Router();

// ── Fuel Logs ─────────────────────────────────────────────────────────────────

// GET  /api/expenses/fuel        — list all fuel logs (?vehicle_id= ?trip_id=)
router.get(
  '/fuel',
  verifyToken,
  requireRole('Fleet Manager', 'Financial Analyst', 'Dispatcher'),
  controller.getAllFuelLogs,
);

// POST /api/expenses/fuel        — record a fuel fill-up
router.post(
  '/fuel',
  verifyToken,
  requireRole('Fleet Manager', 'Dispatcher'),
  validate(createFuelLogSchema),
  controller.createFuelLog,
);

// ── General Expenses ──────────────────────────────────────────────────────────

// GET  /api/expenses/general     — list all expenses (?vehicle_id= ?trip_id= ?expense_type=)
router.get(
  '/general',
  verifyToken,
  requireRole('Fleet Manager', 'Financial Analyst'),
  controller.getAllExpenses,
);

// POST /api/expenses/general     — record a miscellaneous expense
router.post(
  '/general',
  verifyToken,
  requireRole('Fleet Manager', 'Financial Analyst'),
  validate(createExpenseSchema),
  controller.createExpense,
);

module.exports = router;
