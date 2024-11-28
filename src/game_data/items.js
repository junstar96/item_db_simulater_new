import express from 'express';
import { prisma } from '../utils/prisma_client.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import UserToken from '../middleware/auth.middlewares.js'
import { Prisma } from '@prisma/client';
import logincheck from '../middleware/login_or_not_login.js'


const router = express.Router();
// model Items {
//   itemId    Int      @id @default(autoincrement()) @map("ItemId")
//   name      Int      @unique @map("name")
//   status    Json     @default("{ \"health\": \"power\" }") @map("status")
//   ItemPrice Int      @default(0) @map("ItemPrice")
//   ItemType  ItemType @default(ingredient) @map("ItemType")
// }

router.post('/items', async (req, res, next) => {
  try {
    const item_data = req.body;
    const isExistItem = await prisma.items.findFirst({
      where: {
        name: item_data.name,
      },
    });

    if (isExistItem) {
      return res.status(409).json({ message: '이미 존재하는 아이템입니다.' });
    }

    
    const result = await prisma.$transaction(async (tx) => {
      // Users 테이블에 사용자를 추가합니다.
      const user = await tx.items.create({
        data: {
          ...item_data
        },
      });

      return [user];
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted
    }
    )

    



    return res.status(201).json({ message: result });
  }
  catch (err) {
    return res.status(404).json({ message: "아이템 추가에 오류" });

  }
});

// src/routes/users.route.js



/** 아이템 수정 **/
router.patch('/items/:itemId', async (req, res, next) => {
  const { itemId } = req.params;
  const check_body = req.body;
  const items = await prisma.items.findFirst({ where: { itemId: +itemId } });

  if (!items)
    return res.status(401).json({ message: '존재하지 않는 아이템입니다.' });
  // 입력받은 사용자의 비밀번호와 데이터베이스에 저장된 비밀번호를 비교합니다.

  const changedItem = await prisma.items.update({
    data: {
      ...check_body
    },
    where: {
      itemId: items.itemId
    }
  })




  return res.status(201).json({ message: '로그인 성공' });
});


// src/routes/users.router.js

/** 사용자 정보 변경 API **/
router.patch('/users/', UserToken, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const updatedData = req.body;

    const userInfo = await prisma.userInfos.findFirst({
      where: { userId: +userId },
    });

    await prisma.$transaction(
      async (tx) => {
        // 트랜잭션 내부에서 사용자 정보를 수정합니다.
        await tx.userInfos.update({
          data: {
            ...updatedData,
          },
          where: {
            userId: userInfo.userId,
          },
        });

        // 변경된 필드만 UseHistories 테이블에 저장합니다.
        for (let key in updatedData) {
          if (userInfo[key] !== updatedData[key]) {
            await tx.userHistories.create({
              data: {
                userId: userInfo.userId,
                changedField: key,
                oldValue: String(userInfo[key]),
                newValue: String(updatedData[key]),
              },
            });
          }
        }
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      },
    );

    return res
      .status(200)
      .json({ message: '사용자 정보 변경에 성공하였습니다.' });
  } catch (err) {
    next(err);
  }
});


export default router;