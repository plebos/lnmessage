/// <reference types="node" />
import { Buffer } from 'buffer';
export declare function sha256(input: Uint8Array): Buffer;
export declare function ecdh(pubkey: Uint8Array, privkey: Uint8Array): Buffer;
export declare function hmacHash(key: Buffer, input: Buffer): Buffer;
export declare function hkdf(ikm: Buffer, len: number, salt?: Buffer, info?: Buffer): Buffer;
export declare function getPublicKey(privKey: Buffer, compressed?: boolean): Buffer;
/**
 * Encrypt data using authenticated encryption with associated data (AEAD)
 * ChaCha20-Poly1305.
 *
 * @param k private key, 64-bytes
 * @param n nonce, 12-bytes
 * @param ad associated data
 * @param plaintext raw data to encrypt
 * @returns encrypted data + tag as a variable length buffer
 */
export declare function ccpEncrypt(k: Buffer, n: Buffer, ad: Buffer, plaintext: Buffer): Buffer;
/**
 * Decrypt data uusing authenticated encryption with associated data (AEAD)
 * ChaCha20-Poly1305
 *
 * @param k private key, 64-bytes
 * @param n nonce, 12-bytes
 * @param ad associated data, variable length
 * @param ciphertext encrypted data to decrypt
 * @returns decrypteed data as a variable length Buffer
 */
export declare function ccpDecrypt(k: Buffer, n: Buffer, ad: Buffer, ciphertext: Buffer): string | Buffer | undefined;
export declare function createRandomPrivateKey(): string;
export declare function validPublicKey(publicKey: string): boolean;
export declare function validPrivateKey(privateKey: string | Buffer): boolean;
export declare function createRandomBytes(length: number): Uint8Array;
