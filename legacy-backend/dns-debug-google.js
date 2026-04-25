const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Use Google DNS
const dnsPromises = dns.promises;

async function debug() {
    try {
        console.log('Resolving SRV for: _mongodb._tcp.cluster0.3ft1tke.mongodb.net using Google DNS');
        const addresses = await dnsPromises.resolveSrv('_mongodb._tcp.cluster0.3ft1tke.mongodb.net');
        console.log('SRV Records:');
        addresses.forEach(addr => {
            console.log(`- ${addr.name}:${addr.port}`);
        });

        for (const addr of addresses) {
            console.log(`Resolving ${addr.name}...`);
            const hosts = await dnsPromises.resolve4(addr.name);
            console.log(`  IPs: ${hosts.join(', ')}`);
        }
    } catch (err) {
        console.error('DNS Error:', err.message);
    }
}

debug();
