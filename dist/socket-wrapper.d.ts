/// <reference types="node" />
/// <reference types="node" />
import type { Socket } from 'net';
import type { Buffer } from 'buffer';
declare class SocketWrapper {
    onopen?: () => void;
    onclose?: () => void;
    onerror?: (error: {
        message: string;
    }) => void;
    onmessage?: (event: {
        data: ArrayBuffer;
    }) => void;
    send: (message: Buffer) => void;
    close: () => void;
    constructor(connection: string, socket: Socket);
}
export default SocketWrapper;
