# Website Axios API Services Documentation

## Overview
Dokumentasi lengkap penggunaan axios API services di website untuk komunikasi dengan backend.

## File Structure
```
src/
├── api/
│   ├── authApi.js      - Authentication API calls
│   ├── userApi.js      - User Management API calls
│   └── index.js        - Centralized exports
```

---

## Setup & Configuration

### 1. Environment Variables
Buat file `.env` atau `.env.local` di root project:
```
VITE_API_URL=http://localhost:8000/api
```

Atau sesuaikan dengan URL backend Anda.

### 2. Axios Instance
File `authApi.js` membuat axios instance dengan:
- Base URL otomatis dari environment variable
- JWT token interceptor di setiap request
- Automatic token refresh/logout saat 401

---

## Import Methods

### Method 1: Import dari index.js (Recommended)
```javascript
import { authApi, userApi, axiosInstance } from '@/api';

// Atau spesifik
import { userApi } from '@/api';
```

### Method 2: Import langsung dari file
```javascript
import { userApi } from '@/api/userApi';
import { authApi } from '@/api/authApi';
```

---

## Usage Examples

### Auth API

#### Login
```javascript
import { authApi } from '@/api';

try {
  const response = await authApi.login('123456789', 'password123');
  console.log(response.data.data.token); // JWT token
  localStorage.setItem('token', response.data.data.token);
  localStorage.setItem('user', JSON.stringify(response.data.data.user));
} catch (error) {
  console.error('Login failed:', error.response.data.message);
}
```

#### Get Profile
```javascript
import { authApi } from '@/api';

try {
  const response = await authApi.getProfile();
  console.log(response.data.data); // User profile
} catch (error) {
  console.error('Get profile failed:', error);
}
```

#### Logout
```javascript
import { authApi } from '@/api';

try {
  await authApi.logout();
  localStorage.removeItem('token');
  localStorage.removeItem('user');
} catch (error) {
  console.error('Logout failed:', error);
}
```

---

### User API (Admin Only)

#### Get All Users
```javascript
import { userApi } from '@/api';

try {
  const response = await userApi.getAllUsers();
  console.log(response.data.data); // Array of users
} catch (error) {
  if (error.response?.status === 403) {
    console.error('Akses ditolak. Hanya admin yang dapat mengakses.');
  } else {
    console.error('Error:', error.response.data.message);
  }
}
```

#### Get Single User
```javascript
import { userApi } from '@/api';

try {
  const response = await userApi.getUserById(1);
  console.log(response.data.data); // Single user
} catch (error) {
  console.error('Error:', error.response.data.message);
}
```

#### Create New User
```javascript
import { userApi } from '@/api';

try {
  const userData = {
    name: 'Budi Santoso',
    nomor_induk: '20240001',
    password: 'password123',
    password_confirmation: 'password123',
    role: 'mahasiswa'
  };

  const response = await userApi.createUser(userData);
  console.log('User created:', response.data.data);
} catch (error) {
  if (error.response?.data?.errors) {
    console.error('Validation errors:', error.response.data.errors);
  } else {
    console.error('Error:', error.response.data.message);
  }
}
```

#### Update User
```javascript
import { userApi } from '@/api';

try {
  const updateData = {
    name: 'Budi Updated',
    role: 'dosen'
  };

  const response = await userApi.updateUser(1, updateData);
  console.log('User updated:', response.data.data);
} catch (error) {
  console.error('Error:', error.response.data.message);
}
```

#### Delete User
```javascript
import { userApi } from '@/api';

try {
  await userApi.deleteUser(1);
  console.log('User deleted successfully');
} catch (error) {
  if (error.response?.status === 403) {
    console.error('Cannot delete yourself');
  } else {
    console.error('Error:', error.response.data.message);
  }
}
```

---

## In React Components

### Example: User List Component
```jsx
import { useState, useEffect } from 'react';
import { userApi } from '@/api';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await userApi.getAllUsers();
        setUsers(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Nomor Induk</th>
          <th>Role</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.nomor_induk}</td>
            <td>{user.role}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Example: Create User Form Component
```jsx
import { useState } from 'react';
import { userApi } from '@/api';

export default function CreateUserForm() {
  const [formData, setFormData] = useState({
    name: '',
    nomor_induk: '',
    password: '',
    password_confirmation: '',
    role: 'mahasiswa'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess(null);

    try {
      const response = await userApi.createUser(formData);
      setSuccess('User created successfully!');
      setFormData({
        name: '',
        nomor_induk: '',
        password: '',
        password_confirmation: '',
        role: 'mahasiswa'
      });
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: error.response?.data?.message || 'Failed to create user' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {success && <div className="alert alert-success">{success}</div>}
      {errors.general && <div className="alert alert-error">{errors.general}</div>}

      <input
        type="text"
        name="name"
        placeholder="Nama"
        value={formData.name}
        onChange={handleChange}
        required
      />
      {errors.name && <span className="error">{errors.name[0]}</span>}

      <input
        type="text"
        name="nomor_induk"
        placeholder="Nomor Induk"
        value={formData.nomor_induk}
        onChange={handleChange}
        required
      />
      {errors.nomor_induk && <span className="error">{errors.nomor_induk[0]}</span>}

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
      />
      {errors.password && <span className="error">{errors.password[0]}</span>}

      <input
        type="password"
        name="password_confirmation"
        placeholder="Konfirmasi Password"
        value={formData.password_confirmation}
        onChange={handleChange}
        required
      />
      {errors.password_confirmation && <span className="error">{errors.password_confirmation[0]}</span>}

      <select
        name="role"
        value={formData.role}
        onChange={handleChange}
      >
        <option value="mahasiswa">Mahasiswa</option>
        <option value="dosen">Dosen</option>
        <option value="admin">Admin</option>
      </select>

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}
```

---

## Error Handling

### Common Error Codes

| Status | Message | Handling |
|--------|---------|----------|
| 401 | Token invalid/expired | Auto logout, redirect to login |
| 403 | Not admin | Show permission denied message |
| 404 | User not found | Show not found message |
| 422 | Validation failed | Show validation errors |
| 500 | Server error | Show error message |

### Generic Error Handler
```javascript
const handleApiError = (error) => {
  const status = error.response?.status;
  const message = error.response?.data?.message;

  switch (status) {
    case 401:
      console.error('Unauthorized - redirecting to login');
      break;
    case 403:
      console.error('Forbidden - insufficient permissions');
      break;
    case 404:
      console.error('Resource not found');
      break;
    case 422:
      console.error('Validation error:', error.response.data.errors);
      break;
    case 500:
      console.error('Server error');
      break;
    default:
      console.error('Error:', message);
  }
};
```

---

## Tips & Best Practices

1. **Always use try-catch** untuk menangani errors
2. **Load state** untuk better UX saat loading data
3. **Validate** input sebelum mengirim ke API
4. **Handle 403 errors** gracefully untuk non-admin users
5. **Store token** di localStorage setelah login
6. **Clear storage** saat logout
7. **Use environment variables** untuk API URL
8. **Test** semua endpoints sebelum production

---

## API Documentation Reference

Untuk dokumentasi lengkap backend API:
- Auth API: [API_AUTH_DOCUMENTATION.md](../backend/API_AUTH_DOCUMENTATION.md)
- User API: [USER_MANAGEMENT_API.md](../backend/USER_MANAGEMENT_API.md)
