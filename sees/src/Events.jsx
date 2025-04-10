import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Card, Button, Container, Row, Col, Form, Modal } from "react-bootstrap";
import { useEvents } from './EventsContext'; // ✅ Event context
import { useUser } from './UserContext';     // ✅ User context
import Select from 'react-select';
import axios from "axios";
import { hasPermission } from './Utils/permissionUtils';
import {
  EventComponent,
  VIPEventDecorator,
  CertificationEventDecorator,
  DiscountEventDecorator
} from './Decorator/EventDecorator';

const Events = () => {
  const placeholderImage = "/images/stock.jpg";
  const { events, setEvents } = useEvents();
  const { user } = useUser(); // ✅ Get logged-in user
  const currentUser = user.email;

  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventData, setEventData] = useState({ title: "", startDate: "", endDate: "", organizers: [], price: "", funding: "", image: "", isVIP: false, isCertification: false, isDiscounted: false });
  const [dateError, setDateError] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [fundingInputs, setFundingInputs] = useState({});
  const [decoratedEvents, setDecoratedEvents] = useState([]);
  const navigate = useNavigate();


  const availableImages = [
    "/images/concert.webp",
    "/images/fancydinner.avif",
    "/images/seminar.jpg",
    "/images/presentation.webp",
    "/images/FormalEvent.jpg",
    "/images/PodCast.jpg",
    "/images/stock.jpg", // your default
  ];

  // Fetch all users (organizers) when modal opens
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/users/organizer/emails");
        const users = response.data.map(email => ({ label: email, value: email }));
        setAllUsers(users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleShow = (event = null) => {
    setEditingEvent(event);
    setEventData(event
      ? {
        ...event,
        organizers: event.organizers.map(email => ({ label: email, value: email })) // Format organizers correctly
      } : { title: "", startDate: "", endDate: "", organizers: [], price: "", funding: "", image: "", isVIP: false, isCertification: false, isDiscounted: false });
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
    const { title, startDate, endDate, organizers, price, funding, isVIP, isCertification, isDiscounted } = eventData;

    if (new Date(startDate) > new Date(endDate)) {
      setDateError("Start date cannot be after end date");
      return;
    }

    const eventPayload = {
      title,
      startDate,
      endDate,
      price: parseFloat(price) || 0,
      funding: parseFloat(funding) || 0,
      image: eventData.image,
      isVIP: eventData.isVIP || false,
      isCertification: eventData.isCertification || false,
      isDiscounted: eventData.isDiscounted || false,
      organizers: organizers.map(user => user.value),
    };

    try {
      if (editingEvent) {
        console.log(eventPayload);
        // Edit mode — send PUT request
        await axios.put(`http://localhost:3001/api/events/${editingEvent.id}`, eventPayload);

        // Update the event in the state (no need to fetch again)
        setEvents(prev => prev.map(event => event.id === editingEvent.id ? { ...event, ...eventPayload } : event));
      } else {
        console.log(eventPayload);
        // Create mode — send POST request
        const response = await axios.post("http://localhost:3001/api/events", eventPayload);
        const newEvent = { ...response.data, id: response.data.eventid };

        // Add the new event to the state
        setEvents(prev => [...prev, newEvent]);
      }

      handleClose();
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  const handleAddFunding = async (eventId) => {
    const amount = parseFloat(fundingInputs[eventId]);
    if (!amount || amount <= 0) return;

    try {
      const response = await axios.post(`http://localhost:3001/api/events/${eventId}/fund`, {
        amount,
      });

      const updatedFunding = response.data.funding;

      setEvents(prev =>
        prev.map(event =>
          event.id === eventId ? { ...event, funding: updatedFunding } : event
        )
      );

      // Clear the input after funding
      setFundingInputs(prev => ({ ...prev, [eventId]: "" }));
    } catch (error) {
      console.error("Error updating funding:", error);
    }
  };

  useEffect(() => {
    // Decorate events dynamically based on conditions (VIP, Certification, Discounted)
    const updatedEvents = events.map((event) => {
      let decoratedEvent = new EventComponent(event); // Start with the base EventComponent

      if (event.isVIP) {
        decoratedEvent = new VIPEventDecorator(decoratedEvent); // Apply VIP decorator
      }
      if (event.isCertification) {
        decoratedEvent = new CertificationEventDecorator(decoratedEvent); // Apply Certification decorator
      }
      if (event.isDiscounted) {
        decoratedEvent = new DiscountEventDecorator(decoratedEvent); // Apply Discount decorator
      }

      //console.log(decoratedEvent.getTitle())
      // Return an object with modified title and price, but leave the original event intact
      return {
        ...event,
        title: decoratedEvent.getTitle(), // Get the decorated title
        price: decoratedEvent.getPrice(), // Get the decorated price
      };
    });

    setDecoratedEvents(updatedEvents); // Store the decorated events in state
  }, [events]);

  return (
    <Container className="mt-4">
      <div className="d-flex mb-4">
        {hasPermission(user, "create_events") && (
          <Button
            variant="success"
            onClick={() => handleShow()}
            style={{
              backgroundColor: "#A7C7E7",
              border: "none",
              color: "#fff",
              fontWeight: "bold"
            }}>
            Add Event
          </Button>
        )}
        {hasPermission(user, 'analytics') && (
        <Button
          variant="info"
          className="ms-3"
          onClick={() => navigate('/analytics')}
          style={{
            backgroundColor: "#CBAACB",
            border: "none",
            color: "#fff",
            fontWeight: "bold"
          }}>
          View Analytics
        </Button>)}
      </div>

      <Row className="g-4 justify-content-center">
        {decoratedEvents.map((event) => (
          <Col key={`${event.id}-${event.title}`} md={6} lg={3} className="d-flex" style={{ maxWidth: "320px" }}>
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
                  <small className="text-muted">
                    Organizers: {Array.isArray(event.organizers) ? event.organizers.join(", ") : "N/A"}
                  </small>
                </Card.Text>
                <Card.Text>
                  <strong>Attendees:</strong> {event.attendeesCount} <br />
                  <strong>Revenue:</strong> ${event.revenue?.toFixed(2)}
                </Card.Text>
                <Card.Text>
                  <strong>Price:</strong> ${event.price?.toFixed(2)} <br />
                  <strong>Funding:</strong> ${event.funding?.toFixed(2)} <br />
                </Card.Text>
                <Button
                  variant="info"
                  className="me-2"
                  style={{ backgroundColor: "#CBAACB", border: "none", color: "#fff" }}
                  onClick={() => navigate(`/event/${event.id}`, { state: event })}>
                  View
                </Button>
                {hasPermission(user, "edit_events") && Array.isArray(event.organizers) && event.organizers.includes(currentUser) && (
                  <Button
                    variant="warning"
                    style={{ backgroundColor: "#FFB5A7", border: "none", color: "#fff" }}
                    onClick={() => {
                      const originalEvent = events.find(e => e.id === event.id); // ✅ Get real event
                      handleShow(originalEvent);
                    }}>
                    Edit
                  </Button>
                )}
                {hasPermission(user, "sponsor") && (
                  <div className="mt-2">
                    <Form.Control
                      type="number"
                      placeholder="Enter funding amount"
                      min="1"
                      step="0.01"
                      value={fundingInputs[event.id] || ""}
                      onChange={(e) =>
                        setFundingInputs(prev => ({ ...prev, [event.id]: e.target.value }))
                      }
                    />
                    <Button
                      variant="outline-success"
                      className="mt-2"
                      onClick={() => handleAddFunding(event.id)}
                      disabled={!fundingInputs[event.id]}
                    >
                      Fund Event
                    </Button>
                  </div>
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
              <Form.Label>Organizer Emails (select multiple)</Form.Label>
              <Select
                isMulti
                name="organizers"
                options={allUsers}
                value={eventData.organizers}
                onChange={(selectedOptions) => setEventData(prev => ({ ...prev, organizers: selectedOptions }))} // Updates the state with selected options
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="VIP Event"
                checked={eventData.isVIP || false}
                onChange={() => setEventData(prev => ({ ...prev, isVIP: !prev.isVIP }))}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Certification Available"
                checked={eventData.isCertification || false}
                onChange={() => setEventData(prev => ({ ...prev, isCertification: !prev.isCertification }))}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Discounted Event"
                checked={eventData.isDiscounted || false}
                onChange={() => setEventData(prev => ({ ...prev, isDiscounted: !prev.isDiscounted }))}
              />
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
            <Form.Group className="mb-3">
              <Form.Label>Choose Event Image</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {availableImages.map((imgSrc) => (
                  <div
                    key={imgSrc}
                    onClick={() =>
                      setEventData((prev) => ({ ...prev, image: imgSrc }))
                    }
                    style={{
                      border:
                        eventData.image === imgSrc ? "2px solid #7a5195" : "1px solid #ccc",
                      borderRadius: "8px",
                      cursor: "pointer",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={imgSrc}
                      alt="Event"
                      style={{ width: "100px", height: "60px", objectFit: "cover" }}
                    />
                  </div>
                ))}
              </div>
            </Form.Group>
            {eventData.image && (
              <div className="mt-3 text-center">
                <p>Selected Image Preview:</p>
                <img
                  src={eventData.image}
                  alt="Selected"
                  style={{ width: "150px", height: "auto", borderRadius: "10px" }}
                />
              </div>
            )}
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