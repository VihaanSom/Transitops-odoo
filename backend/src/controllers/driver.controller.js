'use strict';

const driverService = require('../services/driver.service');

/**
 * GET /api/drivers
 */
async function getAllDrivers(req, res, next) {
  try {
    const drivers = await driverService.getAllDrivers();
    return res.status(200).json(drivers);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/drivers/:id
 */
async function getDriverById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Driver ID must be a number.' });
    }

    const driver = await driverService.getDriverById(id);
    return res.status(200).json(driver);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/drivers
 * Body is pre-validated by validate(createDriverSchema) middleware.
 */
async function createDriver(req, res, next) {
  try {
    const driver = await driverService.createDriver(req.body);
    return res.status(201).json(driver);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/drivers/:id/status
 * Body is pre-validated by validate(updateDriverStatusSchema) middleware.
 */
async function updateStatus(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Driver ID must be a number.' });
    }

    const driver = await driverService.updateDriverStatus(id, req.body.status);
    return res.status(200).json(driver);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/drivers/:id
 */
async function deleteDriver(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Driver ID must be a number.' });
    }

    await driverService.deleteDriver(id);
    return res.status(200).json({ message: 'Driver deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateStatus,
  deleteDriver,
};
