import { Outlet, Link } from "react-router-dom";
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
                    <Nav.Link as={Link} to="/">Home</Nav.Link>
                    <Nav.Link as={Link} to="addEvent">Add Events</Nav.Link>
                    <Nav.Link as={Link} to="manage">Access Events</Nav.Link>
                    <Nav.Link as={Link} to="login">Login</Nav.Link>
                    <NavDropdown title="Sign Up" id="basic-nav-dropdown">
                        <NavDropdown.Item as={Link} to="signup">Attendee Sign Up</NavDropdown.Item>
                        <NavDropdown.Item as={Link} to="signup">Organizer Sign Up</NavDropdown.Item>
                        <NavDropdown.Item as={Link} to="signup">Sponsor Sign Up</NavDropdown.Item>
                    </NavDropdown>
                </Nav>
            </Navbar.Collapse>
        </Container>
    </Navbar>
  );
}

export default Topnav;