const logger = require('./logger');
const fs = require('fs').promises;
const db = require('./db')


// Adds a table for validating itemIds


async function ensureValidItemsTableExist() {
  try {
    console.log("[+] Checking validItemsTable exist")

    const rows = await db.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'valid_items'`,
      [process.env.DB_NAME]
    );

    if (rows.length === 0) {
      logger.info("[x] Table not found, Creating valid_items table...");

      await db.query(`
        CREATE TABLE valid_items (
          itemId INT PRIMARY KEY UNIQUE
        )
      `);
        console.log("Creating Index on itemIds..............")

      await db.query(`CREATE INDEX idx_item_id ON valid_items(itemId)`);

      logger.info('[+] valid_items table created');
    } else {
      logger.info('[+] valid_items table already exists');
    }
  } catch (err) {
    logger.error('Error creating valid_items table:', err);
  }
}

// Add columns if missing
async function ensureRewardFieldsExist() {
  console.log("[+] Ensuring Reward Fields exist in users table......")

  const rows = await db.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
     AND COLUMN_NAME IN ('WheelSpinsClaimed', 'dailyPlayTime', 'dailySpinsClaimed')`,
    [process.env.DB_NAME]
  );

  const existing = rows.map(r => r.COLUMN_NAME);
  const toAdd = [];

  if (!existing.includes('WheelSpinsClaimed'))
    toAdd.push(`ADD COLUMN WheelSpinsClaimed INT DEFAULT 0`);

  if (!existing.includes('dailyPlayTime'))
    toAdd.push(`ADD COLUMN dailyPlayTime INT DEFAULT 0`);

  if (!existing.includes('dailySpinsClaimed'))
    toAdd.push(`ADD COLUMN dailySpinsClaimed INT DEFAULT 0`);

  if (toAdd.length > 0) {
    const query = `ALTER TABLE users ${toAdd.join(', ')}`;
    await db.query(query);
    logger.info('[+] Added missing reward columns:', toAdd);
  }
}

// Populate valid_items table from JSON
async function populateValidItems(jsonFilePath) {
  try {
    const data = await fs.readFile(jsonFilePath, 'utf8');
    const items = JSON.parse(data);

    const batchSize = 10000;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      // Step 2: Extract ii_id as an array of arrays: [[1110100], [1110110], ...]
      const values = batch.map(item => [item.ii_id]);

      // Step 3: Flatten it to [1110100, 1110110, ...]
      const flatValues = values.flat();

      // Step 4: Create placeholder string like "(?), (?), (?)"
      const placeholders = values.map(() => '(?)').join(', ');

      // Step 5: Final SQL looks like: INSERT IGNORE INTO valid_items (itemId) VALUES (?,?),(?)
      const sql = `INSERT IGNORE INTO valid_items (itemId) VALUES ${placeholders}`;

      // Step 6: Execute the query
      await db.query(sql, flatValues);
    }
    console.log(`✅ [DB] Inserted ${items.length} unique items into valid_items`);
    } catch (err) {
    console.error('Error populating valid_items:', err);
  }
}
module.exports = {
  ensureValidItemsTableExist,
  ensureRewardFieldsExist,
  populateValidItems
};
