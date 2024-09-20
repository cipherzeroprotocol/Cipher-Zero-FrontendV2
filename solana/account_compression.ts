import { Connection, PublicKey } from '@solana/web3.js';

async function getAccountInfo(connection: Connection, publicKey: PublicKey) {
    try {
        const accountInfo = await connection.getAccountInfo(publicKey);
        if (accountInfo === null) {
            throw new Error('Account not found');
        }
        return accountInfo;
    } catch (error) {
        console.error('Error fetching account info:', error);
        throw error;
    }
}

async function main() {
    const connection = new Connection('https://api.mainnet-beta.solana.com');
    const publicKey = new PublicKey('YourPublicKeyHere');

    try {
        const accountInfo = await getAccountInfo(connection, publicKey);
        console.log('Account Info:', accountInfo);
    } catch (error) {
        console.error('Error:', error);
    }
}

main().catch(console.error);