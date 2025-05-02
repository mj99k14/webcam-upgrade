// ✅ routes/photoRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../config/database");

const router = express.Router();
const uploadBasePath = "/home/yarimasu/kmj1999";
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// ✅ 사진 업로드 API (단일)
router.post("/upload", (req, res) => {
    upload.single("photo")(req, res, async (err) => {
        if (err) return res.status(500).json({ success: false, message: "파일 업로드 오류" });

        const { user_id, neck_angle, type, shoulder_status, shoulder_diff } = req.body;
        const filename = req.file?.filename;
        if (!user_id || !filename) return res.status(400).json({ success: false, message: "필수 데이터 없음" });

        const photoUrl = `/uploads/${filename}`;
        const neck = parseFloat(neck_angle) || 0;
        const cleanType = (type || '').trim().toLowerCase();
        const photoType = ['best', 'worst', 'normal'].includes(cleanType) ? cleanType : 'normal';

        try {
            const [result] = await db.promise().query(
                `INSERT INTO cam_photos (user_id, photo_url, neck_angle, uploaded_at, type, shoulder_status, shoulder_diff)
                 VALUES (?, ?, ?, NOW(), ?, ?, ?)`,
                [Number(user_id), photoUrl, neck, photoType, shoulder_status || '', parseFloat(shoulder_diff) || 0]
            );
            res.json({ success: true, message: "업로드 성공", photo_url: photoUrl, photo_id: result.insertId });
        } catch (error) {
            res.status(500).json({ success: false, message: "DB 오류", error: error.message });
        }
    });
});

// ✅ 사진 업로드 API (best/worst 한쌍)
router.post("/upload-pair", upload.fields([
    { name: "best", maxCount: 1 },
    { name: "worst", maxCount: 1 }
]), async (req, res) => {
    try {
        const {
            user_id, best_angle, worst_angle,
            best_shoulder_status, worst_shoulder_status,
            best_shoulder_diff, worst_shoulder_diff
        } = req.body;

        const best = req.files.best?.[0];
        const worst = req.files.worst?.[0];
        if (!user_id || (!best && !worst)) return res.status(400).json({ success: false, message: "필수 데이터 누락" });

        const results = [];

        if (best) {
            const bestUrl = `/uploads/${best.filename}`;
            const angle = parseFloat(best_angle) || 0;
            const [result] = await db.promise().query(
                `INSERT INTO cam_photos (user_id, photo_url, neck_angle, uploaded_at, type, shoulder_status, shoulder_diff)
                 VALUES (?, ?, ?, NOW(), ?, ?, ?)`,
                [user_id, bestUrl, angle, 'best', best_shoulder_status || '', parseFloat(best_shoulder_diff) || 0]
            );
            results.push({ type: 'best', photo_id: result.insertId });
        }

        if (worst) {
            const worstUrl = `/uploads/${worst.filename}`;
            const angle = parseFloat(worst_angle) || 0;
            const [result] = await db.promise().query(
                `INSERT INTO cam_photos (user_id, photo_url, neck_angle, uploaded_at, type, shoulder_status, shoulder_diff)
                 VALUES (?, ?, ?, NOW(), ?, ?, ?)`,
                [user_id, worstUrl, angle, 'worst', worst_shoulder_status || '', parseFloat(worst_shoulder_diff) || 0]
            );
            results.push({ type: 'worst', photo_id: result.insertId });
        }

        res.json({ success: true, message: "업로드 완료", results });
    } catch (err) {
        res.status(500).json({ success: false, message: "서버 오류", error: err.message });
    }
});

// ✅ 사진 목록
router.get("/", async (req, res) => {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ success: false, message: "user_id가 필요합니다." });
    try {
        const [photos] = await db.promise().query(
            "SELECT * FROM cam_photos WHERE user_id = ? ORDER BY uploaded_at ASC",
            [user_id]
        );
        res.json(photos);
    } catch (error) {
        res.status(500).json({ success: false, message: "서버 오류" });
    }
});

// ✅ 타입별 사진 필터
router.get("/filter", async (req, res) => {
    const { user_id, type } = req.query;
    if (!user_id || !type) return res.status(400).json({ success: false, message: "user_id 또는 type이 누락됨" });
    try {
        const [rows] = await db.promise().query(
            `SELECT * FROM cam_photos WHERE user_id = ? AND type = ? ORDER BY uploaded_at DESC`,
            [user_id, type]
        );
        res.json({ success: true, photos: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: "DB 오류", error: err.message });
    }
});

// ✅ 날짜별 그룹
router.get("/grouped-by-date", async (req, res) => {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ success: false, message: "user_id 필요" });
    try {
        const [rows] = await db.promise().query(
            `SELECT id, photo_url, neck_angle, uploaded_at, type, shoulder_status, shoulder_diff, DATE(uploaded_at) as date
             FROM cam_photos
             WHERE user_id = ? AND type IN ('best', 'worst')
             ORDER BY uploaded_at DESC`,
            [user_id]
        );

        const grouped = {};
        for (const photo of rows) {
            const date = photo.date;
            if (!grouped[date]) grouped[date] = { best: [], worst: [] };
            if (photo.type === 'best') grouped[date].best.push(photo);
            if (photo.type === 'worst') grouped[date].worst.push(photo);
        }
        res.json({ success: true, grouped });
    } catch (err) {
        res.status(500).json({ success: false, message: "DB 오류", error: err.message });
    }
});


// ✅ 사진 삭제 + 연결된 측정 결과(posture_results)도 같이 삭제
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [[photo]] = await db.promise().query(
            "SELECT * FROM cam_photos WHERE id = ?",
            [id]
        );
        if (!photo) return res.status(404).json({ success: false, message: "사진 없음" });

        // 📁 실제 파일 삭제
        const relativePath = photo.photo_url.replace(/^\/+/, '');
        const filePath = path.join(uploadBasePath, relativePath);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log("🗑️ 파일 삭제:", filePath);
        }

        // ✅ posture_results에서 연결된 best/worst 사진만 NULL 처리
        await db.promise().query(
            `UPDATE posture_results SET best_photo_id = NULL WHERE best_photo_id = ?`,
            [id]
        );
        await db.promise().query(
            `UPDATE posture_results SET worst_photo_id = NULL WHERE worst_photo_id = ?`,
            [id]
        );

        // ✅ cam_photos 삭제
        await db.promise().query("DELETE FROM cam_photos WHERE id = ?", [id]);

        res.json({ success: true, message: "📸 사진 및 연동 해제 완료" });

    } catch (error) {
        console.error("🚨 삭제 오류:", error);
        res.status(500).json({ success: false, message: "서버 오류" });
    }
});


module.exports = router;
