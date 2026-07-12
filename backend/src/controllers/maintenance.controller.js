'use strict';

const maintenanceService = require('../services/maintenance.service');

// ── GET /api/maintenance ──────────────────────────────────────────────────────
async function getAllMaintenance(req, res, next) {
  try {
    const logs = await maintenanceService.getAllMaintenance({ status: req.query.status });
    res.json(logs);
  } catch (err) {
    next(err);
  }
}

// ── GET /api/maintenance/:id ──────────────────────────────────────────────────
async function getMaintenanceById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid maintenance log ID.' });
    const log = await maintenanceService.getMaintenanceById(id);
    res.json(log);
  } catch (err) {
    next(err);
  }
}

// ── POST /api/maintenance ─────────────────────────────────────────────────────
async function createMaintenance(req, res, next) {
  try {
    const log = await maintenanceService.createMaintenance(req.body);
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
}

// ── PATCH /api/maintenance/:id/close ─────────────────────────────────────────
async function closeMaintenance(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid maintenance log ID.' });
    const log = await maintenanceService.closeMaintenance(id, req.body);
    res.json(log);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllMaintenance,
  getMaintenanceById,
  createMaintenance,
  closeMaintenance,
};
