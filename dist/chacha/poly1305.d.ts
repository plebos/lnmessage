/// <reference types="node" />
import { Buffer } from 'buffer';
declare class Poly1305 {
    buffer: Buffer;
    leftover: number;
    r: Uint16Array;
    h: Uint16Array;
    pad: Uint16Array;
    finished: number;
    constructor(key: Buffer);
    blocks(m: Buffer, mpos: number, bytes: number): void;
    update(m: Buffer): this;
    finish(): Buffer;
}
export default Poly1305;
