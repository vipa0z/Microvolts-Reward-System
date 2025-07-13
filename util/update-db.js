// populate-items.js
const { ensureValidItemsTableExist, populateValidItems, ensureRewardFieldsExist} = require('./updateDBHelpers');

async function run() {
    await ensureValidItemsTableExist();
    await populateValidItems('../configs/itemInfo.json');
    await ensureRewardFieldsExist()
    process.exit(0);
}

run();