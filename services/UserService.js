
class UserService {
    static async findUserByUsername(username) {
        users = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    
        return users[0];
    }

    static async findUserById(AccountID) {
        users = await db.query('SELECT * FROM users WHERE AccountID = ?', [AccountID]);
    
        return users[0];
    }


    static async createUser({ username, password, nickName, level, AccountID }) {
        const newUser = {
            AccountID,
            username,
            password, // already hashed
            nickName,
            grade: 1,
            level,
        };
        await db.query('INSERT INTO users (AccountID, username, password, nickName, grade, level) VALUES (?, ?, ?, ?, ?, ?)', [AccountID, username, password, nickName, grade, level]);
        return newUser;
    }

    static async loginUser(username, password) {
        const user = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (!user) {
            return null;
        }
        return user;
    }
}

module.exports = UserService;
