import { BufferReader } from './buf.js';
import { MessageType } from '../types.js';
export class CommandoMessage {
    /**
     * Processes a buffer containing the message information. This method
     * will capture the id of the commando response as well as the payload
     */
    static deserialize(buffer) {
        const instance = new CommandoMessage();
        const reader = new BufferReader(buffer);
        // read the type bytes
        reader.readUInt16BE();
        instance.id = reader.readBytes(8).toString('hex');
        const json = reader.readBytes(buffer.byteLength - 26).toString();
        try {
            instance.response = JSON.parse(json);
        }
        catch (error) {
            instance.response = {
                jsonrpc: '2.0',
                id: null,
                error: { code: 1, message: 'Could not parse json response' }
            };
        }
        return instance;
    }
    type = MessageType.CommandoResponse;
    id;
    response;
}
//# sourceMappingURL=CommandoMessage.js.map