async function runTests() {
  const baseUrl = 'http://localhost:3000/api/drivers';
  const authUrl = 'http://localhost:3000/api/auth/login';

  console.log('--- Step 0: Login to get token ---');
  // Logging in as Safety Officer because they have access to all driver routes (including status updates)
  let authRes = await fetch(authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'safety@transitops.com', password: 'password123' })
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
  
  console.log('✅ Successfully logged in as Safety Officer\n');

  let createdDriverId;
  const uniqueLicense = `LIC-${Date.now().toString().slice(-6)}`;

  console.log('--- Test Case 1: Create a new driver (POST /) ---');
  let res = await fetch(baseUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'John Doe',
      license_number: uniqueLicense,
      license_category: 'Class A',
      license_expiry_date: '2028-12-31',
      contact_number: '+1-555-0199',
      safety_score: 100
    })
  });
  console.log(`Status: ${res.status}`);
  let data = await res.json();
  console.log(data);
  if (res.status === 201) createdDriverId = data.id;
  console.log('\n');

  console.log('--- Test Case 2: Create with missing/invalid fields (Validation Error) ---');
  res = await fetch(baseUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'Jane Doe',
      license_number: 'LIC-INVALID',
      // Missing required fields like license_category
      license_expiry_date: 'invalid-date' // Should fail date validation
    })
  });
  console.log(`Status: ${res.status}`);
  console.log(await res.json());
  console.log('\n');

  console.log('--- Test Case 3: Create with duplicate license (Conflict Error) ---');
  res = await fetch(baseUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'John Duplicate',
      license_number: uniqueLicense, // Reusing the license from Test Case 1
      license_category: 'Class A',
      license_expiry_date: '2028-12-31',
      contact_number: '+1-555-0199'
    })
  });
  console.log(`Status: ${res.status}`);
  console.log(await res.json());
  console.log('\n');

  console.log('--- Test Case 4: Get all drivers (GET /) ---');
  res = await fetch(baseUrl, { headers });
  console.log(`Status: ${res.status}`);
  let allDrivers = await res.json();
  console.log(`Total drivers found: ${allDrivers.length}`);
  console.log('\n');

  if (createdDriverId) {
    console.log(`--- Test Case 5: Get driver by ID (GET /${createdDriverId}) ---`);
    res = await fetch(`${baseUrl}/${createdDriverId}`, { headers });
    console.log(`Status: ${res.status}`);
    console.log(await res.json());
    console.log('\n');

    console.log(`--- Test Case 6: Update driver status (PUT /${createdDriverId}/status) ---`);
    res = await fetch(`${baseUrl}/${createdDriverId}/status`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        status: 'suspended'
      })
    });
    console.log(`Status: ${res.status}`);
    console.log(await res.json());
    console.log('\n');

    console.log(`--- Test Case 7: Delete driver (DELETE /${createdDriverId}) ---`);
    res = await fetch(`${baseUrl}/${createdDriverId}`, {
      method: 'DELETE',
      headers
    });
    console.log(`Status: ${res.status}`);
    console.log(await res.json());
    console.log('\n');
  } else {
    console.log('Skipping ID-specific tests because creation failed.\n');
  }

  console.log('--- Test Case 8: Get non-existent driver (404 Error) ---');
  res = await fetch(`${baseUrl}/999999`, { headers });
  console.log(`Status: ${res.status}`);
  console.log(await res.json());
  console.log('\n');

  console.log('--- Test Case 9: Delete non-existent driver (404 Error) ---');
  res = await fetch(`${baseUrl}/999999`, {
    method: 'DELETE',
    headers
  });
  console.log(`Status: ${res.status}`);
  console.log(await res.json());
  console.log('\n');
}

runTests().catch(console.error);
