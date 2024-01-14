import "bootstrap/js/src/dom/data";

export default function useGetJWT() {
    return function (username, password) {
        // Create the body as a JSON object
        const body = JSON.stringify({
            username: username,
            password: password
        });

        return fetch('http://127.0.0.1:8000/api/accounts/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            mode: "cors",
            credentials: 'include',
            body: body
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        });
    }
}
