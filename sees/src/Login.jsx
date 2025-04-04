import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../src/UserContext';

function Login() {
  const navigate = useNavigate();
  const { login } = useUser();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const user = {
        name: formData.email.split('@')[0],
        email: formData.email,
        role: 'user'
      };

      login(user);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userName', user.name);
      localStorage.setItem('userRole', user.role);

      alert(`Welcome ${user.name} (${user.role})`);
      navigate('/events');
    } catch (err) {
      alert('Login failed — invalid credentials');
    }
  };

  const containerStyle = {
    maxWidth: '500px',
    margin: '3rem auto',
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  };

  const titleStyle = {
    textAlign: 'center',
    color: '#2E2E2E',
    marginBottom: '1.5rem',
  };

  const buttonStyle = {
    backgroundColor: '#A7C7E7',
    border: 'none',
    width: '100%',
    marginTop: '1rem',
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Login</h2>
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

        <Button variant="primary" type="submit" style={buttonStyle}>
          Log In
        </Button>
      </Form>
    </div>
  );
}

export default Login;
