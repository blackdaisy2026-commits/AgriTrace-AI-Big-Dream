require('dotenv').config();
const mongoose = require('mongoose');
const MarketPrice = require('../models/MarketPrice');

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const count = await MarketPrice.countDocuments();
    console.log(`Current MarketPrice records: ${count}`);
    const latest = await MarketPrice.findOne().sort({ updatedAt: -1 });
    if (latest) {
        console.log('Latest record:', latest.commodity, latest.market, latest.modalPrice);
    }
    await mongoose.disconnect();
}

check();
