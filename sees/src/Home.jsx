import React from 'react';

function Home() {
  const containerStyle = {
    padding: '2rem',
    backgroundColor: '#FDFDFD',
    minHeight: '80vh',
    textAlign: 'center',
  };

  const titleStyle = {
    fontSize: '2.5rem',
    color: '#2E2E2E',
    marginBottom: '1rem',
  };

  const subtitleStyle = {
    fontSize: '1.6rem',
    color: '#CBAACB',
    margin: '2rem 0 1rem 0',
    borderBottom: '2px solid #FFB5A7',
    display: 'inline-block',
    paddingBottom: '0.5rem',
  };

  const listStyle = {
    listStyleType: 'none',
    padding: 0,
    fontSize: '1.2rem',
    color: '#4B4B4B',
  };

  const itemStyle = {
    margin: '1rem 0',
    backgroundColor: '#fff',
    padding: '1rem',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Welcome to SEES 👋</h1>
      <h2 style={subtitleStyle}>To Do List:</h2>
      <ul style={listStyle}>
        <li style={itemStyle}>✅ Implement User Registration and Login</li>
        <li style={itemStyle}>🗓️ Implement Event Creation and Management</li>
        <li style={itemStyle}>💬 Implement Live Chat</li>
        <li style={itemStyle}>💳 Implement Payment Integration</li>
      </ul>
    </div>
  );
}

export default Home;
