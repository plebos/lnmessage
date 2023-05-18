import { Buffer } from 'buffer';
import { ccpDecrypt, ccpEncrypt, ecdh, getPublicKey, hkdf, sha256 } from './crypto.js';
export class NoiseState {
    /**
     * The official protocol name for the Lightning variant of Noise. This
     * value is mixed into the iniitialiization function to start the
     * handshake.
     */
    protocolName = Buffer.from('Noise_XK_secp256k1_ChaChaPoly_SHA256');
    /**
     * Appended to the hash of the protocolName during initialization.
     */
    prologue = Buffer.from('lightning');
    /**
     * Local secret is a 32-bit private key valid in elliptic curve
     * secp256k1. This value is unique to the node and should be
     * chosen with strong cryptographic randomness.
     */
    ls;
    /**
     * Local compressed public key derviced from the local secret `ls`.
     * This value is stored as a 33-byte buffer.
     */
    lpk;
    /**
     * Ephemeral secret is a 32-bit private key valid in elliptic curve
     * secp256k1. This value is generated by each node for each connection.
     * This value must be generated with strong cryptographic randomness.
     */
    es;
    /**
     * Ephemeral compressed public key derived from the ephemeral secret
     * `es`. This value is stored as a 33-byte buffer.
     */
    epk;
    /**
     * Remote compressed public key stored as a 33-byte buffer.
     */
    rpk;
    /**
     * Remote party's ephemeral public key as a 33-byte buffer storing
     * the compressed public key. This value is extracted in act 2 where
     * it is sent during act 1 to the opposing side.
     */
    repk;
    /**
     * Hanshake hash. This value is the accumulated hash of all handshake data that
     * has been sent and received during the handshake process.
     */
    h;
    /**
     * Chaining key. This value is the accumulated hash of all previous ECDH outputs.
     * At the end of the handshake, `ck` is used to dervice the encryption keys
     * for messages.
     */
    ck;
    /**
     * The key used is the receiving key used to decrypt messages sent by the
     * other side. It is generated in Act3.
     */
    rk;
    /**
     * The key used by the sender to encrypt messages to the receiver. This value
     * is generated in Act3.
     */
    sk;
    /**
     * Nonce incremented when sending messages. Initialized to zero in Act3.
     */
    sn;
    /**
     * Nonce incremented when receiving messages. Initialized to zero in Act3.
     */
    rn;
    /**
    * Chaining key for sending. Initialized to ck in Act 3.
    */
    sck;
    /**
    * Chaining key for receiving. Initialized to ck in Act 3.
    */
    rck;
    /**
     * Intermediate key 1. Used to encrypt or decrypt the zero-length AEAD
     * payload in the corresponding initiator or receiver act.
     */
    tempK1;
    /**
     * Intermediate key 2. Used to encrypt or decrypt the zero-length AEAD
     * payload in the corresponding initiator or receiver act.
     */
    tempK2;
    /**
     * Intermediate key 3. Used to encrypt or decrypt the zero-length AEAD
     * payload in the corresponding initiator or receiver act.
     */
    tempK3;
    /**
     * State machine for perforing noise-protocol handshake, message
     * encryption and decryption, and key rotation.
     */
    constructor({ ls, es }) {
        this.ls = ls;
        this.lpk = getPublicKey(ls);
        this.es = es;
        this.epk = getPublicKey(es);
    }
    /**
     * Initiator Act1 is the starting point for the authenticated key exchange
     * handshake. The initiator attempts to satisfy an implicit challenge by the
     * responder: knowledge of the static public key of the responder. It also
     * transmits the initiators ephemeral key.
     * @param rpk remote public key
     * @return Buffer that is 50 bytes
     */
    initiatorAct1(rpk) {
        this.rpk = rpk;
        this._initialize(this.rpk);
        // 2. h = SHA-256(h || epk)
        this.h = sha256(Buffer.concat([this.h, this.epk]));
        // 3. es = ECDH(e.priv, rs)
        const ss = ecdh(this.rpk, this.es);
        // 4. ck, temp_k1 = HKDF(ck, es)
        const tempK1 = hkdf(ss, 64, this.ck);
        this.ck = tempK1.subarray(0, 32);
        this.tempK1 = Buffer.from(tempK1.subarray(32));
        // 5. c = encryptWithAD(temp_k1, 0, h, zero)
        const c = ccpEncrypt(this.tempK1, Buffer.alloc(12), this.h, Buffer.alloc(0));
        // 6. h = SHA-256(h || c)
        this.h = sha256(Buffer.concat([this.h, c]));
        // 7. m = 0 || epk || c
        const m = Buffer.concat([Buffer.alloc(1), this.epk, c]);
        return m;
    }
    /**
     * Initiator Act2 handles the response generated by the receiver's
     * Act1, a 50-byte message. The responder's ephemeral key is extacted
     * from the message during this phase.
     *
     * @param m 50-byte message from responder's act1
     */
    initiatorAct2(m) {
        // 1. read exactly 50 bytes off the stream
        if (m.length !== 50)
            throw new Error('ACT2_READ_FAILED');
        // 2. parse th read message m into v, re, and c
        const v = m.subarray(0, 1)[0];
        const re = m.subarray(1, 34);
        const c = m.subarray(34);
        // 2a. convert re to public key
        this.repk = re;
        // 3. assert version is known version
        if (v !== 0)
            throw new Error('ACT2_BAD_VERSION');
        // 4. sha256(h || re.serializedCompressed');
        this.h = sha256(Buffer.concat([this.h, this.repk]));
        // 5. ss = ECDH(re, e.priv);
        const ss = ecdh(this.repk, this.es);
        // 6. ck, temp_k2 = HKDF(cd, ss)
        const tempK2 = hkdf(ss, 64, this.ck);
        this.ck = tempK2.subarray(0, 32);
        this.tempK2 = tempK2.subarray(32);
        // 7. p = decryptWithAD()
        ccpDecrypt(this.tempK2, Buffer.alloc(12), this.h, c);
        // 8. h = sha256(h || c)
        this.h = sha256(Buffer.concat([this.h, c]));
    }
    /**
     * Initiator Act3 is the final phase in the authenticated
     * key agreement. This act is executed only if act 2
     * was successful. The initiator transports its static public key
     * to the responder.
     */
    initiatorAct3() {
        // 1. c = encryptWithAD(temp_k2, 1, h, lpk)
        const c = ccpEncrypt(this.tempK2, Buffer.from([0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]), this.h, this.lpk);
        // 2. h = sha256(h || c)
        this.h = sha256(Buffer.concat([this.h, c]));
        // 3. ss = ECDH(re, s.priv)
        const ss = ecdh(this.repk, this.ls);
        // 4. ck, temp_k3 = HKDF(ck, ss)
        const tempK3 = hkdf(ss, 64, this.ck);
        this.ck = tempK3.subarray(0, 32);
        this.tempK3 = Buffer.from(tempK3.subarray(32));
        this.rck = this.sck = this.ck;
        // 5. t = encryptWithAD(temp_k3, 0, h, zero)
        const t = ccpEncrypt(this.tempK3, Buffer.alloc(12), this.h, Buffer.alloc(0));
        // 6. sk, rk = hkdf(ck, zero)
        const sk = hkdf(Buffer.alloc(0), 64, this.ck);
        this.rk = sk.subarray(32);
        this.sk = sk.subarray(0, 32);
        // 7. rn = 0, sn = 0
        this.sn = Buffer.alloc(12);
        this.rn = Buffer.alloc(12);
        // 8. send m = 0 || c || t
        const m = Buffer.concat([Buffer.alloc(1), c, t]);
        return m;
    }
    /**
     * Receiver Act1 extracts the initiators ephemeral key. It also
     * validates that the initiator knows the receivers public key.
     * @param m 50-byte message sent by the initiator
     */
    receiveAct1(m) {
        this._initialize(this.lpk);
        // 1. read exactly 50 bytes off the stream
        if (m.length !== 50)
            throw new Error('ACT1_READ_FAILED');
        // 2. parse th read message m into v,re, and c
        const v = m.subarray(0, 1)[0];
        const re = m.subarray(1, 34);
        const c = m.subarray(34);
        this.repk = re;
        // 3. assert version is known version
        if (v !== 0)
            throw new Error('ACT1_BAD_VERSION');
        // 4. sha256(h || re.serializedCompressed');
        this.h = sha256(Buffer.concat([this.h, re]));
        // 5. ss = ECDH(re, ls.priv);
        const ss = ecdh(re, this.ls);
        // 6. ck, temp_k1 = HKDF(cd, ss)
        const tempK1 = hkdf(ss, 64, this.ck);
        this.ck = tempK1.subarray(0, 32);
        this.tempK1 = tempK1.subarray(32);
        // 7. p = decryptWithAD(temp_k1, 0, h, c)
        ccpDecrypt(this.tempK1, Buffer.alloc(12), this.h, c);
        // 8. h = sha256(h || c)
        this.h = sha256(Buffer.concat([this.h, c]));
    }
    /**
     * Receiver Act2 takes place only if Act1 was successful.
     * This act sends responder's ephermeral key to the initiator.
     */
    recieveAct2() {
        // 1. e = generateKey() => done in initialization
        // 2. h = sha256(h || e.pub.compressed())
        this.h = sha256(Buffer.concat([this.h, this.epk]));
        // 3. ss = ecdh(re, e.priv)
        const ss = ecdh(this.repk, this.es);
        // 4. ck, temp_k2 = hkdf(ck, ss)
        const tempK2 = hkdf(ss, 64, this.ck);
        this.ck = tempK2.subarray(0, 32);
        this.tempK2 = Buffer.from(tempK2.subarray(32));
        // 5. c = encryptWithAd(temp_k2, 0, h, zero)
        const c = ccpEncrypt(this.tempK2, Buffer.alloc(12), this.h, Buffer.alloc(0));
        // 6. h = sha256(h || c)
        this.h = sha256(Buffer.concat([this.h, c]));
        // 7. m = 0 || e.pub.compressed() Z|| c
        const m = Buffer.concat([Buffer.alloc(1), this.epk, c]);
        return m;
    }
    /**
     * Receiver Act3 is the final phase in the authenticated key
     * agreement. This act is executed only if act 2 was successful.
     * The receiver extracts the public key of the initiator.
     * @param m 66-byte message
     */
    receiveAct3(m) {
        // 1. read exactly 66 bytes from the network buffer
        if (m.length !== 66)
            throw new Error('ACT3_READ_FAILED');
        // 2. parse m into v, c, t
        const v = m.subarray(0, 1)[0];
        const c = m.subarray(1, 50);
        const t = m.subarray(50);
        // 3. validate v is recognized
        if (v !== 0)
            throw new Error('ACT3_BAD_VERSION');
        // 4. rs = decryptWithAD(temp_k2, 1, h, c)
        const rs = ccpDecrypt(this.tempK2, Buffer.from('000000000100000000000000', 'hex'), this.h, c);
        this.rpk = rs;
        // 5. h = sha256(h || c)
        this.h = sha256(Buffer.concat([this.h, c]));
        // 6. ss = ECDH(rs, e.priv)
        const ss = ecdh(this.rpk, this.es);
        // 7. ck, temp_k3 = hkdf(cs, ss)
        const tempK3 = hkdf(ss, 64, this.ck);
        this.ck = tempK3.subarray(0, 32);
        this.tempK3 = tempK3.subarray(32);
        // 8. p = decryptWithAD(temp_k3, 0, h, t)
        ccpDecrypt(this.tempK3, Buffer.alloc(12), this.h, t);
        // 9. rk, sk = hkdf(ck, zero)
        const sk = hkdf(Buffer.alloc(0), 64, this.ck);
        this.rk = sk.subarray(0, 32);
        this.sk = sk.subarray(32);
        // 10. rn = 0, sn = 0
        this.rn = Buffer.alloc(12);
        this.sn = Buffer.alloc(12);
    }
    /**
     * Sends an encrypted message using the shared sending key and nonce.
     * The nonce is rotated once the message is sent. The sending key is
     * rotated every 1000 messages.
     * @param m
     */
    encryptMessage(m) {
        // step 1/2. serialize m length into int16
        const l = Buffer.alloc(2);
        l.writeUInt16BE(m.length, 0);
        // step 3. encrypt l, using chachapoly1305, sn, sk)
        const lc = ccpEncrypt(this.sk, this.sn, Buffer.alloc(0), l);
        // step 3a: increment sn
        if (this._incrementSendingNonce() >= 1000)
            this._rotateSendingKeys();
        // step 4 encrypt m using chachapoly1305, sn, sk
        const c = ccpEncrypt(this.sk, this.sn, Buffer.alloc(0), m);
        // step 4a: increment sn
        if (this._incrementSendingNonce() >= 1000)
            this._rotateSendingKeys();
        // step 5 return m to be sent
        return Buffer.concat([lc, c]);
    }
    /**
     * Decrypts the length of the message using the receiving key and nonce.
     * The receiving key is rotated every 1000 messages.
     */
    decryptLength(lc) {
        const l = ccpDecrypt(this.rk, this.rn, Buffer.alloc(0), lc);
        if (this._incrementRecievingNonce() >= 1000)
            this._rotateRecievingKeys();
        return l.readUInt16BE(0);
    }
    /**
     * Decrypts the message using the receiving key and nonce. The receiving
     * key is rotated every 1000 messages.
     */
    decryptMessage(c) {
        const m = ccpDecrypt(this.rk, this.rn, Buffer.alloc(0), c);
        if (this._incrementRecievingNonce() >= 1000)
            this._rotateRecievingKeys();
        return m;
    }
    /////////////////////////////////////
    /**
     * Initializes the noise state prior to Act1.
     */
    _initialize(pubkey) {
        // 1. h = SHA-256(protocolName)
        this.h = sha256(Buffer.from(this.protocolName));
        // 2. ck = h
        this.ck = this.h;
        // 3. h = SHA-256(h || prologue)
        this.h = sha256(Buffer.concat([this.h, this.prologue]));
        // 4. h = SHA-256(h || pubkey)
        this.h = sha256(Buffer.concat([this.h, pubkey]));
    }
    _incrementSendingNonce() {
        const newValue = this.sn.readUInt16LE(4) + 1;
        this.sn.writeUInt16LE(newValue, 4);
        return newValue;
    }
    _incrementRecievingNonce() {
        const newValue = this.rn.readUInt16LE(4) + 1;
        this.rn.writeUInt16LE(newValue, 4);
        return newValue;
    }
    _rotateSendingKeys() {
        const result = hkdf(this.sk, 64, this.sck);
        this.sk = result.subarray(32);
        this.sck = result.subarray(0, 32);
        this.sn = Buffer.alloc(12);
    }
    _rotateRecievingKeys() {
        const result = hkdf(this.rk, 64, this.rck);
        this.rk = result.subarray(32);
        this.rck = result.subarray(0, 32);
        this.rn = Buffer.alloc(12);
    }
}
//# sourceMappingURL=noise-state.js.map