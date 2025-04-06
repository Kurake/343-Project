import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from './UserContext'; // ✅ import

function Signup() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;
  const { login } = useUser(); // ✅ hook for login context

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    affiliation: '',
  });

  const [touchedFields, setTouchedFields] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
  };

  const isValid = (field) => {
    if (!touchedFields[field]) return null;
    if (field === "email") return /\S+@\S+\.\S+/.test(formData[field]);
    return formData[field].trim().length > 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity() === false) {
      event.stopPropagation();
      return;
    }

    try {
      const res = await axios.post('http://localhost:3001/api/auth/signup', {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        role: data || 'Attendee',
      });

      alert(res.data.message);

      const user = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        role: data || 'Attendee',
      };

      login(user); // ✅ update context
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userName', user.name);
      localStorage.setItem('userRole', user.role);

      navigate('/');
    } catch (err) {
      alert('Signup failed');
    }
  };

  const containerStyle = {
    maxWidth: '700px',
    margin: '3rem auto',
    backgroundColor: '#ffffff',
    padding: '2.5rem',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  };

  const titleStyle = {
    textAlign: 'center',
    color: '#2E2E2E',
    marginBottom: '2rem',
  };

  const buttonStyle = {
    backgroundColor: '#CBAACB',
    border: 'none',
    width: '100%',
    marginTop: '1.5rem',
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Signing Up as {data}</h1>
      <Form noValidate onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Form.Group as={Col} md="4" controlId="firstName">
            <Form.Label>First name</Form.Label>
            <Form.Control
              required
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First name"
              isValid={isValid("firstName")}
              isInvalid={touchedFields.firstName && !isValid("firstName")}
            />
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            <Form.Control.Feedback type="invalid">Required.</Form.Control.Feedback>
          </Form.Group>

          <Form.Group as={Col} md="4" controlId="lastName">
            <Form.Label>Last name</Form.Label>
            <Form.Control
              required
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last name"
              isValid={isValid("lastName")}
              isInvalid={touchedFields.lastName && !isValid("lastName")}
            />
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            <Form.Control.Feedback type="invalid">Required.</Form.Control.Feedback>
          </Form.Group>

          <Form.Group as={Col} md="4" controlId="username">
            <Form.Label>Username</Form.Label>
            <InputGroup hasValidation>
              <InputGroup.Text>@</InputGroup.Text>
              <Form.Control
                required
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                isValid={isValid("username")}
                isInvalid={touchedFields.username && !isValid("username")}
              />
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">Please choose a username.</Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
        </Row>

        <Row className="mb-3">
          <Form.Group as={Col} md="6" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              isValid={isValid("email")}
              isInvalid={touchedFields.email && !isValid("email")}
            />
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            <Form.Control.Feedback type="invalid">Enter a valid email.</Form.Control.Feedback>
          </Form.Group>

          <Form.Group as={Col} md="6" controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              required
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              isValid={isValid("password")}
              isInvalid={touchedFields.password && !isValid("password")}
            />
            <Form.Text muted>Password must be 8–20 characters.</Form.Text>
            <Form.Control.Feedback type="invalid">Required.</Form.Control.Feedback>
          </Form.Group>
        </Row>

        <Row className="mb-3">
          <Form.Group as={Col} md="12" controlId="affiliation">
            <Form.Label>Affiliation</Form.Label>
            <Form.Control
              type="text"
              name="affiliation"
              value={formData.affiliation}
              onChange={handleChange}
              placeholder="Affiliation"
              isValid={isValid("affiliation")}
              isInvalid={touchedFields.affiliation && !isValid("affiliation")}
            />
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            <Form.Control.Feedback type="invalid">Please provide a valid affiliation.</Form.Control.Feedback>
          </Form.Group>
        </Row>

        <Form.Group className="mb-3">
          <Form.Check
            required
            label="Agree to terms and conditions"
            feedback="You must agree before submitting."
            feedbackType="invalid"
          />
        </Form.Group>

        <Button type="submit" style={buttonStyle}>Submit</Button>
      </Form>

      {data === 'attendee' && (
        <>
          <Form.Label htmlFor="inputAttribute">Hidden Field, Leaping Attribute</Form.Label>
          <Form.Control type="text" id="inputAttribute" />
        </>
      )}
    </div>
  );
}

export default Signup;
