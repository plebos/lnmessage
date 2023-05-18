/// <reference types="node" />
import { Buffer } from 'buffer';
declare class Cipher {
    private alen;
    private clen;
    private chacha;
    private poly;
    private tag;
    private _decrypt;
    private _hasData;
    constructor(key: Buffer, iv: Buffer, decrypt?: boolean);
    setAAD(aad: Buffer): void;
    update(data: string | Buffer, inputEnc?: BufferEncoding, outputEnc?: BufferEncoding): string | Buffer;
    final(outputEnc?: BufferEncoding): string | Buffer;
    _update(chunk: Buffer): Buffer | undefined;
    _final(): Buffer;
    getAuthTag(): Buffer;
    setAuthTag(tag: Buffer): void;
}
export declare function createDecipher(key: Buffer, iv: Buffer): Cipher;
export declare function createCipher(key: Buffer, iv: Buffer): Cipher;
export {};
