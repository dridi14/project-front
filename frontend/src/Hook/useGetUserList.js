import { useContext } from 'react';
import { userContext } from '../Context/UserContext';

export default function useGetUserList() {
    const [loggedUser] = useContext(userContext);

    return function () {
        return fetch('http://127.0.0.1:8000/api/accounts/users/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loggedUser}`
            },
            mode: "cors",
            credentials: 'include',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            });
    }
}