const dns = require('dns').promises;

async function debug() {
    try {
        console.log('Resolving SRV for: _mongodb._tcp.cluster0.3ft1tke.mongodb.net');
        const addresses = await dns.resolveSrv('_mongodb._tcp.cluster0.3ft1tke.mongodb.net');
        console.log('SRV Records:');
        addresses.forEach(addr => {
            console.log(`- ${addr.name}:${addr.port}`);
        });

        for (const addr of addresses) {
            console.log(`Pinging ${addr.name}...`);
            const hosts = await dns.resolve4(addr.name);
            console.log(`  IPs: ${hosts.join(', ')}`);
        }
    } catch (err) {
        console.error('DNS Error:', err.message);
    }
}

debug();
