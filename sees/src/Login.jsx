import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../src/UserContext';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useUser();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please fill in both email and password.");
      return;
    }

    try {
      // Here, instead of directly logging in with static data, we send the credentials to the backend
      axios
        .post('http://localhost:3001/api/auth/login', formData)
        .then((response) => {
          // If login is successful
          login(response.data.user); // Update context with user info
          navigate('/'); // Redirect user to homepage
        })
        .catch((err) => {
          setError("Login failed. Please try again.");
        });
    } catch (err) {
      setError("Login failed. Please try again.");
    }
  };

  return (
    <Container style={styles.container}>
      <h2 style={styles.title}>Login</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Button type="submit" style={styles.button}>
          Log In
        </Button>
      </Form>
    </Container>
  );
};

const styles = {
  container: {
    maxWidth: '500px',
    margin: '3rem auto',
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
  title: {
    textAlign: 'center',
    color: '#2E2E2E',
    marginBottom: '1.5rem',
  },
  button: {
    backgroundColor: '#A7C7E7',
    border: 'none',
    width: '100%',
    marginTop: '1rem',
  },
};

export default Login;
