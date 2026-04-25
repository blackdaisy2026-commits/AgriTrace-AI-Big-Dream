import { get, set, keys } from "idb-keyval";

export interface Batch {
    id: string;
    crop: string;
    cropTamil?: string;
    farmer: string;
    district: string;
    village?: string;
    weight: string;
    timestamp: string;
    currentStage: "Harvested" | "Quality Tested" | "Processed" | "In Transit" | "Sold";
    organic: boolean;
    fairTrade: boolean;
    gps?: string;
    photo?: string;
    history: BatchEvent[];
}

export interface BatchEvent {
    stage: string;
    actor: string;
    timestamp: string;
    location: string;
    notes: string;
    txHash: string;
}

const BATCH_STORE_KEY = "agri-batches-registry";

export async function saveLiveBatch(batch: Batch): Promise<void> {
    const batches = await getLiveBatches();
    batches[batch.id] = batch;
    await set(BATCH_STORE_KEY, batches);
}

export async function getLiveBatches(): Promise<Record<string, Batch>> {
    const stored = await get<Record<string, Batch>>(BATCH_STORE_KEY);
    return stored || {};
}

export async function getBatchById(id: string): Promise<Batch | null> {
    const batches = await getLiveBatches();
    return batches[id] || null;
}
