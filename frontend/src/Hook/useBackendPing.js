import { useContext } from 'react';
import { userContext } from '../Context/UserContext';

export default function useBackendPing() {
    const [loggedUser] = useContext(userContext);
    return function (userId) {
       

        return fetch(`http://127.0.0.1:8000/api/ping-user/${userId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loggedUser.access}`
            },
            credentials: 'include',
        })
            .then(data => data.json())
            .then(data => data.message)
    }
}