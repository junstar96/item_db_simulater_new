// src/middlewares/auth.middleware.js

import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma_client.js';



export default async function (req, res, next) {
  try {
    const { authorization } = req.cookies;
    if (!authorization) {
      req.islogin = false;
      next();
    }
    console.log(authorization);

    const [tokenType, token] = authorization.split(' ');


    if (tokenType !== 'Bearer') {
      req.islogin = false;
      return next();
    }

    if (!token)
    {
      req.islogin = false;
      return next();
    }


    const decodedToken = jwt.verify(token, process.env.JSONWEBTOKEN_KEY);

    const userId = decodedToken.userId;



    const user = await prisma.users.findFirst({
      where: { UserId: userId },
    });
    if (!user) {
      req.islogin = false;
      return next();
    }




    // req.user에 사용자 정보를 저장합니다.
    
    req.islogin = true;
    return next();
  } catch (error) {
    res.clearCookie('authorization');
    //return res.status(400).json({message : error.message});

    //토큰이 만료되었거나, 조작되었을 때, 에러 메시지를 다르게 출력합니다.
    switch (error.name) {
      case 'TokenExpiredError':
        return res.status(401).json({ message: '토큰이 만료되었습니다.' });
      case 'JsonWebTokenError':
        return res.status(401).json({ message: '토큰이 조작되었습니다.' });
      default:
        return res
          .status(401)
          .json({ message: error.message ?? '오류 확인좀' });
    }
  }
}