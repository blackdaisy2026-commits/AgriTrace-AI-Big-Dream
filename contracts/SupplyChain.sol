// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * AgriTraceTN - Supply Chain Smart Contract
 * TNI26040 TN-Hackathon 2026
 * Deploy to: Polygon Mumbai (Amoy testnet)
 */
contract SupplyChain {
    
    enum Stage { Harvest, QualityCheck, Processing, Transport, Sold }
    
    struct BatchEvent {
        Stage stage;
        string data;       // JSON string with details
        address actor;
        uint256 timestamp;
        string gps;
        bool verified;
    }
    
    struct Batch {
        uint256 id;
        string cropType;
        string farmer;
        address farmerAddress;
        uint256 weight;
        bool organic;
        bool fairTrade;
        Stage currentStage;
        uint256 createdAt;
        bool exists;
    }
    
    mapping(uint256 => Batch) public batches;
    mapping(uint256 => BatchEvent[]) public batchEvents;
    mapping(uint256 => address[]) public batchActors;
    
    uint256 public batchCount;
    
    // Events emitted to blockchain
    event BatchCreated(uint256 indexed batchId, string cropType, address farmer, uint256 timestamp);
    event EventLogged(uint256 indexed batchId, Stage stage, string data, address actor, uint256 timestamp);
    event StageUpdated(uint256 indexed batchId, Stage newStage, uint256 timestamp);
    
    modifier batchExists(uint256 batchId) {
        require(batches[batchId].exists, "Batch does not exist");
        _;
    }
    
    /**
     * Create a new batch (called by farmer on harvest)
     */
    function createBatch(
        string memory cropType,
        string memory farmerName,
        uint256 weightKg,
        bool isOrganic,
        bool isFairTrade,
        string memory harvestData,
        string memory gps
    ) external returns (uint256) {
        batchCount++;
        uint256 batchId = batchCount;
        
        batches[batchId] = Batch({
            id: batchId,
            cropType: cropType,
            farmer: farmerName,
            farmerAddress: msg.sender,
            weight: weightKg,
            organic: isOrganic,
            fairTrade: isFairTrade,
            currentStage: Stage.Harvest,
            createdAt: block.timestamp,
            exists: true
        });
        
        batchEvents[batchId].push(BatchEvent({
            stage: Stage.Harvest,
            data: harvestData,
            actor: msg.sender,
            timestamp: block.timestamp,
            gps: gps,
            verified: true
        }));
        
        batchActors[batchId].push(msg.sender);
        
        emit BatchCreated(batchId, cropType, msg.sender, block.timestamp);
        emit EventLogged(batchId, Stage.Harvest, harvestData, msg.sender, block.timestamp);
        
        return batchId;
    }
    
    /**
     * Log a supply chain event (quality check, processing, transport, sale)
     */
    function logEvent(
        uint256 batchId,
        Stage stage,
        string memory data,
        string memory gps
    ) external batchExists(batchId) {
        require(uint8(stage) > uint8(batches[batchId].currentStage), "Stage must advance forward");
        
        batches[batchId].currentStage = stage;
        
        batchEvents[batchId].push(BatchEvent({
            stage: stage,
            data: data,
            actor: msg.sender,
            timestamp: block.timestamp,
            gps: gps,
            verified: true
        }));
        
        // Add actor if new
        bool actorExists = false;
        for (uint i = 0; i < batchActors[batchId].length; i++) {
            if (batchActors[batchId][i] == msg.sender) { actorExists = true; break; }
        }
        if (!actorExists) batchActors[batchId].push(msg.sender);
        
        emit EventLogged(batchId, stage, data, msg.sender, block.timestamp);
        emit StageUpdated(batchId, stage, block.timestamp);
    }
    
    /**
     * Get all events for a batch
     */
    function getBatchEvents(uint256 batchId) external view batchExists(batchId) returns (BatchEvent[] memory) {
        return batchEvents[batchId];
    }
    
    /**
     * Get batch info
     */
    function getBatch(uint256 batchId) external view batchExists(batchId) returns (Batch memory) {
        return batches[batchId];
    }
    
    /**
     * Get event count for a batch
     */
    function getEventCount(uint256 batchId) external view returns (uint256) {
        return batchEvents[batchId].length;
    }
}
