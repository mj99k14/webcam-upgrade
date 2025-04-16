import axios from "axios";

const API = axios.create({
    baseURL: "http://210.101.236.158:5000/api", // 백엔드 주소
    withCredentials: true, // 쿠키 인증 정보 포함
});

// ✅ 로그인 API
export const loginWithGoogle = async (token) => {
    return await API.post("/auth/google", { token });
};

// ✅ 현재 로그인한 사용자 정보 가져오기
export const fetchUserProfile = async (email) => {
    return await API.get("/user/me", {
        params: { email }
    });
};
// ✅ 사진 업로드 API
export const uploadPhoto = async (formData) => {
    return await API.post("/photos/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};
// ✅ 여러 장 사진 업로드 API
export const uploadMultiplePhotos = async (formData) => {
    return await API.post("/photos/upload-multiple", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

// ✅ 업로드된 사진 목록 가져오기
export const fetchPhotos = async (user_id) => {
    return await API.get("/photos", {
        params: { user_id }
    });
};

// ✅ 사진 삭제 API
export const deletePhoto = async (photoId) => {
    return await API.delete(`/photos/${photoId}`);
};


// ✅ : 날짜별 목각도 요약
export const getAngleTrend = async (user_id, date) => {
    return await API.get('/posture/angle-trend', {
        params: { user_id, date }
    });
};





export default API;
