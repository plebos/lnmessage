/// <reference types="node" />
import { IWireMessage } from './IWireMessage.js';
export declare function deserialize(buffer: Buffer): IWireMessage | {
    type: number;
};
