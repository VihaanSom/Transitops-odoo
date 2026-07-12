'use strict';

const prisma = require('../config/prisma');

/**
 * Returns all vehicles, optionally filtered by type and/or status.
 *
 * @param {{ type?: string, status?: string }} filters
 */
async function getAllVehicles(filters = {}) {
  const where = {};

  if (filters.type) {
    where.vehicle_type = filters.type;
  }
  if (filters.status) {
    where.status = filters.status;
  }

  return prisma.vehicles.findMany({
    where,
    orderBy: { id: 'asc' },
  });
}

/**
 * Returns a single vehicle by ID, including its documents.
 * Throws 404 if not found.
 *
 * @param {number} id
 */
async function getVehicleById(id) {
  const vehicle = await prisma.vehicles.findUnique({
    where: { id },
    include: { vehicle_documents: true },
  });

  if (!vehicle) {
    const err = new Error('Vehicle not found.');
    err.statusCode = 404;
    throw err;
  }

  return vehicle;
}

/**
 * Creates a new vehicle.
 * Prisma/DB unique constraint on registration_number returns P2002 → 409 (handled by errorHandler).
 *
 * @param {object} data
 */
async function createVehicle(data) {
  return prisma.vehicles.create({ data });
}

/**
 * Updates an existing vehicle by ID.
 * Only fields present in `data` are updated (partial update).
 * Throws 404 if not found.
 *
 * @param {number} id
 * @param {object} data
 */
async function updateVehicle(id, data) {
  // Verify the vehicle exists first so we return a clean 404 instead of a Prisma error.
  await getVehicleById(id);

  return prisma.vehicles.update({
    where: { id },
    data,
  });
}

/**
 * Soft-deletes a vehicle by setting its status to 'retired'.
 * A vehicle that is on_trip or in_shop should not be retired — the caller
 * (controller) should reject those cases before calling this service.
 *
 * @param {number} id
 */
async function retireVehicle(id) {
  const vehicle = await getVehicleById(id);

  if (vehicle.status === 'on_trip') {
    const err = new Error('Cannot retire a vehicle that is currently on a trip.');
    err.statusCode = 409;
    throw err;
  }

  if (vehicle.status === 'in_shop') {
    const err = new Error('Cannot retire a vehicle that is currently in maintenance. Close the maintenance record first.');
    err.statusCode = 409;
    throw err;
  }

  return prisma.vehicles.update({
    where: { id },
    data: { status: 'retired' },
  });
}

/**
 * Adds a document record to a vehicle.
 * Throws 404 if the vehicle does not exist.
 *
 * @param {number} vehicleId
 * @param {{ document_type: string, file_url: string }} data
 */
async function addDocument(vehicleId, data) {
  // Verify vehicle exists
  await getVehicleById(vehicleId);

  return prisma.vehicle_documents.create({
    data: {
      vehicle_id: vehicleId,
      ...data,
    },
  });
}

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  retireVehicle,
  addDocument,
};
