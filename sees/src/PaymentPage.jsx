import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Card, Button, Alert, Form, Row, Col, Spinner } from 'react-bootstrap';
import { useUser } from './UserContext';

const PaymentPage = () => {
  const { eventId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { userBalance, deductBalance } = useUser();

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

  // Ensure event price exists and is a number
  useEffect(() => {
    if (event && (event.price === undefined || event.price === null)) {
      setEvent({
        ...event,
        price: 0
      });
    }
  }, [event]);

  const handlePayWithBalance = () => {
    if (!userBalance || userBalance < event.price) {
      setError(`Insufficient funds. Your balance: $${userBalance.toFixed(2)}`);
      return;
    }

    setProcessing(true);
    setTimeout(() => {
      deductBalance(event.price);
      setProcessing(false);
      setPaymentSuccess(true);
    }, 1500);
  };

  const handleStripePayment = () => {
    setShowStripe(true);
  };

  const mockStripePayment = (success) => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      if (success) {
        setPaymentSuccess(true);
      } else {
        setError('Payment failed. Please try again.');
      }
      setShowStripe(false);
    }, 1500);
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
              onClick={() => navigate(`/event/${event.id}`)}
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
                <i className="bi bi-credit-card me-2"></i>
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
                    <div className="position-relative">
                      <Form.Control 
                        type="text" 
                        placeholder="1234 5678 9012 3456" 
                        maxLength="19"
                        value={cardNumber}
                        onChange={(e) => {
                          // Format card number with spaces every 4 digits
                          const input = e.target.value.replace(/\s/g, '');
                          const formatted = input.replace(/(\d{4})/g, '$1 ').trim();
                          setCardNumber(formatted);
                        }} 
                      />
                      <div className="position-absolute end-0 top-0 pt-2 pe-3">
                        <i className="bi bi-credit-card text-secondary"></i>
                      </div>
                    </div>
                    <small className="text-muted">Test: 4242 4242 4242 4242 (Success) or 4000 0000 0000 0002 (Failure)</small>
                  </Form.Group>
                  
                  <Row>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>Expiry Date</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="MM/YY"
                          maxLength="5"
                          onChange={(e) => {
                            // Format as MM/YY
                            const input = e.target.value.replace(/\D/g, '');
                            let formatted = input;
                            if (input.length > 2) {
                              formatted = `${input.slice(0, 2)}/${input.slice(2)}`;
                            }
                            e.target.value = formatted;
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>CVC</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="123"
                          maxLength="3" 
                          onChange={(e) => e.target.value = e.target.value.replace(/\D/g, '')}
                        />
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
