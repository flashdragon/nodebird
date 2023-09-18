const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

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
  passport.use(new LocalStrategy({
    usernameField: 'email', //req.body.email
    passwordField: 'password', //req.body.password
    passReqToCallback: false,
  }, async (email, password, done) => {
    try {
      const exUser = await redisClient.get(`user:${email}`);
      if (exUser) {
        user=JSON.parse(exUser);
        const result = await bcrypt.compare(password, user.password);
        if (result) {
          done(null, user);
        } else {
          done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
        }
      } else {
        done(null, false, { message: '가입되지 않은 회원입니다.' });
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  }));
};