import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import './Chat.css'; // Import your CSS file for styling
import io from 'socket.io-client'; // Import the WebSocket library



function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

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
      const response = await axios.get('http://localhost:8000/receive');
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
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
