import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import NeedAuth from './Auth/NeedAuth';
import UserList from './Component/UserList';
import GroupCreation from './Component/group';
import GroupList from './Component/groups';
import GroupChat from './Component/group-chat';
import Login from './Auth/Login';
import Chat from './Component/Chat'; // Import the Chat component
import UserProvider, { userContext } from './Context/UserContext';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { useContext } from 'react'; // Import useContext

function App() {
  const [user, setUser] = useContext(userContext); // Use the userContext

  // Function to handle logout
  const handleLogout = () => {
    setUser(''); // Clear the user token
    // Additional logic if necessary, e.g., clearing local storage
  };

  return (
    <UserProvider>
      <BrowserRouter>
        <Navbar bg="light" expand="lg">
          <Navbar.Brand as={Link} to="/">Home</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link as={Link} to="/chat">Chat</Nav.Link>
              <Nav.Link as={Link} to="/userlist">User List</Nav.Link>
              <Nav.Link as={Link} to="/group">Group</Nav.Link>
              <Nav.Link as={Link} to="/groups">Group list</Nav.Link>              
                <Nav.Link as={Link} to="/login" onClick={handleLogout}>Logout</Nav.Link> 
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        <Routes>
          <Route path="/" element={<NeedAuth><UserList /></NeedAuth>} />
          <Route path="/login" element={<Login />} />
          <Route path="/chat" element={<NeedAuth><Chat /></NeedAuth>} />
          <Route path="/userlist" element={<NeedAuth><UserList /></NeedAuth>} />
          <Route path="/group" element={<NeedAuth><GroupCreation /></NeedAuth>} />
          <Route path="/groups" element={<NeedAuth><GroupList /></NeedAuth>} />
          <Route path="/group-chat/:groupId" element={<NeedAuth><GroupChat /></NeedAuth>} />
          <Route path="*" element={<h1>Not Found</h1>} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
