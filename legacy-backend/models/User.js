const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['farmer', 'processor', 'retailer', 'consumer', 'regulator', 'tahsildar'],
        required: true
    },
    walletAddress: { type: String },
    location: { type: String },
    district: { type: String },
    taluk: { type: String },
    village: { type: String },
    mobileNo: { type: String },
    aadhaarNumber: { type: String },
    uzhavarCardNumber: { type: String },
    landDetails: { type: String },
    cropDetails: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
