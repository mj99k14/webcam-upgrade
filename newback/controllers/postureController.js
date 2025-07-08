const db = require("../config/database");
const path = require("path");
const fs = require("fs");

// 측정 결과 저장
const savePostureResult = async (req, res) => {
    try {
        const user_id = req.user.user_id; //  토큰에서 추출
        const {
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

        if (!best_photo_id || !worst_photo_id) {
            return res.status(400).json({
                success: false,
                message: "❌ 사진 ID가 누락되었습니다."
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

const getAngleTrend = async (req, res) => {
    const user_id = req.user.user_id;
    const { date } = req.query;
    console.log("📌 angle-trend 요청 받음:", user_id, date);

    if (!date) {
        return res.status(400).json({ success: false, message: "date 필요" });
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

const getPostureHistory = async (req, res) => {
    const user_id = req.user.user_id;

    try {
        const [rows] = await db.promise().query(
            `SELECT 
                id, average_neck_angle, max_neck_angle, duration_seconds,
                best_photo_id, worst_photo_id, feedback, shoulder_status, shoulder_diff, measured_at
             FROM posture_results
             WHERE user_id = ?
             ORDER BY measured_at DESC`,
            [user_id]
        );

        return res.json({ success: true, history: rows });
    } catch (err) {
        console.error("❌ 측정 이력 조회 실패:", err);
        return res.status(500).json({ success: false, message: "서버 오류", error: err.message });
    }
};

const getLatestPosture = async (req, res) => {
    const user_id = req.user.user_id;

    try {
        const [rows] = await db.promise().query(
            `SELECT * FROM posture_results WHERE user_id = ? ORDER BY measured_at DESC LIMIT 1`,
            [user_id]
        );

        return res.json({ success: true, data: rows[0] || null });
    } catch (err) {
        console.error("❌ 최신 결과 조회 실패:", err);
        return res.status(500).json({ success: false, message: "서버 오류" });
    }
};

const getTodaySummary = async (req, res) => {
    const user_id = req.user.user_id;

    try {
        const [rows] = await db.promise().query(
            `SELECT 
             AVG(average_neck_angle) as avg_neck_angle,
             MAX(max_neck_angle) as max_neck_angle,
             COUNT(*) as count,
             AVG(shoulder_diff) as avg_shoulder_diff
             FROM posture_results
             WHERE user_id = ? AND DATE(COALESCE(measured_at, created_at)) = CURDATE()`,
            [user_id]
        );

        const data = rows[0];
        if (!data || data.count === null || data.count === 0) {
            return res.json({ success: true, data: null });
        }

        const result = {
            averageNeckAngle: data.avg_neck_angle,
            maxNeckAngle: data.max_neck_angle,
            shoulderStatus: data.avg_shoulder_diff > 10 ? "비대칭" : "정상"
        };

        res.json({ success: true, data: result });
    } catch (err) {
        console.error("🔥 getTodaySummary 서버 오류:", err);
        res.status(500).json({ success: false, message: "서버 오류", error: err.message });
    }
};

const getDailySummary = async (req, res) => {
    const user_id = req.user.user_id;

    try {
        const [rows] = await db.promise().query(
            `SELECT 
             DATE(measured_at) as date,
             AVG(average_neck_angle) as avg_neck_angle,
             MAX(max_neck_angle) as max_neck_angle,
             AVG(shoulder_diff) as avg_shoulder_diff
             FROM posture_results
             WHERE user_id = ?
             GROUP BY DATE(measured_at)
             ORDER BY date DESC
             LIMIT 7`,
            [user_id]
        );

        const summaries = rows.map(row => ({
            date: row.date,
            neckAngle: row.avg_neck_angle,
            shoulderStatus: row.avg_shoulder_diff > 10 ? "비대칭" : "정상"
        }));

        res.json({ success: true, data: summaries });
    } catch (err) {
        console.error("❌ 날짜별 요약 실패:", err);
        res.status(500).json({ success: false, message: "서버 오류" });
    }
};

const getDailyPostureChart = (req, res) => {
    res.send("📈 차트용 데이터 반환 테스트");
};

const deletePhoto = async (req, res) => {
    const photoId = req.params.id;
    const user_id = req.user.user_id;

    try {
        const [rows] = await db.promise().query('SELECT photo_url, user_id FROM cam_photos WHERE id = ?', [photoId]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: '사진을 찾을 수 없습니다.' });
        if (rows[0].user_id !== user_id) return res.status(403).json({ success: false, message: '권한이 없습니다.' });

        const photoPath = path.join(__dirname, '..', rows[0].photo_url);

        if (fs.existsSync(photoPath)) {
            fs.unlinkSync(photoPath);
        }

        await db.promise().query('DELETE FROM cam_photos WHERE id = ?', [photoId]);

        res.json({ success: true, message: '사진이 삭제되었습니다.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '삭제 중 오류가 발생했습니다.' });
    }
};

module.exports = {
    savePostureResult,
    getAngleTrend,
    getPostureHistory,
    getLatestPosture,
    getTodaySummary,
    getDailySummary,
    getDailyPostureChart,
    deletePhoto
};