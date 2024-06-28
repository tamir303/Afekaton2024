import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8083', // Set your base URL here
});

export default instance;
