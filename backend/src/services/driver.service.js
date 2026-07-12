'use strict';

const prisma = require('../config/prisma');

/**
 * Returns all drivers.
 */
async function getAllDrivers() {
  return prisma.drivers.findMany({ orderBy: { id: 'asc' } });
}

/**
 * Returns a single driver by ID.
 * Throws 404 if not found.
 *
 * @param {number} id
 */
async function getDriverById(id) {
  const driver = await prisma.drivers.findUnique({ where: { id } });

  if (!driver) {
    const err = new Error('Driver not found.');
    err.statusCode = 404;
    throw err;
  }

  return driver;
}

/**
 * Creates a new driver.
 * Prisma unique constraint on license_number returns P2002 → 409 (handled by errorHandler).
 *
 * @param {object} data
 */
async function createDriver(data) {
  return prisma.drivers.create({ data });
}

/**
 * Updates a driver's status by ID.
 * Used primarily for manual suspensions or status corrections.
 * Throws 404 if driver not found.
 *
 * @param {number} id
 * @param {string} status
 */
async function updateDriverStatus(id, status) {
  // Verify driver exists first for a clean 404
  await getDriverById(id);

  return prisma.drivers.update({
    where: { id },
    data: { status },
  });
}

/**
 * Hard-deletes a driver by ID.
 * If the driver is associated with existing trips, Prisma will throw a P2003
 * foreign key constraint error, which is caught by the global error handler.
 * Throws 404 if driver not found.
 *
 * @param {number} id
 */
async function deleteDriver(id) {
  // Verify driver exists first for a clean 404
  await getDriverById(id);

  return prisma.drivers.delete({
    where: { id },
  });
}

module.exports = {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriverStatus,
  deleteDriver,
};
