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
  try
  {
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




  return res.status(201).json({ data: changedItem });
  }
  catch (err)
  {
    return res.status(404).json({errormessage : err})
  }
  
});


// src/routes/users.router.js

/** 아이템 전체 조회 **/
router.get('/items', async (req, res, next) => {
  try {
    const item_list = await prisma.items.findMany({
      select : {
        itemId : true,
        name : true,
        ItemPrice : true,
        ItemType : true,

      }
    })

    return res
      .status(200)
      .json({ data : item_list });
  } catch (err) {
    next(err);
  }
});

router.get('/items/:itemid', async (req, res, next) => {
  try {
    const {itemid} = req.params;
    const item_list = await prisma.items.findFirst({
      select : {
        itemId : true,
        name : true,
        ItemPrice : true,
        ItemType : true,

      },
      where : {
        itemId : +itemid
      }
    })

    return res
      .status(200)
      .json({ data : item_list });
  } catch (err) {
    return res
      .status(404)
      .json({ errormessage : err });
  }
});




export default router;