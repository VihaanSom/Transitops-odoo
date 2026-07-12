'use strict';

const tripService = require('../services/trip.service');

// ── GET /api/trips ────────────────────────────────────────────────────────────
async function getAllTrips(req, res, next) {
  try {
    const trips = await tripService.getAllTrips({ status: req.query.status });
    res.json(trips);
  } catch (err) {
    next(err);
  }
}

// ── GET /api/trips/:id ────────────────────────────────────────────────────────
async function getTripById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid trip ID.' });
    const trip = await tripService.getTripById(id);
    res.json(trip);
  } catch (err) {
    next(err);
  }
}

// ── POST /api/trips ───────────────────────────────────────────────────────────
async function createTrip(req, res, next) {
  try {
    const trip = await tripService.createTrip(req.body);
    res.status(201).json(trip);
  } catch (err) {
    next(err);
  }
}

// ── PATCH /api/trips/:id/dispatch ────────────────────────────────────────────
async function dispatchTrip(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid trip ID.' });
    const trip = await tripService.dispatchTrip(id, req.body);
    res.json(trip);
  } catch (err) {
    next(err);
  }
}

// ── PATCH /api/trips/:id/complete ────────────────────────────────────────────
async function completeTrip(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid trip ID.' });
    const trip = await tripService.completeTrip(id, req.body);
    res.json(trip);
  } catch (err) {
    next(err);
  }
}

// ── PATCH /api/trips/:id/cancel ──────────────────────────────────────────────
async function cancelTrip(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid trip ID.' });
    const trip = await tripService.cancelTrip(id, req.body);
    res.json(trip);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllTrips,
  getTripById,
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
};
