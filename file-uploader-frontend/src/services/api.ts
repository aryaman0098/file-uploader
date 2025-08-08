import axios from 'axios';
import { auth } from '../utils/firebase.utils';

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL
})

/**
 * Populate firebase auth token as bearer token in every api request
 */
api.interceptors.request.use(async (config) => {
  const currentUser = auth.currentUser
  if (currentUser) {
    const token = await currentUser.getIdToken()
    config.headers.Authorization = `Bearer ${token}`
  }
  return config;
})

export default api;