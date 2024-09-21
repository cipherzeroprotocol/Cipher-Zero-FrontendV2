import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { sha256 } from 'ethers';  // Updated import
import { logger } from '../utils/logger';
import { MerkleProof } from '../types';

export class SolanaMerkleTree {
  private leaves: Buffer[];
  private layers: Buffer[][];
  private hashFunction: (data: Buffer) => Buffer;

  constructor(leaves: Buffer[], customHashFunction?: (data: Buffer) => Buffer) {
    this.hashFunction = customHashFunction || this.defaultHash;
    this.leaves = leaves.map(leaf => this.hashFunction(leaf));
    this.layers = [this.leaves];
    this.buildTree();
  }

  private buildTree(): void {
    logger.debug('Building Solana Merkle tree...');
    while (this.layers[this.layers.length - 1].length > 1) {
      const currentLayer = this.layers[this.layers.length - 1];
      const newLayer: Buffer[] = [];
      for (let i = 0; i < currentLayer.length; i += 2) {
        if (i + 1 < currentLayer.length) {
          newLayer.push(this.hashPair(currentLayer[i], currentLayer[i + 1]));
        } else {
          newLayer.push(currentLayer[i]);
        }
      }
      this.layers.push(newLayer);
    }
    logger.debug(`Solana Merkle tree built with ${this.leaves.length} leaves and ${this.layers.length} layers`);
  }

  private hashPair(left: Buffer, right: Buffer): Buffer {
    return left.compare(right) <= 0
      ? this.hashFunction(Buffer.concat([left, right]))
      : this.hashFunction(Buffer.concat([right, left]));
  }

  private defaultHash(data: Buffer): Buffer {
    return Buffer.from(sha256(data).slice(2), 'hex');
  }

  public getRoot(): Buffer {
    return this.layers[this.layers.length - 1][0];
  }

  public getProof(index: number): MerkleProof {
    if (index < 0 || index >= this.leaves.length) {
      throw new Error('Leaf index out of bounds');
    }

    const proof: MerkleProof = {
      leaf: this.leaves[index].toString('hex'),
      path: [],
      indices: [],
      root: '',
      siblings: []
    };

    for (let i = 0; i < this.layers.length - 1; i++) {
      const isRightNode = index % 2 === 0;
      const siblingIndex = isRightNode ? index + 1 : index - 1;

      if (siblingIndex < this.layers[i].length) {
        proof.path.push(this.layers[i][siblingIndex].toString('hex'));
        proof.indices.push(isRightNode ? 1 : 0);
      }

      index = Math.floor(index / 2);
    }

    return proof;
  }

  public verifyProof(proof: MerkleProof, root: Buffer): boolean {
    let computedHash = Buffer.from(proof.leaf, 'hex');

    for (let i = 0; i < proof.path.length; i++) {
      const proofElement = Buffer.from(proof.path[i], 'hex');
      if (proof.indices[i] === 0) {
        computedHash = this.hashPair(proofElement, computedHash);
      } else {
        computedHash = this.hashPair(computedHash, proofElement);
      }
    }

    return computedHash.equals(root);
  }

  public updateLeaf(index: number, newLeaf: Buffer): void {
    if (index < 0 || index >= this.leaves.length) {
      throw new Error('Leaf index out of bounds');
    }

    const newLeafHash = this.hashFunction(newLeaf);
    this.leaves[index] = newLeafHash;

    let currentIndex = index;
    for (let i = 0; i < this.layers.length - 1; i++) {
      const isRightNode = currentIndex % 2 === 0;
      const siblingIndex = isRightNode ? currentIndex + 1 : currentIndex - 1;
      const currentLayer = this.layers[i];

      if (siblingIndex < currentLayer.length) {
        const newParentHash = this.hashPair(
          isRightNode ? currentLayer[currentIndex] : currentLayer[siblingIndex],
          isRightNode ? currentLayer[siblingIndex] : currentLayer[currentIndex]
        );
        this.layers[i + 1][Math.floor(currentIndex / 2)] = newParentHash;
      } else {
        this.layers[i + 1][Math.floor(currentIndex / 2)] = currentLayer[currentIndex];
      }

      currentIndex = Math.floor(currentIndex / 2);
    }

    logger.debug(`Updated leaf at index ${index}`);
  }

  public getLeafCount(): number {
    return this.leaves.length;
  }

  public getTreeDepth(): number {
    return this.layers.length - 1;
  }

  public createVerifyProofTransaction(
    programId: PublicKey,
    proof: MerkleProof,
    root: Buffer
  ): Transaction {
    const verifyProofInstruction = new TransactionInstruction({
      keys: [
        { pubkey: PublicKey.default, isSigner: false, isWritable: false }
      ],
      programId,
      data: Buffer.from([
        ...Buffer.from(proof.leaf, 'hex'),
        ...Buffer.concat(proof.path.map(p => Buffer.from(p, 'hex'))),
        ...Array.from(new Uint8Array(proof.indices)),
        ...Array.from(root)
      ])
    });

    const transaction = new Transaction().add(verifyProofInstruction);
    return transaction;
  }

  public createUpdateRootTransaction(
    programId: PublicKey,
    newRoot: Buffer
  ): Transaction {
    const updateRootInstruction = new TransactionInstruction({
      keys: [
        { pubkey: PublicKey.default, isSigner: false, isWritable: true }
      ],
      programId,
      data: newRoot
    });

    const transaction = new Transaction().add(updateRootInstruction);
    return transaction;
  }
}