import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import NeedAuth from './Auth/NeedAuth';
import UserList from './Component/UserList';
import Login from './Auth/Login';
import Chat from './Component/Chat'; // Import the Chat component
import UserProvider from './Context/UserContext';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Navbar bg="light" expand="lg">
          <Navbar.Brand as={Link} to="/">Home</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link as={Link} to="/chat">Chat</Nav.Link> {/* Add a link to the Chat component */}
              <Nav.Link as={Link} to="/userlist">User List</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        <Routes>
          <Route path="/" element={<NeedAuth><UserList /></NeedAuth>} />
          <Route path="/login" element={<Login />} />
          <Route path="/chat" element={<Chat />} /> {/* Route for the Chat component */}
          <Route path="/userlist" element={<NeedAuth><UserList /></NeedAuth>} />
          <Route path="*" element={<h1>Not Found</h1>} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
