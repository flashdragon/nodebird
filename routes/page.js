const express = require('express');
const router = express.Router();
const {renderProfile, renderJoin, renderMain, renderHashtag, renderEdit }=require('../controllers/page');
const { isLoggedIn, isNotLoggedIn } = require('../middlewares');


router.use((req,res,next)=>{
    res.locals.user=req.user;
    res.locals.followerCount=req.user?.Followers?.length || 0;
    res.locals.followingCount=req.user?.Followings?.length || 0;
    res.locals.followingIdList=req.user?.Followings?.map(f=>f.id) || [];
    next();
});



router.get('/profile', isLoggedIn, renderProfile);
router.get('/join', isNotLoggedIn, renderJoin);
router.get('/', renderMain);
router.get('/hashtag', renderHashtag);
router.get('/edit', isLoggedIn, renderEdit);

module.exports=router;