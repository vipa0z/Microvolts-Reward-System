const db = require("../util/db");
const logger = require("../util/logger");
const fs = require("fs").promises;
const path = require("path");
const chalk = require("chalk");
const { CATEGORY_CONFIGS } = require('../util/categoryConfig');
const MemoryLoader = require('./MemoryLoader');


// 🔍 Extract all ii_id(s) from items (handling nested arrays, objects, numbers)
function extractItemIds(items) {
    const ids = [];
// check for arrays of itemIds and unwrap them
    for (const wrapper of items) {
        const item = Array.isArray(wrapper) ? wrapper[0] : wrapper;

        if (!item) continue;

        if (Array.isArray(item.itemId)) {
            ids.push(...item.itemId);
        }
        else if (typeof item.itemId === "number") {
            ids.push(item.itemId);
        }
    }
    return ids.filter(id => typeof id === "number" && !isNaN(id));
}

//  Main item validator
async function validateItems(category, items, options = {}) {
    const allItems = require("./MemoryLoader").getAllItems();
    const { saveIfValid = true, fromFile = false } = options;
    const config = CATEGORY_CONFIGS[category];
    if (!config) throw new Error(`Unknown category: ${category}`);

    const itemIds = extractItemIds(items);
    if (!itemIds.length) {
        return { success: true, validItemIds: [], skipped: true };
    }
    // compare to ids in memory
   
    const validItemIds = allItems.map(row => row.itemId);
    const invalidItemIds = itemIds.filter(itemId => !validItemIds.includes(itemId));

    if (invalidItemIds.length > 0) {
        return { success: false, invalidItemIds };
    }

    if (saveIfValid && !fromFile) {
        const configPath = path.join(__dirname, "..", "configs", config.filename);
        let fileData = { [config.key]: [] };

        try {
            const raw = await fs.readFile(configPath, "utf8");
            fileData = JSON.parse(raw);
            if (!Array.isArray(fileData[config.key])) {
                throw new Error(`Expected array in ${config.filename} under key ${config.key}`);
            }
        } catch (err) {
            if (err.code !== "ENOENT" && !(err instanceof SyntaxError)) throw err;
        }

        // 🧹 Flatten array-wrapped items before saving
        const normalizedItems = items.map(item => Array.isArray(item) ? item[0] : item);
        fileData[config.key].push(...normalizedItems);

        await fs.writeFile(configPath, JSON.stringify(fileData, null, 4), "utf8");
        logger.info(`Saved ${normalizedItems.length} items to ${config.filename}`);
    }

    return { success: true, validItemIds };
}


async function validateConfigFileOnStartup(category) {
    const config = CATEGORY_CONFIGS[category];
    if (!config) throw new Error(`Unknown category: ${category}`);

    const configPath = path.join(__dirname, "..", "configs", config.filename);

    try {
        let configData = {};
        let shouldWrite = false;

        // 🔍 Try to read the file
        try {
            const raw = await fs.readFile(configPath, "utf8");
            if (!raw.trim()) {
                // Empty file
                logger.warn(`[!] ${config.filename} is empty. Initializing with empty '${config.key}' array.`);
                configData = { [config.key]: [] };
                shouldWrite = true;
            } else {
                try {
                    configData = JSON.parse(raw);
                } catch (parseErr) {
                    logger.warn(`[!] ${config.filename} contains invalid JSON. Overwriting with empty '${config.key}' array.`);
                    configData = { [config.key]: [] };
                    shouldWrite = true;
                }
            }
        } catch (err) {
            if (err.code === "ENOENT") {
                logger.warn(`[!] ${config.filename} does not exist. Creating...`);
                configData = { [config.key]: [] };
                shouldWrite = true;
            } else {
                throw err;
            }
        }

        // If missing or invalid, initialize the expected structure
        if (typeof configData !== 'object' || !configData.hasOwnProperty(config.key)) {
            logger.warn(`[!] ${config.filename} missing expected key. Initializing with empty '${config.key}' array.`);
            configData = { [config.key]: [] };
            shouldWrite = true;
        }

        if (shouldWrite) {
            await fs.writeFile(configPath, JSON.stringify(configData, null, 4), "utf8");
            logger.info(`[✓] Initialized '${config.filename}' with empty '${config.key}' array.`);
        }

        const keys = Object.keys(configData);
        if (keys.length > 1 || keys[0] !== config.key) {
            console.log(chalk.red(`Invalid structure in file: ${configPath}\nOnly the key '${config.key}' is allowed, but found: ${keys.join(", ")}`));
        }

        let items = configData[config.key];
        if (!Array.isArray(items)) {
            items = [items]; // wrap single object
        }

        items = items.map(item => Array.isArray(item) ? item[0] : item);

        const result = await validateItems(category, items, { saveIfValid: false, fromFile: true });

        if (!result.success) {
            logger.error(`[!] Invalid item IDs in ${config.filename}: ${result.invalidItemIds.join(", ")}`);
            process.exit(0)
        } else {
            logger.info(`[✓] All item IDs in ${config.filename} are valid.`);
        }

        return result;

    } catch (err) {
        logger.error(`Error validating ${category} config: ${err.message}\n${err.stack}`);
        return { success: false, error: err.message };
    }
}


module.exports = {
    validateItems,
    validateConfigFileOnStartup,
    CATEGORY_CONFIGS
};
