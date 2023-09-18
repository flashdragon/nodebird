const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const passport = require('passport');
const redis = require('ioredis');
const RedisStore = require('connect-redis').default;
const {sequelize} = require('./models');


dotenv.config();
const pageRouter = require('./routes/page');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');
const passportConfig = require('./passport');


const app = express();
passportConfig();
app.set('port',process.env.PORT || 8001);
app.set('view engine','html');
nunjucks.configure('views',{
    express:app,
    watch:true,
});

sequelize.sync({force:false})
    .then(()=>{
        console.log('데이터베이스 연결 성공');
    })
    .catch((err)=>{
        console.error(err);
    })


const redisClient = redis.createClient({
    host: process.env.redisHost,
    port: process.env.redisPort,
    password: process.env.redisPassword,
    legacyMode: true,
 });
 redisClient.on('connect', () => {
    console.info('Redis connected!');
 });
 redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
 });


app.use((req,res,next)=>{
    req.redis=redisClient;
    next();
})
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname,'public')));
app.use('/img', express.static(path.join(__dirname,'uploads')));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave:false,
    saveUninitialized:false,
    secret:process.env.COOKIE_SECRET,
    store: new RedisStore({client:redisClient, prefix:'session'}),
    cookie:{
        httpOnly:true,
        secure:false,
    }
}));
app.use(passport.initialize());
app.use(passport.session());


app.use('/', pageRouter);
app.use('/auth', authRouter);
app.use('/post', postRouter);
app.use('/user', userRouter);


app.use((req,res,next)=>{
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status=404;
    next(error);
});

app.use((err,req,res,next)=>{
    res.locals.message=err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

app.listen(app.get('port'),()=>{
    console.log(app.get('port'), '번 포트에서 대기 중');
});
