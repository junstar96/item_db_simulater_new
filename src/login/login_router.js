import express from 'express';
import { prisma } from '../utils/prisma_client.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import UserToken from '../middleware/auth.middlewares.js'
import { Prisma } from '@prisma/client';


const router = express.Router();

// model Users {
//   UserId   String @id @default(uuid()) @map("UserId")
//   name     String @unique @map("name")
//   password String @map("password")

//   UserCharacters UserCharacters[]

//   @@map("Users")
// }

/** 사용자 회원가입 API **/
router.post('/sign-up', async (req, res, next) => {
  try {
    const { name, password } = req.body;
    const isExistUser = await prisma.users.findFirst({
      where: {
        name: name,
      },
    });

    if (isExistUser) {
      return res.status(409).json({ message: '이미 존재하는 아이디입니다.' });
    }

    if (password.length < 6) {
      return res.status(409).json({ message: '비밀번호가 6자리 미만입니다.' });
    }




    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await prisma.$transaction(async (tx) => {
      // Users 테이블에 사용자를 추가합니다.
      const user = await tx.users.create({
        data: {
          name: name,
          password: hashedPassword
        },
      });

      return [user];
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted
    }
    )



    return res.status(201).json({ message: '회원가입이 완료되었습니다.' });
  }
  catch (err) {
    next(err);

  }
});

// src/routes/users.route.js



/** 로그인 API **/
router.get('/sign-in', async (req, res, next) => {
  try {
    const { name, password } = req.body;
    const user = await prisma.users.findFirst({ where: { name: name } });

    if (!user)
      return res.status(401).json({ message: '존재하지 않는 이메일입니다.' });
    // 입력받은 사용자의 비밀번호와 데이터베이스에 저장된 비밀번호를 비교합니다.
    else if (!(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });


    const token = jwt.sign(
      {
        userId: user.UserId,
      },
      process.env.JSONWEBTOKEN_KEY,
    );

    res.cookie('authorization', `Bearer ${token}`);
    res.userId = user.UserId


    return res.status(200).json({ message: `${name} 님의 로그인에 성공했습니다.` });
  }
  catch {
    return res.status(404).json({ message: '로그인 실패' });
  }

});

router.get('/logout', UserToken, async (req, res, next) => {
  const { name, password } = req.body;
  const { userId } = req.userId;
  const user = await prisma.users.findFirst({ where: { name: name } });

  if (!userId) {
    return res.status(200).json({ message: '로그인 성공' });
  }

  if (!user)
    return res.status(401).json({ message: '존재하지 않는 이메일입니다.' });
  // 입력받은 사용자의 비밀번호와 데이터베이스에 저장된 비밀번호를 비교합니다.
  else if (!(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });


  const token = jwt.sign(
    {
      userId: user.UserId,
    },
    process.env.JSONWEBTOKEN_KEY,
  );

  res.cookie('authorization', `Bearer ${token}`);
  res.userId = user.UserId


  return res.status(200).json({ message: '로그인 성공' });
});

// src/routes/users.route.js

/** 사용자 조회 API **/
router.get('/users', UserToken, async (req, res, next) => {
  console.log(req.body);

  const users = await prisma.users.findMany({
    select: {
      userId: true,
      email: true,
      createAt: true,
      updateAt: true,

    },
  });

  return res.status(200).json({ data: "읽기 성공" });
});


export default router;