import express from 'express';
import { prisma } from '../utils/prisma_client.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import UserToken from '../middleware/auth.middlewares.js'
import logincheck from '../middleware/login_or_not_login.js'
import { Prisma } from '@prisma/client';


// model UserCharacters {
//     charId    Int      @id @default(autoincrement()) @map("charId")
//     UserId    String   @map("UserId")
//     name      String   @unique @map("name")
//     level     Int      @map("level")
//     status    Json     @default("{ \"health\": \"power\" }") @map("status")
//     money     Int      @default(0) @map("money")
//     createdAt DateTime @default(now()) @map("createdAt")

//     user Users @relation(fields: [UserId], references: [UserId], onDelete: Cascade)

//     @@map("UserCharacters")
//   }
const router = express.Router();

/** 캐릭터 생성 **/
router.post('/characters', UserToken, async (req, res, next) => {
  try {
    const { name, status } = req.body;
    const userId = req.userId;
    console.log(userId);

    const isExistCharacter = await prisma.userCharacters.findFirst({
      where: {
        name: name,
      },
    });

    if (isExistCharacter) {
      return res.status(409).json({ message: '이미 존재하는 캐릭터입니다.' });
    }



    const result_character = await prisma.$transaction(async (tx) => {
      const character = await tx.userCharacters.create({
        data: {
          name: name,
          level: 1,
          status: { health: 500, power: 100 },
          money: 10000,
          user: {
            connect: {
              UserId: userId
            }
          }
        }
      });

      return [character]
    },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted
      })



    return res.status(201).json({ data: result_character });
  }
  catch (err) {
    return res.status(404).json({ message: '캐릭 생성 불가능', errormessage: err });


  }
});

// src/routes/users.route.js



// /** 캐릭터 삭제 **/
router.delete('/characters/:characterId', UserToken, async (req, res, next) => {
  try {
    const { characterId } = req.params;
    const userId = req.userId;



    const user = await prisma.userCharacters.findFirst({ where: { UserId: userId, charId: +characterId } });

    if (!user)
      return res.status(401).json({ message: '존재하지 않는 캐릭터입니다.' });


    const deletechar = await prisma.userCharacters.delete({
      where: {
        charId: +user.charId
      }
    })



    return res.status(200).json({ message: '캐릭터 삭제', "삭제된 캐릭터": deletechar });
  }
  catch (err) {

  }
});

// // src/routes/users.route.js

// /** 캐릭터 상세 조회 API **/
router.get('/characters/:characterId', logincheck, async (req, res, next) => {
  try {
    const { characterId } = req.params;
    const islogin = req.islogin;

    const characterlist = await prisma.userCharacters.findFirst({
      where: {
        charId: +characterId
      },
      select: {
        name: true,
        level: true,
        status: true,
        money: islogin,
      }

    })

    return res.status(200).json({ data: characterlist });
  }
  catch (err) {
    return res.status(404).json({ data: err });
  }

});

//캐릭터 전체 조회
router.get('/characters', logincheck, async (req, res, next) => {
  try {
    const islogin = req.islogin;
    console.log(islogin);

    const characterlist = await prisma.userCharacters.findMany({
      select: {
        name: true,
        level: true,
        status: true,
        money: islogin,
      }
    })

    return res.status(200).json({ data: characterlist });
  }
  catch (err) {
    return res.status(200).json({ data: err });
  }

});

router.patch('/characters/:characterId', UserToken, async (req, res, next) => {
  try {
    const { userId } = req.userId;
    const updatedData = req.body;
    const { characterId } = req.params;

    const characterInfo = await prisma.userCharacters.findFirst({
      where: { UserId: userId, charId: +characterId },
    });

    const updated = await prisma.$transaction(
      async (tx) => {
        // 트랜잭션 내부에서 사용자 정보를 수정합니다.
        return [await tx.userCharacters.update({
          data: {
            ...updatedData,
          },
          where: {
            userId: characterInfo.userId,
            charId: +characterId,
          },
        })];

        // 변경된 필드만 UseHistories 테이블에 저장합니다.
        // for (let key in updatedData) {
        //   if (userInfo[key] !== updatedData[key]) {
        //     await tx.userHistories.create({
        //       data: {
        //         userId: userInfo.userId,
        //         changedField: key,
        //         oldValue: String(userInfo[key]),
        //         newValue: String(updatedData[key]),
        //       },
        //     });
        //   }
        // }

      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      },
    );

    return res
      .status(200)
      .json({ message: updated });
  } catch (err) {
    return res
      .status(404)
      .json({ message: "캐릭터 정보 수정이 안 되었습니다." });
  }
});

router.patch('/characters/:characterId/get_money', logincheck, async (req, res, next) => {
  try {
    const {userId} = req.userId;
    const { characterId } = req.params;
    const { money } = req.body;
    const islogin = req.islogin;
    
    if(!islogin)
    {
      return res.status(404).json({error : "로그인 안 됨."})
    }

    const findcharacter = await prisma.userCharacters.findFirst({
      where: {
        charId: +characterId
      }
    });
    console.log(characterId)
    console.log(money);
    console.log(userId)

    if (findcharacter) {
      throw new Error("오류 발생");
    }

    console.log("확인")

    const updated = await prisma.userCharacters.update({
      where: {
        UserId: userid,
        charId: characterId
      },
      data: {
        money: (findcharacter.money + Number(money))
      }
    })

    console.log("확인")

    return res
      .status(200)
      .json({ data: updated });
  }
  catch (err) {
    return res
      .status(404)
      .json({ message: "캐릭터 정보 수정이 안 되었습니다." });
  }


})



export default router;