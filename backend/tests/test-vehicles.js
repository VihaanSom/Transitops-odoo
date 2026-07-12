async function runTests() {
  const baseUrl = 'http://localhost:3000/api/vehicles';
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

  let createdVehicleId;
  const uniqueReg = `TEST-${Date.now().toString().slice(-6)}`;

  console.log('--- Test Case 1: Create a new vehicle (POST /) ---');
  let res = await fetch(baseUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      registration_number: uniqueReg,
      name_model: 'Volvo FH16',
      vehicle_type: 'Heavy Truck',
      max_load_capacity: 40000,
      acquisition_cost: 8000000
    })
  });
  console.log(`Status: ${res.status}`);
  let data = await res.json();
  console.log(data);
  if (res.status === 201) createdVehicleId = data.id;
  console.log('\n');

  console.log('--- Test Case 2: Create with missing fields (Validation Error) ---');
  res = await fetch(baseUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      registration_number: 'MISSING-FIELDS',
      // Missing name_model, vehicle_type, etc.
    })
  });
  console.log(`Status: ${res.status}`);
  console.log(await res.json());
  console.log('\n');

  console.log('--- Test Case 3: Create with duplicate registration (Conflict Error) ---');
  res = await fetch(baseUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      registration_number: uniqueReg, // Trying to reuse the one we just created
      name_model: 'Volvo FH16',
      vehicle_type: 'Heavy Truck',
      max_load_capacity: 40000,
      acquisition_cost: 8000000
    })
  });
  console.log(`Status: ${res.status}`);
  console.log(await res.json());
  console.log('\n');

  console.log('--- Test Case 4: Get all vehicles (GET /) ---');
  res = await fetch(baseUrl, { headers });
  console.log(`Status: ${res.status}`);
  let allVehicles = await res.json();
  console.log(`Total vehicles found: ${allVehicles.length}`);
  console.log('\n');

  console.log('--- Test Case 5: Get filtered vehicles (GET /?type=Heavy Truck) ---');
  res = await fetch(`${baseUrl}?type=Heavy Truck`, { headers });
  console.log(`Status: ${res.status}`);
  let filteredVehicles = await res.json();
  console.log(`Heavy Trucks found: ${filteredVehicles.length}`);
  console.log('\n');

  if (createdVehicleId) {
    console.log(`--- Test Case 6: Get vehicle by ID (GET /${createdVehicleId}) ---`);
    res = await fetch(`${baseUrl}/${createdVehicleId}`, { headers });
    console.log(`Status: ${res.status}`);
    console.log(await res.json());
    console.log('\n');

    console.log(`--- Test Case 7: Update vehicle (PUT /${createdVehicleId}) ---`);
    res = await fetch(`${baseUrl}/${createdVehicleId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        odometer: 150
      })
    });
    console.log(`Status: ${res.status}`);
    console.log(await res.json());
    console.log('\n');

    console.log(`--- Test Case 8: Add document to vehicle (POST /${createdVehicleId}/documents) ---`);
    res = await fetch(`${baseUrl}/${createdVehicleId}/documents`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        document_type: 'Insurance',
        file_url: 'https://example.com/insurance.pdf'
      })
    });
    console.log(`Status: ${res.status}`);
    console.log(await res.json());
    console.log('\n');

    console.log(`--- Test Case 9: Retire vehicle (DELETE /${createdVehicleId}) ---`);
    res = await fetch(`${baseUrl}/${createdVehicleId}`, {
      method: 'DELETE',
      headers
    });
    console.log(`Status: ${res.status}`);
    console.log(await res.json());
    console.log('\n');
  } else {
    console.log('Skipping ID-specific tests because creation failed.\n');
  }

  console.log('--- Test Case 10: Delete non-existent vehicle (404 Error) ---');
  res = await fetch(`${baseUrl}/999999`, {
    method: 'DELETE',
    headers
  });
  console.log(`Status: ${res.status}`);
  console.log(await res.json());
  console.log('\n');
}

runTests().catch(console.error);
