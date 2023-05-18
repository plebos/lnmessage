import { Buffer } from 'buffer';
import * as secp256k1 from '@noble/secp256k1';
import { createCipher, createDecipher } from './chacha/index.js';
import { hmac } from '@noble/hashes/hmac';
import { sha256 as sha256Array } from '@noble/hashes/sha256';
import { bytesToHex, randomBytes } from '@noble/hashes/utils';
export function sha256(input) {
    return Buffer.from(sha256Array(input));
}
export function ecdh(pubkey, privkey) {
    const point = secp256k1.Point.fromHex(secp256k1.getSharedSecret(privkey, pubkey));
    return Buffer.from(sha256(point.toRawBytes(true)));
}
export function hmacHash(key, input) {
    return Buffer.from(hmac(sha256Array, key, input));
}
export function hkdf(ikm, len, salt = Buffer.alloc(0), info = Buffer.alloc(0)) {
    // extract step
    const prk = hmacHash(salt, ikm);
    // expand
    const n = Math.ceil(len / prk.byteLength);
    if (n > 255)
        throw new Error('Output length exceeds maximum');
    const t = [Buffer.alloc(0)];
    for (let i = 1; i <= n; i++) {
        const tp = t[t.length - 1];
        const bi = Buffer.from([i]);
        t.push(hmacHash(prk, Buffer.concat([tp, info, bi])));
    }
    return Buffer.concat(t.slice(1)).subarray(0, len);
}
export function getPublicKey(privKey, compressed = true) {
    return Buffer.from(secp256k1.getPublicKey(privKey, compressed));
}
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
export function ccpEncrypt(k, n, ad, plaintext) {
    const cipher = createCipher(k, n);
    cipher.setAAD(ad);
    const pad = cipher.update(plaintext);
    cipher.final && cipher.final();
    const tag = cipher.getAuthTag();
    return Buffer.concat([pad, tag]);
}
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
export function ccpDecrypt(k, n, ad, ciphertext) {
    const decipher = createDecipher(k, n);
    decipher.setAAD(ad);
    if (ciphertext.length === 16) {
        decipher.setAuthTag(ciphertext);
        return decipher.final();
    }
    if (ciphertext.length > 16) {
        const tag = ciphertext.subarray(ciphertext.length - 16);
        const pad = ciphertext.subarray(0, ciphertext.length - 16);
        decipher.setAuthTag(tag);
        let m = decipher.update(pad);
        const f = decipher.final();
        m = Buffer.concat([m, f]);
        return m;
    }
}
export function createRandomPrivateKey() {
    let privKey;
    do {
        privKey = randomBytes(32);
    } while (!validPrivateKey(Buffer.from(privKey)));
    return bytesToHex(privKey);
}
export function validPublicKey(publicKey) {
    try {
        secp256k1.Point.fromHex(publicKey);
        return true;
    }
    catch (e) {
        return false;
    }
}
export function validPrivateKey(privateKey) {
    return secp256k1.utils.isValidPrivateKey(privateKey);
}
export function createRandomBytes(length) {
    return randomBytes(length);
}
//# sourceMappingURL=crypto.js.map