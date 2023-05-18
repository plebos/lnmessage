/// <reference types="node" />
import { Buffer } from 'buffer';
import { MessageType } from '../types.js';
import { IWireMessage } from './IWireMessage.js';
export declare class PongMessage implements IWireMessage {
    /**
     * Deserializes a pong message from a Buffer into a PongMessage
     * instance.
     */
    static deserialize(payload: Buffer): PongMessage;
    /**
     * Message type = 19
     */
    type: MessageType;
    /**
     * Should be set to zeros of length specified in a ping message's
     * num_pong_bytes. Must not set ignored to sensitive data such as
     * secrets or portions of initialized memory.
     */
    ignored: Buffer;
    /**
     * In order to allow for the existence of long-lived TCP
     * connections, at times it may be required that both ends keep
     * alive the TCP connection at the application level.
     *
     * The pong message is a reply to a ping message and must
     * reply with the specify number of bytes when the num_pong_bytes
     * value is less than 65532.
     * for the number of pong bytes it expects to receive as
     * a reply. The ignored bits should be set to 0.
     */
    constructor(numPongBytes?: number);
    /**
     * Serializes a PongMessage into a Buffer that can be
     * streamed on the wire.
     */
    serialize(): Buffer;
}
