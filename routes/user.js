const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middlewares');
const { follow, unfollow } = require('../controllers/user');

router.post('/:id/follow', isLoggedIn, follow);

router.post('/:id/unfollow', isLoggedIn, unfollow);

module.exports = router;