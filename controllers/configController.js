const CATEGORY_CONFIGS = require('../services/ConfigValidator').CATEGORY_CONFIGS;
const MemoryLoader = require('../services/MemoryLoader');
const logger = require('../util/logger');
// ✅ Function that takes category and returns an Express handler function
exports.configureItems = function (category) {
    return async (req, res) => {
        try {
            const configMeta = CATEGORY_CONFIGS[category];
            if (!configMeta) {
                return res.status(400).json({ error: `Unknown category: ${category}` });
            }

            const items = req.body[configMeta.key];

            if (!Array.isArray(items)) {
                return res.status(400).json({ error: `Expected '${configMeta.key}' to be an array of objects.` });
            }

            const cleanedItems = [];
            for (const entry of items) {
                if (Array.isArray(entry)) {
                    return res.status(400).json({ error: "Nested arrays are not allowed. Each item should be a flat object." });
                }
                if (typeof entry !== 'object' || entry === null) {
                    return res.status(400).json({ error: "Each item must be a non-null object." });
                }
                const requiredFields = ['itemId', 'itemName', 'itemOption'];
                const entryKeys = Object.keys(entry);

                // Missing required fields
                const missing = requiredFields.filter(field => !(field in entry));
                if (missing.length > 0) {
                    return res.status(400).json({ error: `Missing required field(s): ${missing.join(', ')}` });
                }

                // Unknown fields
                const unknown = entryKeys.filter(key => !requiredFields.includes(key));
                if (unknown.length > 0) {
                    return res.status(400).json({ error: `Unknown field(s): ${unknown.join(', ')}` });
                }

                // itemId: number or array of numbers
                const itemId = entry.itemId;
                if (
                    !(
                        (typeof itemId === 'number' && Number.isInteger(itemId)) ||
                        (Array.isArray(itemId) && itemId.every(id => typeof id === 'number' && Number.isInteger(id)))
                    )
                ) {
                    return res.status(400).json({ error: "itemId must be an integer or an array of integers." });
                }

                // Normalize
                entry.itemId = Array.isArray(itemId) ? itemId : [itemId];

                // itemName and itemOption
                if (typeof entry.itemName !== 'string') {
                    return res.status(400).json({ error: "itemName must be a string." });
                }
                if (typeof entry.itemOption !== 'string') {
                    return res.status(400).json({ error: "itemOption must be a string." });
                }

                cleanedItems.push(entry);
            }

            const ConfigValidator = require('../services/ConfigValidator');

            const result = await ConfigValidator.validateItems(category, cleanedItems, {
                saveIfValid: false,
                fromFile: false,
            });

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid itemIds, please check your input.",
                    invalidItemIds: result.invalidItemIds
                });
            }

            const fs = require('fs').promises;
            const path = require('path');

            const configPath = path.join(__dirname, "..", "configs", configMeta.filename);
            const raw = await fs.readFile(configPath, "utf8");
            const configData = JSON.parse(raw);

            if (!Array.isArray(configData[configMeta.key])) {
                return res.status(500).json({
                    error: `Invalid config structure. Expected '${configMeta.key}' to be an array.`
                });
            }

            configData[configMeta.key].push(...cleanedItems);

            await fs.writeFile(configPath, JSON.stringify(configData, null, 4), "utf8");

            // Reload the category in memory to reflect the changes immediately
            try {
                await MemoryLoader.reloadCategory(configMeta.key);
                logger.info(`[✓] Reloaded ${configMeta.key} in memory after configuration update`);
            } catch (reloadErr) {
                logger.error(`[!] Failed to reload ${configMeta.key} in memory: ${reloadErr.message}`);
                // Continue with the response even if reload fails
            }

            return res.status(200).json({
                success: true,
                data: {
                    category: configMeta.key,
                    items: cleanedItems,
                },
                message: `${cleanedItems.length} item(s) added to ${category} and memory cache updated.`
            });

        } catch (err) {
            console.error(`Error configuring ${category}:`, err);
            return res.status(500).json({ error: err.message });
        }
    };
};
