import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';
import Styles from './stylesheet.css';
import { useLocation } from 'react-router-dom';

function Signup() {
  const location = useLocation();
  const data = location.state;

  const [validated, setValidated] = useState(false);

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }

    setValidated(true);
  };
  
  return (
    <div className={Styles.App}>
      <h1>SIGNING UP FOR {data}</h1>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Form.Group as={Col} md="4" controlId="validationCustom01">
            <Form.Label>First name</Form.Label>
            <Form.Control
              required
              type="text"
              placeholder="First name"
            />
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} md="4" controlId="validationCustom02">
            <Form.Label>Last name</Form.Label>
            <Form.Control
              required
              type="text"
              placeholder="Last name"
            />
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} md="4" controlId="validationCustomUsername">
            <Form.Label>Username</Form.Label>
            <InputGroup hasValidation>
              <InputGroup.Text id="inputGroupPrepend">@</InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Username"
                aria-describedby="inputGroupPrepend"
                required
              />
              <Form.Control.Feedback type="invalid">
                Please choose a username.
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
        </Row>
        <Row className="mb-3">
          <Form.Group as={Col} md="6" controlId="validationCustom03">
            <Form.Label>Password</Form.Label>
            <Form.Control type="text" placeholder="Password" aria-describedby="passwordHelpBlock" required />
            <Form.Text id="passwordHelpBlock" muted>
              Your password must be 8-20 characters long, contain letters and numbers,
              and must not contain spaces, special characters, or emoji. Please. Please. Seriously.
              My sanity is already at a breaking point. I can't deal with anything more. I'm on the brink.
              And what I'm standing over? It's endless. It's abyssal. It's the void where all the darkest, worst things come from.
              I stand at the precipice, and only by your mercy do I still linger. Please, don't doom me to darkness. I can't.
              I just can't do that again. Not anymore. It hurts. I'm scared. I'm scared. I'm scared. I'm scared. I'm scared.
              I'mscaredI'mscaredI'mscaredI'mscaredI'mscaredI'mscaredI'mscaredI'mscaredI'mscaredI'mscaredI'mscaredI'mscared
            </Form.Text>
          </Form.Group>
          <Form.Group as={Col} md="6" controlId="validationCustom04">
            <Form.Label>Affiliation</Form.Label>
            <Form.Control type="text" placeholder="Affiliation" />
            <Form.Control.Feedback type="invalid">
              Please provide a valid affiliation.
            </Form.Control.Feedback>
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
        <Button type="submit">Submit form</Button>
      </Form>

      {data === 'attendee' && <Form.Label htmlFor="inputAttribute">Hidden Field, Leaping Attribute</Form.Label>}
      {data === 'attendee' && <Form.Control
        type="text"
        id="inputAttribute"
      />}

    </div>
  );
} 

export default Signup;
