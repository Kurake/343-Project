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
                    <Nav.Link href="#home"><Link to="/">Home</Link></Nav.Link>
                    <Nav.Link href="#addevent"><Link to="addEvent">Add Events</Link></Nav.Link>
                    <Nav.Link href="#management"><Link to="manage">Access Events</Link></Nav.Link>
                    <Nav.Link href="#login"><Link to="login">Login</Link></Nav.Link>
                    <NavDropdown title="Sign Up" id="basic-nav-dropdown">
                        <NavDropdown.Item href="#action/3.1"><Link to="signup">Attendee Sign Up</Link></NavDropdown.Item>
                        <NavDropdown.Item href="#action/3.2"><Link to="signup">Organizer Sign Up</Link></NavDropdown.Item>
                        <NavDropdown.Item href="#action/3.3"><Link to="signup">Sponsor Sign Up</Link></NavDropdown.Item>
                    </NavDropdown>
                </Nav>
            </Navbar.Collapse>
        </Container>
    </Navbar>
  );
}

export default Topnav;