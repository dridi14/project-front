export default function useBackendPing() {
    return function (userId) {
        return fetch(`http://127.0.0.1:8000/ping/${userId}`, {
            method: 'POST',
        })
            .then(data => data.json())
            .then(data => data.message)
    }
}