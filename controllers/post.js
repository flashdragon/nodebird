const Post = require('../models/post');
const User = require('../models/user');
const Hashtag = require('../models/hashtag');
const Good = require('../models/good');

exports.afterUploadImage = (req, res) => {
    console.log(req.file);
    res.json({url: `/img/${req.file.filename}`});
};


exports.uploadPost = async (req, res, next) => {
    try{
        const post = await Post.create({
            content: req.body.content,
            img: req.body.url,
            UserId: req.user.id,
        });
        const hashtags = req.body.content.match(/#[^\s#]*/g);
        if(hashtags){
            const result = await Promise.all(hashtags.map((tag) => {
                return Hashtag.findOrCreate({
                    where:{title: tag.slice(1).toLowerCase()}
                });
            }));
            console.log('result', result);
            await post.addHashtags(result.map(r => r[0]));
        }
        res.redirect('/');
    }catch(error){
        console.error(error);
        next(error);
    }
};


exports.deletePost = async (req, res, next) => {
    try{
        const del = await Post.destroy({where:{ id: req.body.postId}});
        if(del){
            res.redirect('/');
        }
    }catch(error){
        console.error(error);
        next(error);
    }
};


exports.goodPost = async (req, res, next) => {
    try{
        const {userId,postId}=req.body;
        const user = await User.findOne({where:{id:userId}});
        if(user){
            const exGood = await Good.findOne({where:{
                user:userId,
                post:postId,
            }});
            const post= await Post.findOne({
                where:{id:postId}
            });
            if(exGood){
                Good.destroy({where:{
                    user:userId,
                    post:postId,
                }});
                const down = await Post.update({
                    good:post.good-1
                },{
                    where:{id:postId}
                });
            }else{
                Good.create({
                    user:userId,
                    post:postId,
                });
                const up = await Post.update({
                    good:post.good+1
                },{
                    where:{id:postId}
                });
            }
            res.redirect('/');
        }else{
            res.status(404).send('no user');
        }
    }catch(error){
        console.error(error);
        next(error);
    }
};