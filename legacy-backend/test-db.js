const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

console.log('Attempting to connect to:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
}).then(() => {
    console.log('✅ Connection Successful!');
    process.exit(0);
}).catch(err => {
    console.error('❌ Connection Failed!');
    console.error('Error Code:', err.code);
    console.error('Error Message:', err.message);
    if (err.reason) console.error('Reason:', err.reason);
    process.exit(1);
});
