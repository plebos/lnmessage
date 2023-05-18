/// <reference types="node" />
import { Buffer } from 'buffer';
declare class Chacha20 {
    input: Uint32Array;
    cachePos: number;
    buffer: Uint32Array;
    output: Buffer;
    constructor(key: Buffer, nonce: Buffer);
    quarterRound(a: number, b: number, c: number, d: number): void;
    makeBlock(output: Buffer, start: number): void;
    getBytes(len: number): Buffer;
}
export default Chacha20;
