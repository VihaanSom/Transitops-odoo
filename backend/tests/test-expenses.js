async function runTests() {
  const baseUrl = 'http://localhost:3000/api/expenses';
  const authUrl = 'http://localhost:3000/api/auth/login';

  console.log('--- Step 0: Login as Fleet Manager ---');
  let authRes = await fetch(authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'fleet@transitops.com', password: 'password123' })
  });

  if (authRes.status !== 200) {
    console.error('Failed to login. Is the server running?');
    return;
  }

  const { token } = await authRes.json();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  console.log('✅ Successfully logged in as Fleet Manager\n');

  // ── Fuel Logs ────────────────────────────────────────────────────────────────

  console.log('--- Test Case 1: Log a fuel fill-up (POST /fuel) ---');
  let res = await fetch(`${baseUrl}/fuel`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      vehicle_id: 1,
      liters: 120.5,
      cost: 9800,
      log_date: new Date().toISOString()
    })
  });
  console.log(`Status: ${res.status}`);
  console.log(await res.json());
  console.log('\n');

  console.log('--- Test Case 2: Log fuel linked to a trip (POST /fuel with trip_id) ---');
  res = await fetch(`${baseUrl}/fuel`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      vehicle_id: 2,
      trip_id: 1,
      liters: 85.0,
      cost: 6800
    })
  });
  console.log(`Status: ${res.status}`);
  console.log(await res.json());
  console.log('\n');

  console.log('--- Test Case 3: Fuel log with missing fields (Validation Error) ---');
  res = await fetch(`${baseUrl}/fuel`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      vehicle_id: 1
      // Missing liters and cost
    })
  });
  console.log(`Status: ${res.status}`);
  console.log(await res.json());
  console.log('\n');

  console.log('--- Test Case 4: Get all fuel logs (GET /fuel) ---');
  res = await fetch(`${baseUrl}/fuel`, { headers });
  console.log(`Status: ${res.status}`);
  let allFuel = await res.json();
  console.log(`Total fuel logs: ${allFuel.length}`);
  console.log('\n');

  console.log('--- Test Case 5: Get fuel logs filtered by vehicle (GET /fuel?vehicle_id=1) ---');
  res = await fetch(`${baseUrl}/fuel?vehicle_id=1`, { headers });
  console.log(`Status: ${res.status}`);
  let filtered = await res.json();
  console.log(`Fuel logs for vehicle 1: ${filtered.length}`);
  console.log('\n');

  // ── General Expenses ─────────────────────────────────────────────────────────

  console.log('--- Test Case 6: Log a general expense (POST /general) ---');
  res = await fetch(`${baseUrl}/general`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      vehicle_id: 1,
      expense_type: 'Toll',
      amount: 250
    })
  });
  console.log(`Status: ${res.status}`);
  console.log(await res.json());
  console.log('\n');

  console.log('--- Test Case 7: Log expense linked to a trip (POST /general with trip_id) ---');
  res = await fetch(`${baseUrl}/general`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      vehicle_id: 2,
      trip_id: 1,
      expense_type: 'Driver Allowance',
      amount: 1200
    })
  });
  console.log(`Status: ${res.status}`);
  console.log(await res.json());
  console.log('\n');

  console.log('--- Test Case 8: Expense with missing fields (Validation Error) ---');
  res = await fetch(`${baseUrl}/general`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      vehicle_id: 1
      // Missing expense_type and amount
    })
  });
  console.log(`Status: ${res.status}`);
  console.log(await res.json());
  console.log('\n');

  console.log('--- Test Case 9: Get all general expenses (GET /general) ---');
  res = await fetch(`${baseUrl}/general`, { headers });
  console.log(`Status: ${res.status}`);
  let allExp = await res.json();
  console.log(`Total expenses: ${allExp.length}`);
  console.log('\n');

  console.log('--- Test Case 10: Get expenses filtered by type (GET /general?expense_type=Toll) ---');
  res = await fetch(`${baseUrl}/general?expense_type=Toll`, { headers });
  console.log(`Status: ${res.status}`);
  let tolls = await res.json();
  console.log(`Toll expenses: ${tolls.length}`);
  console.log('\n');
}

runTests().catch(console.error);
