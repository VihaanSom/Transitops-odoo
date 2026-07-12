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

module.exports = { getVehicleAnalytics };
