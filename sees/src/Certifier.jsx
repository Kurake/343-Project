import React, { useState } from 'react';
import './stylesheet.css';
import { useNavigate } from "react-router-dom";
import { Card, Button, Container, Row, Col, Form, Modal } from "react-bootstrap";
import { useEvents } from './EventsContext'; // ✅ Event context
import { useUser } from './UserContext';     // ✅ User context

function Certifier() {
  return (
    <Container className="mt-4">
      <Card style={pastelBox}>
        Would you like to certify all users associated with this event?
      </Card>
    </Container>
  );
} 

export default Certifier;
