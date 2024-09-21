import { PublicKey, Connection, Keypair } from '@solana/web3.js';
import { PeerConnection } from './peer_connection';
import { PieceVerification } from './piece_verification';
import { logger } from '../utils/logger';
import { ZkUtils } from '../zk_compression/zk_utils';
import { sha256 } from 'ethers';
import {
    LightSystemProgram,
    Rpc,
    confirmTx,
    createRpc,
} from "@lightprotocol/stateless.js";
import { createMint, mintTo, transfer } from "@lightprotocol/compressed-token";

export class CrossSwarmSharing {
    private peers: Map<string, PeerConnection>;
    private pieceVerification: PieceVerification;
    private zkUtils: ZkUtils;
    private connection: Rpc;
    private payer: Keypair;

    constructor(connection: Connection) {
        this.peers = new Map();
        this.pieceVerification = new PieceVerification(connection);
        this.zkUtils = new ZkUtils(connection);
        this.connection = createRpc(process.env.RPC_ENDPOINT!, process.env.COMPRESSION_RPC_ENDPOINT!);
        this.payer = Keypair.generate();
    }

    async addPeer(peerId: string, solanaPublicKey: PublicKey): Promise<void> {
        const peer = new PeerConnection(peerId, solanaPublicKey, this.zkUtils.getConnection());
        await peer.connect();
        this.peers.set(peerId, peer);
        logger.info(`Added peer ${peerId} to cross-swarm sharing`);
    }

    async removePeer(peerId: string): Promise<void> {
        const peer = this.peers.get(peerId);
        if (peer) {
            await peer.disconnect();
            this.peers.delete(peerId);
            logger.info(`Removed peer ${peerId} from cross-swarm sharing`);
        }
    }

    async sharePiece(pieceIndex: number, pieceData: Buffer, targetSwarm: string): Promise<void> {
        logger.info(`Sharing piece ${pieceIndex} with swarm ${targetSwarm}`);
        
        const proof = await this.pieceVerification.generatePieceProof(pieceData);
        const encryptedPiece = await this.zkUtils.encryptData(pieceData);

        for (const peer of this.peers.values()) {
            if (peer.getPeerId().startsWith(targetSwarm)) {
                await peer.sendPiece(pieceIndex, encryptedPiece);
                await peer.sendEncryptedMessage(Buffer.from(JSON.stringify(proof)));
            }
        }
    }

    async receivePiece(pieceIndex: number, encryptedPiece: Buffer, encryptedProof: Buffer, peerPublicKey: PublicKey): Promise<Buffer> {
        logger.info(`Receiving piece ${pieceIndex} from peer ${peerPublicKey.toBase58()}`);

        const pieceData = await this.zkUtils.decryptData(encryptedPiece);
        const proof = JSON.parse((await this.zkUtils.decryptData(encryptedProof)).toString());

        const pieceHash = Buffer.from(sha256(pieceData)).toString('hex');
        const isValid = await this.pieceVerification.verifyPiece(pieceData, pieceHash, proof);
        if (!isValid) {
            throw new Error('Invalid piece or proof');
        }

        return pieceData;
    }

    async initiateSwarmDiscovery(swarmId: string): Promise<void> {
        logger.info(`Initiating discovery for swarm ${swarmId}`);
        // Implement swarm discovery logic here
        // This could involve DHT lookups, tracker communication, or other discovery mechanisms
    }

    async negotiateCrossSwarmTransfer(sourceSwarm: string, targetSwarm: string, fileHash: string): Promise<void> {
        logger.info(`Negotiating cross-swarm transfer for file ${fileHash} from ${sourceSwarm} to ${targetSwarm}`);
        // Implement negotiation logic here
        // This could involve creating a Solana transaction to record the transfer agreement
    }

    async airdropLamports(): Promise<void> {
        await confirmTx(this.connection, await this.connection.requestAirdrop(this.payer.publicKey, 10e9)); // 10 SOL to payer
    }

    async createCompressedMint(): Promise<string> {
        const { mint, transactionSignature } = await createMint(
            this.connection,
            this.payer,
            this.payer.publicKey,
            9 // Number of decimals for the token
        );
        logger.info(`Mint created with transaction: ${transactionSignature}`);
        return mint.toBase58();
    }

    async mintCompressedTokens(mintAddress: string): Promise<void> {
        const mintToTxId = await mintTo(this.connection, this.payer, new PublicKey(mintAddress), this.payer.publicKey, this.payer, 1e9);
        logger.info(`Minted tokens with transaction: ${mintToTxId}`);
    }

    async transferCompressedTokens(mintAddress: string, amount: number): Promise<void> {
        const transferTxId = await transfer(this.connection, this.payer, new PublicKey(mintAddress), amount, this.payer, new PublicKey('recipientPublicKey'));
        logger.info(`Transferred tokens with transaction: ${transferTxId}`);
    }
}