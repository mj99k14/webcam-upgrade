// controllers/postureController.js
const db = require("../config/database");
const fs = require("fs");
const path = require("path");

exports.savePostureResult = async (req, res) => {
    try {
        const userId = req.body.user_id;
        const neckAngle = parseFloat(req.body.neck_angle);
        const photo = req.file;

        if (!userId || !neckAngle || !photo) {
            return res.status(400).json({ success: false, message: "필수 데이터 누락" });
        }

        const photoUrl = `/uploads/${photo.filename}`;
        const sql = `INSERT INTO cam_photos (user_id, photo_url, neck_angle, uploaded_at) VALUES (?, ?, ?, NOW())`;
        await db.promise().query(sql, [userId, photoUrl, neckAngle]);

        res.json({ success: true, message: "자세 결과 저장 완료" });
    } catch (err) {
        console.error("❌ 저장 중 오류:", err);
        res.status(500).json({ success: false, message: "서버 오류" });
    }
};

exports.getPostureHistory = async (req, res) => {
    try {
        const userId = req.query.user_id;
        if (!userId) {
            return res.status(400).json({ success: false, message: "user_id 필요" });
        }

        const [rows] = await db.promise().query(
            `SELECT photo_url, neck_angle, uploaded_at 
       FROM cam_photos 
       WHERE user_id = ? 
       ORDER BY uploaded_at DESC`,
            [userId]
        );

        res.json({ success: true, history: rows });
    } catch (err) {
        console.error("❌ 이력 조회 오류:", err);
        res.status(500).json({ success: false, message: "서버 오류" });
    }
};
