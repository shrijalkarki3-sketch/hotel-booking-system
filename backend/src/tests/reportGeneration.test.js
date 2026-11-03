const base = 'http://localhost:5000/api/v1';

const api = async (path, options = {}) => {
  const res = await fetch(base + path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { status: res.status, data: json };
};

async function main() {
  const customerLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'customer@example.com', password: 'password123' }),
  });

  const managerLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'manager@example.com', password: 'password123' }),
  });

  const adminLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@example.com', password: 'password123' }),
  });

  const customerToken = customerLogin.data?.data?.token;
  const managerToken = managerLogin.data?.data?.token;
  const adminToken = adminLogin.data?.data?.token;

  const customerReport = await api('/analytics/reports/admin', {
    headers: { Authorization: `Bearer ${customerToken}` },
  });

  const managerReport = await api('/analytics/reports/manager', {
    headers: { Authorization: `Bearer ${managerToken}` },
  });

  const adminReport = await api('/analytics/reports/admin', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  const unauthenticated = await api('/analytics/reports/admin');

  console.log('customer_report=' + customerReport.status + ' msg=' + (customerReport.data?.message || 'n/a'));
  console.log('manager_report=' + managerReport.status + ' totalBookings=' + (managerReport.data?.data?.summary?.totalBookings || 0));
  console.log('admin_report=' + adminReport.status + ' totalUsers=' + (adminReport.data?.data?.summary?.totalUsers || 0));
  console.log('unauth_report=' + unauthenticated.status + ' msg=' + (unauthenticated.data?.message || 'n/a'));

  if (customerReport.status !== 403) process.exit(1);
  if (managerReport.status !== 200) process.exit(1);
  if (adminReport.status !== 200) process.exit(1);
  if (unauthenticated.status !== 401) process.exit(1);
}

main().catch((error) => {
  console.error('report_test_error=' + error.message);
  process.exit(1);
});
