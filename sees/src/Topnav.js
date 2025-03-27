import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

function Topnav() {
  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="#home">Smart Education Events System</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#link">Add Events</Nav.Link>
            <Nav.Link href="#management">Event Management</Nav.Link>
            <Nav.Link href="#login">Login</Nav.Link>
            <NavDropdown title="Sign Up" id="basic-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Attendee Sign Up</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">Organizer Sign Up</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Sponsor Sign Up</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Topnav;