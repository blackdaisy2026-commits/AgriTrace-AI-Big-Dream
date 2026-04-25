const mongoose = require('mongoose');
require('dotenv').config();
const HarvestApplication = require('./models/HarvestApplication');

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const app = await HarvestApplication.findOne({ applicationId: 'HAR-TN-MMDSSZCC' });
    console.log(JSON.stringify(app, null, 2));
    process.exit();
}
check();
