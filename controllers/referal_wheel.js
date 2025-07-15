const SpinningWheel = require('../services/SpinningWheel');
const logger = require('../util/logger');
const MemoryLoader = require('../services/MemoryLoader');

/**
 * Handle wheel spin request from player
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.drawWheel = async (req, res) => {
    const playerId = req.user.playerId;
    const wheel = new SpinningWheel(playerId);

    try {
        // Process the spin (eligibility check is now handled inside spin method)
        const spinResult = await wheel.spin();
        
        // If spin was not successful, return the error
        if (!spinResult.success) {
            return res.status(403).json({
                success: false,
                error: spinResult.error,
                hoursLeft: spinResult.hoursUntilNextSpin,
                remainingSpins: spinResult.remainingSpins
            });
        }
        
        // Spin was successful, return the result
        logger.info(`Player ${playerId} won ${spinResult.itemName} from wheel spin`);
        return res.status(200).json({
            success: true,
            data: {
                message: `Congratulations! You won ${spinResult.itemName}`,
                remainingSpins: spinResult.remainingSpins
            }
        });





    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });

    }
}

/**
 * Render the wheel page with player's eligibility information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.renderWheelPage = async (req, res) => {
    const playerId = req.user.playerId;
    const wheel = new SpinningWheel(playerId);

    try {
           const eligibility = await wheel.checkEligibility();
        // Render the wheel page with eligibility information
        res.render('wheel', {
            success: true,
            canSpin: eligibility.canSpin,
            remainingSpins: eligibility.remainingSpins,
            hoursUntilNextSpin: eligibility.hoursUntilNextSpin,
            wheelItems: MemoryLoader.getItems('wheel_items')
        });
    } catch (err) {
        logger.error(`Error rendering wheel page for player ${playerId}: ${err.message}`);
        return res.render('error', {
            error: {
                message: "An error occurred while loading the wheel page"
            }
        });
    }
}
exports.getWheelItems = async (req, res) => {
    const playerId = req.user.playerId;
    const wheel = new SpinningWheel(playerId)
    const eligibility = await wheel.checkEligibility();
    try {
        
        // Render the wheel page with eligibility information
        res.status(200).json( {
            success: true,
            data: {
                canSpin: eligibility.canSpin,
                remainingSpins: eligibility.remainingSpins,
                hoursUntilNextSpin: eligibility.hoursUntilNextSpin,
                wheelItems: MemoryLoader.getItems('wheel_items')
            }
        });
    } catch (err) {
        logger.error(`Error rendering wheel page for player ${playerId}: ${err.message}`);
        return res.render('error', {
            error: {
                message: "An error occurred while loading the wheel page"
            }
        });
    }
}
