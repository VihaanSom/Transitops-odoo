async function runTests() {
  const baseUrl = 'http://localhost:3000/api/auth/login';

  console.log('--- Test Case 1: Successful Login (Happy Path) ---');
  let res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'fleet@transitops.com', password: 'password123' })
  });
  console.log(`Status: ${res.status}`);
  console.log(await res.json());
  console.log('\n');

  console.log('--- Test Case 2: Missing Email (Validation Error) ---');
  res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'password123' })
  });
  console.log(`Status: ${res.status}`);
  console.log(await res.json());
  console.log('\n');

  console.log('--- Test Case 3: Invalid Email Format (Validation Error) ---');
  res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'not-an-email', password: 'password123' })
  });
  console.log(`Status: ${res.status}`);
  console.log(await res.json());
  console.log('\n');

  console.log('--- Test Case 4: Incorrect Password ---');
  res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'fleet@transitops.com', password: 'wrongpassword' })
  });
  console.log(`Status: ${res.status}`);
  console.log(await res.json());
  console.log('\n');

  console.log('--- Test Case 5: Non-Existent User ---');
  res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'nobody@transitops.com', password: 'password123' })
  });
  console.log(`Status: ${res.status}`);
  console.log(await res.json());
  console.log('\n');

  console.log('--- Test Case 6: Register new user (POST /register) ---');
  const registerUrl = 'http://localhost:3000/api/auth/register';
  const newEmail = `newuser${Date.now()}@transitops.com`;
  
  res = await fetch(registerUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: newEmail,
      password: 'newpassword123',
      role: 'Fleet Manager',
      first_name: 'John',
      last_name: 'Hackathon'
    })
  });
  console.log(`Status: ${res.status}`);
  console.log(await res.json());
  console.log('\n');

  console.log('--- Test Case 7: Register with duplicate email (Conflict Error) ---');
  res = await fetch(registerUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: newEmail, // trying to reuse the same email
      password: 'newpassword123',
      role: 'Fleet Manager'
    })
  });
  console.log(`Status: ${res.status}`);
  console.log(await res.json());
  console.log('\n');

  console.log('--- Fetching token for new user ---');
  const loginRes = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: newEmail, password: 'newpassword123' })
  });
  const loginData = await loginRes.json();
  const deleteToken = loginData.token;

  console.log('--- Test Case 8: Get Profile (GET /me) ---');
  if (deleteToken) {
    res = await fetch('http://localhost:3000/api/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deleteToken}`
      }
    });
    console.log(`Status: ${res.status}`);
    console.log(await res.json());
  } else {
    console.log('Skipping due to missing token.');
  }
  console.log('\n');

  console.log('--- Test Case 9: Update Profile (PUT /me) ---');
  if (deleteToken) {
    res = await fetch('http://localhost:3000/api/auth/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deleteToken}`
      },
      body: JSON.stringify({
        first_name: 'UpdatedFirst',
        last_name: 'UpdatedLast'
      })
    });
    console.log(`Status: ${res.status}`);
    console.log(await res.json());
  } else {
    console.log('Skipping due to missing token.');
  }
  console.log('\n');

  console.log('--- Test Case 10: Delete Account (DELETE /me) ---');
  if (deleteToken) {
    res = await fetch('http://localhost:3000/api/auth/me', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deleteToken}`
      }
    });
    console.log(`Status: ${res.status}`);
    console.log(await res.json());
  } else {
    console.log('Failed to get token for delete test (make sure Test Case 6 succeeded).');
  }
  console.log('\n');
}

runTests().catch(console.error);
