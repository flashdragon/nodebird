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
        const delGood = await Good.destroy({where:{postId:req.body.postId}});
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
                userId:userId,
                postId:postId,
            }});
            if(exGood){
                const del = await Good.destroy({where:{
                    userId:userId,
                    postId:postId,
                }});
                const down = await Post.decrement({good:1},{where:{id:postId}});
            }else{
                const create = await Good.create({
                    userId:userId,
                    postId:postId,
                });
                const up = await Post.increment({good:1},{where:{id:postId}});
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