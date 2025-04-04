// src/Analytics.jsx
import React from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Container, Card } from 'react-bootstrap';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const Analytics = () => {
  // Mock Data
  const eventsPerMonth = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [{
      label: 'Events Created',
      data: [4, 6, 3, 7],
      backgroundColor: '#A7C7E7'
    }]
  };

  const organizersActivity = {
    labels: ['Alice', 'Bob', 'Charlie', 'Dana'],
    datasets: [{
      label: 'Events Organized',
      data: [5, 3, 7, 2],
      backgroundColor: ['#CBAACB', '#FFB5A7', '#A7C7E7', '#FDFDFD']
    }]
  };

  const revenueData = {
    labels: ['Conference', 'Workshop', 'Seminar'],
    datasets: [{
      label: 'Revenue ($)',
      data: [150, 60, 90],
      borderColor: '#2E2E2E',
      backgroundColor: '#CBAACB',
      tension: 0.4,
      fill: true
    }]
  };

  const totalRegistrations = 102;

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Analytics & Reporting</h2>

      <Card className="mb-4 p-3 shadow-sm">
        <h4>Events Created Per Month</h4>
        <Bar data={eventsPerMonth} />
      </Card>

      <Card className="mb-4 p-3 shadow-sm">
        <h4>Most Active Organizers</h4>
        <Pie data={organizersActivity} />
      </Card>

      <Card className="mb-4 p-3 shadow-sm">
        <h4>Revenue Per Event</h4>
        <Line data={revenueData} />
      </Card>

      <Card className="mb-4 p-4 text-center shadow-sm">
        <h4>Total Event Registrations</h4>
        <h1 style={{ fontSize: '4rem', color: '#7a5195' }}>{totalRegistrations}</h1>
      </Card>
    </Container>
  );
};

export default Analytics;
