const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const postureController = require("../controllers/postureController");
const { getDailyPostureChart } = require('../controllers/postureController');
const verifyToken = require("../middleware/auth"); // ? JWT 인증 미들웨어 추가

const router = express.Router();

// uploads 폴더 없으면 생성
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// multer 저장 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

//  보호된 API들에 verifyToken 미들웨어 추가
router.post("/save", verifyToken, upload.single("photo"), postureController.savePostureResult);

router.get("/history", verifyToken, postureController.getPostureHistory);
router.get("/latest/:userId", verifyToken, postureController.getLatestPosture);
router.get("/summary/today", verifyToken, postureController.getTodaySummary);
router.get("/summary", verifyToken, postureController.getDailySummary);
router.get("/daily-chart", verifyToken, getDailyPostureChart);
router.get("/angle-trend", verifyToken, postureController.getAngleTrend);

//  ping은 인증 없이 허용
router.get("/ping", (req, res) => {
    res.json({ success: true, message: "pong" });
});

module.exports = router;
