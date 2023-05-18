/// <reference types="node" />
import { CommandoResponse, MessageType } from '../types.js';
export declare class CommandoMessage {
    /**
     * Processes a buffer containing the message information. This method
     * will capture the id of the commando response as well as the payload
     */
    static deserialize(buffer: Buffer): CommandoMessage;
    type: MessageType;
    id: string;
    response: CommandoResponse;
}
