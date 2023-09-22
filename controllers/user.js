const User = require('../models/user');
const { follow, unfollow } = require('../services/user');

exports.follow = async (req, res, next) => {
    try{
        const result = await follow(req.user.id, req.params.id);
        if(result === 'ok'){
            res.send('success');
        }else if(result === 'no user'){
            res.status(404).send('no user');
        }
    }catch(error){
        console.error(error);
        next(error);
    }
};

exports.unfollow = async (req, res, next) => {
    try{
        const result = await unfollow(req.user.id, req.params.id);
        if(result === 'ok'){
            res.send('success');
        }else if(result === 'no user'){
            res.status(404).send('no user');
        }
    }catch(error){
        console.error(error);
        next(error);
    }
};