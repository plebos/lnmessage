export var InitFeatureFlags;
(function (InitFeatureFlags) {
    /**
     * option_data_loss_protect local flag is set. This flag enables / requires
     * the support of the extra channel_reestablish fields defined in BOLT #2.
     */
    InitFeatureFlags[InitFeatureFlags["optionDataLossProtectRequired"] = 0] = "optionDataLossProtectRequired";
    /**
     * option_data_loss_protect local flag is set. This flag enables / requires
     * the support of the extra channel_reestablish fields defined in BOLT #2.
     */
    InitFeatureFlags[InitFeatureFlags["optionDataLossProtectOptional"] = 1] = "optionDataLossProtectOptional";
    /**
     * initial_routing_sync asks the remote node to send a complete routing
     * information dump. The initial_routing_sync feature is overridden (and
     * should be considered equal to 0) by the gossip_queries feature if the
     * latter is negotiated via init.
     */
    InitFeatureFlags[InitFeatureFlags["initialRoutingSyncOptional"] = 3] = "initialRoutingSyncOptional";
    /**
     * option_upfront_shutdown_script flag asks to commit to a shutdown
     * scriptpubkey when opening a channel as defined in BOLT #2.
     */
    InitFeatureFlags[InitFeatureFlags["optionUpfrontShutdownScriptRequired"] = 4] = "optionUpfrontShutdownScriptRequired";
    /**
     * option_upfront_shutdown_script flag asks to commit to a shutdown
     * scriptpubkey when opening a channel as defined in BOLT #2.
     */
    InitFeatureFlags[InitFeatureFlags["optionUpfrontShutdownScriptOptional"] = 5] = "optionUpfrontShutdownScriptOptional";
    /**
     * gossip_queries flag signals that the node wishes to use more advanced
     * gossip control. When negotiated, this flag will override the
     * initial_routing_sync flag. Advanced querying is defined in BOLT #7.
     */
    InitFeatureFlags[InitFeatureFlags["gossipQueriesRequired"] = 6] = "gossipQueriesRequired";
    /**
     * gossip_queries flag signals that the node wishes to use more advanced
     * gossip control. When negotiated, this flag will override the
     * initial_routing_sync flag. Advanced querying is defined in BOLT #7.
     */
    InitFeatureFlags[InitFeatureFlags["gossipQueriesOptional"] = 7] = "gossipQueriesOptional";
    InitFeatureFlags[InitFeatureFlags["optionVarOptionOptinRequired"] = 8] = "optionVarOptionOptinRequired";
    InitFeatureFlags[InitFeatureFlags["optionVarOptionOptinOptional"] = 9] = "optionVarOptionOptinOptional";
    InitFeatureFlags[InitFeatureFlags["gossipQueriesExRequired"] = 10] = "gossipQueriesExRequired";
    InitFeatureFlags[InitFeatureFlags["gossipQueriesExOptional"] = 11] = "gossipQueriesExOptional";
    InitFeatureFlags[InitFeatureFlags["optionStaticRemoteKeyRequired"] = 12] = "optionStaticRemoteKeyRequired";
    InitFeatureFlags[InitFeatureFlags["optionStaticRemoteKeyOptional"] = 13] = "optionStaticRemoteKeyOptional";
    InitFeatureFlags[InitFeatureFlags["paymentSecretRequired"] = 14] = "paymentSecretRequired";
    InitFeatureFlags[InitFeatureFlags["paymentSecretOptional"] = 15] = "paymentSecretOptional";
    InitFeatureFlags[InitFeatureFlags["basicMppRequired"] = 16] = "basicMppRequired";
    InitFeatureFlags[InitFeatureFlags["basicMppOptional"] = 17] = "basicMppOptional";
    InitFeatureFlags[InitFeatureFlags["optionSupportLargeChannelRequired"] = 18] = "optionSupportLargeChannelRequired";
    InitFeatureFlags[InitFeatureFlags["optionSupportLargeChannelOptional"] = 19] = "optionSupportLargeChannelOptional";
})(InitFeatureFlags || (InitFeatureFlags = {}));
//# sourceMappingURL=InitFeatureFlags.js.map