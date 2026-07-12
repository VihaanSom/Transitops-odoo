async function runTests() {
  const baseUrl = 'http://localhost:3000/api/trips';
  const authUrl = 'http://localhost:3000/api/auth/login';

  console.log('--- Step 0: Login to get token ---');
  let authRes = await fetch(authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'dispatch@transitops.com', password: 'password123' })
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
  
  console.log('✅ Successfully logged in as Dispatcher\n');

  let createdTripId;

  console.log('--- Test Case 1: Create a new trip (POST /) ---');
  let res = await fetch(baseUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      source: 'Mumbai',
      destination: 'Delhi',
      vehicle_id: 1,
      driver_id: 1,
      cargo_weight: 1000,
      planned_distance: 1400,
      start_odometer: 10000
    })
  });
  console.log(`Status: ${res.status}`);
  let data = await res.json();
  console.log(data);
  if (res.status === 201) createdTripId = data.id;
  console.log('\n');

  console.log('--- Test Case 2: Create trip with suspended driver (Trigger Error) ---');
  res = await fetch(baseUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      source: 'Mumbai',
      destination: 'Pune',
      vehicle_id: 2,
      driver_id: 5, // Mohan Das is suspended
      cargo_weight: 500,
      planned_distance: 150,
      start_odometer: 20000
    })
  });
  console.log(`Status: ${res.status}`);
  let failedData = await res.json();
  console.log(failedData);
  let failedTripId;
  if (res.status === 201) failedTripId = failedData.id;
  console.log('\n');

  if (failedTripId) {
    console.log(`--- Test Case 3: Try to dispatch trip with suspended driver (PATCH /${failedTripId}/dispatch) ---`);
    res = await fetch(`${baseUrl}/${failedTripId}/dispatch`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({})
    });
    console.log(`Status: ${res.status}`);
    console.log(await res.json());
    console.log('\n');
  }

  if (createdTripId) {
    console.log(`--- Test Case 4: Dispatch trip (PATCH /${createdTripId}/dispatch) ---`);
    res = await fetch(`${baseUrl}/${createdTripId}/dispatch`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({})
    });
    console.log(`Status: ${res.status}`);
    console.log(await res.json());
    console.log('\n');

    console.log(`--- Test Case 5: Complete trip (PATCH /${createdTripId}/complete) ---`);
    res = await fetch(`${baseUrl}/${createdTripId}/complete`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        final_odometer: 11400,
        revenue: 50000
      })
    });
    console.log(`Status: ${res.status}`);
    console.log(await res.json());
    console.log('\n');
  } else {
    console.log('Skipping dispatch/complete tests because creation failed.\n');
  }

  console.log('--- Test Case 6: Create and Cancel a trip ---');
  res = await fetch(baseUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      source: 'Nashik',
      destination: 'Thane',
      vehicle_id: 3,
      driver_id: 2,
      cargo_weight: 200,
      planned_distance: 120,
      start_odometer: 5000
    })
  });
  let cancelTripData = await res.json();
  let tripToCancel = cancelTripData.id;
  
  if (tripToCancel) {
    res = await fetch(`${baseUrl}/${tripToCancel}/cancel`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({})
    });
    console.log(`Status: ${res.status}`);
    console.log(await res.json());
  }
  console.log('\n');

  console.log('--- Test Case 7: Get all trips (GET /) ---');
  res = await fetch(baseUrl, { headers });
  console.log(`Status: ${res.status}`);
  let allTrips = await res.json();
  console.log(`Total trips found: ${allTrips.length}`);
  console.log('\n');

  if (createdTripId) {
    console.log(`--- Test Case 8: Get trip by ID (GET /${createdTripId}) ---`);
    res = await fetch(`${baseUrl}/${createdTripId}`, { headers });
    console.log(`Status: ${res.status}`);
    console.log(await res.json());
    console.log('\n');
  }
}

runTests().catch(console.error);
