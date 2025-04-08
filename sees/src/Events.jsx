import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Card, Button, Container, Row, Col, Form, Modal } from "react-bootstrap";
import { useEvents } from './EventsContext'; // ✅ Event context
import { useUser } from './UserContext';     // ✅ User context
import axios from "axios";

const Events = () => {
  const placeholderImage = "/images/stock.jpg";
  const { events, setEvents } = useEvents();
  const { user } = useUser(); // ✅ Get logged-in user
  const currentUser = user.email;

  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventData, setEventData] = useState({ title: "", startDate: "", endDate: "", organizers: "", price: "" });
  const [dateError, setDateError] = useState("");
  const navigate = useNavigate();

  const handleShow = (event = null) => {
    setEditingEvent(event);
    setEventData(event ? { ...event, organizers: event.organizers.join(", ") } : { title: "", startDate: "", endDate: "", organizers: "", price: "" });
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setDateError("");
    setEditingEvent(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));

    if (name === "startDate" || name === "endDate") {
      if (eventData.startDate && eventData.endDate && eventData.startDate > eventData.endDate) {
        setDateError("Start date must be before or equal to the end date.");
      } else {
        setDateError("");
      }
    }
  };

  const handleSaveEvent = async () => {
    const { title, startDate, endDate, organizers, price } = eventData;
  
    if (new Date(startDate) > new Date(endDate)) {
      setDateError("Start date cannot be after end date");
      return;
    }
  
    const eventPayload = {
      title,
      startDate,
      endDate,
      price: parseFloat(price),
    };
  
    try {
      if (editingEvent) {
        // Edit mode — send PUT request
        const response = await axios.put(`http://localhost:3001/api/events/${editingEvent.id}`, eventPayload);
        const updatedEvent = response.data;
        setEvents(prev =>
          prev.map(event => (event.id === updatedEvent.id ? updatedEvent : event))
        );
      } else {
        // Create mode — send POST request
        const response = await axios.post('http://localhost:3001/api/events', eventPayload);
        const newEvent = response.data;
        setEvents(prev => [...prev, newEvent]);
      }
  
      handleClose();
    } catch (error) {
      console.error("Error saving event:", error);
      // You could also show an alert or toast here
    }
  };

  return (
    <Container className="mt-4">
      <div className="d-flex mb-4">
        <Button
          variant="success"
          onClick={() => handleShow()}
          style={{
            backgroundColor: "#A7C7E7",
            border: "none",
            color: "#fff",
            fontWeight: "bold"
          }}
        >
          Add Event
        </Button>

        <Button
          variant="info"
          className="ms-3"
          onClick={() => navigate('/analytics')}
          style={{
            backgroundColor: "#CBAACB",
            border: "none",
            color: "#fff",
            fontWeight: "bold"
          }}
        >
          View Analytics
        </Button>
      </div>

      <Row className="g-4 justify-content-center">
        {events.map((event) => (
          <Col key={event.id} md={6} lg={3} className="d-flex" style={{ maxWidth: "320px" }}>
            <Card
              className="w-100 shadow-sm p-3"
              style={{
                backgroundColor: "#fef9ff",
                borderRadius: "16px",
                border: "1px solid #e0d4f7"
              }}
            >
              <Card.Img
                variant="top"
                src={event.image || placeholderImage}
                alt={event.title}
                style={{ height: "150px", objectFit: "cover", borderRadius: "10px" }}
              />
              <Card.Body>
                <Card.Title style={{ color: "#7a5195" }}>{event.title}</Card.Title>
                <Card.Text style={{ color: "#555" }}>
                  {event.startDate} - {event.endDate}
                </Card.Text>
                <Card.Text>
                  <small className="text-muted">Organizers: {event.organizers.join(", ")}</small>
                </Card.Text>
                <Card.Text>
                  <strong>Attendees:</strong> {event.attendeesCount} <br />
                  <strong>Revenue:</strong> ${event.revenue.toFixed(2)}
                </Card.Text>
                <Button
                  variant="info"
                  className="me-2"
                  style={{ backgroundColor: "#CBAACB", border: "none", color: "#fff" }}
                  onClick={() => navigate(`/event/${event.id}`, { state: event })}
                >
                  View
                </Button>
                {event.organizers.includes(currentUser) && (
                  <Button
                    variant="warning"
                    style={{ backgroundColor: "#FFB5A7", border: "none", color: "#fff" }}
                    onClick={() => handleShow(event)}
                  >
                    Edit
                  </Button>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{editingEvent ? "Edit Event" : "Add New Event"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" name="title" value={eventData.title} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control type="date" name="startDate" value={eventData.startDate} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control type="date" name="endDate" value={eventData.endDate} onChange={handleChange} required />
            </Form.Group>
            {dateError && <p className="text-danger">{dateError}</p>}
            <Form.Group className="mb-3">
              <Form.Label>Organizer Emails (comma-separated)</Form.Label>
              <Form.Control type="text" name="organizers" value={eventData.organizers} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Price ($)</Form.Label>
              <Form.Control
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={eventData.price || ""}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
          <Button variant="primary" onClick={handleSaveEvent} disabled={dateError}>Save</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Events;
