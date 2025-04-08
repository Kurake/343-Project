import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useUser } from './UserContext';
import { useEvents } from './EventsContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { user } = useUser();
  const { events } = useEvents();
  const navigate = useNavigate();

  const totalAttendees = events.reduce((sum, e) => sum + (e.attendeesCount || 0), 0);
  const totalRevenue = events.reduce((sum, e) => sum + (e.revenue || 0), 0);

  const upcomingEvents = events
    .filter(e => new Date(e.startDate) > new Date())
    .slice(0, 3);

  return (
    <Container className="mt-4">
      {/* Hero Banner */}
      <Card className="mb-4 shadow-sm text-center p-4" style={{ backgroundColor: '#A7C7E7' }}>
        <h1 style={{ color: '#fff', fontWeight: 'bold' }}>Welcome to Smart Education Events System</h1>
        {user?.isLoggedIn && <h4 style={{ color: '#fff' }}>Hello, {user.name} 👋</h4>}
      </Card>

      {/* Stats */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center shadow-sm p-3" style={{ backgroundColor: '#fef9ff' }}>
            <h5>Total Events</h5>
            <h3 style={{ color: '#A7C7E7' }}>{events.length}</h3>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center shadow-sm p-3" style={{ backgroundColor: '#fef9ff' }}>
            <h5>Total Attendees</h5>
            <h3 style={{ color: '#FFB5A7' }}>{totalAttendees}</h3>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center shadow-sm p-3" style={{ backgroundColor: '#fef9ff' }}>
            <h5>Total Revenue</h5>
            <h3 style={{ color: '#CBAACB' }}>${totalRevenue.toFixed(2)}</h3>
          </Card>
        </Col>
      </Row>

      {/* Upcoming Events */}
      <h4 className="mb-3" style={{ color: '#7a5195' }}>Upcoming Events</h4>
      <Row className="mb-4">
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map(e => (
            <Col key={e.id} md={4}>
              <Card className="p-3 shadow-sm mb-3" style={{ backgroundColor: '#fef9ff' }}>
                <h5>{e.title}</h5>
                <p>{e.startDate} - {e.endDate}</p>
                <Button 
                  size="sm" 
                  style={{ backgroundColor: '#CBAACB', border: 'none' }} 
                  onClick={() => navigate(`/event/${e.id}`, { state: e })}
                >
                  View Details
                </Button>
              </Card>
            </Col>
          ))
        ) : (
          <p className="text-muted">No upcoming events.</p>
        )}
      </Row>

      {/* Quick Actions */}
      <div className="text-center">
        <Button 
          variant="primary" 
          className="me-3" 
          onClick={() => navigate('/events')}
          style={{ backgroundColor: '#A7C7E7', border: 'none' }}
        >
          Go to Events
        </Button>
        <Button 
          variant="secondary" 
          onClick={() => navigate('/analytics')}
          style={{ backgroundColor: '#CBAACB', border: 'none' }}
        >
          View Analytics
        </Button>
      </div>
    </Container>
  );
};

export default Home;
