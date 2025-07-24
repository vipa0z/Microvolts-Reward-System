const jwt = require('jsonwebtoken');
const UserService = require('../services/UserService');
const dotenv = require("dotenv").config()
const USER_JWT_SECRET = process.env.USER_JWT_SECRET || 'user-secret-key';
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'admin-secret-key';

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Authenticate the user
        const user = await UserService.loginUser(username, password);

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Determine which secret to use
        const isStaff = user.grade >= process.env.MINIMUM_GRADE_TO_CONFIGURE
        const jwtSecret = isStaff ? ADMIN_JWT_SECRET : USER_JWT_SECRET;
        console.log("[+] Processing JWT as user grade:", user.grade)
        const payload = {
            id: user.AccountID,
            username: user.username,
            nickName: user.nickName,
            grade: user.grade,
            lvl: user.level,
        };

        const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

        return res.status(200).json({ 
            success:true,
            data: { 
                token,
                user: {
                    userId: user.AccountID,
                    username: user.username,
                    nickName: user.nickName,
                    grade: user.grade,
                    lvl: user.level,
                }
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    login,
};
