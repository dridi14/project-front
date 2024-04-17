import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import axios from 'axios';

import { userContext } from '../Context/UserContext';

function GroupChat() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [members, setMembers] = useState([]);
    const { groupId } = useParams();
    const [loggedUser] = useContext(userContext);

    useEffect(() => {
        fetchGroupDetails();

        const mercureHubUrl = 'http://localhost:8001/.well-known/mercure';
        const topic = `group/${groupId}`;
        const url = new URL(mercureHubUrl);
        url.searchParams.append('topic', topic);

        const eventSource = new EventSource(url.toString(), { withCredentials: true });

        eventSource.onmessage = (e) => {
            const newMessage = JSON.parse(e.data);
            setMessages(prevMessages => [...prevMessages, newMessage]);
        };

        return () => {
            eventSource.close();
        };
    }, [groupId]);

    const fetchGroupDetails = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/groups/${groupId}`, {
                headers: {
                    'Authorization': `Bearer ${loggedUser.access}`
                }
            });
            if (response.status === 200) {
                setMembers(response?.data?.members);
                setMessages(response?.data?.messages);
            }
        } catch (error) {
            console.error('Failed to fetch group details:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`http://127.0.0.1:8000/api/group-messages/${groupId}/`, {
                message: newMessage,
                sender: loggedUser.id,
                group: groupId
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${loggedUser.access}`
                }
            });

            if (response.status === 201) {
                setMessages([...messages, response.data]);
                setNewMessage('');
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const isMessageSentByUser = (message) => {
        return message.senderId === loggedUser.id;
    };

    return (
        <Container>
            <Row>
                <Col md={8} className="mx-auto">
                    <h1>Group Chat</h1>
                    <div className="message-container">
                        <ListGroup>
                            {messages.map((message, index) => (
                                <ListGroup.Item key={index} className={`message-item ${isMessageSentByUser(message) ? 'sent' : 'received'}`}>
                                    sender: {message.sender} 
                                    <br />
                                    {message.message}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </div>
                    <Form className="mt-3" onSubmit={handleSendMessage}>
                        <Form.Group>
                            <Form.Control
                                type="text"
                                placeholder="Type your message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Send
                        </Button>
                    </Form>
                    <h2>Members</h2>
                    <ListGroup>
                        {members.map((member, index) => (
                            <ListGroup.Item key={index}>
                                {member}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Col>
            </Row>
        </Container>
    );
}

export default GroupChat;
