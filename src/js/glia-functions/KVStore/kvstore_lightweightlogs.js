export async function onInvoke(request, env, kvStoreFactory) {
    const myKvStore = kvStoreFactory.initializeKvStore("automations_logs");

    // 1a. Parse the outer Glia Envelope
    let envelope = {};
    try {
        envelope = await request.json();
    } catch (e) {
        return Response.json({ error: "Failed to parse request body" }, { status: 400 });
    }

    // 1b. Parse the inner Payload String
    let body = {};
    try {
        if (typeof envelope.payload === 'string') {
            body = JSON.parse(envelope.payload);
        } else {
            // Fallback in case Glia sometimes passes it as an object
            body = envelope.payload || {};
        }
    } catch (e) {
        return Response.json({ error: "Failed to parse inner payload string" }, { status: 400 });
    }

    // Now safely destructure from the parsed body
    const { action, logData } = body;

    try {
        if (action === "save_log") {
            const timestamp = Date.now();
            // Prefix + Ticket + Timestamp ensures unique keys
            const logId = `log_${logData.ticket}_${timestamp}`;
            
            // 1. Fetch current index of recent logs
            const getIndexOp = await myKvStore.processBatchOperations([{ op: "get", key: "recent_logs_index" }]);
            let recentLogsIndex = [];
            
            if (getIndexOp[0] && getIndexOp[0].value) {
                recentLogsIndex = JSON.parse(getIndexOp[0].value);
            }

            // 2. Add new log ID to the start of the index and limit to 10 items (Light Logging)
            recentLogsIndex.unshift(logId);
            if (recentLogsIndex.length > 10) {
                recentLogsIndex.pop(); 
            }

            // 3. Prepare payload with a 3-day expiration reference
            const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
            const logPayload = {
                id: logId,
                ticket: logData.ticket,
                user: logData.user,
                status: logData.status,
                timestamp: timestamp,
                expiresAt: timestamp + threeDaysMs, 
                output: logData.output 
            };

            // 4. Batch operation: Save the new log AND update the index
            const operations = [
                { op: "set", key: logId, value: JSON.stringify(logPayload) },
                { op: "set", key: "recent_logs_index", value: JSON.stringify(recentLogsIndex) }
            ];

            await myKvStore.processBatchOperations(operations);
            return Response.json({ success: true, logId: logId });
        } 
        
        else if (action === "get_recent") {
            // 1. Fetch the index
            const getIndexOp = await myKvStore.processBatchOperations([{ op: "get", key: "recent_logs_index" }]);
            if (!getIndexOp[0] || !getIndexOp[0].value) return Response.json({ logs: [] });
            
            // 2. Extract the keys
            const latestTenKeys = JSON.parse(getIndexOp[0].value);
            if (latestTenKeys.length === 0) return Response.json({ logs: [] });
            
            // 3. Batch fetch the actual log data for those keys
            const getLogsOps = latestTenKeys.map(key => ({ op: "get", key: key }));
            const logsResults = await myKvStore.processBatchOperations(getLogsOps);
            
            // 4. Parse and filter out expired logs (older than 3 days)
            const currentTime = Date.now();
            const validLogs = logsResults
                .filter(res => res.value !== null)
                .map(res => JSON.parse(res.value))
                .filter(log => log.expiresAt > currentTime); 
                
            return Response.json({ logs: validLogs });
        }
        
        // Catch unsupported actions
        return Response.json({ error: "Unsupported action provided" }, { status: 400 });

    } catch (error) {
        console.error("KV Store Operation Failed:", error.message);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}