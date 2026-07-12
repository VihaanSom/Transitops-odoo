'use strict';

const dashboardService = require('../services/dashboard.service');

/**
 * GET /api/dashboard/kpis
 * Access: All authenticated roles.
 */
async function getKpis(req, res, next) {
  try {
    const kpis = await dashboardService.getKpis();
    return res.status(200).json(kpis);
  } catch (err) {
    next(err);
  }
}

module.exports = { getKpis };
