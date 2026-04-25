const mongoose = require('mongoose');
require('dotenv').config();
const HarvestApplication = require('./models/HarvestApplication');

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const apps = await HarvestApplication.find();
    console.log('Total Apps:', apps.length);
    apps.forEach(a => {
        console.log(`- AppID: ${a.applicationId}, District: ${a.farmerDistrict}, Taluk: ${a.farmerTaluk}, Status: ${a.status}`);
    });
    process.exit();
}
check();
