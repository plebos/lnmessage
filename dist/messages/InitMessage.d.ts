/// <reference types="node" />
import { Buffer } from 'buffer';
import { BitField } from './BitField.js';
import { InitFeatureFlags } from './InitFeatureFlags.js';
import { MessageType } from '../types.js';
import { IWireMessage } from './IWireMessage.js';
/**
 * InitMessage is defined in BOLT #1. Once authentication is complete, the first
 * message reveals the features supported or required by the node sending the
 * message. This message is sent even on a reconnection.
 *
 * This message contains two fields; global features and local features, that
 * are used to signal how the message should operate. The values of are defined
 * in the BOLT #9.
 */
export declare class InitMessage implements IWireMessage {
    /**
     * Processes a buffer containing the message information. This method
     * will capture the arbitrary length global and local
     * features into two internal properties of the newly constructed
     * init message object.
     */
    static deserialize(buffer: Buffer): InitMessage;
    /**
     * Message type 16
     */
    type: MessageType;
    /**
     * BitField containing the features provided in by the local or remote node
     */
    features: BitField<InitFeatureFlags>;
    /**
     * Supported chain_hashes for the remote peer
     */
    chainHashes: Buffer[];
    /**
     * Serialize will construct a properly formatted message based on the
     * properties of the configured message.
     */
    serialize(): Buffer;
}
