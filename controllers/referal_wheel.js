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
        const spinResult = await wheel.spin();
        
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
        
        // show log to players
        logger.info(`time: ${new Date().toISOString()} Player ${playerId} won ${spinResult.itemName}`);
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
// API get
exports.getWheelItems = async (req, res) => {
    
    const playerId = req.user.playerId;
    if (!playerId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const wheel = new SpinningWheel(playerId)
    try {
    const eligibility = await wheel.checkEligibility();
    
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
// ssr
// exports.renderWheelPage = async (req, res) => {
//     const playerId = req.user.playerId;
//     const wheel = new SpinningWheel(playerId);
//     const wheelItems = MemoryLoader.getItems('wheel_items');
//     try {
//            const eligibility = await wheel.checkEligibility();
//         // Render the wheel page with eligibility information
//         res.render('wheel', {
//             success: true,
//             canSpin: eligibility.canSpin,
//             remainingSpins: eligibility.remainingSpins,
//             hoursUntilNextSpin: eligibility.hoursUntilNextSpin,
//             wheelItems,
//             title:'wheel'
//         });
//     } catch (err) {
//         logger.error(`Error rendering wheel page for player ${playerId}: ${err.message}`);
//         return res.render('error', {
//             error: {
//                 message: "An error occurred while loading the wheel page"
//             }
//         });
//     }
// }
