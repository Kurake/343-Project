import { Outlet, Link, useNavigate } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Button from 'react-bootstrap/Button';
import { useUser } from './UserContext';

function Topnav() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    localStorage.clear();
    navigate('/login');
  };

  return (
    <Navbar
      expand="lg"
      style={{
        backgroundColor: '#A7C7E7',
        borderBottom: '2px solid #CBAACB',
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
            <Nav.Link as={Link} to="events" style={linkStyle}>Event Dashboard</Nav.Link>
            <Nav.Link as={Link} to="analytics" style={linkStyle}>Analytics</Nav.Link>
            <Nav.Link as={Link} to="chatroom" style={linkStyle}>Chatroom</Nav.Link>
          </Nav>

          <Nav className="ms-auto">
            {user?.isLoggedIn ? (
              <>
                <Navbar.Text className="me-3" style={{ color: '#2E2E2E' }}>
                  Signed in as <strong>{user.name}</strong>
                </Navbar.Text>
                <Button 
                  variant="outline-dark" 
                  size="sm" 
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
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
              </>
            )}
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
