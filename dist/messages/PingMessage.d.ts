/// <reference types="node" />
import { Buffer } from 'buffer';
import { MessageType } from '../types.js';
import { IWireMessage } from './IWireMessage.js';
export declare const PONG_BYTE_THRESHOLD = 65532;
/**
 * In order to allow for the existence of long-lived TCP
 * connections,  at times it may be required that both ends keep
 * alive the TCP connection at the application level.
 *
 * The ping message is sent by an initiator and includes a value
 * for the number of pong bytes it expects to receive as
 * a reply. The ignored bits should be set to 0.
 */
export declare class PingMessage implements IWireMessage {
    /**
     * Deserialize a message and return a new instance of the
     * PingMessage type.
     */
    static deserialize(payload: Buffer): PingMessage;
    /**
     * Ping message type is 18
     */
    type: MessageType;
    /**
     * The number of bytes that should be returned in the pong message.
     * Can be set to 65532 to indicate that no pong message should be
     * sent. Setting to any number below 65532 will require a pong
     * matching the corresponding number of bytes. If the reply
     * byteslen does not match this, you may terminate the channels
     * with the client.
     */
    numPongBytes: number;
    /**
     * Should set ignored to 0s. Must not set ignored to
     * sensitive data such as secrets or portions of initialized
     * memory.
     */
    ignored: Buffer;
    /**
     * Serialize the PingMessage and return a Buffer
     */
    serialize(): Buffer;
    /**
     * triggersReply indicates if a pong message must send a reply.
     * Ping messages than are smaller than 65532 must send a reply
     * with the corresponding number of bytes. Above this value
     * no reply is necessary.  Refer to BOLT #1.
     */
    get triggersReply(): boolean;
}
