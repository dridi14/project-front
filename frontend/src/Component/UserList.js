import { useEffect, useState, useContext } from "react";
import useGetUserList from "../Hook/useGetUserList";
import useBackendPing from "../Hook/useBackendPing";
import { userContext } from "../Context/UserContext";

export default function UserList() {
    const [loggedUser] = useContext(userContext);
    const [userList, setUserList] = useState([]);

    const getUserList = useGetUserList();
    const backendPing = useBackendPing();

    const handleSubmit = (e) => {
        e.preventDefault();
        const userId = e.target[0].value;
        backendPing(userId).then(data => console.log(data))
    }

    const handleMessage = (e) => {
        // Your handleMessage logic
    }

    useEffect(() => {
        getUserList().then(data => {
    
            // If data itself is the users array
            if (Array.isArray(data)) {
                setUserList(data);
            } else if (data && data.users) {
                // If data contains a 'users' property
                setUserList(data.users);
            } else {
                // If the response is not in an expected format
                console.error("Invalid format or undefined data:", data);
            }
        }).catch(error => {
            console.error("Error fetching user list:", error);
        });
    
        const mercureToken = loggedUser.mercure_token;
        const mercureHubUrl ='http://localhost:8001/.well-known/mercure';
        const topic = '';
        const headers = {
            'Authorization': `Bearer ${mercureToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'origin': 'http://localhost:3000'
        };
        
        const eventSource = new EventSource(`${mercureHubUrl}?topic=${encodeURIComponent(topic)}`, { headers });
        
        eventSource.onmessage = handleMessage;

        return () => {
            eventSource.close();
        }
    }, []);

    return (
        <div>
            <h1 className='m-5 text-center'>Ping a user</h1>
            {userList.length > 0 ? (
                userList.map(user => (
                    <form className='w-75 mx-auto mb-3' onSubmit={handleSubmit} key={user.id}>
                        <button className='btn btn-dark w-100' type='submit' value={user.id}>{user.username}</button>
                    </form>
                ))
            ) : (
                <p>No users found.</p>
            )}
        </div>
    );
}
