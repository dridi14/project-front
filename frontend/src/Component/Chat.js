import React, { useState, useEffect, useContext } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import './Chat.css';
import io from 'socket.io-client'; 
import { useLocation } from 'react-router-dom';
import { userContext } from '../Context/UserContext';
import axios from 'axios';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get('userId');
  const [loggedUser] = useContext(userContext);

  useEffect(() => {
    // Fetch initial messages from the server
    fetchMessages();

    const socket = io();

    // Listen for updates from socket
    socket.on(`user/${loggedUser.id}`, (message) => {
      console.log('Received message:', message);
      setMessages(prevMessages => [...prevMessages, message]);
    });

    return () => {
      socket.connect();
    };
  }, []); // Removed messages from dependency array

  const fetchMessages = async () => {
    try {
        const url = `http://127.0.0.1:8000/api/private-messages/${userId}/`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loggedUser.access}`
            },
            mode: "cors",
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setMessages(data);
    } catch (error) {
        console.error('Failed to fetch messages:', error);
    }
    console.log(loggedUser.mercure_token)
    document.cookie = `mercureAuthorization=${loggedUser.mercure_token};Secure;SameSite=None`;
    const mercureHubUrl = 'http://localhost:8001/.well-known/mercure';

    const topic = `user/${loggedUser.id}`;
    const url = new URL(mercureHubUrl);
    url.searchParams.append('topic', topic);

    const eventSource = new EventSource(url, { withCredentials: true });
    console.log('subscribed', topic)

    eventSource.onmessage = e => {
        console.log(e)
        // 
        try {
            let newMessage = JSON.parse(e.data); 
            console.log(newMessage)
            setMessages(prevMessages => [...prevMessages, newMessage]);
        } catch (jsonParseError) {
            console.error('Data received is not valid JSON:', jsonParseError);
            // Handle non-JSON data here, if needed
        }
    };

    return () => {
        eventSource.connect();
    };
};

  

  const handleSendMessage = async () => {
    try {
      const url = `http://127.0.0.1:8000/api/private-messages/${userId}/`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loggedUser.access}`
        },
        body: JSON.stringify({ message: newMessage }),
        mode: "cors",
        credentials: 'include',
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const responseData = await response.json();
  console.log("Sent Message:", responseData); // Log sent message
  setMessages(prevMessages => [...prevMessages, responseData]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const isMessageSentByUser = (message) => {
    return message.sender === loggedUser.id; // Replace 'loggedUser.id' with the current user's id
  };

  return (
    <Container>
      <Row>
        <Col md={8} className="mx-auto">
          <h1>Chat</h1>
          <div className="message-container">
            <ListGroup>
            {messages.map((message) => (
  <ListGroup.Item 
    key={message.id} 
    className={`message-item ${isMessageSentByUser(message) ? 'sent' : 'received'}`}>
    {message.message}
  </ListGroup.Item>
))}
            </ListGroup>
          </div>
          <Form className="mt-3">
            <Form.Group>
              <Form.Control
                type="text"
                placeholder="Type your message..."
                value={newMessage.message}
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
