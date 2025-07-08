// src/api.js
import axios from "axios";

const API = axios.create({
    baseURL: "http://210.101.236.158:5000/api"
});

//  요청마다 JWT 자동 삽입
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

//  응답 에러 처리 (예: 인증 만료 시 로그아웃)
API.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            alert("⛔ 인증이 만료되었습니다. 다시 로그인해주세요.");
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        return Promise.reject(err);
    }
);

//  Auth 관련
export const loginWithGoogle = async (code) =>
    await API.post("/auth/google", { code });

export const getUserProfile = async (email) =>
    await API.get("/user/me", { params: { email } });

export const deleteUserAccount = async (userId) =>
    await API.delete(`/user/delete/${userId}`);

//  사진 관련
export const getPhotos = async (user_id) =>
    await API.get("/photos", { params: { user_id } });

export const uploadPhoto = async (formData) =>
    await API.post("/photos/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

export const uploadMultiplePhotos = async (formData) =>
    await API.post("/photos/upload-multiple", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

export const deletePhotoById = async (photoId) =>
    await API.delete(`/photos/${photoId}`);

// 자세 측정 관련
export const savePostureResult = async (payload) =>
    await API.post("/posture/save", payload);

export const getPostureHistory = async (user_id) =>
    await API.get("/posture/history", { params: { user_id } });

export const getLatestPosture = async (user_id) =>
    await API.get(`/posture/latest/${user_id}`);

export const getTodaySummary = async () =>
    await API.get("/posture/summary/today");

export const getDailySummary = async () =>
    await API.get("/posture/summary");

export const getAngleTrend = async (user_id, date) =>
    await API.get("/posture/angle-trend", { params: { user_id, date } });

export default API;
