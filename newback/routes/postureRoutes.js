const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const postureController = require("../controllers/postureController");
const { getDailyPostureChart } = require('../controllers/postureController');

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

// ? 측정 결과 저장
router.post("/save", upload.single("photo"), postureController.savePostureResult);

// ? 측정 이력 조회
router.get("/history", postureController.getPostureHistory);

// ? 최신 측정 결과 조회
router.get("/latest/:userId", postureController.getLatestPosture);

// ? 오늘 요약
router.get('/today-summary', postureController.getTodaySummary);

// ? 날짜별 그래프 데이터
router.get('/daily-chart', getDailyPostureChart);

// ? 날짜별 텍스트 요약 (이게 누락돼 있었음)
router.get('/summary', postureController.getDailySummary);

router.get("/angle-trend", postureController.getAngleTrend);

// ? 연결 확인용 ping
router.get("/ping", (req, res) => {
    res.json({ success: true, message: "pong" });
});

module.exports = router;
