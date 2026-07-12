async function runTests() {
  const baseUrl = 'http://localhost:3000/api/maintenance';
  const authUrl = 'http://localhost:3000/api/auth/login';

  console.log('--- Step 0: Login to get token ---');
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

  let createdMaintenanceId;

  console.log('--- Test Case 1: Open a new maintenance log (POST /) ---');
  let res = await fetch(baseUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      vehicle_id: 1, // Ensure vehicle is available, otherwise trigger will fail
      description: 'Routine Oil Change and Brake Inspection'
    })
  });
  console.log(`Status: ${res.status}`);
  let data = await res.json();
  console.log(data);
  if (res.status === 201) createdMaintenanceId = data.id;
  console.log('\n');

  console.log('--- Test Case 2: Open maintenance for invalid/missing fields (Validation Error) ---');
  res = await fetch(baseUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      description: 'Missing vehicle id'
    })
  });
  console.log(`Status: ${res.status}`);
  console.log(await res.json());
  console.log('\n');

  if (createdMaintenanceId) {
    console.log(`--- Test Case 3: Close maintenance log (PATCH /${createdMaintenanceId}/close) ---`);
    res = await fetch(`${baseUrl}/${createdMaintenanceId}/close`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        cost: 1500
      })
    });
    console.log(`Status: ${res.status}`);
    console.log(await res.json());
    console.log('\n');
  } else {
    console.log('Skipping close maintenance test because creation failed.\n');
  }

  console.log('--- Test Case 4: Get all maintenance logs (GET /) ---');
  res = await fetch(baseUrl, { headers });
  console.log(`Status: ${res.status}`);
  let allLogs = await res.json();
  console.log(`Total maintenance logs found: ${allLogs.length}`);
  console.log('\n');

  console.log('--- Test Case 5: Get filtered maintenance logs (GET /?status=open) ---');
  res = await fetch(`${baseUrl}?status=open`, { headers });
  console.log(`Status: ${res.status}`);
  let filteredLogs = await res.json();
  console.log(`Open logs found: ${filteredLogs.length}`);
  console.log('\n');

  if (createdMaintenanceId) {
    console.log(`--- Test Case 6: Get maintenance log by ID (GET /${createdMaintenanceId}) ---`);
    res = await fetch(`${baseUrl}/${createdMaintenanceId}`, { headers });
    console.log(`Status: ${res.status}`);
    console.log(await res.json());
    console.log('\n');
  }
}

runTests().catch(console.error);
