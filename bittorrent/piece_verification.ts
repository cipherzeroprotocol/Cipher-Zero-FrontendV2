import { sha256, Connection } from '@solana/web3.js';
import { ZkUtils } from '../zk_compression/zk_utils';
import { logger } from '../utils/logger';

export class PieceVerification {
    private zkUtils: ZkUtils;

    constructor(connection: Connection) {
        this.zkUtils = new ZkUtils(connection);
    }

    async verifyPiece(piece: Buffer, expectedHash: string, proof: any): Promise<boolean> {
        logger.debug('Verifying piece integrity and proof');

        // Verify the piece hash
        const pieceHash = sha256(piece);
        if (pieceHash.toString('hex') !== expectedHash) {
            logger.warn('Piece hash mismatch');
            return false;
        }

        // Verify the zero-knowledge proof
        const isValidProof = await this.zkUtils.verifyZkProof(proof, { pieceHash: expectedHash }, 'piece_verification_key');
        if (!isValidProof) {
            logger.warn('Invalid zero-knowledge proof for piece');
            return false;
        }

        logger.info('Piece verified successfully');
        return true;
    }

    async generatePieceProof(piece: Buffer): Promise<any> {
        logger.debug('Generating proof for piece');
        const pieceHash = sha256(piece);
        const proof = await this.zkUtils.generateZkProof(piece, 'piece_circuit');
        return proof;
    }

    async verifyMerkleProof(piece: Buffer, merkleProof: any, merkleRoot: Buffer): Promise<boolean> {
        logger.debug('Verifying Merkle proof for piece');
        return this.zkUtils.verifyMerkleProof(merkleProof, merkleRoot, piece);
    }
}