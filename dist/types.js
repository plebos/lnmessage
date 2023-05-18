/**
 * Defined in BOLT01
 */
export var MessageType;
(function (MessageType) {
    // Setup and Control (0 - 31)
    MessageType[MessageType["Init"] = 16] = "Init";
    MessageType[MessageType["Error"] = 17] = "Error";
    MessageType[MessageType["Ping"] = 18] = "Ping";
    MessageType[MessageType["Pong"] = 19] = "Pong";
    // Channel (32-127)
    MessageType[MessageType["OpenChannel"] = 32] = "OpenChannel";
    MessageType[MessageType["AcceptChannel"] = 33] = "AcceptChannel";
    MessageType[MessageType["FundingCreated"] = 34] = "FundingCreated";
    MessageType[MessageType["FundingSigned"] = 35] = "FundingSigned";
    MessageType[MessageType["FundingLocked"] = 36] = "FundingLocked";
    MessageType[MessageType["Shutdown"] = 38] = "Shutdown";
    MessageType[MessageType["ClosingSigned"] = 39] = "ClosingSigned";
    // Commitment (128-255)
    //
    // Routing (256-511)
    MessageType[MessageType["ChannelAnnouncement"] = 256] = "ChannelAnnouncement";
    MessageType[MessageType["NodeAnnouncement"] = 257] = "NodeAnnouncement";
    MessageType[MessageType["ChannelUpdate"] = 258] = "ChannelUpdate";
    MessageType[MessageType["AnnouncementSignatures"] = 259] = "AnnouncementSignatures";
    MessageType[MessageType["QueryShortChannelIds"] = 261] = "QueryShortChannelIds";
    MessageType[MessageType["ReplyShortChannelIdsEnd"] = 262] = "ReplyShortChannelIdsEnd";
    MessageType[MessageType["QueryChannelRange"] = 263] = "QueryChannelRange";
    MessageType[MessageType["ReplyChannelRange"] = 264] = "ReplyChannelRange";
    MessageType[MessageType["GossipTimestampFilter"] = 265] = "GossipTimestampFilter";
    MessageType[MessageType["CommandoRequest"] = 19535] = "CommandoRequest";
    MessageType[MessageType["CommandoResponseContinues"] = 22859] = "CommandoResponseContinues";
    MessageType[MessageType["CommandoResponse"] = 22861] = "CommandoResponse";
})(MessageType || (MessageType = {}));
/**
 * States that the handshake process can be in. States depend on
 * whether the socket is the connection Initiator or Responder.
 *
 * Initiator:
 *   1.  create and send Iniatitor act1 and transition to
 *       AWAITING_RESPONDER_REPLY
 *   2.  process the Responder's reply as act2
 *   3.  create Initiator act3 reply to complete the handshake
 *       and transitions to READY
 *
 * Responder:
 *   1.  begins in AWAITING_INITIATOR waiting to receive act1
 *   2.  processes act1 and creates a reply as act2 and transitions
 *       to AWAITING_INITIATOR_REPLY
 *   3.  processes the Initiator's reply to complete the handshake
 *       and transition to READY
 */
export var HANDSHAKE_STATE;
(function (HANDSHAKE_STATE) {
    /**
     * Initial state for the Initiator. Initiator will transition to
     * AWAITING_RESPONDER_REPLY once act1 is completed and sent.
     */
    HANDSHAKE_STATE[HANDSHAKE_STATE["INITIATOR_INITIATING"] = 0] = "INITIATOR_INITIATING";
    /**
     * Responders begin in this state and wait for the Intiator to begin
     * the handshake. Sockets originating from the NoiseServer will
     * begin in this state.
     */
    HANDSHAKE_STATE[HANDSHAKE_STATE["AWAITING_INITIATOR"] = 1] = "AWAITING_INITIATOR";
    /**
     * Initiator has sent act1 and is awaiting the reply from the responder.
     * Once received, the intiator will create the reply
     */
    HANDSHAKE_STATE[HANDSHAKE_STATE["AWAITING_RESPONDER_REPLY"] = 2] = "AWAITING_RESPONDER_REPLY";
    /**
     * Responder has  sent a reply to the inititator, the Responder will be
     * waiting for the final stage of the handshake sent by the Initiator.
     */
    HANDSHAKE_STATE[HANDSHAKE_STATE["AWAITING_INITIATOR_REPLY"] = 3] = "AWAITING_INITIATOR_REPLY";
    /**
     * Responder/Initiator have completed the handshake and we're ready to
     * start sending and receiving over the socket.
     */
    HANDSHAKE_STATE[HANDSHAKE_STATE["READY"] = 100] = "READY";
})(HANDSHAKE_STATE || (HANDSHAKE_STATE = {}));
export var READ_STATE;
(function (READ_STATE) {
    READ_STATE[READ_STATE["READY_FOR_LEN"] = 2] = "READY_FOR_LEN";
    READ_STATE[READ_STATE["READY_FOR_BODY"] = 3] = "READY_FOR_BODY";
    READ_STATE[READ_STATE["BLOCKED"] = 4] = "BLOCKED";
})(READ_STATE || (READ_STATE = {}));
//# sourceMappingURL=types.js.map