웹사이트를 만들 때 데이터베이스를 어떤 식으로 관리하면 좋을지 연습하는 프로젝트입니다.

# 작업 현황

이번 목표였던 아이템, 캐릭터, 유저의 관리를 하는 데이터베이스 관련 코드를 prisma를 이용해 작업했습니다.
다만 필수 목표만 간신히 작업하고 그 외의 것들은 작업하지 못한 것이 아쉽습니다.

글자를 하나 작성할 때마다 발생하는 오류가 이유를 알 수 없어서 그 부분을 해결하는 것이 너무 시간이 오래 걸렸습니다.


# 할당 받은 Dns

[할당 주소](http://jemuras1010.shop:5555/api/)

## 사용 코드



## 달성한 것 

- 토큰 발급, 토큰을 통한 로그인 현황 확인

```js
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
```

- 유저의 로그인, 회원가입,
  
|코드|선언|보디|기능|
|---|---|---|---|
|/sign-up|post|{}|회원가입을 한다.|
|/sign-in|get|"name" ,"password"|아이디와 비밀번호를 조회하고 값이 맞다면 로그인을 한다. (토큰을 발급한다.)|

- 캐릭터의 생성, 조회, 수정,삭제 

|코드|선언|보디|기능|
|---|---|---|---|
|/characters|post|"name"|캐릭터 이름을 받고 캐릭터를 만듭니다.|
|/characters|get|{}|전체 캐릭터를 조회합니다. 로그인이 안 되어 있다면 소지금액은 표시되지 않습니다.|
|/characters/:characterId|get|{}|원하는 캐릭터의 정보를 조회한다.|
|/characters/:characterId|patch|||
|/characters/:characterId|delete|{}|params에서 아이디를 받아 삭제한다.|


- 아이템의 생성, 조회

|코드|선언|보디|기능|
|---|---|---|---|
|/items|post|"name","status" ,"ItemPrice" ,"ItemType"|아이템을 조회 후 추가한다.|
|/items|get|{}|전체 아이템을 조회합니다.|
|/items/:itemId|get|{}|원하는 아이템의 정보를 조회한다.|