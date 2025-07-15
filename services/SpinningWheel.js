const RewardService = require('./RewardService');
const fs = require('fs').promises;
const path = require('path');
const db  = require('../util/db')
const Player = require('./Player')



class SpinningWheel {
    constructor(playerId) {
        this.WHEEL_UNLOCK_PLAY_TIME = 160; // hours required per spin
        this.requiredPlaytimeInSeconds = this.WHEEL_UNLOCK_PLAY_TIME * 3600; // converts hours to seconds
        this.playerId = playerId;
    }
    async loadWheelItems() {
        const configPath = path.join(__dirname, '..', 'configs', 'wheel_items.json');
        try {
            const raw = await fs.readFile(configPath, 'utf8');
            if (!raw.trim()) return [];
            const data = JSON.parse(raw);
            if (Array.isArray(data.wheel_items)) {
                return data.wheel_items;
            }
            return [];
        } catch (err) {
            // Optionally, log or auto-initialize here
            return [];
        }
    }

    async getItems() {
        return await loadWheelItems();
    }


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


        //  updates the players spin count in the database
    async consumeSpin() {
        const player = await Player.getPlayerById(this.playerId);

        if (!player) {
            throw new Error("Player not found");
        }
        // Calculate new spin count
        const newWheelSpinsClaimed = player.WheelSpinsClaimed + 1;

        // Update the database with the new count
        await SpinningWheel.updateWheelSpinsClaimed(this.playerId, newWheelSpinsClaimed);

        return {
            WheelSpinsClaimed: newWheelSpinsClaimed
        };
    }

        // updates the players spin count in the database
    static async updateWheelSpinsClaimed(playerId, newWheelSpinsClaimed) {
        const rows = await db.query(
            'UPDATE users SET WheelSpinsClaimed = ? WHERE AccountID = ? LIMIT 1',
            [newWheelSpinsClaimed, playerId]
        );
        return rows;
    }


        // randomly draws an item, replace with chances and pity system later on
    drawWheel(items) {
        if (!items || items.length === 0) {
            throw new Error("No wheel items configured");
        }

        const reward = items[Math.floor(Math.random() * items.length)];
        return reward;
    }


    // calls the checkEligibility function, if true, calls consumeSpin and drawWheel
    async spin() {
        try {
            // Check if player is eligible to spin
            const eligibility = await this.checkEligibility();

            if (!eligibility.canSpin) {
                return {
                    success: false,
                    error: eligibility.error || `You need ${eligibility.hoursUntilNextSpin} hours of play time before you can claim a spin`,
                    hoursUntilNextSpin: eligibility.hoursUntilNextSpin,
                    remainingSpins: eligibility.remainingSpins
                };
            }

            // Consume the spin (this now updates the database)
            await this.consumeSpin();
                // already loaded in memory (working on it)
                
            // // Draw reward from wheel
            // const wheelItems = await this.loadWheelItems();

            const reward = await this.drawWheel(wheelItems);
            console.log("DRAWN REWARD:", reward.itemName);

            const rewardService = new RewardService(this.playerId);

            // Give reward to player
            try {
                console.log("reward",reward)
                if (reward.ii_id.length > 1) {
                    await rewardService.sendMultipleRewardsToPlayerGiftBox(
                        reward.ii_id,
                        "Congratulations Microbolter! You won " + reward.itemName + " from The Spinning Wheel",
                        "Spinning Wheel"
                    );
                } else {
                    await rewardService.sendRewardToPlayerGiftBox(
                        reward.itemId,
                        "Congratulations Microbolter! You won " + reward.itemName + " from The Spinning Wheel",
                        "Spinning Wheel"
                    );
                }
            } catch (error) {
                console.error("Error sending reward:", error);
                return {
                    success: false,
                    error: "An error occurred while sending reward",
                    remainingSpins: 0
                };
            }

            // Get updated eligibility after consuming the spin
            const updatedEligibility = await this.checkEligibility();

            return {
                success: true,
                itemName: reward.itemName,
                remainingSpins: updatedEligibility.remainingSpins
            };

        } catch (error) {
            console.error("Error during spin:", error);
            return {
                success: false,
                error: "An error occurred while spinning",
                remainingSpins: 0
            };
        }
    }

    // Static method to get wheel configuration
    static getWheelItems() {
        return items;
    }
}

module.exports = SpinningWheel;