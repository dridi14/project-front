import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';

import { userContext } from "../Context/UserContext"; 

export default function GroupList() {
    const [loggedUser] = useContext(userContext);
    const [groups, setGroups] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/groups', {
                    headers: {
                        'Authorization': `Bearer ${loggedUser.access}`
                    }
                });
                setGroups(response.data);
            } catch (error) {
                console.error('Error fetching groups:', error);
            }
        };

        fetchGroups();
    }, [loggedUser.access]);

    const handleCreateGroup = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/groups/', {
                name: groupName
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${loggedUser.access}`
                }
            });

            if (response.status === 201) {
                setGroups([...groups, response.data]);
                setGroupName('');
                setSuccess(true);
            } else {
                throw new Error('Failed to create group');
            }
        } catch (error) {
            setError('Error creating group: ' + error.message);
            setSuccess(false);
        }
    };

    const buttonStyle = {
        width: '150px',
        height: '50px',
        fontSize: '16px'
    };

    return (
        <div>
            <h1 className='m-5 text-center'>Groups</h1>
            <form onSubmit={handleCreateGroup} className='mb-4'>
                <input 
                    type="text" 
                    placeholder="Enter group name" 
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className='form-control'
                />
                <button type="submit" className="btn btn-primary" style={buttonStyle}>Create Group</button>
            </form>
            {success && <div className="alert alert-success">Group created successfully!</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            <div>
                {groups.length > 0 ? (
                    groups.map((group, index) => (
                        <div key={index} className="w-75 mx-auto mb-3 d-flex align-items-center">
                            <p className="m-0">{group.name}</p>
                            <button 
                                className="btn btn-info ms-auto" 
                                onClick={() => navigate(`/group-chat/${group.id}`)}
                                style={buttonStyle}
                            >
                                <FontAwesomeIcon icon={faUsers} /> Go to Chat
                            </button>
                        </div>
                    ))
                ) : (
                    <p>No groups found.</p>
                )}
            </div>
        </div>
    );
}
