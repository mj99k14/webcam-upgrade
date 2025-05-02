// ✅ .env 먼저 불러오기
require("dotenv").config();


const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");

// ✅ 라우트 import
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const photoRoutes = require("./routes/photoRoutes");
const postureRoutes = require("./routes/postureRoutes"); // 자세 측정 라우트


const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS 허용 도메인 목록 (.env에서 콤마 없이 하나만 설정)
const allowedOrigins = process.env.FRONTEND_URL.split(",").map(origin => origin.trim());
console.log(" CORS 허용 Origin 목록:", allowedOrigins);

app.use(
    cors({
        origin: (origin, callback) => {
            console.log(" 요청 Origin:", origin);
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.log(" CORS 차단됨:", origin);
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// ✅ 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// ✅ API 라우트 등록
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/posture", postureRoutes);


app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// ✅ 서버 시작
app.listen(PORT, "0.0.0.0", () => {
    console.log(`로컬 서버 실행 중: http://localhost:${PORT}`);
});
