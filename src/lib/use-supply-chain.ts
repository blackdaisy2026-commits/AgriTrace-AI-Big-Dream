'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { SUPPLY_CHAIN_ABI, CONTRACT_ADDRESS } from './blockchain'

export function useSupplyChain() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()

    // Function to create a new batch (Harvest)
    const createBatch = async (
        cropType: string,
        farmerName: string,
        weight: number,
        isOrganic: boolean,
        isFairTrade: boolean,
        harvestData: string,
        gps: string
    ) => {
        return writeContract({
            abi: SUPPLY_CHAIN_ABI,
            address: CONTRACT_ADDRESS,
            functionName: 'createBatch',
            args: [cropType, farmerName, BigInt(weight), isOrganic, isFairTrade, harvestData, gps],
        })
    }

    // Function to log a new stage event
    const logEvent = async (
        batchId: string,
        stage: number, // 0: Harvest, 1: QualityCheck, 2: Processing, 3: Transport, 4: Sold
        data: string,
        gps: string
    ) => {
        return writeContract({
            abi: SUPPLY_CHAIN_ABI,
            address: CONTRACT_ADDRESS,
            functionName: 'logEvent',
            args: [BigInt(batchId), stage, data, gps],
        })
    }

    return {
        createBatch,
        logEvent,
        hash,
        isPending,
        error
    }
}

export function useBatchDetails(batchId: string) {
    const batchQuery = useReadContract({
        abi: SUPPLY_CHAIN_ABI,
        address: CONTRACT_ADDRESS,
        functionName: 'getBatch',
        args: [BigInt(batchId)],
        query: {
            enabled: !!batchId && !isNaN(Number(batchId)),
        }
    })

    const eventsQuery = useReadContract({
        abi: SUPPLY_CHAIN_ABI,
        address: CONTRACT_ADDRESS,
        functionName: 'getBatchEvents',
        args: [BigInt(batchId)],
        query: {
            enabled: !!batchId && !isNaN(Number(batchId)),
        }
    })

    return {
        batch: batchQuery.data,
        events: eventsQuery.data,
        isLoading: batchQuery.isLoading || eventsQuery.isLoading,
        error: batchQuery.error || eventsQuery.error,
        refetch: () => {
            batchQuery.refetch();
            eventsQuery.refetch();
        }
    }
}
