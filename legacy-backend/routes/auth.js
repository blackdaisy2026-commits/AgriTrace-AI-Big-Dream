const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

router.post('/register', async (req, res) => {
    try {
        const {
            name, email, password, role, district, taluk, village,
            location, mobileNo, aadhaarNumber, uzhavarCardNumber,
            landDetails, cropDetails
        } = req.body;

        // Check if email already exists before attempting to create
        const existingUser = await User.findOne({ email: email?.toLowerCase().trim() });
        if (existingUser) {
            return res.status(400).json({
                status: 'fail',
                message: 'இந்த மின்னஞ்சல் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது. / This email is already registered. Please login instead.'
            });
        }

        const user = await User.create({
            name, email, password, role, district, taluk, village,
            location, mobileNo, aadhaarNumber, uzhavarCardNumber,
            landDetails, cropDetails
        });

        const token = signToken(user._id);

        res.status(201).json({
            status: 'success',
            token,
            data: { user: { id: user._id, name, email, role, district, taluk } }
        });
    } catch (err) {
        // MongoDB duplicate key error code
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern || {})[0] || 'field';
            return res.status(400).json({
                status: 'fail',
                message: `இந்த ${field} ஏற்கனவே பயன்படுத்தப்படுகிறது. / This ${field} is already in use.`
            });
        }
        // Mongoose validation errors
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message).join(', ');
            return res.status(400).json({ status: 'fail', message: messages });
        }
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Incorrect email or password' });
        }

        const token = signToken(user._id);

        res.status(200).json({
            status: 'success',
            token,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    district: user.district,
                    taluk: user.taluk
                }
            }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

const { protect } = require('../middleware/auth');

router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.status(200).json({ status: 'success', data: { user } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

router.get('/users', protect, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({ status: 'success', data: users });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

module.exports = router;
