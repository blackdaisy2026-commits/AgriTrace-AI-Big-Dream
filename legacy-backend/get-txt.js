const dns = require('dns');
const fs = require('fs');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const dnsPromises = dns.promises;

async function debug() {
    try {
        const txt = await dnsPromises.resolveTxt('cluster0.3ft1tke.mongodb.net');
        fs.writeFileSync('txt.txt', JSON.stringify(txt), 'utf8');
        console.log('Done');
    } catch (err) {
        console.error('DNS Error:', err.message);
    }
}

debug();
