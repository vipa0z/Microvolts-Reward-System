const RewardService = require('./RewardService');
const db = require('../util/db');
const Player = require('./Player');
const MemoryLoader = require('./MemoryLoader');
const logger = require('../util/logger');

class SpinningWheel {
    constructor(playerId) {
        this.WHEEL_UNLOCK_PLAY_TIME = 160; // hours required per spin
        this.requiredPlaytimeInSeconds = this.WHEEL_UNLOCK_PLAY_TIME * 3600; // converts hours to seconds
        this.playerId = playerId;
    }

    // checks the players eligibility for a spin
    async checkEligibility() {
        const player = await Player.getPlayerById(this.playerId);
        

        // Calculate total eligible spins based on playtime, returns a canSpin boolean with either 0/1
        // playtime needed in seconds = 160 * 3600 = 576,000
        // if playtime / time needed = int -> reward with spin
        // 160/160 = 1, 320/160 = 2, 480/160 = 3...
        const totalEligibleSpins = Math.floor(player.Playtime / this.requiredPlaytimeInSeconds);

        // Calculate available spins (eligible minus already claimed)
        const availableSpins = Math.max(0, totalEligibleSpins - player.WheelSpinsClaimed);

        // Calculate hours until next spin eligibility
        let hoursUntilNextSpin = 0;
        if (availableSpins === 0) {
            // Player has claimed all available spins, calculate time until next threshold
            const nextThresholdPlaytime = this.requiredPlaytimeInSeconds * (player.WheelSpinsClaimed + 1);
            const playtimeNeeded = nextThresholdPlaytime - player.Playtime;
            hoursUntilNextSpin = Math.max(0, Math.ceil(playtimeNeeded / 3600));
        }
                // returning useful data for making mathmatical decisions
        return {
            canSpin: availableSpins > 0,  // if 0, player can't spin if 1, player can spin :O
            remainingSpins: availableSpins,
            hoursUntilNextSpin: hoursUntilNextSpin,
            totalEligibleSpins: totalEligibleSpins, // calculated amount of spins available
            claimedSpins: player.WheelSpinsClaimed // amount of spins already claimed 
        };
    }



    /**
     * Consumes a spin by updating the player's spin count in the database
     * @param {number} updatedClaimedWheelSpins - The new total of claimed spins
     * @returns {Promise<Object>} - Database query result
     */
    async consumeSpin(updatedClaimedWheelSpins) {
        try {
            const rows = await db.query(
                'UPDATE users SET WheelSpinsClaimed = ? WHERE AccountID = ? LIMIT 1',
                [updatedClaimedWheelSpins, this.playerId]
            );
            logger.info(`Player ${this.playerId} consumed a wheel spin. Total claimed: ${updatedClaimedWheelSpins}`);
            return rows;
        } catch (error) {
            logger.error(`Error consuming spin for player ${this.playerId}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Randomly draws an item from the wheel items
     * @returns {Object} - The randomly selected reward item
     */
    drawWheel() {
        // Get wheel items from memory
        const items = MemoryLoader.getItems('wheel_items');
        console.log("items", items)
        if (!items || items.length === 0) {
            throw new Error("No wheel items configured");
        }

        // Select a random item from the wheel items
        const reward = items[Math.floor(Math.random() * items.length)];
        logger.info(`Player ${this.playerId} drew reward: ${reward.ii_name}`);
        return reward;
    }


    async spin() {
        try {
            // Check if player is eligible to spin // UNCOMMENT THIS)
           
            const eligibility = {canSpin: true, remainingSpins: 5, hoursUntilNextSpin: 0, totalEligibleSpins: 1, claimedSpins: 0}
            
            if (!eligibility.canSpin) {
                console.log("can spin", eligibility.canSpin)
                return {
                    success: false,
                    error: `You need ${eligibility.hoursUntilNextSpin} more hours to claim a spin`,
                    hoursUntilNextSpin: eligibility.hoursUntilNextSpin,
                    remainingSpins: 0
                };
            }
        
            // Consume the spin (updates the database)
            await this.consumeSpin(eligibility.claimedSpins + 1);
            
            // Draw reward
            const reward = this.drawWheel();
            
            // Send reward to player
            await this.sendReward(reward);
            
            // Get updated eligibility
            const updatedEligibility = await this.checkEligibility();

            return {
                success: true,
                itemName: reward.ii_name,
                remainingSpins: updatedEligibility.remainingSpins
            };
        } catch (error) {
            logger.error(`Error during wheel spin for player ${this.playerId}: ${error.message}`);
            return {
                success: false,
                error: "An error occurred while processing your spin",
                remainingSpins: 0
            };
        }
    }
    
    /**
     * Send the reward to the player's gift box
     * @param {Object} reward - The reward item to send
     * @returns {Promise<void>}
     */
    async sendReward(reward) {
        const rewardService = new RewardService(
            this.playerId, 
            process.env.EMU_ADMIN_JWT,
        );
        const message = `Congratulations Microbolter! You won ${reward.itemName} from The Referal system, keep creating alts to abuse this even more--i mean inviting friends :].`;
        
        if (Array.isArray(reward.itemId)) {
            await rewardService.sendMultipleRewardsToPlayerGiftBox(
                reward.itemId,
                message
            );
        } else { // send single item
            await rewardService.sendRewardToPlayerGiftBox(
                reward.itemId,
                `Congratulations Microbolter! You've just won ${reward.itemName} as your referal The Spinning Wheel`
            );
        }
        
        logger.info(`Reward ${reward.itemName} sent to player ${this.playerId}'s gift box`);
    }

    }


module.exports = SpinningWheel;