import { Buffer } from 'buffer';
import { BufferReader, BufferWriter } from './buf.js';
import { BitField } from './BitField.js';
import { MessageType } from '../types.js';
import { readTlvs } from './read-tlvs.js';
/**
 * InitMessage is defined in BOLT #1. Once authentication is complete, the first
 * message reveals the features supported or required by the node sending the
 * message. This message is sent even on a reconnection.
 *
 * This message contains two fields; global features and local features, that
 * are used to signal how the message should operate. The values of are defined
 * in the BOLT #9.
 */
export class InitMessage {
    /**
     * Processes a buffer containing the message information. This method
     * will capture the arbitrary length global and local
     * features into two internal properties of the newly constructed
     * init message object.
     */
    static deserialize(buffer) {
        const instance = new InitMessage();
        const reader = new BufferReader(buffer);
        // read the type bytes
        reader.readUInt16BE();
        // read the global features and per the specification, the global
        // features should not exceed features greater than 13.
        const gflen = reader.readUInt16BE();
        const gf = BitField.fromBuffer(reader.readBytes(gflen));
        // Read the local length and parse into a BN value.
        const lflen = reader.readUInt16BE();
        const lf = BitField.fromBuffer(reader.readBytes(lflen));
        // construct a single features object by bitwise or of the global and
        // local features.
        instance.features = new BitField().or(gf).or(lf);
        // process TLVs
        readTlvs(reader, (type, valueReader) => {
            switch (type) {
                // Process networks TLVs which is a series of chain_hash 32
                // byte values. This method will simply read from the stream
                // until every thing has been read
                case BigInt(1): {
                    while (!valueReader.eof) {
                        const chainHash = valueReader.readBytes(32);
                        instance.chainHashes.push(chainHash);
                    }
                    return true;
                }
                default:
                    return false;
            }
        });
        return instance;
    }
    /**
     * Message type 16
     */
    type = MessageType.Init;
    /**
     * BitField containing the features provided in by the local or remote node
     */
    features = new BitField();
    /**
     * Supported chain_hashes for the remote peer
     */
    chainHashes = [];
    /**
     * Serialize will construct a properly formatted message based on the
     * properties of the configured message.
     */
    serialize() {
        const writer = new BufferWriter();
        // write the type
        writer.writeUInt16BE(this.type);
        // write gflen
        const gflen = 0;
        writer.writeUInt16BE(gflen);
        // write features
        const features = Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]);
        const featuresLen = features.length;
        writer.writeUInt16BE(featuresLen);
        writer.writeBytes(features);
        // write chainhash tlv
        if (this.chainHashes.length) {
            writer.writeBigSize(1); // type
            writer.writeBigSize(this.chainHashes.length * 32); // length
            writer.writeBytes(Buffer.concat(this.chainHashes)); // value
        }
        return writer.toBuffer();
    }
}
//# sourceMappingURL=InitMessage.js.map