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
  const [cardNumber, setCardNumber] = useState('');
  
  useEffect(() => {
    if (!event && eventId) {

      setLoading(true);
      setTimeout(() => {
        // Mock API
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
        <Card className="shadow p-4 text-center">
          <Card.Body>
            <div className="mb-4 text-success">
              <i className="bi bi-check-circle-fill" style={{ fontSize: '3rem' }}></i>
            </div>
            <Card.Title as="h2">Payment Successful!</Card.Title>
            <Card.Text>
              Thank you for registering for <strong>{event.title}</strong>.
              {userBalance !== undefined && (
                <div className="mt-2">
                  Your remaining balance: <strong>${userBalance.toFixed(2)}</strong>
                </div>
              )}
            </Card.Text>
            <Button 
              variant="primary" 
              onClick={() => navigate(`/event/${event.id}`, { 
                state: event // Pass the full event object, not { event }
              })}
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
      <h2>Payment for Event Registration</h2>
      
      <Card className="mb-4 shadow-sm">
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
              <h3 className="text-primary">
                ${typeof event.price === 'number' ? event.price.toFixed(2) : '0.00'}
              </h3>
              <small className="text-muted">Registration fee</small>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h4>Payment Options</h4>
          
          <div className="mb-4">
            <h5>Option 1: Pay with your balance</h5>
            <p>Current balance: <strong>${userBalance.toFixed(2)}</strong></p>
            {userBalance >= event.price ? (
              <Button 
                variant="success" 
                onClick={handlePayWithBalance}
                disabled={processing}
              >
                {processing ? 'Processing...' : `Pay $${event.price.toFixed(2)} from my balance`}
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
                variant="primary" 
                onClick={handleStripePayment}
                disabled={processing}
              >
                <i className="bi bi-credit-card me-2"></i>
                Pay with Stripe
              </Button>
            ) : (
              <Card className="p-3 border mb-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">Secure Checkout</h6>
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/512px-Stripe_Logo%2C_revised_2016.svg.png" 
                    alt="Stripe" 
                    height="25" 
                  />
                </div>
                
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
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Cardholder Name</Form.Label>
                    <Form.Control type="text" placeholder="Name on card" />
                  </Form.Group>
                  
                  <div className="d-flex align-items-center mb-3">
                    <div className="me-3">
                      <Form.Check 
                        type="radio"
                        id="credit-card"
                        name="paymentMethod"
                        label="Credit Card"
                        checked={paymentMethod === 'credit'}
                        onChange={() => setPaymentMethod('credit')}
                      />
                    </div>
                    <div>
                      <Form.Check 
                        type="radio"
                        id="debit-card"
                        name="paymentMethod"
                        label="Debit Card"
                        checked={paymentMethod === 'debit'}
                        onChange={() => setPaymentMethod('debit')}
                      />
                    </div>
                  </div>
                  
                  <div className="d-flex align-items-center">
                    <Button 
                      variant="primary" 
                      className="me-2 flex-grow-1"
                      onClick={() => {
                        // Check if using the failure test card
                        const cleanCardNumber = cardNumber.replace(/\s/g, '');
                        const isFailureCard = cleanCardNumber === '4000000000000002';
                        mockStripePayment(!isFailureCard);
                      }}
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <Spinner 
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Processing...
                        </>
                      ) : (
                        <>Pay ${event.price.toFixed(2)} securely</>
                      )}
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setShowStripe(false)}
                      disabled={processing}
                    >
                      Cancel
                    </Button>
                  </div>
                  
                  <div className="mt-3 text-center">
                    <small className="text-muted">
                      <i className="bi bi-shield-lock me-1"></i>
                      Your payment information is secure and encrypted
                    </small>
                  </div>
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