import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import useGetUserList from "../Hook/useGetUserList";
import useBackendPing from "../Hook/useBackendPing";
import { userContext } from "../Context/UserContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';

export default function UserList() {
    const [loggedUser] = useContext(userContext);
    const [userList, setUserList] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [members, setMembers] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();
    const getUserList = useGetUserList();
    const backendPing = useBackendPing();

    const handleSubmit = (e) => {
        e.preventDefault();
        const userId = e.target[0].value;
        backendPing(userId).then(data => {
            console.log('Backend response:', data);
        }).catch(error => {
            console.error('Failed to ping backend:', error);
        });
    };

    const handleChatStart = (userId) => {
        navigate(`/chat?userId=${userId}`);
    };

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
            console.error("Error fetching user list:", error);
        });

        const mercureHubUrl = 'http://localhost:8001/.well-known/mercure';
        const topic = `user/${loggedUser.id}`;
        const url = new URL(mercureHubUrl);
        url.searchParams.append('topic', topic);
        const eventSource = new EventSource(url, {withCredentials: true});
                
        eventSource.onmessage = e => console.log('Mercure message:', e.data);

        return () => {
            eventSource.close();
        };
    }, [loggedUser.id]);

    useEffect(() => {
        const createGroup = async () => {
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

        createGroup();
    }, []);

    // Define your inline styles
    const buttonStyle = {
        width: '150px', // Set your desired width
        height: '50px', // Set your desired height
        padding: '0',   // Adjust padding if needed
        fontSize: '16px' // Adjust font size if needed
    };

    const buttonStyleping = {
        width: '75px', 
        height: '50px', 
        padding: '0',   
        fontSize: '16px'
    };

    return (
        <div>
            <h1 className='m-5 text-center'>Ping a user</h1>
            {userList.length > 0 ? (
                userList.map(user => (
                    <div className='w-75 mx-auto mb-3 d-flex align-items-center' key={user.id}>
                         <button className='btn btn-dark' style={buttonStyle} type='submit' value={user.id}>{user.username}</button>
                        <form onSubmit={handleSubmit} className='me-2'>
                          <button className='btn btn-dark mx-4' style={buttonStyleping} value={user.id}>Ping</button>
                        </form>
                        <button className='btn btn-info' style={buttonStyle} onClick={() => handleChatStart(user.id)}>
                            <FontAwesomeIcon icon={faComment} /> Start Chat
                        </button>
                    </div>
                ))
            ) : (
                <p>No users found.</p>
            )}
        </div>
    );
    
    
}
