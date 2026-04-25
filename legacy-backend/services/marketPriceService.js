const MarketPrice = require('../models/MarketPrice');

// ─── Fast Cache System ───
const PRICE_CACHE = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 Hour

const FALLBACK_PRICES = {
    "Tomato": { min: 25, max: 45, modal: 35 },
    "Banana": { min: 30, max: 60, modal: 45 },
    "Rice": { min: 45, max: 75, modal: 60 },
    "Mango": { min: 60, max: 120, modal: 90 },
    "Onion": { min: 20, max: 50, modal: 35 },
    "Chili Red": { min: 140, max: 200, modal: 170 },
    "Potato": { min: 25, max: 45, modal: 35 },
    "Coconut": { min: 20, max: 35, modal: 28 },
    "Turmeric": { min: 90, max: 150, modal: 120 },
    "Sugarcane": { min: 4, max: 8, modal: 6 },
    "Groundnut": { min: 70, max: 110, modal: 90 },
    "Beans": { min: 40, max: 80, modal: 60 },
    "Bitter gourd": { min: 30, max: 55, modal: 40 },
    "Bottle gourd": { min: 15, max: 30, modal: 22 },
    "Brinjal": { min: 20, max: 45, modal: 30 },
    "Green Avare(W)": { min: 35, max: 65, modal: 50 },
    "Ridgeguard(Tori)": { min: 25, max: 50, modal: 38 },
    "Snakeguard": { min: 20, max: 40, modal: 30 },
    "Chikoos(Sapota)": { min: 25, max: 50, modal: 38 },
    "Paddy": { min: 22, max: 28, modal: 24 },
    "Cotton": { min: 65, max: 85, modal: 75 },
    "Small Onion": { min: 35, max: 70, modal: 50 }
};

/**
 * Service to handle data.gov.in API integration for daily crop prices
 * Resource: Agmarknet Daily Prices (9ef84268-d588-465a-a308-a864a43d0070)
 */
class MarketPriceService {
    static async fetchAndSyncPrices() {
        const apiKey = process.env.DATAGOV_API_KEY;
        if (!apiKey) {
            console.warn('DATAGOV_API_KEY not found in environment. Sync skipped.');
            return;
        }

        const resourceId = '9ef84268-d588-465a-a308-a864a43d0070';
        const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&filters[state]=Tamil Nadu&limit=2000`;

        try {
            console.log('🔄 Syncing market prices from data.gov.in...');
            const response = await fetch(url);
            if (!response.ok) throw new Error(`API responded with status: ${response.status}`);

            const data = await response.json();
            if (!data || !data.records || !Array.isArray(data.records)) return;

            const ops = data.records
                .filter(record => record.commodity && record.min_price && record.max_price)
                .map(record => {
                    const minP = parseFloat(record.min_price) / 100;
                    const maxP = parseFloat(record.max_price) / 100;
                    const modalP = parseFloat(record.modal_price || record.min_price) / 100;
                    if (isNaN(minP) || isNaN(maxP)) return null;

                    return {
                        updateOne: {
                            filter: {
                                commodity: record.commodity,
                                market: record.market,
                                district: record.district,
                                arrivalDate: record.arrival_date
                            },
                            update: {
                                commodity: record.commodity,
                                state: record.state,
                                district: record.district,
                                market: record.market,
                                minPrice: minP,
                                maxPrice: maxP,
                                modalPrice: modalP,
                                arrivalDate: record.arrival_date || new Date().toISOString().split('T')[0],
                                rawApiResponse: record,
                                updatedAt: new Date()
                            },
                            upsert: true
                        }
                    };
                })
                .filter(op => op !== null);

            if (ops.length > 0) {
                await MarketPrice.bulkWrite(ops).catch(e => console.error('BulkWrite error:', e.message));
                // Clear cache on sync to refresh data
                PRICE_CACHE.clear();
            }
            console.log('✨ Market prices synchronization complete.');
        } catch (error) {
            console.error('❌ Error syncing market prices:', error.message);
        }
    }

    /**
     * Get price range with Fast Cache and optimized DB lookups
     */
    static async getPriceRange(commodity, district) {
        const cacheKey = `${commodity}-${district}`.toLowerCase();

        // 1. Check Fast Cache (Instant)
        const cached = PRICE_CACHE.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
            return cached.data;
        }

        try {
            const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const mainPart = commodity.split('(')[0].trim();
            const parenMatch = commodity.match(/\((.*?)\)/);
            const parenPart = parenMatch ? parenMatch[1] : null;

            // 2. Optimized Consolidated Query
            const searchTerms = [commodity, mainPart, parenPart].filter(Boolean);
            const uniqueTerms = [...new Set(searchTerms)];
            const regexTerms = uniqueTerms.map(t => new RegExp(escapeRegex(t), 'i'));

            // Single query with Priority Sorting
            const allData = await MarketPrice.find({ commodity: { $in: regexTerms } })
                .sort({ updatedAt: -1 })
                .limit(50);

            let results = [];

            // Filter by district in memory (much faster than separate DB calls)
            if (district) {
                const distRegex = new RegExp(escapeRegex(district), 'i');
                results = allData.filter(d => distRegex.test(d.district));
            }

            // Fallback to all data (state-wide)
            if (results.length === 0) {
                results = allData;
            }

            // 3. Process Result
            if (results.length > 0) {
                const min = Math.min(...results.map(d => d.minPrice));
                const max = Math.max(...results.map(d => d.maxPrice));
                const modal = results.reduce((sum, d) => sum + d.modalPrice, 0) / results.length;

                const processedData = {
                    min: parseFloat(min.toFixed(2)),
                    max: parseFloat(max.toFixed(2)),
                    modal: parseFloat(modal.toFixed(2)),
                    commodity: results[0].commodity,
                    date: results[0].arrivalDate
                };

                PRICE_CACHE.set(cacheKey, { data: processedData, timestamp: Date.now() });
                return processedData;
            }

            // 4. Hardcoded Fallback (Instant)
            const fallback = FALLBACK_PRICES[commodity] || FALLBACK_PRICES[mainPart] || FALLBACK_PRICES[parenPart];
            if (fallback) {
                const fallbackData = { ...fallback, commodity, date: 'Daily Avg', isFallback: true };
                PRICE_CACHE.set(cacheKey, { data: fallbackData, timestamp: Date.now() });
                return fallbackData;
            }

            return null;
        } catch (error) {
            console.error('Error in Fast Retrieval:', error);
            return null;
        }
    }
}

module.exports = MarketPriceService;
