import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:5001/',  // Flask backend address
  withCredentials: true,  // Allows cross-domain requests to carry credentials
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;