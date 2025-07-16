// config data used by configvalidator and memoryloader to avoid circular dependencies
const CATEGORY_CONFIGS = {
    "shop_items": { filename: "shop_items.json", key: "shop_items" },
    "wheel_items": { filename: "wheel_items.json", key: "wheel_items" },
    "hourly_items": { filename: "hourly_reward_items.json", key: "hourly_reward_items" },
    "achievement_items": { filename: "achievement_items.json", key: "achievement_items" },
};

module.exports = { CATEGORY_CONFIGS };
