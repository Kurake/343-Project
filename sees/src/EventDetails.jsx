import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Updated import
import { Container, Card, Button, Modal, Form, ListGroup } from "react-bootstrap";
import { useUser } from './UserContext';

const EventDetails = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Added navigate
  const [event, setEvent] = useState({ 
    ...location.state, 
    organizers: Array.isArray(location.state.organizers) ? location.state.organizers : [],
    sessions: location.state.sessions || []
  });
  
  const [showModal, setShowModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingSessionIndex, setEditingSessionIndex] = useState(null);
  const [eventData, setEventData] = useState(event);
  const [newSession, setNewSession] = useState({ title: "", description: "", date: "", location: "", isOnline: false });
  
  const { userBalance } = useUser();

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  
  const handleSessionShow = (index = null) => {
    setEditingSessionIndex(index);
    if (index !== null) {
      setNewSession(event.sessions[index]);
    } else {
      setNewSession({ title: "", description: "", date: "", location: "", isOnline: false });
    }
    setShowSessionModal(true);
  };

  const handleSessionClose = () => {
    setShowSessionModal(false);
    setEditingSessionIndex(null);
    setNewSession({ title: "", description: "", date: "", location: "", isOnline: false });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData({
      ...eventData,
      [name]: name === "organizers" ? value.split(",").map(email => email.trim()) : value,
    });
  };

  const handleSave = () => {
    setEvent(eventData);
    handleClose();
  };

  const handleSessionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewSession({ ...newSession, [name]: type === "checkbox" ? checked : value });
  };

  const handleAddOrEditSession = () => {
    setEvent((prevEvent) => {
      const updatedSessions = [...prevEvent.sessions];
      if (editingSessionIndex !== null) {
        updatedSessions[editingSessionIndex] = newSession;
      } else {
        updatedSessions.push(newSession);
      }
      return { ...prevEvent, sessions: updatedSessions };
    });
    handleSessionClose();
  };

  const handleDeleteSession = (index) => {
    setEvent((prevEvent) => ({
      ...prevEvent,
      sessions: prevEvent.sessions.filter((_, i) => i !== index)
    }));
  };

  console.log("Event Image URL:", event.image);

  return (
    <Container className="mt-4">
      <Card className="shadow-sm p-4">
        <Card.Img 
          variant="top" 
          src={event.image || "/images/stock.jpg"} 
          alt={event.title} 
          style={{ height: "250px", objectFit: "cover" }} 
        />
        <Card.Body>
          <Card.Title>{event.title}</Card.Title>
          <Card.Text>Date: {event.startDate} - {event.endDate}</Card.Text>
          <Card.Text>Organizers: {Array.isArray(event.organizers) ? event.organizers.join(", ") : "No organizers"}</Card.Text>
          <Button variant="warning" onClick={handleShow}>Edit Event</Button>
          <Button variant="success" className="ms-2" onClick={() => handleSessionShow()}>Add Session</Button>
          <Button 
            variant="primary" 
            className="ms-2" 
            onClick={() => navigate(`/event/${event.id}/payment`, { state: { event } })}
          >
            Register (${event.price ? event.price.toFixed(2) : '0.00'})
          </Button>
        </Card.Body>
      </Card>

      <h4 className="mt-4">Sessions</h4>
      <ListGroup>
        {event.sessions.length > 0 ? (
          event.sessions.map((session, index) => (
            <ListGroup.Item key={index} className="border rounded p-3 mb-2">
              <h5>{session.title}</h5>
              <p>{session.description}</p>
              <p><strong>Date:</strong> {session.date}</p>
              <p><strong>Location:</strong> {session.location}</p>
              <p><strong>Mode:</strong> {session.isOnline ? "Online" : "In-Person"}</p>
              <Button variant="primary" className="me-2" onClick={() => handleSessionShow(index)}>Edit</Button>
              <Button variant="danger" onClick={() => handleDeleteSession(index)}>Delete</Button>
            </ListGroup.Item>
          ))
        ) : (
          <p>No sessions added yet.</p>
        )}
      </ListGroup>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Event</Modal.Title>
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
            <Form.Group className="mb-3">
              <Form.Label>Organizer Emails (comma-separated)</Form.Label>
              <Form.Control type="text" name="organizers" value={eventData.organizers.join(", ")} onChange={handleChange} required />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
          <Button variant="primary" onClick={handleSave}>Save Changes</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showSessionModal} onHide={handleSessionClose}>
        <Modal.Header closeButton>
          <Modal.Title>{editingSessionIndex !== null ? "Edit Session" : "Add Session"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Session Title</Form.Label>
              <Form.Control type="text" name="title" value={newSession.title} onChange={handleSessionChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Session Description</Form.Label>
              <Form.Control as="textarea" name="description" value={newSession.description} onChange={handleSessionChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Session Date</Form.Label>
              <Form.Control type="date" name="date" value={newSession.date} onChange={handleSessionChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control type="text" name="location" value={newSession.location} onChange={handleSessionChange} required />
            </Form.Group>
            <Form.Check type="checkbox" label="Online Session" name="isOnline" checked={newSession.isOnline} onChange={handleSessionChange} />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleSessionClose}>Close</Button>
          <Button variant="primary" onClick={handleAddOrEditSession}>{editingSessionIndex !== null ? "Save Changes" : "Add Session"}</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EventDetails;
