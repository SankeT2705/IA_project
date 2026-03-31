import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

export const getNodes = () => axios.get(`${BASE_URL}/nodes`);
export const getTasks = () => axios.get(`${BASE_URL}/tasks`);