const shopItems = require("../data/eventShopItems")
class EventShop {
    constructor() {
        this.items = shopItems
    }

    static loadShopItems() {
     return shopItems    
    }

    static async buyItem(itemId, AccountID, eventCurrency ) {

        const item = shopItems.find(item => item.id === itemId)
        if (!item) {
            return { error: 'Item not found' }
        }
        if (eventCurrency < item.price) {
            return { error: 'Not enough event currency' }
        }

        eventCurrency = item.price - eventCurrency

        // save to giftbox
        const saved = await RewardService.giveReward(AccountID, item.id, "Event Shop")
        
        return saved
    }
}