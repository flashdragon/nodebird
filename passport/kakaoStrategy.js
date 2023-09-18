const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;

const User = require('../models/user');
const dotenv = require('dotenv');
const redis = require('ioredis');
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
  passport.use(new KakaoStrategy({
    clientID: process.env.KAKAO_ID,
    callbackURL: '/auth/kakao/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const exUser = await redisClient.get(`user:${profile._json?.kakao_account?.email}`);
      if (exUser) {
        const user = JSON.parse(exUser);
        done(null, user);
      } else {
        const newUser = await User.create({
          email: profile._json?.kakao_account?.email,
          nick: profile.displayName,
          snsId: profile.id,
          provider: 'kakao',
        });
        redisClient.set(`user:${newUser.email}`,JSON.stringify(newUser),(err)=>{
          if(err){
            console.error(err);
          }else{
            console.log(`redis에 ${newUser.id}번 유저 넣기 성공`);
          }
        });
        done(null, newUser);
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  }));
};