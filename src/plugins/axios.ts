// src/plugins/axios.ts
import axios from "axios";

const instance = axios.create({
  baseURL: "", // 替换成你的后端地址
  timeout: 5000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
