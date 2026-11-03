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

  const adminLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@example.com', password: 'password123' }),
  });

  const customerToken = customerLogin.data?.data?.token;
  const adminToken = adminLogin.data?.data?.token;

  const customerProfileUpdate = await api('/auth/profile', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${customerToken}` },
    body: JSON.stringify({ name: 'John Customer Updated', phone: '+977 9803333333' }),
  });

  const customerPasswordChange = await api('/auth/password', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${customerToken}` },
    body: JSON.stringify({ currentPassword: 'password123', newPassword: 'newPassword123' }),
  });

  const adminUserList = await api('/users', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  const targetUserId = adminUserList.data?.data?.find((u) => u.email === 'customer@example.com')?._id;

  const adminUserDetail = await api(`/users/${targetUserId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  const customerBlocked = await api(`/users/${targetUserId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${customerToken}` },
    body: JSON.stringify({ status: 'blocked' }),
  });

  const managerAccess = await api('/auth/manager-test', {
    headers: { Authorization: `Bearer ${customerToken}` },
  });

  console.log('customer_profile_update=' + customerProfileUpdate.status + ' ' + (customerProfileUpdate.data?.message || 'n/a'));
  console.log('customer_password_change=' + customerPasswordChange.status + ' ' + (customerPasswordChange.data?.message || 'n/a'));
  console.log('admin_user_list=' + adminUserList.status + ' count=' + (adminUserList.data?.count || 0));
  console.log('admin_user_detail=' + adminUserDetail.status + ' message=' + (adminUserDetail.data?.message || 'n/a'));
  console.log('customer_status_update=' + customerBlocked.status + ' message=' + (customerBlocked.data?.message || 'n/a'));
  console.log('customer_manager_access=' + managerAccess.status + ' message=' + (managerAccess.data?.message || 'n/a'));

  if (adminUserDetail.status !== 200) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('phase3_test_error=' + error.message);
  process.exit(1);
});
