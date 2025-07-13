const shopService = require('../services/shopService');

exports.getEventShop = async (req, res) => { 
    const username = req.user.username 
    if (!username) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const shopItems = await shopService.loadShopItems()

        res.status(200).json({success:true,
             message:"shop items loaded successfully",
             data:shopItems});
             
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.postEventShop = async (req, res) => {
    const username = req.username 
    const itemId = req.params.itemId
    if (!username) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!itemId) {
        return res.status(400).json({ error: 'Item ID is required' });
    }
    try {
        const itemSaved = await shopService.buyItem(username, itemId).saved
        
        if (!itemSaved) {
            return res.status(500).json({ error: 'Failed to save item' });
        }

        res.status(200).json({
            success:true,
            message:"item bought successfully"
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
