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
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCvv] = useState('');

  // Format credit card expiry input (12/28 format)
  const handleExpiryChange = (e) => {
    const input = e.target.value.replace(/\D/g, ''); // Remove non-digits
    let formatted = input;

    if (input.length > 0) {
      // Format as MM/YY
      if (input.length <= 2) {
        formatted = input;
      } else {
        formatted = `${input.substring(0, 2)}/${input.substring(2, 4)}`;
      }
      
      // Limit to 4 digits (MM/YY)
      if (input.length > 4) {
        formatted = `${input.substring(0, 2)}/${input.substring(2, 4)}`;
      }
    }

    setCardExpiry(formatted);
  };

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

  const isValidCardNumber = () => {
    // Check if it's the test success card
    return cardNumber.replace(/\s/g, '') === '4242424242424242';
  };

  const mockStripePayment = () => {
    setProcessing(true);
    
    // Process payment based on card number validation
    const isSuccess = isValidCardNumber();
    
    setTimeout(() => {
      if (isSuccess) {
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
        setProcessing(false);
        setError('Invalid card number. Please use 4242 4242 4242 4242 for testing.');
        // Don't hide stripe form on failure so they can try again
      }
    }, 1500); // Simulate processing time
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
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
              {/* <div className="mt-2">
                Remaining balance: <strong>${userBalance.toFixed(2)}</strong>
              </div> */}
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
          {/* <h4>Payment Options</h4> */}
          
          {/* <div className="mb-4">
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
          </div> */}

          <div className="mt-4">
            <h5>Pay with Stripe</h5>
            {showStripe ? (
              <div className="mt-3">
                <Form.Group className="mb-3">
                  <Form.Label>Card Number</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="4242 4242 4242 4242" 
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    maxLength={19}
                    disabled={processing} 
                  />
                  <Form.Text className="text-muted">
                    Use 4242 4242 4242 4242 for successful payment test
                  </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Row>
                    <Col>
                      <Form.Label>Expiry Date</Form.Label>
                      <Form.Control
                        type="text"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY"
                        maxLength="5"
                        disabled={processing}
                      />
                    </Col>
                    <Col>
                      <Form.Label>CVV</Form.Label>
                      <Form.Control 
                        type="text" 
                        placeholder="***" 
                        value={cardCvv}
                        onChange={(e) => setCvv(e.target.value)}
                        maxLength={3}
                        disabled={processing} 
                      />
                    </Col>
                  </Row>
                </Form.Group>
                <div className="d-flex justify-content-between">
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setShowStripe(false)}
                    disabled={processing}
                  >
                    Cancel
                  </Button>
                  <Button 
                    style={{ backgroundColor: '#A7C7E7', border: 'none' }} 
                    onClick={mockStripePayment}
                    disabled={processing || cardNumber.length < 16}
                  >
                    {processing ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                        <span className="ms-2">Processing...</span>
                      </>
                    ) : `Pay $${event.price ? event.price.toFixed(2) : '0.00'}`}
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                style={{ backgroundColor: '#A7C7E7', border: 'none' }} 
                onClick={handleStripePayment}
                className="mt-2"
              >
                Pay with Credit Card
              </Button>
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
