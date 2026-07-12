'use strict';

const expenseService = require('../services/expense.service');

// ── GET /api/expenses/fuel ────────────────────────────────────────────────────
async function getAllFuelLogs(req, res, next) {
  try {
    const logs = await expenseService.getAllFuelLogs({
      vehicle_id: req.query.vehicle_id,
      trip_id: req.query.trip_id,
    });
    res.json(logs);
  } catch (err) {
    next(err);
  }
}

// ── POST /api/expenses/fuel ───────────────────────────────────────────────────
async function createFuelLog(req, res, next) {
  try {
    const log = await expenseService.createFuelLog(req.body);
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
}

// ── GET /api/expenses/general ─────────────────────────────────────────────────
async function getAllExpenses(req, res, next) {
  try {
    const expenses = await expenseService.getAllExpenses({
      vehicle_id: req.query.vehicle_id,
      trip_id: req.query.trip_id,
      expense_type: req.query.expense_type,
    });
    res.json(expenses);
  } catch (err) {
    next(err);
  }
}

// ── POST /api/expenses/general ────────────────────────────────────────────────
async function createExpense(req, res, next) {
  try {
    const expense = await expenseService.createExpense(req.body);
    res.status(201).json(expense);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllFuelLogs, createFuelLog, getAllExpenses, createExpense };
