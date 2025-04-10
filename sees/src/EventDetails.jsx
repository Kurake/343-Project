import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Card, Button, Modal, Form, ListGroup } from "react-bootstrap";
import { useUser } from './UserContext';
import axios from "axios";

const pastelBox = {
  backgroundColor: "#FDF6F0",
  borderRadius: "16px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  padding: "1.5rem",
};

const EventDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [event, setEvent] = useState({
    ...location.state,
    organizers: Array.isArray(location.state.organizers) ? location.state.organizers : [],
    sessions: location.state.sessions || []
  });

  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingSessionIndex, setEditingSessionIndex] = useState(null);
  const [newSession, setNewSession] = useState({ title: "", description: "", date: "", location: "", online: false });
  const [allUsers, setAllUsers] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const { userBalance, user } = useUser();

  const handleSessionShow = (index = null) => {
    setEditingSessionIndex(index);
    if (index !== null) {
      setNewSession(event.sessions[index]);
    } else {
      setNewSession({ title: "", description: "", date: "", location: "", online: false });
    }
    setShowSessionModal(true);
  };

  const handleSessionClose = () => {
    setShowSessionModal(false);
    setEditingSessionIndex(null);
    setNewSession({ title: "", description: "", date: "", location: "", online: false });
  };

  const handleSessionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewSession({ ...newSession, [name]: type === "checkbox" ? checked : value });
  };

  const handleAddOrEditSession = async () => {
    try {
      const sessionData = { ...newSession };
      const url = `http://localhost:3001/api/events/${event.id}/sessions`;
  
      // If editing an existing session, send PUT request
      if (editingSessionIndex !== null) {
        await axios.put(`${url}/${event.sessions[editingSessionIndex].sessionid}`, sessionData);
      } else {
        // Add new session by sending POST request
        await axios.post(url, sessionData);
      }
  
      // After adding or editing session, fetch updated session list
      fetchSessions();  // <-- This is the new call to fetch updated sessions
      handleSessionClose();  // Close the modal after saving
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const handleDeleteSession = async (index) => {
    try {
      const sessionId = event.sessions[index].sessionid;
      await axios.delete(`http://localhost:3001/api/events/${event.id}/sessions/${sessionId}`);
      fetchSessions(); // <-- Fetch updated session list after deletion
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/events/${event.id}/sessions`);
      setEvent((prevEvent) => ({
        ...prevEvent,
        sessions: response.data,  // Update the sessions in the state
      }));
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/users/emails');
        const users = response.data.map(user => ({
          label: user.email,
          value: user.email,
        }));
        setAllUsers(users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
  
    fetchUsers();
    fetchSessions();  // <-- This is the call to fetch sessions initially
  }, [event.id]);  // <-- It will run again when event.id changes

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/events/${event.id}/payments/${user.id}`);
        setPaymentStatus(response.data.status); // 'completed', 'pending', etc.
      } catch (error) {
        console.error('Error fetching payment status:', error);
      }
    };
  
    fetchPaymentStatus();
  }, [event.id, user.id]);

  return (
    <Container className="mt-4">
      <Card style={pastelBox}>
        <Card.Img
          variant="top"
          src={event.image || "/images/stock.jpg"}
          alt={event.title}
          style={{ height: "250px", objectFit: "cover", borderRadius: "10px" }}
        />
        <Card.Body>
          <Card.Title style={{ fontSize: "1.8rem", color: "#4F709C" }}>{event.title}</Card.Title>
          <Card.Text>Date: {event.startDate} - {event.endDate}</Card.Text>
          <Card.Text>Organizers: {Array.isArray(event.organizers) ? event.organizers.join(", ") : "No organizers"}</Card.Text>
          <Card.Text>
            Payment Status: <strong>{paymentStatus || 'Not Paid'}</strong>
          </Card.Text>
          <Button variant="success" className="ms-2" onClick={() => handleSessionShow()}>Add Session</Button>
          <Button
            variant="primary"
            className="ms-2"
            onClick={() => navigate(`/event/${event.id}/payment`, { state: { event } })}
          >
            Register (${event.price ? event.price : '0.00'})
          </Button>
        </Card.Body>
      </Card>

      <h4 className="mt-4" style={{ color: "#8B5FBF" }}>Sessions</h4>
      <ListGroup>
        {event.sessions.length > 0 ? (
          event.sessions.map((session, index) => (
            <ListGroup.Item key={index} className="border rounded p-3 mb-2" style={{ backgroundColor: "#FFF5F5" }}>
              <h5>{session.title}</h5>
              <p>{session.description}</p>
              <p><strong>Date:</strong> {session.date}</p>
              <p><strong>Location:</strong> {session.location}</p>
              <p><strong>Mode:</strong> {session.online ? "Online" : "In-Person"}</p>
              <Button variant="primary" className="me-2" onClick={() => handleSessionShow(index)}>Edit</Button>
              <Button variant="danger" onClick={() => handleDeleteSession(index)}>Delete</Button>
            </ListGroup.Item>
          ))
        ) : (
          <p style={{ color: "#888" }}>No sessions added yet.</p>
        )}
      </ListGroup>

      {/* Session Modal */}
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
            <Form.Check type="checkbox" label="Online Session" name="online" checked={newSession.online} onChange={handleSessionChange} />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleSessionClose}>Close</Button>
          <Button variant="primary" onClick={handleAddOrEditSession}>
            {editingSessionIndex !== null ? "Save Changes" : "Add Session"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EventDetails;