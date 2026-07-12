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

/**
 * GET /api/dashboard/recent-trips
 * Access: All authenticated roles.
 * Returns the 5 most recent trips for the dashboard widget.
 */
async function getRecentTrips(req, res, next) {
  try {
    const trips = await dashboardService.getRecentTrips();
    return res.status(200).json(trips);
  } catch (err) {
    next(err);
  }
}

module.exports = { getKpis, getRecentTrips };
