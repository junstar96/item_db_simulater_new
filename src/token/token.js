import express from 'express'
import jwt from 'jsonwebtoken'

const router = express.Router();

let tokenStorage = {}; // Refresh Token을 저장할 객체

/** Access Token, Refresh Token 발급 API **/
router.post('/tokens', (req, res) => {
    const { id } = req.body;
    const accessToken = createAccessToken(id);
    const refreshToken = createRefreshToken(id);

    // Refresh Token을 가지고 해당 유저의 정보를 서버에 저장합니다.
    tokenStorage[refreshToken] = {
        id: id, // 사용자에게 전달받은 ID를 저장합니다.
        ip: req.ip, // 사용자의 IP 정보를 저장합니다.
        userAgent: req.headers['user-agent'], // 사용자의 User Agent 정보를 저장합니다.
    };

    res.cookie('accessToken', accessToken); // Access Token을 Cookie에 전달한다.
    res.cookie('refreshToken', refreshToken); // Refresh Token을 Cookie에 전달한다.

    return res
        .status(200)
        .json({ message: 'Token이 정상적으로 발급되었습니다.' });
});



router.get('/tokens/validate', (req, res) => {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        return res
            .status(400)
            .json({ errorMessage: 'Access Token이 존재하지 않습니다.' });
    }

    const payload = validateToken(accessToken, process.env.JSONWEBTOKEN_KEY);
    console.log(payload);
    if (!payload) {
        return res
            .status(401)
            .json({ errorMessage: 'Access Token이 유효하지 않습니다.' });
    }

    const { id } = payload;
    return res.json({
        message: `${id}의 Payload를 가진 Token이 성공적으로 인증되었습니다.`,
    });
});

// Token을 검증하고 Payload를 반환합니다.
function validateToken(token, secretKey) {
    try {
        const payload = jwt.verify(token, secretKey);
        return payload;
    } catch (error) {
        return null;
    }
}

// Access Token을 생성하는 함수
function createAccessToken(id) {
    const accessToken = jwt.sign(
        { id: id }, // JWT 데이터
        process.env.JSONWEBTOKEN_KEY, // Access Token의 비밀 키
        { expiresIn: '10s' }, // Access Token이 10초 뒤에 만료되도록 설정합니다.
    );

    return accessToken;
}

// Refresh Token을 생성하는 함수
function createRefreshToken(id) {
    const refreshToken = jwt.sign(
        { id: id }, // JWT 데이터
        process.env.REFRESH_TOKEN_SECRET_KEY, // Refresh Token의 비밀 키
        { expiresIn: '7d' }, // Refresh Token이 7일 뒤에 만료되도록 설정합니다.
    );

    return refreshToken;
}

export default router;