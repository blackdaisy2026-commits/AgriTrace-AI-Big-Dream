require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Batch = require('../models/Batch');
const Event = require('../models/Event');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Batch.deleteMany({});
        await Event.deleteMany({});

        // Create Users
        const farmer = await User.create({
            name: 'Murugesan Pillai',
            email: 'farmer@agritrace.tn',
            password: 'password123',
            role: 'farmer',
            district: 'Karur',
            taluk: 'Manmangalam',
            location: 'Manmangalam West',
            mobileNo: '9876543210'
        });

        const processor = await User.create({
            name: 'Manmangalam Field Officer',
            email: 'processor@agritrace.tn',
            password: 'password123',
            role: 'processor',
            district: 'Karur',
            taluk: 'Manmangalam',
            location: 'Karur North Unit'
        });

        const processor2 = await User.create({
            name: 'Theni Field Officer',
            email: 'processor2@agritrace.tn',
            password: 'password123',
            role: 'processor',
            district: 'Theni',
            taluk: 'Theni',
            location: 'Theni Main Unit'
        });

        const retailer = await User.create({
            name: 'Chennai Fresh Market',
            email: 'retailer@agritrace.tn',
            password: 'password123',
            role: 'retailer',
            district: 'Chennai',
            location: 'Koyambedu'
        });

        const consumer = await User.create({
            name: 'Anbu Selvan',
            email: 'consumer@agritrace.tn',
            password: 'password123',
            role: 'consumer'
        });

        const regulator = await User.create({
            name: 'TNAS Board',
            email: 'tn@gmail.com',
            password: '123',
            role: 'regulator'
        });

        console.log('✅ Seeded all roles (pw: password123)');

        // Create a Batch
        const batch = await Batch.create({
            batchId: 'TN-DEMO-2026-001',
            cropType: 'Tomato',
            farmer: farmer._id,
            farmerName: farmer.name,
            village: 'Oddanchatram',
            district: 'Dindigul',
            weightKg: 500,
            isOrganic: true,
            isFairTrade: true,
            txHash: '0x' + 'a'.repeat(64)
        });

        console.log('✅ Seeded Demo Batch');

        process.exit();
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedData();
