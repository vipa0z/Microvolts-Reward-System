const db = require('../util/db'); // Do not destructure; MariaDB pool is usually exported directly

class PlayerService {
    constructor(playerId) {
        this.playerId = playerId;
    }

    static async getPlayerById(playerId) {
       
        try {
           
            const rows = await db.query(
                'SELECT Playtime, WheelSpinsClaimed, AccountID FROM users WHERE AccountID = ? LIMIT 1',
                [playerId]
            );

            // MariaDB client returns rows as array, first row is metadata
            if (!rows || rows.length === 0) return false;

            return rows[0]; // first result row
        } catch (err) {
            console.error(`[DB ERROR] getPlayerById:`, err);
            throw err;
        } 
    }

    static async updatePlaytime(playerId, newPlaytime) {
        try {
            const result = await db.query(
                'UPDATE users SET dailyHoursPlayed = ? WHERE AccountID = ? LIMIT 1',
                [newPlaytime, playerId]
            );
            return result.affectedRows > 0;
        } catch (err) {
            console.error(`[DB ERROR] updatePlaytime:`, err);
            throw err;
        } 
    }

    // ✅ You can add more methods here, reusing the same pattern
}

module.exports = PlayerService;
