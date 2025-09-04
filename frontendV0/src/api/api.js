import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8080/api/auth', // "auth for controller"
});

export const registerUser = async (userData) => {
    try {
        const response = await API.post('/register', userData); // /api/auth/register
        return response.data;
    } catch (error) {
        console.error('Error registering user:', error.response?.data || error.message);
        throw error;
    }
};
export const loginUser = async (credentials) => {
    try {
        const response = await API.post('/login', credentials); // Now maps to /api/auth/login
        return response.data;   
    }
    catch (error) {
        console.error('Error logging in user:', error.response?.data || error.message);
        throw error;
    }
};