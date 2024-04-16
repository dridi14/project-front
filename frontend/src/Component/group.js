import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import axios from 'axios';
import useGetUserList from "../Hook/useGetUserList";
import { userContext } from '../Context/UserContext';
import { useContext } from 'react';

function GroupCreation() {
    const [groupName, setGroupName] = useState('');
    const [members, setMembers] = useState([]);
    const [userList, setUserList] = useState([]);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const getUserList = useGetUserList();
    const [loggedUser] = useContext(userContext);

    useEffect(() => {
        getUserList().then(data => {
            if (Array.isArray(data)) {
                setUserList(data);
            } else if (data && data.users) {
                setUserList(data.users);
            } else {
                console.error("Invalid format or undefined data:", data);
            }
        }).catch(error => {
            setError('Error fetching user list: ' + error);
            console.error("Error fetching user list:", error);
        });
    }, []);

    const handleAddMember = (selectedMember) => {
        // Prevent adding the same member twice
        if (!members.includes(selectedMember)) {
            setMembers([...members, selectedMember]);
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/groups/', {
                name: groupName,  
                members: members
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${loggedUser.access}`
                }
            });
    
            if (response.status === 200) {
                setSuccess(true);
                setGroupName('');
                setMembers([]);
            } else {
                throw new Error('Failed to create group');
            }
        } catch (error) {
            setError('Error creating group: ' + error.message);
            setSuccess(false);
        }
    };
    

    return (
        <Container>
            <h2>Create Group</h2>
            {success && <Alert variant="success">Group Created Successfully!</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group>
                    <Form.Label>Group Name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter group name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Add Members</Form.Label>
                    <Form.Control as="select" multiple onChange={(e) => handleAddMember(e.target.value)}>
                        {userList.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.username}  
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>
                {members.length > 0 && (
                    <ul>
                        {members.map(member => (
                            <li key={member}>{member} - {userList.find(user => user.id === member)?.username}</li>
                        ))}
                    </ul>
                )}
                <Button variant="primary" type="submit">Create Group</Button>
            </Form>
        </Container>
    );
}

export default GroupCreation;
