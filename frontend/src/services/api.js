import axios from 'axios';

// Create an instance of axios with default settings
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Replace with your actual API base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor (optional)
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor (optional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// API endpoints
export const uploadJobDescription = (data) => api.post('/upload-jd', data);
export const uploadResume = (data) => api.post('/upload-resume', data);
export const getCandidates = () => api.get('/candidates');
export const scheduleInterview = (candidateId, timeSlot) => 
  api.post(`/schedule-interview/${candidateId}`, { timeSlot });
export const getScheduledInterviews = () => api.get('/scheduled-interviews');
export const setAvailableTimeSlots = (timeSlots) => 
  api.post('/available-timeslots', { timeSlots });

export default api;
