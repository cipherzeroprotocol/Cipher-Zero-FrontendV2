import { RPC_ENDPOINT } from '../utils/constants';
import { createRpc } from '@lightprotocol/stateless.js'; // Import the specific type if available

// Create a connection instance using the Stateless RPC library
const connection = createRpc(RPC_ENDPOINT, RPC_ENDPOINT);

/**
 * Retrieves the current blockchain slot.
 * @returns The current slot number as a Promise.
 * @throws Error if the slot retrieval fails.
 */
export const getSlot = async (): Promise<number> => {
    try {
        const slot = await connection.getSlot();
        console.log(`Current Slot: ${slot}`);
        return slot;
    } catch (error) {
        console.error('Failed to retrieve slot:', error);
        throw new Error('Slot retrieval failed');
    }
};

/**
 * Retrieves the health status of the indexer for a specific slot.
 * @param slot - The slot number for which to check the indexer health.
 * @returns The health status as a Promise.
 * @throws Error if the indexer health check fails.
 */
export const getIndexerHealth = async (slot: number): Promise<string> => {
    try {
        const health = await connection.getIndexerHealth();
        console.log(`Indexer Health for Slot ${slot}: ${health}`);
        return health;
    } catch (error) {
        console.error('Failed to retrieve indexer health:', error);
        throw new Error('Indexer health check failed');
    }
};

/**
 * Main function to demonstrate retrieving slot and indexer health.
 */
const main = async () => {
    try {
        const slot = await getSlot();
        await getIndexerHealth(slot);
    } catch (error) {
        console.error('Error in main execution:', error);
    }
};

main();
