const db = require("../config/database");

// ✅ 측정 결과 저장
const savePostureResult = async (req, res) => {
    try {
        const {
            user_id,
            average_neck_angle,
            max_neck_angle,
            duration,
            best_photo_id,
            worst_photo_id,
            feedback,
            shoulder_status,
            shoulder_diff,
            measured_at
        } = req.body;

        if (!user_id || !best_photo_id || !worst_photo_id) {
            return res.status(400).json({
                success: false,
                message: "❌ user_id 또는 사진 ID가 누락되었습니다."
            });
        }

        const finalMeasuredAt = measured_at || new Date().toISOString();

        const insertQuery = `
      INSERT INTO posture_results (
        user_id, average_neck_angle, max_neck_angle, duration_seconds,
        best_photo_id, worst_photo_id, feedback,
        shoulder_status, shoulder_diff, measured_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const values = [
            user_id,
            average_neck_angle,
            max_neck_angle,
            duration || 0,
            best_photo_id,
            worst_photo_id,
            feedback || '',
            shoulder_status || '',
            shoulder_diff || 0,
            finalMeasuredAt
        ];

        await db.promise().query(insertQuery, values);

        return res.json({ success: true, message: "✅ 측정 결과 저장 완료" });
    } catch (err) {
        console.error("🔥 측정 저장 에러:", err);
        return res.status(500).json({ success: false, message: "서버 오류", error: err.message });
    }
};

// ✅ 날짜별 best/worst 목각도 조회 (Chart용)
const getAngleTrend = async (req, res) => {
    const { user_id, date } = req.query;
    console.log("📌 angle-trend 요청 받음:", user_id, date); // ✅ 로그 찍기


    if (!user_id || !date) {
        return res.status(400).json({ success: false, message: "user_id와 date 필요" });
    }

    try {
        const [rows] = await db.promise().query(
            `SELECT 
         type, neck_angle, uploaded_at 
       FROM cam_photos
       WHERE user_id = ? AND DATE(uploaded_at) = ? AND type IN ('best', 'worst')
       ORDER BY uploaded_at ASC`,
            [user_id, date]
        );

        if (rows.length === 0) {
            return res.json({ success: true, angles: [] });
        }

        const result = rows.map(row => ({
            type: row.type,
            neck_angle: row.neck_angle || 0,
            time: row.uploaded_at
        }));

        return res.json({ success: true, angles: result });
    } catch (err) {
        console.error("❌ best/worst 각도 불러오기 실패:", err);
        return res.status(500).json({ success: false, message: "서버 오류", error: err.message });
    }
};
// ✅ 측정 이력 조회
const getPostureHistory = (req, res) => {
    res.send("📚 측정 이력 반환 테스트");
};

// ✅ 최신 측정 결과
const getLatestPosture = (req, res) => {
    res.send("🆕 최신 결과 테스트");
};

// ✅ 오늘 요약
const getTodaySummary = (req, res) => {
    res.send("📅 오늘 요약 테스트");
};

// ✅ 날짜별 요약
const getDailySummary = (req, res) => {
    res.send("📊 날짜별 요약 테스트");
};

const getDailyPostureChart = (req, res) => {
    res.send("📈 차트용 데이터 반환 테스트");
};

module.exports = {
    savePostureResult,
    getAngleTrend,
    getPostureHistory,
    getLatestPosture,
    getTodaySummary,
    getDailySummary,
    getDailyPostureChart
};