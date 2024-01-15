import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import './Chat.css';
import io from 'socket.io-client'; 
import { useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { userContext } from '../Context/UserContext';



function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get('userId');
  const [loggedUser] = useContext(userContext);
    const [userList, setUserList] = useState([]);

  useEffect(() => {
    // Fetch initial messages from the server
    fetchMessages();

    // Create a WebSocket connection to the Mercure hub
    const socket = io('YOUR_MERCURE_HUB_URL');

    // Listen for updates from Mercure
    socket.on('YOUR_MERCURE_TOPIC', (message) => {
      // Handle incoming messages, e.g., add them to the state
      setMessages([...messages, message]);
    });

    // Cleanup the WebSocket connection when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, [messages]);


  const fetchMessages = async () => {
    // Fetch messages from the server and set them in the state
    try {
      const response = await axios.get('http://127.0.0.1:8000/private-messages/<int:receiver>/');
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

    document.cookie = `mercureAuthorization=${loggedUser.mercure_token};Secure;SameSite=None`;
    const mercureHubUrl ='http://localhost:1234/.well-known/mercure';

    // Topic formatted as 'receiver/{userid}'
    const topic = `receiver/${loggedUser.id}`;
    const url = new URL(mercureHubUrl);
    url.searchParams.append('topic', topic);

    const eventSource = new EventSource(url, {withCredentials: true});

    eventSource.onmessage = e => {
        const newMessage = JSON.parse(e.data);
        // Assuming newMessage is structured correctly, add it to your state
        setMessages(prevMessages => [...prevMessages, newMessage]);
    };

    // Cleanup the EventSource connection when the component unmounts
    return () => {
        eventSource.close();
    };


  const handleSendMessage = async () => {
    // Send a new message to the server and update messages state
    try {
      const response = await axios.post('http://localhost:8000/send', {
        content: newMessage,
      });
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <Container>
      <Row>
        <Col md={8} className="mx-auto">
          <h1>Chat</h1>
          <div className="message-container">
            <ListGroup>
              {messages.map((message) => (
                <ListGroup.Item key={message.id}>
                  {message.content}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
          <Form className="mt-3">
            <Form.Group>
              <Form.Control
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" onClick={handleSendMessage}>
              Send
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default Chat;
