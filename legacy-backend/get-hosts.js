const dns = require('dns');
const fs = require('fs');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const dnsPromises = dns.promises;

async function debug() {
    try {
        const addresses = await dnsPromises.resolveSrv('_mongodb._tcp.cluster0.3ft1tke.mongodb.net');
        const hosts = addresses.map(addr => `${addr.name}:${addr.port}`).join(',');
        fs.writeFileSync('hosts.txt', 'STANDARD_URI_HOSTS:' + hosts, 'utf8');
        console.log('Done');
    } catch (err) {
        console.error('DNS Error:', err.message);
    }
}

debug();
