import express from 'express'
import cookieparser from 'cookie-parser'
import dotenv from 'dotenv'
import loginRouter from './login/login_router.js'
import tokenRouter from './token/token.js'
import characterRouter from './game_data/characters.js'
import itemRouter from './game_data/items.js'

const app = express();
const PORT = 5555;
dotenv.config();

app.use(express.json());
app.use(cookieparser());

app.use('/', [tokenRouter]);
app.use('/api', [loginRouter, characterRouter, itemRouter]);


app.listen(PORT, () => {
    console.log(PORT, '포트로 서버가 열렸어요!');
})