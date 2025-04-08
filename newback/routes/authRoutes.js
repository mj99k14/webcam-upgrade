const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const qs = require("qs"); // 꼭 필요!
const db = require("../config/database");

const router = express.Router();

router.post("/google", async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ success: false, message: "인증 코드가 없습니다." });
        }

        console.log("✅ 인증 코드:", code);
        console.log("✅ redirect_uri:", process.env.FRONTEND_URL + "/auth/callback");

        // ✅ 토큰 요청
        const tokenResponse = await axios.post(
            "https://oauth2.googleapis.com/token",
            qs.stringify({
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: process.env.GOOGLE_REDIRECT_URI, // ✅ 바로 이거!
                grant_type: "authorization_code",
                code: code,
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );


        console.log("✅ 토큰 응답:", tokenResponse.data);
        const { access_token } = tokenResponse.data;

        // ✅ 사용자 정보 요청
        const { data } = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        console.log("✅ 사용자 정보:", data);
        const { email, name, picture } = data;
        const google_id = data.id;

        // ✅ DB 확인 또는 삽입
        const [existingUsers] = await db.promise().query("SELECT * FROM kmj_cam WHERE email = ?", [email]);
        let user_id;

        if (existingUsers.length > 0) {
            user_id = existingUsers[0].id;
        } else {
            const [insertResult] = await db.promise().query(
                "INSERT INTO kmj_cam (name, email, profile_image, google_id, created_at) VALUES (?, ?, ?, ?, NOW())",
                [name, email, picture, google_id]
            );
            user_id = insertResult.insertId;
        }

        // ✅ JWT 발급
        const jwtToken = jwt.sign({ user_id, email }, process.env.JWT_SECRET, { expiresIn: "1h" });

        return res.json({
            success: true,
            token: jwtToken,
            user: { user_id, email, name, picture },
        });
    } catch (error) {
        console.error("❌ Google 로그인 처리 오류:", error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            message: "서버 오류 발생",
            error: error.message,
        });
    }
});

module.exports = router;
