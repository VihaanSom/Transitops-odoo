async function runTests() {
  const baseUrl = 'http://localhost:3000/api/dashboard';
  const authUrl = 'http://localhost:3000/api/auth/login';

  // ── Step 0: Login ────────────────────────────────────────────────────────
  console.log('--- Step 0: Login to get token ---');
  const authRes = await fetch(authUrl, {
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

  // ── Test Case 1: Happy Path ───────────────────────────────────────────────
  console.log('--- Test Case 1: Get KPIs (GET /kpis) ---');
  let res = await fetch(`${baseUrl}/kpis`, { headers });
  console.log(`Status: ${res.status}`);
  console.log(await res.json());
  console.log('\n');

  // ── Test Case 2: Unauthenticated (no token) ───────────────────────────────
  console.log('--- Test Case 2: No token → 401 Unauthorized ---');
  res = await fetch(`${baseUrl}/kpis`);
  console.log(`Status: ${res.status}`);
  console.log(await res.json());
  console.log('\n');

  // ── Test Case 3: Valid for another role (Finance) ────────────────────────
  console.log('--- Test Case 3: Finance Analyst can also view KPIs ---');
  const financeRes = await fetch(authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'finance@transitops.com', password: 'password123' })
  });
  const { token: financeToken } = await financeRes.json();
  res = await fetch(`${baseUrl}/kpis`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${financeToken}`
    }
  });
  console.log(`Status: ${res.status}`);
  console.log(await res.json());
  console.log('\n');
}

runTests().catch(console.error);
