import { get, set, del, keys } from "idb-keyval";

export interface QueuedEvent {
    id: string;
    type: "harvest" | "process" | "transport" | "sell";
    data: Record<string, unknown>;
    timestamp: string;
    batchId: string;
    status: "pending" | "syncing" | "synced" | "failed";
}

const QUEUE_PREFIX = "agri-queue-";

export async function queueEvent(
    type: QueuedEvent["type"],
    data: Record<string, unknown>,
    batchId: string
): Promise<string> {
    const id = `${QUEUE_PREFIX}${Date.now()}`;
    const event: QueuedEvent = {
        id,
        type,
        data,
        batchId,
        timestamp: new Date().toISOString(),
        status: "pending",
    };
    await set(id, event);
    return id;
}

export async function getPendingEvents(): Promise<QueuedEvent[]> {
    const allKeys = await keys();
    const queueKeys = allKeys.filter((k) =>
        String(k).startsWith(QUEUE_PREFIX)
    );
    const events: QueuedEvent[] = [];
    for (const key of queueKeys) {
        const event = await get<QueuedEvent>(key);
        if (event && event.status !== "synced") {
            events.push(event);
        }
    }
    return events.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
}

export async function markEventSynced(id: string): Promise<void> {
    const event = await get<QueuedEvent>(id);
    if (event) {
        event.status = "synced";
        await set(id, event);
        // Clean up synced events after 1 min
        setTimeout(() => del(id), 60000);
    }
}

export async function clearSyncedEvents(): Promise<void> {
    const allKeys = await keys();
    const queueKeys = allKeys.filter((k) => String(k).startsWith(QUEUE_PREFIX));
    for (const key of queueKeys) {
        const event = await get<QueuedEvent>(key);
        if (event?.status === "synced") {
            await del(key);
        }
    }
}
