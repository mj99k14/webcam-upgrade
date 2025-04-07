const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const db = require("../config/database");

const router = express.Router();

// ? Google OAuth 로그인 처리
router.post("/google", async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ success: false, message: "인증 코드가 없습니다." });

        console.log("? 인증 코드:", code); // ? 인증 코드 확인

        // ? Google API에 인증 코드 보내서 토큰 받기
        const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", {
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.FRONTEND_URL + "/auth/callback",
            grant_type: "authorization_code",
            code: code,
        });


        console.log("? 토큰 응답:", tokenResponse.data); // ? Google에서 받은 응답 확인
        const { access_token } = tokenResponse.data;

        // ? 토큰을 사용해 사용자 정보 가져오기
        const { data } = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        console.log("? Google 사용자 정보:", data); // ? 사용자 정보 확인

        const { email, name, picture } = data;
        const google_id = data.id;

        // ? DB에서 사용자 확인
        const [existingUsers] = await db.promise().query("SELECT * FROM kmj_cam WHERE email = ?", [email]);
        console.log("? DB 검색 결과:", existingUsers);

        let user_id;
        if (existingUsers.length > 0) {
            user_id = existingUsers[0].id;  // ? 기존 사용자의 user_id 가져오기
        } else {
            console.log("? 신규 사용자: 회원가입 진행");

            const [insertResult] = await db.promise().query(
                "INSERT INTO kmj_cam (name, email, profile_image, google_id, created_at) VALUES (?, ?, ?, ?, NOW())",
                [name, email, picture, google_id]
            );
            user_id = insertResult.insertId;  // ? 새로 생성된 user_id 가져오기
            console.log("? 신규 사용자 등록 완료:", user_id);
        }

        console.log("? 최종 user_id:", user_id);

        // ? JWT 토큰 생성 (user_id 포함)
        console.log("? JWT 토큰 생성 중...");
        const jwtToken = jwt.sign(
            { user_id, email }, // ? user_id 포함!
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        console.log("? JWT 토큰:", jwtToken);

        return res.json({
            success: true,
            token: jwtToken,
            user: { user_id, email, name, picture }
        });

    } catch (error) {
        console.error("? Google 로그인 처리 중 오류:", error);
        return res.status(500).json({ success: false, message: "서버 오류 발생", error: error.message });
    }
});

module.exports = router;
