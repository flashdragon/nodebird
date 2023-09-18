const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/user');

exports.join = async (req, res, next) => {
  const { email, nick, password } = req.body;
  let redisClient=req.redis;
  try {
    const exUser = await redisClient.get(`user:${email}`);
    if (exUser) {
      return res.redirect('/join?error=exist');
    }
    const hash = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      email,
      nick,
      password: hash,
    });
    redisClient.set(`user:${newUser.email}`,JSON.stringify(newUser),(err)=>{
      if(err){
        console.error(err);
      }else{
        console.log(`redis에 ${newUser.id}번 유저 넣기 성공`);
      }
    });
    return res.redirect('/');
  } catch (error) {
    console.error(error);
    return next(error);
  }
}

exports.login = (req, res, next) => {
  passport.authenticate('local', (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.redirect(`/?error=${info.message}`);
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect('/');
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
};

exports.logout = (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
};

exports.edit = async (req, res) => {
  const { email, nick, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 12); 
    const exUser = await User.update({
      nick,
      password: hash,
    },{ 
      where: { email } 
    });
    return res.redirect('/');
  } catch (error) {
    console.error(error);
    return next(error);
  }
};