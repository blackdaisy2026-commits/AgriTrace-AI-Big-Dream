const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function createRegulator() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const userData = {
            name: "TN Regulator",
            email: "tn@gmail.com",
            password: "123", // Will be hashed by pre-save middleware
            role: "regulator",
            district: "Chennai",
            taluk: "Alandur"
        };

        let user = await User.findOne({ email: userData.email });

        if (user) {
            console.log('User already exists, updating password and role...');
            user.password = userData.password;
            user.role = userData.role;
            await user.save();
            console.log('Regulator updated successfully');
        } else {
            user = new User(userData);
            await user.save();
            console.log('Regulator created successfully');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

createRegulator();
