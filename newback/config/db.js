const mysql = require('mysql2');

const db = mysql.createConnection({
    host: '210.101.236.158', // ✅ 원격 서버 IP
    user: 'kmj',            // ✅ MySQL 사용자 이름
    password: '12',         // ✅ MySQL 비밀번호
    database: 'yarimasu',   // ✅ 사용하려는 데이터베이스 이름
    port: 3306              // ✅ MySQL 기본 포트 (변경 가능)
});


db.connect(err => {
    if (err) {
        console.error("❌ MySQL 연결 실패:", err);
        return;
    }
    console.log("✅ MySQL 연결 성공!");
});

module.exports = db;
