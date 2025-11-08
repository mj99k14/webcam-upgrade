const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET || "your_jwt_secret";

const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    console.log("?? 받은 Authorization 헤더:", authHeader);

    if (!authHeader) {
        return res.status(401).json({ success: false, message: "토큰이 없습니다." });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ success: false, message: "잘못된 인증 형식입니다." });
    }

    try {
        const decoded = jwt.verify(token, secret);
        console.log("? JWT 디코딩 결과:", decoded);

        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: "유효하지 않은 토큰입니다." });
    }
};

module.exports = verifyToken;
