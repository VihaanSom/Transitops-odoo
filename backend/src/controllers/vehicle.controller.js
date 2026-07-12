'use strict';

const vehicleService = require('../services/vehicle.service');

/**
 * GET /api/vehicles
 * Query params: ?type=Van&status=available
 */
async function getAllVehicles(req, res, next) {
  try {
    const { type, status } = req.query;
    const vehicles = await vehicleService.getAllVehicles({ type, status });
    return res.status(200).json(vehicles);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/vehicles/:id
 */
async function getVehicleById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Vehicle ID must be a number.' });
    }

    const vehicle = await vehicleService.getVehicleById(id);
    return res.status(200).json(vehicle);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/vehicles
 * Body is pre-validated by validate(createVehicleSchema) middleware.
 */
async function createVehicle(req, res, next) {
  try {
    const vehicle = await vehicleService.createVehicle(req.body);
    return res.status(201).json(vehicle);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/vehicles/:id
 * Body is pre-validated by validate(updateVehicleSchema) middleware.
 */
async function updateVehicle(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Vehicle ID must be a number.' });
    }

    const vehicle = await vehicleService.updateVehicle(id, req.body);
    return res.status(200).json(vehicle);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/vehicles/:id
 * Soft-deletes the vehicle by marking it as 'retired'.
 */
async function deleteVehicle(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Vehicle ID must be a number.' });
    }

    const vehicle = await vehicleService.retireVehicle(id);
    return res.status(200).json({
      message: 'Vehicle retired successfully.',
      vehicle,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/vehicles/:id/documents
 * Body is pre-validated by validate(addDocumentSchema) middleware.
 */
async function addDocument(req, res, next) {
  try {
    const vehicleId = parseInt(req.params.id, 10);
    if (isNaN(vehicleId)) {
      return res.status(400).json({ error: 'Vehicle ID must be a number.' });
    }

    const doc = await vehicleService.addDocument(vehicleId, req.body);
    return res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  addDocument,
};
