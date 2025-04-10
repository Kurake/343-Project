import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Card, Button, Alert, Form, Row, Col, Spinner } from 'react-bootstrap';
import { useUser } from './UserContext';
import axios from 'axios';
import { useEvents } from './EventsContext';

const PaymentPage = () => {
  const { eventId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { userBalance, deductBalance, user } = useUser();
  const { fetchEvents } = useEvents();

  const [event, setEvent] = useState(location.state?.event || null);
  const [loading, setLoading] = useState(!event);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showStripe, setShowStripe] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit');

  useEffect(() => {
    if (!event && eventId) {
      setLoading(true);
      setTimeout(() => {
        const mockEvent = {
          id: parseInt(eventId),
          title: "Sample Event",
          startDate: "2025-04-15",
          endDate: "2025-04-17",
          price: 9.99,
          organizers: ["organizer@example.com"]
        };
        setEvent(mockEvent);
        setLoading(false);
      }, 800);
    }
  }, [event, eventId]);

  const handlePayWithBalance = () => {
    if (!userBalance || userBalance < event.price) {
      setError(`Insufficient funds. Your balance: $${userBalance.toFixed(2)}`);
      return;
    }

    setProcessing(true);
    
    // Make API call to backend
    axios.post(`http://localhost:3001/api/events/${event.id}/pay`, {
      userId: user.email,
      amount: event.price,
      paymentMethod: 'balance',
    })
      .then(response => {
        deductBalance(event.price);
        fetchEvents(); // Refresh events data
        setProcessing(false);
        setPaymentSuccess(true);
      })
      .catch(err => {
        console.error('Payment Error:', err);
        setError(err.response?.data?.message || 'Payment failed. Please try again.');
        setProcessing(false);
      });
  };

  const handleStripePayment = () => {
    setShowStripe(true);
  };

  const mockStripePayment = (success) => {
    setProcessing(true);
    
    if (success) {
      axios.post(`http://localhost:3001/api/events/${event.id}/pay`, {
        userId: user.email,
        amount: event.price,
        paymentMethod: 'stripe',
      })
        .then(response => {
          fetchEvents(); // Refresh events data
          setProcessing(false);
          setPaymentSuccess(true);
          setShowStripe(false);
        })
        .catch(err => {
          console.error('Payment Error:', err);
          setError(err.response?.data?.message || 'Payment failed. Please try again.');
          setProcessing(false);
        });
    } else {
      setTimeout(() => {
        setProcessing(false);
        setError('Payment failed. Please try again.');
        setShowStripe(false);
      }, 1500);
    }
  };

  const handlePay = async () => {
    setProcessing(true);
    setError('');

    try {
      const response = await axios.post(`http://localhost:3001/api/events/${event.id}/pay`, {
        userId: user.email,
        amount: event.price,
        paymentMethod: paymentMethod,
      });

      if (response.status === 201) {
        if (paymentMethod === 'balance') {
          deductBalance(event.price);
        }
        fetchEvents(); // Refresh events data
        setPaymentSuccess(true);
      } else {
        setError('Payment failed. Please try again.');
      }
    } catch (err) {
      console.error('Payment Error:', err);
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const pastelBox = {
    backgroundColor: '#fff8f0',
    borderRadius: '20px',
    padding: '2rem',
    boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.05)'
  };

  const pastelHeader = {
    color: '#A267AC',
    fontWeight: 'bold'
  };

  const pastelPrice = {
    color: '#5885AF',
    fontSize: '2rem',
    fontWeight: 'bold'
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (paymentSuccess) {
    return (
      <Container className="mt-5">
        <Card style={pastelBox} className="text-center">
          <Card.Body>
            <div className="mb-4 text-success">
              <i className="bi bi-check-circle-fill" style={{ fontSize: '3rem' }}></i>
            </div>
            <Card.Title as="h2" style={pastelHeader}>Payment Successful!</Card.Title>
            <Card.Text>
              Thank you for registering for <strong>{event.title}</strong>.
              <div className="mt-2">
                Remaining balance: <strong>${userBalance.toFixed(2)}</strong>
              </div>
            </Card.Text>
            <Button 
              style={{ backgroundColor: '#A7C7E7', border: 'none' }} 
              onClick={() => {
                fetchEvents(); // Refresh events one more time before navigating
                navigate(`/event/${event.id}`, { 
                  state: { ...event, forceRefresh: true } 
                });
              }}
            >
              View Event Details
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 style={pastelHeader}>Payment for Event Registration</h2>
      
      <Card className="mb-4" style={pastelBox}>
        <Card.Body>
          <Row>
            <Col md={8}>
              <Card.Title>{event.title}</Card.Title>
              <Card.Text>
                <strong>Date:</strong> {event.startDate} to {event.endDate}
              </Card.Text>
              <Card.Text>
                <strong>Organizers:</strong> {Array.isArray(event.organizers) ? event.organizers.join(", ") : "N/A"}
              </Card.Text>
            </Col>
            <Col md={4} className="text-md-end">
              <div style={pastelPrice}>${event.price.toFixed(2)}</div>
              <small className="text-muted">Registration fee</small>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4" style={pastelBox}>
        <Card.Body>
          <h4>Payment Options</h4>
          
          <div className="mb-4">
            <h5>Option 1: Pay with your balance</h5>
            <p>Current balance: <strong>${userBalance.toFixed(2)}</strong></p>
            {userBalance >= event.price ? (
              <Button 
                style={{ backgroundColor: '#CBAACB', border: 'none' }} 
                onClick={handlePayWithBalance}
                disabled={processing}
              >
                {processing ? 'Processing...' : `Pay $${event.price.toFixed(2)} from balance`}
              </Button>
            ) : (
              <Alert variant="warning">
                Insufficient balance. Please add funds or use Stripe payment.
              </Alert>
            )}
          </div>

          <div className="mt-4">
            <h5>Option 2: Pay with Stripe</h5>
            {!showStripe ? (
              <Button 
                style={{ backgroundColor: '#A7C7E7', border: 'none' }} 
                onClick={handleStripePayment}
                disabled={processing}
              >
                Pay with Stripe
              </Button>
            ) : (
              <Card className="p-3 border" style={{ backgroundColor: '#fdf6ff' }}>
                <h6>Stripe Test Mode</h6>
                <p>Use any of these test card numbers:</p>
                <ul>
                  <li>Success: 4242 4242 4242 4242</li>
                  <li>Failure: 4000 0000 0000 0002</li>
                </ul>
                
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Card Number</Form.Label>
                    <Form.Control type="text" placeholder="1234 5678 9012 3456" />
                  </Form.Group>
                  <Row>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>Expiry Date</Form.Label>
                        <Form.Control type="text" placeholder="MM/YY" />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>CVC</Form.Label>
                        <Form.Control type="text" placeholder="123" />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Check 
                    type="radio"
                    id="credit-card"
                    name="paymentMethod"
                    label="Credit Card"
                    checked={paymentMethod === 'credit'}
                    onChange={() => setPaymentMethod('credit')}
                  />
                  <Form.Check 
                    type="radio"
                    id="debit-card"
                    name="paymentMethod"
                    label="Debit Card"
                    checked={paymentMethod === 'debit'}
                    onChange={() => setPaymentMethod('debit')}
                  />
                  <Form.Check 
                    type="radio"
                    id="balance"
                    name="paymentMethod"
                    label="Pay with Balance"
                    checked={paymentMethod === 'balance'}
                    onChange={() => setPaymentMethod('balance')}
                  />
                  <Form.Check 
                    type="radio"
                    id="stripe"
                    name="paymentMethod"
                    label="Pay with Stripe"
                    checked={paymentMethod === 'stripe'}
                    onChange={() => setPaymentMethod('stripe')}
                  />
                  <Button 
                    variant="success" 
                    className="me-2 mt-3"
                    onClick={() => mockStripePayment(true)}
                  >
                    Submit Success Test
                  </Button>
                  <Button 
                    variant="warning" 
                    className="mt-3"
                    onClick={() => mockStripePayment(false)}
                  >
                    Submit Failure Test
                  </Button>
                </Form>
              </Card>
            )}
          </div>
        </Card.Body>
      </Card>

      <Button 
        variant="outline-secondary" 
        onClick={() => navigate(-1)}
      >
        Cancel and Go Back
      </Button>
    </Container>
  );
};

export default PaymentPage;
