const Player = require('./Player')
const db   = require('../util/db')
const axios = require("axios")
class RewardService {
    constructor(playerId, adminJwt) {
        this.playerId = playerId;
        this.timestamp = Math.floor(Date.now() / 1000);
        this.adminJwt = adminJwt;
        this.emuApiUrl = process.env.EMU_API_URL;
        this.player = null;
    }
 async sendRewardToPlayerGiftBox(itemId, message, sender) {
  try {
    // Make sure we have the player data

      this.player = await Player.getPlayerById(this.playerId);
      if (!this.player) {
        return { error: 'Player not found' };
      }

    const response = await axios.post(
      `${this.emuApiUrl}:${process.env.EMU_API_PORT}/sendreward`,
      {
        Nickname: this.player.Nickname,
        ItemID: itemId,
        Message: message,
        Sender: sender
      },
      {
        headers: {
          'Authorization': `Bearer ${this.adminJwt}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error sending reward:', error);
    return { 
      error: 'Failed to send reward to player gift box',
      details: error.response?.data || error.message 
    };
  }

     
//     try {
//     const player = await Player.getPlayerById(this.playerId)
//     if (!player) {
//         return { error: 'Player not found' };
//     }
    
    
//     const [insertInfo] = await db.query(
//       `INSERT INTO GiftBox (itemId, timestamp, accountId, message, sender) VALUES (?, ?, ?, ?, ?)`,
//       [itemId, this.timestamp, this.playerId, message, sender]
//     );
    
//     console.log(insertInfo.insertId); // access renamed variable
//     return insertInfo.insertId;
// }
    
//  catch (error) {
//     console.error(error);
//     return { error: 'Failed to send reward to player gift box' };
//   }
}

 async sendMultipleRewardsToPlayerGiftBox(itemIds, message, sender) {

  const valuesSQL = itemIds.map(ii_id => {
    return `(${ii_id}, ${this.timestamp}, ${this.playerId}, ${message}, ${sender})`;
  }).join(', ');

  const sql = `
      INSERT INTO giftBox (itemId, timestamp, accountId, message, sender)
      VALUES ${valuesSQL}
  `;

  try {
      const [result] = await db.query(sql); // no bound parameters
      return result;
  } catch (err) {
      console.error("Failed to insert multiple gift box rewards:", err);
      return { error: 'Insert failed' };
  }
}


}
module.exports = RewardService;