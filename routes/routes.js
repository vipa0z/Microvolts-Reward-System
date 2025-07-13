const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')
const configController = require("../controllers/configController")
const wheelController = require('../controllers/referal_wheel');
// const hourlyRewardsController = require('../controllers/hourlyRewardsController');
// const achievementController = require('../controllers/achievementController');



// --- Route Definitions ---
// these are dev tags and will not be interpreted by the server (for documentation porpuses)
/**
 * @route   POST /api/rewards/draw-wheel
 * @desc    Performs a wheel draw for the authenticated user.
 * @access  Private
 */
// for peasants
router.post('/rewards/draw-wheel',auth, wheelController.drawWheel);

// for admins
router.post('/configure/wheel', auth, configController.configureItems('wheel_items'));
router.post('/configure/shop', auth, configController.configureItems('shop_items'));
router.post('/configure/hourly', auth, configController.configureItems('hourly_items'));
router.post('/configure/achievement', auth, configController.configureItems('achievement_items'));

/**
 * @route   POST /api/hourly-rewards/draw
 * @desc    Claims the hourly reward for the authenticated user.
 * @access  Private
 */
// router.post('/hourly-rewards/draw', hourlyRewardsController.draw);

/**
 * @route   POST /api/claim-achievement
 * @desc    Claims a specific achievement for the user.
 * @access  Private
 * @body    { "achievementId": "someId123" }
 */
// router.post('/claim-achievement', achievementController.claim);


module.exports = router;