const fs = require("fs");
const express = require("express");
const multer = require("multer");
const db = require("../config/database");
const path = require("path");

const router = express.Router();

// ✅ uploads 폴더 없으면 생성
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ multer 저장 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
router.post("/save", upload.single("photo"), controller.savePostureResult); // 측정 결과 저장
router.get("/history", controller.getPostureHistory); // 자세 이력 조회

const upload = multer({ storage });  // ✅ 누락되지 않게 반드시 선언

// ✅ 사진 업로드 API
router.post("/upload", (req, res) => {
    upload.single("photo")(req, res, async (err) => {
        if (err) {
            console.error("❌ Multer 에러:", err);
            return res.status(500).json({ success: false, message: "파일 업로드 오류" });
        }

        // ✅ 여기서 req.body 로그 찍기
        console.log("✅ req.body:", req.body);
        console.log("✅ req.file:", req.file);

        const user_id = Number(req.body.user_id);
        const neck_angle = parseFloat(req.body.neck_angle);
        const shoulder_angle = parseFloat(req.body.shoulder_angle);
        const filename = req.file?.filename;

        if (!user_id || !filename) {
            return res.status(400).json({ success: false, message: "필수 데이터 없음" });
        }

        const photoUrl = `/uploads/${filename}`;

        try {
            await db.promise().query(
                `INSERT INTO cam_photos (user_id, photo_url, neck_angle, shoulder_angle, uploaded_at)
         VALUES (?, ?, ?, ?, NOW())`,
                [user_id, photoUrl, neck_angle, shoulder_angle]
            );
            res.json({ success: true, message: "업로드 성공", photo_url: photoUrl });
        } catch (error) {
            console.error("❌ DB 저장 오류:", error);
            res.status(500).json({ success: false, message: "DB 오류", error: error.message });
        }
    });
});


// ✅ 특정 사용자 사진 조회
router.get("/", async (req, res) => {
    try {
        const { user_id } = req.query;
        if (!user_id) {
            return res.status(400).json({ success: false, message: "user_id가 필요합니다." });
        }

        const [photos] = await db.promise().query(
            "SELECT * FROM cam_photos WHERE user_id = ? ORDER BY uploaded_at ASC",
            [user_id]
        );

        res.json(photos);
    } catch (error) {
        console.error("❌ 사진 목록 조회 오류:", error);
        res.status(500).json({ success: false, message: "서버 오류" });
    }
});

// ✅ 사진 삭제 API
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [[photo]] = await db.promise().query("SELECT * FROM cam_photos WHERE id = ?", [id]);
        if (!photo) {
            return res.status(404).json({ success: false, message: "사진 없음" });
        }

        // DB에서 삭제
        await db.promise().query("DELETE FROM cam_photos WHERE id = ?", [id]);

        res.json({ success: true, message: "삭제 완료" });
    } catch (error) {
        console.error("❌ 사진 삭제 오류:", error);
        res.status(500).json({ success: false, message: "서버 오류" });
    }
});

module.exports = router;
