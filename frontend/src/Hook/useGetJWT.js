import "bootstrap/js/src/dom/data";

export default function useGetJWT() {
    return function (username, password) {
        console.log(username, password); // This logs the credentials, consider removing this in production for security reasons.

        // Create the request body as a JSON object
        const body = JSON.stringify({
            username: username,
            password: password,
        });

        return fetch('http://127.0.0.1:8000/api/accounts/login/', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          credentials: 'include', // Correct setting for including credentials
          body: body
      })
        .then(response => {
            // First check the response status and handle specific cases
            if (!response.ok) {
                if (response.status === 401) {
                    // Specifically handling unauthorized access
                    return response.json().then(data => {
                        throw new Error(data.detail || 'Unauthorized'); // Custom error message from server, or default message
                    });
                }
                // General error handler for other status codes
                throw new Error('Network response was not ok');
            }
            // If response is okay, parse the JSON body of the response
            return response.json();
        })
        .then(data => {
            // Handle the data received from the server
            return data;
        })
        .catch(error => {
            // Catch and log any errors in the fetch or response processing
            console.error('Error:', error);
            throw error;
        });
    }
}
