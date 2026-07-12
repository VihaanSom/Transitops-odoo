async function runTests() {
  const baseUrl = 'http://localhost:3000/api/reports';
  const authUrl = 'http://localhost:3000/api/auth/login';

  console.log('--- Step 0: Login as Financial Analyst ---');
  let authRes = await fetch(authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'finance@transitops.com', password: 'password123' })
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

  console.log('✅ Successfully logged in as Financial Analyst\n');

  console.log('--- Test Case 1: Get vehicle analytics report (GET /vehicle-analytics) ---');
  let res = await fetch(`${baseUrl}/vehicle-analytics`, { headers });
  console.log(`Status: ${res.status}`);
  let data = await res.json();
  console.log(`Total vehicles in report: ${data.length}`);
  if (data.length > 0) {
    console.log('Sample row:');
    console.log(data[0]);
  }
  console.log('\n');

  console.log('--- Test Case 2: Access with wrong role (Dispatcher) - 403 Expected ---');
  let dispAuthRes = await fetch(authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'dispatch@transitops.com', password: 'password123' })
  });
  const { token: dispToken } = await dispAuthRes.json();
  res = await fetch(`${baseUrl}/vehicle-analytics`, {
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${dispToken}` }
  });
  console.log(`Status: ${res.status}`);
  console.log(await res.json());
  console.log('\n');

  console.log('--- Test Case 3: Access without token - 401 Expected ---');
  res = await fetch(`${baseUrl}/vehicle-analytics`);
  console.log(`Status: ${res.status}`);
  console.log(await res.json());
  console.log('\n');
}

runTests().catch(console.error);
