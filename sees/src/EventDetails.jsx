import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Card, Button, Modal, Form, ListGroup } from "react-bootstrap";
import { useUser } from './UserContext';
import axios from "axios";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';

const pastelBox = {
  backgroundColor: "#FDF6F0",
  borderRadius: "16px",
  boxShadow: "0 4px 10px rgba(53, 21, 21, 0.05)",
  padding: "1.5rem",
};

const EventDetails = () => {
  const { userBalance, user } = useUser();
  const userRole = user.role;
  const location = useLocation();
  const navigate = useNavigate();

  // Provide default values to avoid accessing undefined properties
  const [event, setEvent] = useState({
    id: location.state?.id || null,
    title: location.state?.title || "Untitled Event",
    startDate: location.state?.startDate || "",
    endDate: location.state?.endDate || "",
    price: location.state?.price || 0,
    image: location.state?.image || "/images/stock.jpg",
    organizers: Array.isArray(location.state?.organizers) ? location.state.organizers : [],
    sessions: location.state?.sessions || [],
  });

  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingSessionIndex, setEditingSessionIndex] = useState(null);
  const [newSession, setNewSession] = useState({ title: "", description: "", date: "", location: "", online: false });
  const [allUsers, setAllUsers] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState(null);


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
        if (!user || !user.isLoggedIn || !user.email || !event.id) return;
        
        // Make sure event.id is a number
        const eventId = parseInt(event.id, 10);
        if (isNaN(eventId)) {
          console.error('Invalid event ID:', event.id);
          return;
        }
        
        const response = await axios.get(
          `http://localhost:3001/api/events/${eventId}/payments/${encodeURIComponent(user.email)}`
        );
        
        setPaymentStatus(response.data.status);
      } catch (error) {
        console.error('Error fetching payment status:', error);
      }
    };
  
    if (user && user.isLoggedIn) {
      fetchPaymentStatus();
    }
  }, [event.id, user]);

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        if (!user || !user.isLoggedIn || !user.email) return;
        
        const response = await axios.get(
          `http://localhost:3001/api/events/${event.id}/payments/${user.email}`
        );
        setPaymentStatus(response.data.status);
      } catch (error) {
        console.error('Error fetching payment status:', error);
      }
    };
  
    if (location.state?.forceRefresh && user?.isLoggedIn) {
      fetchPaymentStatus();
    }
  }, [location.state]);

  const handleSendNote = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/users/emails', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
      });
      const emails = await res.json();

      if(res.ok) {
        // You can now handle the emails (e.g., prepare them for mailing or display)
        emails.forEach(email => {
          sendNote(email);
        });
      } else {
        console.error("Error fetching users:", data.message);
      }
    } catch (err) {
      console.error("Error fetching attending users:", err);
    }

  };

  const sendNote = async (user) => {
    try {
      const res = await fetch('http://localhost:3001/message', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email: user, event: event.title})
      });
      // Check if the response is JSON before parsing it
      const contentType = res.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        const result = await res.json();
      } else {
        console.error("Expected JSON response, but received:", contentType);
        alert("Error: Expected JSON response, but got something else.");
      }
    } catch (err) {
      alert('Error sending email, 123 ' + err);
      console.error(err);
    }
  }

  const handleSendCert = async () => {
    const eventId = parseInt(event.id, 10);
    // Need to do this multiple times. In order to know who to send it to, use id to get emails
    console.log("HANDLING SENDING CERTIFICATIONS");

    try {
      const res = await fetch('http://localhost:3001/api/users/emails/${eventId}', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ eventId }) // Send eventId in the request body
      });
      const data = await res.json();

      if(res.ok) {
        const users = data.users; // Array of users with emails and names
        console.log('Attending users:', users);
  
        // You can now handle the users (e.g., prepare them for mailing or display)
        users.forEach(user => {
          sendCerts(user)
        });
      } else {
        console.error("Error fetching users:", data.message);
      }
    } catch (err) {
      console.error("Error fetching attending users:", err);
    }
  };

  const sendCerts = async (user) => {
    try {
      const res = await fetch('http://localhost:3001/send-email', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email: user.email, event: event.title, name: user.name})
      });
      console.log('Fetch response status:', res.status);
      const result = await res.json();
    } catch(err) {
      alert('Error sending email, 123 ' + err);
      console.error(err);
    }
  }


  const notiPopover = (
    <Popover id="popover-basic">
      <Popover.Header as="h3">Confirm Notifications?</Popover.Header>
      <Popover.Body>
        Do you want to send email notifications to all users?
        <Button onClick={handleSendNote}>CONFIRM</Button>
      </Popover.Body>
      {/*Expecting email, event and then ""*/}
    </Popover>
  );

  const certiPopover = (
    <Popover id="popover-basic">
      <Popover.Header as="h3">Confirm Certifications?</Popover.Header>
      <Popover.Body>
        Do you want to send certifications to all users?
        <Button onClick={handleSendCert}>CONFIRM</Button>
      </Popover.Body>
      {/*Expecting email, event and recipient name*/}
    </Popover>
  );

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
            Payment Status: <strong>{paymentStatus === 'completed' ? 'Paid' : 'Not Paid'}</strong>
          </Card.Text>
          {event.organizers.includes(user?.email) && (
            <Button variant="success" className="ms-2" onClick={() => handleSessionShow()}>
              Add Session
            </Button>
          )}
          {paymentStatus !== 'completed' && (
            <Button
              variant="primary"
              className="ms-2"
              onClick={() => navigate(`/event/${event.id}/payment`, { state: { event } })}
            >
              Register (${event.price ? event.price.toFixed(2) : '0.00'})
            </Button>
          )}
          {/*If the account is an organizer account, allow mailing options*/}
          {userRole === 'organizer' && (
            <OverlayTrigger trigger="click" placement="bottom" overlay={notiPopover}>
              <Button variant="primary" className="ms-2">Send Notifications</Button>
            </OverlayTrigger>
          )}
          {userRole === 'organizer' && (
            <OverlayTrigger trigger="click" placement="bottom" overlay={certiPopover}>
              <Button variant="primary" className="ms-2">Send Certifications</Button>
            </OverlayTrigger>
          )}
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