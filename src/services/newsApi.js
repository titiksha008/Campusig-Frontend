import axios from "axios";

const API = "http://localhost:5000/api/news";

export const getAllNews = () => axios.get(API);
export const getNewsById = (id) => axios.get(`${API}/${id}`);
export const getLiveNews = () => axios.get(`${API}/live`);