import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { useEvents } from './EventsContext'; // ✅ Import live context

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const { events } = useEvents(); // ✅ Use shared live events

  // ---- Data Prep ----
  const eventsPerMonth = {};
  const organizerMap = {};
  let totalAttendees = 0;
  let totalRevenue = 0;

  events.forEach(event => {
    const month = new Date(event.startDate).toLocaleString('default', { month: 'short', year: 'numeric' });
    eventsPerMonth[month] = (eventsPerMonth[month] || 0) + 1;

    event.organizers.forEach(org => {
      organizerMap[org] = (organizerMap[org] || 0) + 1;
    });

    totalAttendees += event.attendeesCount || 0;
    totalRevenue += event.revenue || 0;
  });

  // ---- Chart Data ----
  const eventsPerMonthData = {
    labels: Object.keys(eventsPerMonth),
    datasets: [
      {
        label: 'Events Created',
        data: Object.values(eventsPerMonth),
        backgroundColor: '#A7C7E7',
      },
    ],
  };

  const organizerPieData = {
    labels: Object.keys(organizerMap),
    datasets: [
      {
        data: Object.values(organizerMap),
        backgroundColor: ['#CBAACB', '#FFB5A7', '#FFD6A5', '#B5EAD7', '#A7C7E7'],
      },
    ],
  };

  const revenueData = {
    labels: events.map(e => e.title),
    datasets: [
      {
        label: 'Revenue ($)',
        data: events.map(e => e.revenue),
        backgroundColor: '#FFB5A7',
      },
    ],
  };

  return (
    <Container className="mt-4">
      <h2 style={{ color: '#7a5195', marginBottom: '1rem' }}>Analytics & Reporting</h2>
      
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center shadow-sm p-3" style={{ backgroundColor: '#fef9ff' }}>
            <h5>Total Events Planned</h5>
            <h3 style={{ color: '#A7C7E7' }}>{events.length}</h3>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center shadow-sm p-3" style={{ backgroundColor: '#fef9ff' }}>
            <h5>Total Attendees Registered</h5>
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

      <Row className="mb-5">
        <Col md={6}>
          <Card className="p-3 shadow-sm" style={{ backgroundColor: '#fef9ff' }}>
            <h5 style={{ color: '#7a5195' }}>Events Created Per Month</h5>
            <Bar data={eventsPerMonthData} />
          </Card>
        </Col>
        <Col md={6}>
          <Card className="p-3 shadow-sm" style={{ backgroundColor: '#fef9ff' }}>
            <h5 style={{ color: '#7a5195' }}>Most Active Organizers</h5>
            <Pie data={organizerPieData} />
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="p-3 shadow-sm" style={{ backgroundColor: '#fef9ff' }}>
            <h5 style={{ color: '#7a5195' }}>Revenue Per Event</h5>
            <Bar data={revenueData} />
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Analytics;
