const SpinningWheel = require('../services/SpinningWheel')
const logger = require('../util/logger')
const chalk = require('chalk');
// n// config wheel items



exports.drawWheel = async (req, res) => {
    const playerId = req.user.playerId
    const wheel = new SpinningWheel(playerId)

    try {
        // Check eligibility
        const eligible = await wheel.checkEligibility();
        console.log(`Can spin: ${eligible.canSpin}, Remaining: ${eligible.remainingSpins}`);
        if (!eligible){
            return res.status(403).json({
                success: false,
                error: "You need " + eligible.hoursUntilNextSpin + " hours more to claim a spin",
                hoursLeft: eligible.hoursUntilNextSpin,
                remainingSpins: eligible.remainingSpins
            })
        }
        // player hasn't reached the required playtime
        if (!eligible.canSpin) {
            console.log(eligible)
            return res.status(403).json({
                success: false,
                error: "you need " + eligible.hoursUntilNextSpin + " hours more to claim a spin",
                hoursLeft: eligible.hoursUntilNextSpin,
                remainingSpins: eligible.remainingSpins
            })
        }

        try {
            const { itemName, remainingSpins } = await wheel.spin();
            if (itemName) {
                console.log("won", itemName)
            }
            return res.status(200).json({
                success: true,
                data: {
                    message: "Congratulations! You won " + itemName,
                    remainingSpins: remainingSpins
                }
            });

        } catch (error) {

            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }





    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });

    }
}

exports.renderWheelPage = async (req, res) => {

    const playerId = req.user.playerId
    const wheel = new SpinningWheel(playerId)

    try {
        const eligibility = await wheel.checkEligibility();
        if (!eligibility.canSpin) {
            res.render('wheel', {
                success: false,
                error: {
                    message: `You need ${((player.Playtime - requiredPlaytimeInSeconds) / 3600)} Hours more to unlock the spinning wheel`

                }
            })
        }

    } catch (err) {
        return res.render('error', {
            error: {
                message: "server error"

            }
        })

    }
}
