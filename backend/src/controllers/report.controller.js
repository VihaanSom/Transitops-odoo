'use strict';

const reportService = require('../services/report.service');

// ── GET /api/reports/vehicle-analytics ───────────────────────────────────────
async function getVehicleAnalytics(req, res, next) {
  try {
    const analytics = await reportService.getVehicleAnalytics();
    res.json(analytics);
  } catch (err) {
    next(err);
  }
}

// ── GET /api/reports/monthly-revenue ─────────────────────────────────────────
async function getMonthlyRevenue(req, res, next) {
  try {
    const data = await reportService.getMonthlyRevenue();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { getVehicleAnalytics, getMonthlyRevenue };
