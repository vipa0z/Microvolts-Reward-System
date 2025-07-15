const db = require('../util/db');
const RewardService = require('./RewardService');
const MemoryLoader = require('./MemoryLoader');
const logger = require('../util/logger');

class ShopService {
    constructor (playerId) {
        this.playerId = playerId
        this.shopItems = MemoryLoader.getItems('shop_items');
    }
    
    async buyItem(itemId) {
        try {
            const playerCurrencyAmount = await db.query('SELECT EventCurrencyAmount FROM players WHERE playerId = ?', [this.playerId])[0].EventCurrencyAmount;
            // Get shop items from memory
            const shopItems = this.shopItems
            
            // Find the item in the shop
            const item = shopItems.find(item => {
                if (Array.isArray(item.ii_id)) {
                    return item.ii_id.includes(Number(itemId));
                }
                return item.ii_id === Number(itemId);
            });

            if (!item) {
                return { success: false, error: 'Item not found in shop' };
            }

            // Check if player has enough currency
            if (playerCurrencyAmount < (item.price || 0)) {
                return { success: false, error: 'Not enough currency' };
            }

            // Create reward service instance
            const rewardService = new RewardService(playerId);

            // Send reward to player
            let result;
            if (Array.isArray(item.ii_id)) {
                result = await rewardService.sendMultipleRewardsToPlayerGiftBox(
                    item.ii_id,
                    `You purchased ${item.ii_name} from the shop.`,
                    `${process.env.EVENT_NAME} Shop`)
            } else {
                result = await rewardService.sendRewardToPlayerGiftBox(
                    item.ii_id,
                    `You purchased ${item.ii_name} from the shop.`,
                    `${process.env.EVENT_NAME} Shop`
                );
            }
            
            const Updatedcurrency = playerCurrency - (item.price || 0); // negative values?
            await db.query('UPDATE players SET EventCurrency = ? WHERE playerId = ?', [Updatedcurrency, this.playerId]);
         

            return { 
                success: true, 
                message: `Successfully purchased ${item.ii_name}`,
                item: item,
                currencyAmount: Updatedcurrency
            };
        } catch (error) {
            logger.error(`Error buying item: ${error.message}`);
            return { success: false, error: 'Failed to process purchase' };
        }
    }
}

module.exports = ShopService;