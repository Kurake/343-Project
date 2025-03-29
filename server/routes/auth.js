const express = require('express');
const router = express.Router();

const users = [];

router.post('/signup', (req, res) => {
  const { name, email, password, role } = req.body;

  const user = {
    name,
    email,
    password,
    role,
    login: () => `Logging in as ${role}`
  };

  users.push(user);
  res.status(201).json({ message: 'User registered successfully', user });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    res.json({ message: 'Login successful', user });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

module.exports = router;
