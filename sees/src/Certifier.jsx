import React, { useState } from 'react';
import './stylesheet.css';
import { useNavigate } from "react-router-dom";
import { Card, Button, Container, Row, Col, Form, Modal } from "react-bootstrap";
import { useEvents } from './EventsContext'; // ✅ Event context
import { useUser } from './UserContext';     // ✅ User context

function Certifier() {
  return (
      <div className="app">
        <p>Placeholder for some really cool certification code that will DEFINITELY go in here, trust</p>
      </div>
  );
} 

export default Certifier;
