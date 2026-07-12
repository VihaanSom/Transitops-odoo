/**
 * TransitOps Database Seed Script
 *
 * Seeds the database with realistic sample data for development/testing.
 * Passwords are hashed with bcrypt (saltRounds=10) so the auth login endpoint works.
 * Plain-text passwords are printed at the end for reference.
 *
 * Usage: node prisma/seed.js  (or: npm run seed)
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PLAIN_PASSWORD = 'password123';
const SALT_ROUNDS = 10;

async function main() {
  console.log('🌱 Starting seed...\n');

  // ── 1. Clear existing data (in dependency order) ─────────────────────────
  console.log('  🗑️  Clearing existing data...');
  await prisma.$executeRaw`TRUNCATE TABLE expenses, fuel_logs, maintenance_logs, trips, vehicle_documents, drivers, vehicles, users RESTART IDENTITY CASCADE`;
  console.log('  ✅ Cleared.\n');

  // ── 2. Users (one per role, hashed passwords) ─────────────
  console.log('  👤 Seeding users...');
  const password_hash = await bcrypt.hash(PLAIN_PASSWORD, SALT_ROUNDS);
  
  const users = await Promise.all([
    prisma.users.create({
      data: {
        role: 'Fleet Manager',
        email: 'fleet@transitops.com',
        password_hash,
      },
    }),
    prisma.users.create({
      data: {
        role: 'Safety Officer',
        email: 'safety@transitops.com',
        password_hash,
      },
    }),
    prisma.users.create({
      data: {
        role: 'Dispatcher',
        email: 'dispatch@transitops.com',
        password_hash,
      },
    }),
    prisma.users.create({
      data: {
        role: 'Financial Analyst',
        email: 'finance@transitops.com',
        password_hash,
      },
    }),
  ]);
  console.log(`  ✅ ${users.length} users created.\n`);

  // ── 3. Vehicles ───────────────────────────────────────────────────────────
  console.log('  🚛 Seeding vehicles...');
  const vehicles = await Promise.all([
    prisma.vehicles.create({
      data: {
        registration_number: 'MH-12-AB-1234',
        name_model: 'Tata Prima 4928.S',
        vehicle_type: 'Heavy Truck',
        max_load_capacity: 25000,
        odometer: 84320,
        acquisition_cost: 3500000,
        status: 'available',
      },
    }),
    prisma.vehicles.create({
      data: {
        registration_number: 'MH-12-CD-5678',
        name_model: 'Ashok Leyland AVTR 1923',
        vehicle_type: 'Medium Truck',
        max_load_capacity: 15000,
        odometer: 42100,
        acquisition_cost: 2200000,
        status: 'available',
      },
    }),
    prisma.vehicles.create({
      data: {
        registration_number: 'MH-14-EF-9012',
        name_model: 'Mahindra Supro Cargo Van',
        vehicle_type: 'Van',
        max_load_capacity: 1200,
        odometer: 27650,
        acquisition_cost: 750000,
        status: 'available',
      },
    }),
    prisma.vehicles.create({
      data: {
        registration_number: 'MH-04-GH-3456',
        name_model: 'Eicher Pro 2095',
        vehicle_type: 'Light Truck',
        max_load_capacity: 9000,
        odometer: 61800,
        acquisition_cost: 1800000,
        status: 'available',
      },
    }),
    prisma.vehicles.create({
      data: {
        registration_number: 'MH-43-IJ-7890',
        name_model: 'BharatBenz 3528',
        vehicle_type: 'Heavy Truck',
        max_load_capacity: 28000,
        odometer: 112000,
        acquisition_cost: 4200000,
        status: 'available',
      },
    }),
  ]);
  console.log(`  ✅ ${vehicles.length} vehicles created.\n`);

  // ── 4. Vehicle Documents ──────────────────────────────────────────────────
  console.log('  📄 Seeding vehicle documents...');
  await Promise.all([
    prisma.vehicle_documents.create({
      data: {
        vehicle_id: vehicles[0].id,
        document_type: 'Insurance',
        file_url: 'https://storage.transitops.com/docs/insurance_MH12AB1234.pdf',
      },
    }),
    prisma.vehicle_documents.create({
      data: {
        vehicle_id: vehicles[0].id,
        document_type: 'Registration',
        file_url: 'https://storage.transitops.com/docs/reg_MH12AB1234.pdf',
      },
    }),
    prisma.vehicle_documents.create({
      data: {
        vehicle_id: vehicles[1].id,
        document_type: 'Permit',
        file_url: 'https://storage.transitops.com/docs/permit_MH12CD5678.pdf',
      },
    }),
    prisma.vehicle_documents.create({
      data: {
        vehicle_id: vehicles[2].id,
        document_type: 'Insurance',
        file_url: 'https://storage.transitops.com/docs/insurance_MH14EF9012.pdf',
      },
    }),
  ]);
  console.log('  ✅ Vehicle documents created.\n');

  // ── 5. Drivers ────────────────────────────────────────────────────────────
  console.log('  👷 Seeding drivers...');
  const drivers = await Promise.all([
    prisma.drivers.create({
      data: {
        name: 'Ramesh Kumar',
        license_number: 'MH0120210012345',
        license_category: 'HMV',
        license_expiry_date: new Date('2027-06-30'),
        contact_number: '+91-9876543210',
        safety_score: 92,
        status: 'available',
      },
    }),
    prisma.drivers.create({
      data: {
        name: 'Suresh Patil',
        license_number: 'MH1420190067890',
        license_category: 'HMV',
        license_expiry_date: new Date('2026-11-15'),
        contact_number: '+91-9876543211',
        safety_score: 85,
        status: 'available',
      },
    }),
    prisma.drivers.create({
      data: {
        name: 'Anil Sharma',
        license_number: 'DL0420220045678',
        license_category: 'LMV',
        license_expiry_date: new Date('2028-03-22'),
        contact_number: '+91-9876543212',
        safety_score: 78,
        status: 'available',
      },
    }),
    prisma.drivers.create({
      data: {
        name: 'Vijay Yadav',
        license_number: 'GJ0120230011223',
        license_category: 'HMV',
        license_expiry_date: new Date('2029-01-10'),
        contact_number: '+91-9876543213',
        safety_score: 96,
        status: 'available',
      },
    }),
    prisma.drivers.create({
      data: {
        name: 'Mohan Das',
        license_number: 'KA0520180098765',
        license_category: 'LMV',
        license_expiry_date: new Date('2025-08-20'), // Intentionally expired for test
        contact_number: '+91-9876543214',
        safety_score: 60,
        status: 'suspended',
      },
    }),
  ]);
  console.log(`  ✅ ${drivers.length} drivers created.\n`);

  // ── 6. Trips (draft + completed) ──────────────────────────────────────────
  console.log('  🗺️  Seeding trips...');

  // Completed trip 1 — for analytics data
  const trip1 = await prisma.trips.create({
    data: {
      source: 'Mumbai',
      destination: 'Pune',
      vehicle_id: vehicles[0].id,
      driver_id: drivers[0].id,
      cargo_weight: 18000,
      planned_distance: 148,
      status: 'completed',
      start_odometer: 84172,
      final_odometer: 84320,
      revenue: 45000,
      scheduled_at: new Date('2026-07-01T06:00:00Z'),
      dispatched_at: new Date('2026-07-01T06:30:00Z'),
      completed_at: new Date('2026-07-01T09:45:00Z'),
    },
  });

  // Completed trip 2
  const trip2 = await prisma.trips.create({
    data: {
      source: 'Pune',
      destination: 'Nashik',
      vehicle_id: vehicles[1].id,
      driver_id: drivers[1].id,
      cargo_weight: 12000,
      planned_distance: 212,
      status: 'completed',
      start_odometer: 41888,
      final_odometer: 42100,
      revenue: 38000,
      scheduled_at: new Date('2026-07-03T08:00:00Z'),
      dispatched_at: new Date('2026-07-03T08:30:00Z'),
      completed_at: new Date('2026-07-03T13:15:00Z'),
    },
  });

  // Draft trip — ready to dispatch
  const trip3 = await prisma.trips.create({
    data: {
      source: 'Mumbai',
      destination: 'Nagpur',
      vehicle_id: vehicles[3].id,
      driver_id: drivers[3].id,
      cargo_weight: 7500,
      planned_distance: 830,
      status: 'draft',
      start_odometer: 61800,
      scheduled_at: new Date('2026-07-14T05:00:00Z'),
    },
  });

  // Cancelled trip
  await prisma.trips.create({
    data: {
      source: 'Mumbai',
      destination: 'Surat',
      vehicle_id: vehicles[2].id,
      driver_id: drivers[2].id,
      cargo_weight: 900,
      planned_distance: 280,
      status: 'cancelled',
      start_odometer: 27650,
      scheduled_at: new Date('2026-07-05T07:00:00Z'),
      cancelled_at: new Date('2026-07-05T06:50:00Z'),
    },
  });

  console.log('  ✅ 4 trips created.\n');

  // ── 7. Maintenance Logs ───────────────────────────────────────────────────
  console.log('  🔧 Seeding maintenance logs...');

  // Closed maintenance — for analytics
  await prisma.maintenance_logs.create({
    data: {
      vehicle_id: vehicles[4].id,
      description: 'Routine engine overhaul and brake pad replacement',
      cost: 85000,
      status: 'closed',
      opened_at: new Date('2026-06-20T09:00:00Z'),
      closed_at: new Date('2026-06-25T17:00:00Z'),
    },
  });

  await prisma.maintenance_logs.create({
    data: {
      vehicle_id: vehicles[0].id,
      description: 'Tyre replacement — all 6 axles',
      cost: 42000,
      status: 'closed',
      opened_at: new Date('2026-06-28T08:00:00Z'),
      closed_at: new Date('2026-06-29T16:00:00Z'),
    },
  });

  console.log('  ✅ Maintenance logs created.\n');

  // ── 8. Fuel Logs ──────────────────────────────────────────────────────────
  console.log('  ⛽ Seeding fuel logs...');
  await Promise.all([
    prisma.fuel_logs.create({
      data: {
        vehicle_id: vehicles[0].id,
        trip_id: trip1.id,
        liters: 95.5,
        cost: 8595,
        log_date: new Date('2026-07-01T06:15:00Z'),
      },
    }),
    prisma.fuel_logs.create({
      data: {
        vehicle_id: vehicles[1].id,
        trip_id: trip2.id,
        liters: 110.2,
        cost: 9918,
        log_date: new Date('2026-07-03T08:10:00Z'),
      },
    }),
    prisma.fuel_logs.create({
      data: {
        vehicle_id: vehicles[3].id,
        trip_id: null,
        liters: 60.0,
        cost: 5400,
        log_date: new Date('2026-07-10T11:00:00Z'),
      },
    }),
  ]);
  console.log('  ✅ Fuel logs created.\n');

  // ── 9. Expenses ───────────────────────────────────────────────────────────
  console.log('  💸 Seeding expenses...');
  await Promise.all([
    prisma.expenses.create({
      data: {
        vehicle_id: vehicles[0].id,
        trip_id: trip1.id,
        expense_type: 'Tolls',
        amount: 850,
      },
    }),
    prisma.expenses.create({
      data: {
        vehicle_id: vehicles[1].id,
        trip_id: trip2.id,
        expense_type: 'Parking',
        amount: 500,
      },
    }),
    prisma.expenses.create({
      data: {
        vehicle_id: vehicles[3].id,
        trip_id: trip3.id,
        expense_type: 'Permits',
        amount: 2200,
      },
    }),
    prisma.expenses.create({
      data: {
        vehicle_id: vehicles[4].id,
        trip_id: null,
        expense_type: 'Cleaning',
        amount: 1500,
      },
    }),
  ]);
  console.log('  ✅ Expenses created.\n');

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('═══════════════════════════════════════');
  console.log('✅ Seed complete! Summary:');
  console.log(`   Users:            ${users.length}`);
  console.log(`   Vehicles:         ${vehicles.length}`);
  console.log(`   Drivers:          ${drivers.length}`);
  console.log(`   Trips:            4 (2 completed, 1 draft, 1 cancelled)`);
  console.log(`   Maintenance Logs: 2 (both closed)`);
  console.log(`   Fuel Logs:        3`);
  console.log(`   Expenses:         4`);
  console.log('═══════════════════════════════════════');
  console.log('\n📋 Test Credentials:');
  console.log('   fleet@transitops.com    / password123  [Fleet Manager]');
  console.log('   safety@transitops.com   / password123  [Safety Officer]');
  console.log('   dispatch@transitops.com / password123  [Dispatcher]');
  console.log('   finance@transitops.com  / password123  [Financial Analyst]');
  console.log('\n⚠️  Driver "Mohan Das" has an expired license and is suspended');
  console.log('   → Good for testing dispatch rejection triggers.\n');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
