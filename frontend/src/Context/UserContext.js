import { useState, createContext, useEffect } from "react";

export const userContext = createContext('');

export default function UserProvider(props) {
    const [user, setUser] = useState(() => {
        // Attempt to get the stored user from local storage when initializing the state
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : '';
    });

    useEffect(() => {
        // Update local storage when the user state changes
        localStorage.setItem('user', JSON.stringify(user));
    }, [user]);

    return (
        <userContext.Provider value={[user, setUser]}>
            {props.children}
        </userContext.Provider>
    );
}
