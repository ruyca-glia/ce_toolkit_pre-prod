// read_log.js
async function onInvoke(request, env, kvStoreFactory) {
  try {
    let toHex = function(buffer) {
      return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
    }, unwrap = function(item) {
      return Object.fromEntries(
        Object.entries(item).map(([key, typed]) => {
          const value = typed.S ?? typed.N ?? typed.BOOL ?? typed.NULL ?? null;
          return [key, value];
        })
      );
    };
    const accessKeyId = env["aws:accessKeyId"];
    const secretAccessKey = env["aws:secretAccessKey"];
    const region = env["region"];
    const tableName = env["tableName"];
    const { payload } = await request.json();
    const requestData = typeof payload === "string" ? JSON.parse(payload) : payload ?? {};
    const siteId = requestData.siteId;
    const days = parseInt(requestData.days ?? "30", 10);
    if (!siteId) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required field: siteId" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1e3).toISOString();
    const queryBody = {
      TableName: tableName,
      KeyConditionExpression: "siteId = :sid AND #ts >= :since",
      ExpressionAttributeNames: {
        "#ts": "timestamp#id"
        // # needed because # is a reserved char
      },
      ExpressionAttributeValues: {
        ":sid": { S: siteId },
        ":since": { S: since }
      },
      ScanIndexForward: false
      // newest first
    };
    async function hmac(key, message) {
      const keyBytes = typeof key === "string" ? new TextEncoder().encode(key) : key;
      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyBytes,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      return crypto.subtle.sign(
        "HMAC",
        cryptoKey,
        new TextEncoder().encode(message)
      );
    }
    async function sha256hex(message) {
      const buf = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(message)
      );
      return toHex(buf);
    }
    async function getSigningKey(secret, dateStamp2, region2, service2) {
      const kDate = await hmac("AWS4" + secret, dateStamp2);
      const kRegion = await hmac(new Uint8Array(kDate), region2);
      const kService = await hmac(new Uint8Array(kRegion), service2);
      const kSigning = await hmac(new Uint8Array(kService), "aws4_request");
      return new Uint8Array(kSigning);
    }
    const service = "dynamodb";
    const host = `dynamodb.${region}.amazonaws.com`;
    const endpoint = `https://${host}/`;
    const target = "DynamoDB_20120810.Query";
    const bodyStr = JSON.stringify(queryBody);
    const now = /* @__PURE__ */ new Date();
    const amzDate = now.toISOString().replace(/[:.-]/g, "").slice(0, 15) + "Z";
    const dateStamp = amzDate.slice(0, 8);
    const payloadHash = await sha256hex(bodyStr);
    const headers = {
      "content-type": "application/x-amz-json-1.0",
      "host": host,
      "x-amz-date": amzDate,
      "x-amz-target": target
    };
    const sortedHeaderKeys = Object.keys(headers).sort();
    const canonicalHeaders = sortedHeaderKeys.map((k) => `${k}:${headers[k]}`).join("\n") + "\n";
    const signedHeaders = sortedHeaderKeys.join(";");
    const canonicalRequest = [
      "POST",
      "/",
      "",
      canonicalHeaders,
      signedHeaders,
      payloadHash
    ].join("\n");
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      credentialScope,
      await sha256hex(canonicalRequest)
    ].join("\n");
    const signingKey = await getSigningKey(secretAccessKey, dateStamp, region, service);
    const signature = toHex(await hmac(signingKey, stringToSign));
    const authHeader = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
    const dynamoResponse = await fetch(endpoint, {
      method: "POST",
      headers: { ...headers, Authorization: authHeader },
      body: bodyStr
    });
    const raw = await dynamoResponse.json();
    if (!dynamoResponse.ok) {
      return new Response(
        JSON.stringify({ success: false, error: raw }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }
    const logs = (raw.Items ?? []).map((item) => {
      const log = unwrap(item);
      log.timestamp = log["timestamp#id"]?.split("#")[0] ?? log.createdAt;
      return log;
    });
    return new Response(
      JSON.stringify({ success: true, count: logs.length, logs }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message, stack: err.stack ?? null }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
export {
  onInvoke
};
