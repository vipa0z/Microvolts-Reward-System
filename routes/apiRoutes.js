const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth')
const configController = require("../controllers/configController")
const wheelController = require('../controllers/referal_wheel');
const authController = require("../controllers/authController")
const {authMiddleware } = require('../middlewares/auth');

// const hourlyRewardsController = require('../controllers/hourlyRewardsController');
// const achievementController = require('../controllers/achievementController');
// auth routes
router.post('/login',authController.login)
// for admins
router.post('/config/wheel', authMiddleware, configController.configureItems('wheel_items'));
router.post('/config/shop', authMiddleware, configController.configureItems('shop_items'));
router.post('/config/hourly', authMiddleware, configController.configureItems('hourly_items'));
router.post('/config/achievements', authMiddleware, configController.configureItems('achievement_items'));

// wheel
router.post('/wheel/draw',authMiddleware, wheelController.drawWheel);
router.get('/wheel/items', authMiddleware, wheelController.getWheelItems);







module.exports = router;