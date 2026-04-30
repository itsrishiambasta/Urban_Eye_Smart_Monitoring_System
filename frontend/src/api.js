import axios from 'axios';

const API_BASE = '/api';

// Create axios instance with ngrok headers
const apiClient = axios.create({
    baseURL: API_BASE,
    headers: {
        'ngrok-skip-browser-warning': '69420',
        'ngrok-skip-browser-warning-for-user': 'true',
        'User-Agent': 'UrbanEye-Frontend'
    }
});

// Interceptor to add headers to all requests
apiClient.interceptors.request.use(
    config => {
        config.headers['ngrok-skip-browser-warning'] = '69420';
        return config;
    },
    error => Promise.reject(error)
);

export default apiClient;
