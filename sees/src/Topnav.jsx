import { Outlet, Link } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

function Topnav() {
  return (
    <Navbar
      expand="lg"
      style={{
        backgroundColor: '#A7C7E7', // pastel blue
        borderBottom: '2px solid #CBAACB', // pastel lavender
        padding: '10px 20px',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        borderRadius: '0 0 10px 10px',
      }}
    >
      <Container>
        <Navbar.Brand
          as={Link}
          to="/"
          style={{
            fontWeight: 'bold',
            fontSize: '1.4rem',
            color: '#2E2E2E',
          }}
        >
          Smart Education Events System
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" style={linkStyle}>Home</Nav.Link>
            <Nav.Link as={Link} to="Events" style={linkStyle}>Event Dashboard</Nav.Link>
            <Nav.Link as={Link} to="analytics" style={linkStyle}>Analytics</Nav.Link> {/* ✅ New */}
            <Nav.Link as={Link} to="login" style={linkStyle}>Login</Nav.Link>
            <NavDropdown title="Sign Up" id="basic-nav-dropdown">
              <NavDropdown.Item as={Link} to="signup" state="attendee">
                Attendee Sign Up
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="signup" state="organizer">
                Organizer Sign Up
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="signup" state="sponsor">
                Sponsor Sign Up
              </NavDropdown.Item>
            </NavDropdown>
            <Nav.Link as={Link} to="chatroom" style={linkStyle}>Chatroom</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

const linkStyle = {
  color: '#2E2E2E',
  fontWeight: '500',
  marginRight: '10px',
};

export default Topnav;
