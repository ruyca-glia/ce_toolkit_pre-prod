// kvstore_lightweightlogs.js
async function onInvoke(request, env, kvStoreFactory) {
  const myKvStore = kvStoreFactory.initializeKvStore("automations_logs");
  let envelope = {};
  try {
    envelope = await request.json();
  } catch (e) {
    return Response.json({ error: "Failed to parse request body" }, { status: 400 });
  }
  let body = {};
  try {
    if (typeof envelope.payload === "string") {
      body = JSON.parse(envelope.payload);
    } else {
      body = envelope.payload || {};
    }
  } catch (e) {
    return Response.json({ error: "Failed to parse inner payload string" }, { status: 400 });
  }
  const { action, logData } = body;
  try {
    if (action === "save_log") {
      const timestamp = Date.now();
      const logId = `log_${logData.ticket}_${timestamp}`;
      const getIndexOp = await myKvStore.processBatchOperations([{ op: "get", key: "recent_logs_index" }]);
      let recentLogsIndex = [];
      if (getIndexOp[0] && getIndexOp[0].value) {
        recentLogsIndex = JSON.parse(getIndexOp[0].value);
      }
      recentLogsIndex.unshift(logId);
      if (recentLogsIndex.length > 10) {
        recentLogsIndex.pop();
      }
      const threeDaysMs = 3 * 24 * 60 * 60 * 1e3;
      const logPayload = {
        id: logId,
        ticket: logData.ticket,
        user: logData.user,
        status: logData.status,
        timestamp,
        expiresAt: timestamp + threeDaysMs,
        output: logData.output
      };
      const operations = [
        { op: "set", key: logId, value: JSON.stringify(logPayload) },
        { op: "set", key: "recent_logs_index", value: JSON.stringify(recentLogsIndex) }
      ];
      await myKvStore.processBatchOperations(operations);
      return Response.json({ success: true, logId });
    } else if (action === "get_recent") {
      const getIndexOp = await myKvStore.processBatchOperations([{ op: "get", key: "recent_logs_index" }]);
      if (!getIndexOp[0] || !getIndexOp[0].value) return Response.json({ logs: [] });
      const latestTenKeys = JSON.parse(getIndexOp[0].value);
      if (latestTenKeys.length === 0) return Response.json({ logs: [] });
      const getLogsOps = latestTenKeys.map((key) => ({ op: "get", key }));
      const logsResults = await myKvStore.processBatchOperations(getLogsOps);
      const currentTime = Date.now();
      const validLogs = logsResults.filter((res) => res.value !== null).map((res) => JSON.parse(res.value)).filter((log) => log.expiresAt > currentTime);
      return Response.json({ logs: validLogs });
    }
    return Response.json({ error: "Unsupported action provided" }, { status: 400 });
  } catch (error) {
    console.error("KV Store Operation Failed:", error.message);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
export {
  onInvoke
};
