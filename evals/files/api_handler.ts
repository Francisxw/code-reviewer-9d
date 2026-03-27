import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';

const app = express();
app.use(express.json());

const pool = new Pool({
  host: 'localhost',
  database: 'mydb',
  user: 'admin',
  password: 'password123'
});

const SECRET_KEY = 'my-super-secret-key-12345';

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  const result = await pool.query(
    "SELECT * FROM users WHERE username = '" + username + "'"
  );
  
  if (result.rows.length === 0) {
    res.status(401).json({ error: 'User not found' });
    return;
  }
  
  const user = result.rows[0];
  const valid = await bcrypt.compare(password, user.password);
  
  if (valid) {
    const token = jwt.sign({ userId: user.id, role: user.role }, SECRET_KEY);
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Get user profile
app.get('/api/users/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  } catch (e) {
    // Token invalid
  }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  const { name, email, bio } = req.body;
  
  const query = `UPDATE users SET name = '${name}', email = '${email}', bio = '${bio}' WHERE id = ${req.params.id}`;
  await pool.query(query);
  
  res.json({ success: true });
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
  res.json({ deleted: true });
});

// Get all users with pagination
app.get('/api/users', async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const offset = (page - 1) * limit;
  
  const result = await pool.query(
    'SELECT * FROM users ORDER BY id LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  
  const countResult = await pool.query('SELECT COUNT(*) FROM users');
  
  res.json({
    users: result.rows,
    total: countResult.rows[0].count,
    page: page,
    pages: Math.ceil(countResult.rows[0].count / limit)
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
