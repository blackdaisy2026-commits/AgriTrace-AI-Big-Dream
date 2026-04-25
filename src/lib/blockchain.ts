export const SUPPLY_CHAIN_ABI = [
    {
        "inputs": [
            { "internalType": "string", "name": "cropType", "type": "string" },
            { "internalType": "string", "name": "farmerName", "type": "string" },
            { "internalType": "uint256", "name": "weightKg", "type": "uint256" },
            { "internalType": "bool", "name": "isOrganic", "type": "bool" },
            { "internalType": "bool", "name": "isFairTrade", "type": "bool" },
            { "internalType": "string", "name": "harvestData", "type": "string" },
            { "internalType": "string", "name": "gps", "type": "string" }
        ],
        "name": "createBatch",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "external",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "batchId", "type": "uint256" },
            { "internalType": "enum SupplyChain.Stage", "name": "stage", "type": "uint8" },
            { "internalType": "string", "name": "data", "type": "string" },
            { "internalType": "string", "name": "gps", "type": "string" }
        ],
        "name": "logEvent",
        "outputs": [],
        "stateMutability": "external",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "batchId", "type": "uint256" }],
        "name": "getBatch",
        "outputs": [
            {
                "components": [
                    { "internalType": "uint256", "name": "id", "type": "uint256" },
                    { "internalType": "string", "name": "cropType", "type": "string" },
                    { "internalType": "string", "name": "farmer", "type": "string" },
                    { "internalType": "address", "name": "farmerAddress", "type": "address" },
                    { "internalType": "uint256", "name": "weight", "type": "uint256" },
                    { "internalType": "bool", "name": "organic", "type": "bool" },
                    { "internalType": "bool", "name": "fairTrade", "type": "bool" },
                    { "internalType": "enum SupplyChain.Stage", "name": "currentStage", "type": "uint8" },
                    { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
                    { "internalType": "bool", "name": "exists", "type": "bool" }
                ],
                "internalType": "struct SupplyChain.Batch",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "batchId", "type": "uint256" }],
        "name": "getBatchEvents",
        "outputs": [
            {
                "components": [
                    { "internalType": "enum SupplyChain.Stage", "name": "stage", "type": "uint8" },
                    { "internalType": "string", "name": "data", "type": "string" },
                    { "internalType": "address", "name": "actor", "type": "address" },
                    { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
                    { "internalType": "string", "name": "gps", "type": "string" },
                    { "internalType": "bool", "name": "verified", "type": "bool" }
                ],
                "internalType": "struct SupplyChain.BatchEvent[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "batchCount",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}` || '0x0000000000000000000000000000000000000000';
