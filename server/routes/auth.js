const express = require('express');
const router = express.Router();
const pool = require('../conn');

const users = [];

router.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body;
  
  try {
    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM "user" WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Insert new user
    const insertQuery = 
    `INSERT INTO "user" (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING userid, name, email, role`;
    const result = await pool.query(insertQuery, [name, email, password, role]);

    
  const user = {
    name,
    email,
    password,
    role,
    login: () => `Logging in as ${role}`
  };

  users.push(user);
  res.status(201).json({ message: 'User registered successfully', user });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const result = await pool.query('SELECT * FROM "user" WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check if the password matches (in plaintext)
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({
      message: 'Login successful',
      user: {
        userid: user.userid,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;
