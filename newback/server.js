require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const photoRoutes = require("./routes/photoRoutes");
const postureRoutes = require("./routes/postureRoutes"); //자세 측정 라우터 추가

const app = express();
const PORT = process.env.PORT || 5000;

// ? CORS 설정 (허용할 도메인 지정)
const allowedOrigins = ["http://localhost:5173", "http://210.101.236.158:5173"];

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

// ? OPTIONS 요청 처리 (CORS 문제 해결)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

// ? JSON, URL-encoded 데이터 및 쿠키 처리
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ? 정적 파일 제공 (업로드된 이미지)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ? API 라우트 연결
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/posture", postureRoutes); // ✅ 자세 측정 라우트 연결

// ? 서버 실행
app.listen(PORT, () => {
    console.log(`?? 서버 실행 중: http://localhost:${PORT}`);
    console.log(`?? CORS 허용 도메인: ${allowedOrigins.join(", ")}`);
});
