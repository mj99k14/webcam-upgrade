const express = require("express");
const db = require("../config/database");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const uploadBasePath = "/home/yarimasu/kmj1999";

// ? 현재 로그인한 사용자 정보 가져오기
router.get("/me", async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ success: false, message: "email이 필요합니다." });
        }

        const [user] = await db.promise().query("SELECT * FROM kmj_cam WHERE email = ?", [email]);

        if (user.length === 0) {
            return res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
        }

        res.json({ success: true, user: user[0] });
    } catch (error) {
        console.error("? 사용자 정보 조회 중 오류:", error);
        res.status(500).json({ success: false, message: "서버 오류 발생" });
    }
});

// 회원 탈퇴 (사용자 정보 + 사진 + 실제 파일 삭제)
router.delete("/delete/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;

        // 1. 사용자 존재 확인
        const [users] = await db.promise().query("SELECT * FROM kmj_cam WHERE id = ?", [userId]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
        }

        // 2. 해당 사용자의 사진 경로 조회
        const [photos] = await db.promise().query("SELECT photo_url FROM cam_photos WHERE user_id = ?", [userId]);

        // 3. 파일 삭제 시도
        for (const photo of photos) {
            const relativePath = photo.photo_url.replace(/^\/+/, ''); //  앞에 있는 슬래시 여러 개 제거
            const filePath = path.join(uploadBasePath, relativePath);
            try {
                await fs.promises.unlink(filePath); //  비동기 삭제
                console.log("🗑️ 삭제됨:", filePath);
            } catch (err) {
                console.warn("⚠️ 파일 삭제 실패:", filePath, err.message);
            }
        }

        // 4. DB에서 사진 및 사용자 정보 삭제
        await db.promise().query("DELETE FROM cam_photos WHERE user_id = ?", [userId]);
        await db.promise().query("DELETE FROM kmj_cam WHERE id = ?", [userId]);

        // 5. 완료 응답
        res.json({ success: true, message: "회원 탈퇴 완료 (사진 포함)" });

    } catch (error) {
        console.error("❌ 회원 탈퇴 실패:", error);
        res.status(500).json({ success: false, message: "서버 오류 발생" });
    }
});

module.exports = router;


