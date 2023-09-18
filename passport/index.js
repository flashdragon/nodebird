const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const User = require('../models/user');
const redis = require('ioredis');
const dotenv = require('dotenv');

dotenv.config();

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


module.exports = () => {
    passport.serializeUser((user, done) => {
      done(null, user.email);
    });
  
    passport.deserializeUser((email, done) => {
      redisClient.get(`user:${email}`,(err, res)=>{
        if(err){
          console.error(err);
          done(err);
        }else{
          const user = JSON.parse(res);
          done(null, user);
          console.log(`redis에서 유저 데이터 끄내기`);
        }
      });
    });
  
    local();
    kakao();
  };