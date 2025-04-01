// routes/postureRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const controller = require("../controllers/postureController");

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
const upload = multer({ storage }); // ⬅️ 이 줄 반드시 controller보다 위에 있어야 함!!

// ✅ 라우트
router.post("/save", upload.single("photo"), controller.savePostureResult); // 측정 결과 저장
router.get("/history", controller.getPostureHistory); // 이력 조회

module.exports = router;
