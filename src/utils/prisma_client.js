import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  // Prisma를 이용해 데이터베이스를 접근할 때, SQL을 출력해줍니다.
  log: ['query', 'info', 'warn', 'error'],

  // 에러 메시지를 평문이 아닌, 개발자가 읽기 쉬운 형태로 출력해줍니다.
  errorFormat: 'pretty',
}); // PrismaClient 인스턴스를 생성합니다.

//트랜젝션을 사용한다.
//결과값을 순차적으로 배열에 담겨 변환함
//하나의 트랜잭션을 수행할 수 있는 sequential
// const [posts, comments] = await prisma.$transaction([
//   prisma.posts.findMany(),
//   prisma.comments.findMany()
// ])


// const [Users, userInfos] = await prisma.$transaction([
//   prisma.$queryRaw`select * from Users`,
//   prisma.$queryRaw`select * from UserInfos`
// ])