import { Buffer } from 'buffer';
import { BufferReader, BufferWriter } from './buf.js';
import { MessageType } from '../types.js';
export const PONG_BYTE_THRESHOLD = 65532;
/**
 * In order to allow for the existence of long-lived TCP
 * connections,  at times it may be required that both ends keep
 * alive the TCP connection at the application level.
 *
 * The ping message is sent by an initiator and includes a value
 * for the number of pong bytes it expects to receive as
 * a reply. The ignored bits should be set to 0.
 */
export class PingMessage {
    /**
     * Deserialize a message and return a new instance of the
     * PingMessage type.
     */
    static deserialize(payload) {
        const cursor = new BufferReader(payload);
        cursor.readUInt16BE();
        const instance = new PingMessage();
        instance.numPongBytes = cursor.readUInt16BE();
        const bytesLength = cursor.readUInt16BE();
        instance.ignored = cursor.readBytes(bytesLength);
        return instance;
    }
    /**
     * Ping message type is 18
     */
    type = MessageType.Ping;
    /**
     * The number of bytes that should be returned in the pong message.
     * Can be set to 65532 to indicate that no pong message should be
     * sent. Setting to any number below 65532 will require a pong
     * matching the corresponding number of bytes. If the reply
     * byteslen does not match this, you may terminate the channels
     * with the client.
     */
    numPongBytes = 1;
    /**
     * Should set ignored to 0s. Must not set ignored to
     * sensitive data such as secrets or portions of initialized
     * memory.
     */
    ignored = Buffer.alloc(0);
    /**
     * Serialize the PingMessage and return a Buffer
     */
    serialize() {
        const len = 2 + // type
            2 + // num_pong_bytes
            2 + // byteslen
            this.ignored.length;
        const br = new BufferWriter(Buffer.alloc(len));
        br.writeUInt16BE(this.type);
        br.writeUInt16BE(this.numPongBytes);
        br.writeUInt16BE(this.ignored.length);
        br.writeBytes(this.ignored);
        return br.toBuffer();
    }
    /**
     * triggersReply indicates if a pong message must send a reply.
     * Ping messages than are smaller than 65532 must send a reply
     * with the corresponding number of bytes. Above this value
     * no reply is necessary.  Refer to BOLT #1.
     */
    get triggersReply() {
        return this.numPongBytes < PONG_BYTE_THRESHOLD;
    }
}
//# sourceMappingURL=PingMessage.js.map