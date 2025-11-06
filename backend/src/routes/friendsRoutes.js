const express = require('express');
const router = express.Router();
const friendsController = require('../controllers/friendsController');
const { protect } = require('../middleware/authMiddleware');

// Follow / Unfollow
router.post('/follow', protect, friendsController.follow);
router.delete('/unfollow/:userId', protect, friendsController.unfollow);

// Lists
router.get('/following', protect, friendsController.getFollowing);
router.get('/followers', protect, friendsController.getFollowers);

// Feed & Congrats
router.get('/feed', protect, friendsController.getFeed);
router.post('/congrats', protect, friendsController.congrats);

module.exports = router;



