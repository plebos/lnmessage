/// <reference types="node" />
/// <reference types="node" />
import { BehaviorSubject, Observable } from 'rxjs';
import { Buffer } from 'buffer';
import { NoiseState } from './noise-state.js';
import type { WebSocket as NodeWebSocket } from 'ws';
import type { Socket as TCPSocket } from 'net';
import type SocketWrapper from './socket-wrapper.js';
import { LnWebSocketOptions, JsonRpcSuccessResponse, JsonRpcErrorResponse, Logger, CommandoRequest, ConnectionStatus } from './types.js';
declare class LnMessage {
    /**The underlying Noise protocol. Can be used if you want to play around with the low level Lightning transport protocol*/
    noise: NoiseState;
    /**The public key of the node that Lnmessage is connected to*/
    remoteNodePublicKey: string;
    /**The public key Lnmessage uses when connecting to a remote node
     * If you passed in a private key when initialising,
     * this public key will be derived from it and can be used for persistent identity
     * across session connections
     */
    publicKey: string;
    /**The private key that was either passed in on init or generated automatically
     * Reuse this when reconnecting for persistent id
     */
    privateKey: string;
    /**The url that the WebSocket will connect to. It uses the wsProxy option if provided
     * or otherwise will initiate a WebSocket connection directly to the node
     */
    wsUrl: string;
    /**The WebSocket instance*/
    socket: WebSocket | NodeWebSocket | null | SocketWrapper;
    /**TCP socket instance*/
    tcpSocket?: TCPSocket;
    /**
     * @deprecated Use connectionStatus$ instead
     */
    connected$: BehaviorSubject<boolean>;
    /**
     * Observable that indicates the current socket connection status
     * Can be either 'connected', 'connecting', 'waiting_reconnect' or 'disconnected'.
     */
    connectionStatus$: BehaviorSubject<ConnectionStatus>;
    /**
     * @deprecated Use connectionStatus$ instead
     */
    connecting: boolean;
    /**Observable stream of decypted messages. This can be used to extend Lnmessage
     * functionality so that it can handle other Lightning message types
     */
    decryptedMsgs$: Observable<Buffer>;
    /**Obserable stream of all commando response messages*/
    commandoMsgs$: Observable<(JsonRpcSuccessResponse | JsonRpcErrorResponse) & {
        reqId: string;
    }>;
    /**Node JS Buffer instance, useful if handling decrypted messages manually*/
    Buffer: Buffer['constructor'];
    private _ls;
    private _es;
    private _handshakeState;
    private _readState;
    private _decryptedMsgs$;
    private _commandoMsgs$;
    private _partialCommandoMsgs;
    private _attemptedReconnects;
    private _logger;
    private _attemptReconnect;
    private _messageBuffer;
    private _processingBuffer;
    private _l;
    constructor(options: LnWebSocketOptions);
    connect(attemptReconnect?: boolean): Promise<boolean>;
    private queueMessage;
    disconnect(): void;
    private _processBuffer;
    private _processResponderReply;
    private _processPacketLength;
    private _processPacketBody;
    handleDecryptedMessage(decrypted: Buffer): Promise<void>;
    commando({ method, params, rune, reqId }: CommandoRequest): Promise<JsonRpcSuccessResponse['result']>;
    _log(level: keyof Logger, msg: string): void;
}
export default LnMessage;
