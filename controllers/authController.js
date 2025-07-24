const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require("dotenv").config();

const UserService = require('../services/UserService');

const USER_JWT_SECRET = process.env.USER_JWT_SECRET || 'user-secret-key';
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'admin-secret-key';
const SALT_ROUNDS = 10;

// ─────────────── Register ───────────────
exports.register = async (req, res) => {
    const { username, password, nickName, grade = 1, level = 1 } = req.body;

    try {
        const existingUser = await UserService.findUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const newUser = await UserService.createUser({
            username,
            password: hashedPassword,
            nickName,
            grade,
            level,
        });

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                userId: newUser.AccountID,
                username: newUser.username,
                nickName: newUser.nickName,
                grade: newUser.grade,
                level: newUser.level,
            }
        });
    } catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// ─────────────── Login ───────────────
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await UserService.findUserByUsername(username);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isStaff = user.grade >= process.env.MINIMUM_GRADE_TO_CONFIGURE;
        const jwtSecret = isStaff ? ADMIN_JWT_SECRET : USER_JWT_SECRET;


        const payload = {
            id: user.AccountID,
            username: user.username,
            nickName: user.nickName,
            grade: user.grade,
            lvl: user.level,
        };

        const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

        return res.status(200).json({
            success: true,
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

