
const fs = require('fs').promises;
const path = require('path');
const logger = require('../util/logger');
const { CATEGORY_CONFIGS } = require('../util/categoryConfig');
const allItemsPath = path.join(__dirname, '..', 'data', 'everyItem.json')
class MemoryLoader {
    static items = {
        wheel_items: [],
        shop_items: [],
        hourly_reward_items: [],
        achievement_items: []
    };

    /**
     * Load all configuration items into memory
     */
    static async loadAllItemsIntoMemory() {
        try {
            const data = await fs.readFile(allItemsPath,'utf8')
            this.allItems = JSON.parse(data);
            return this.allItems;
        }
        catch (err) {
            throw new Error("failed to load all items",err)
        }
    }

    /**
     * Load specific category items into memory
     * @param {string} category - Category name (wheel_items, shop_items, etc.)
     */
    static async loadItemsIntoMemory(category) {
        try {
            const config = CATEGORY_CONFIGS[category];
            
            
            if (!config) {
                throw new Error(`Unknown category: ${category}`);
            }

            const configPath = path.join(__dirname, '..', 'configs', config.filename);
            const data = await fs.readFile(configPath, 'utf8');
            const parsedData = JSON.parse(data);

            if (!parsedData[config.key] || !Array.isArray(parsedData[config.key])) {
                throw new Error(`Invalid format in ${config.filename}. Expected array under key '${config.key}'`);
            }

            // Store items in memory
            this.items[config.key] = parsedData[config.key];
            logger.success(`[✓] Loaded ${this.items[config.key].length} ${config.key} into memory`);
            
            return this.items[config.key];
        } catch (error) {
            logger.error(`Error loading ${category} into memory: ${error}`);
            throw error;
        }
    }

    /**
     * Get items from memory
     * @param {string} category - Category key (wheel_items, shop_items, etc.)
     * @returns {Array} - Array of items
     */
    static getItems(category) {
        if (!this.items[category]) {
            logger.warn(`[!] Attempted to access non-existent category: ${category}`);
            return [];
        }
        return this.items[category];
    }
      static getAllItems() {
        if (!this.allItems) {
            logger.warn(`[!] no items`);
            return [];
        }
        return this.allItems
    }
    
    /**
     * Get a specific item by ID from a category
     * @param {string} category - Category key (wheel_items, shop_items, etc.)
     * @param {number|string} itemId - Item ID to find
     * @returns {Object|null} - Item object or null if not found
     */
    static getItemById(category, itemId) {
        if (!this.items[category]) {
            logger.warn(`[!] Attempted to access non-existent category: ${category}`);
            return null;
        }
        
        // Convert itemId to number for comparison if it's a string
        const id = typeof itemId === 'string' ? Number(itemId) : itemId;
        
        // Find item where ii_id matches (either as single value or in array)
        return this.items[category].find(item => {
            if (Array.isArray(item.ii_id)) {
                return item.ii_id.includes(id);
            }
            return item.ii_id === id;
        }) || null;
    }

    /**
     * Reload a specific category from disk into memory
     * @param {string} category - Category key (wheel_items, shop_items, etc.)
     */
    static async reloadCategory(category) {
        try {
            await this.loadItemsIntoMemory(category);
            logger.info(`[✓] Reloaded ${category} into memory`);
            return true;
        } catch (error) {
            logger.error(`Error reloading ${category}: ${error.message}`);
            return false;
        }
    }
}

module.exports = MemoryLoader;