export async function onInvoke(request, env, kvStoreFactory) {

    try {

        // ── Credentials & config from environment variables ───────────────────
        const accessKeyId     = env["aws:accessKeyId"];
        const secretAccessKey = env["aws:secretAccessKey"];
        const region          = env["region"];
        const tableName       = env["tableName"];

        // ── Query parameters from the Glia invocation envelope ────────────────
        const { payload } = await request.json();
        const requestData = typeof payload === "string" ? JSON.parse(payload) : (payload ?? {});

        const siteId = requestData.siteId;
        const days   = parseInt(requestData.days ?? "30", 10);

        if (!siteId) {
            return new Response(
                JSON.stringify({ success: false, error: "Missing required field: siteId" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }
        
        // ── Build the time range lower bound ──────────────────────────────────
        // Since the sort key starts with an ISO timestamp, a simple string
        // comparison works — "2026-05-01..." is lexicographically less than
        // "2026-06-01..." so DynamoDB can filter it natively on the sort key.
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

        // ── DynamoDB Query body ───────────────────────────────────────────────
        const queryBody = {
            TableName: tableName,
            KeyConditionExpression:
                "siteId = :sid AND #ts >= :since",
            ExpressionAttributeNames: {
                "#ts": "timestamp#id",   // # needed because # is a reserved char
            },
            ExpressionAttributeValues: {
                ":sid":   { S: siteId },
                ":since": { S: since },
            },
            ScanIndexForward: false,     // newest first
        };

        // ── AWS Signature V4 helpers ──────────────────────────────────────────
        async function hmac(key, message) {
            const keyBytes = typeof key === "string"
                ? new TextEncoder().encode(key)
                : key;
            const cryptoKey = await crypto.subtle.importKey(
                "raw", keyBytes,
                { name: "HMAC", hash: "SHA-256" },
                false, ["sign"]
            );
            return crypto.subtle.sign(
                "HMAC", cryptoKey, new TextEncoder().encode(message)
            );
        }

        function toHex(buffer) {
            return Array.from(new Uint8Array(buffer))
                .map(b => b.toString(16).padStart(2, "0"))
                .join("");
        }

        async function sha256hex(message) {
            const buf = await crypto.subtle.digest(
                "SHA-256", new TextEncoder().encode(message)
            );
            return toHex(buf);
        }

        async function getSigningKey(secret, dateStamp, region, service) {
            const kDate    = await hmac("AWS4" + secret, dateStamp);
            const kRegion  = await hmac(new Uint8Array(kDate), region);
            const kService = await hmac(new Uint8Array(kRegion), service);
            const kSigning = await hmac(new Uint8Array(kService), "aws4_request");
            return new Uint8Array(kSigning);
        }

        // ── Build & send the signed DynamoDB Query request ────────────────────
        const service  = "dynamodb";
        const host     = `dynamodb.${region}.amazonaws.com`;
        const endpoint = `https://${host}/`;
        const target   = "DynamoDB_20120810.Query";
        const bodyStr  = JSON.stringify(queryBody);
        const now      = new Date();

        const amzDate   = now.toISOString().replace(/[:.-]/g, "").slice(0, 15) + "Z";
        const dateStamp = amzDate.slice(0, 8);

        const payloadHash = await sha256hex(bodyStr);

        const headers = {
            "content-type": "application/x-amz-json-1.0",
            "host":         host,
            "x-amz-date":   amzDate,
            "x-amz-target": target,
        };

        const sortedHeaderKeys = Object.keys(headers).sort();
        const canonicalHeaders = sortedHeaderKeys
            .map(k => `${k}:${headers[k]}`)
            .join("\n") + "\n";
        const signedHeaders = sortedHeaderKeys.join(";");

        const canonicalRequest = [
            "POST",
            "/",
            "",
            canonicalHeaders,
            signedHeaders,
            payloadHash,
        ].join("\n");

        const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;

        const stringToSign = [
            "AWS4-HMAC-SHA256",
            amzDate,
            credentialScope,
            await sha256hex(canonicalRequest),
        ].join("\n");

        const signingKey = await getSigningKey(secretAccessKey, dateStamp, region, service);
        const signature  = toHex(await hmac(signingKey, stringToSign));

        const authHeader =
            `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, ` +
            `SignedHeaders=${signedHeaders}, Signature=${signature}`;

        const dynamoResponse = await fetch(endpoint, {
            method: "POST",
            headers: { ...headers, Authorization: authHeader },
            body: bodyStr,
        });

        const raw = await dynamoResponse.json();

        if (!dynamoResponse.ok) {
            return new Response(
                JSON.stringify({ success: false, error: raw }),
                { status: 502, headers: { "Content-Type": "application/json" } }
            );
        }

        // ── Unwrap DynamoDB type descriptors into plain objects ────────────────
        // DynamoDB returns { "userId": { "S": "jane.doe@glia.com" } }
        // The UI expects plain { "userId": "jane.doe@glia.com" }
        function unwrap(item) {
            return Object.fromEntries(
                Object.entries(item).map(([key, typed]) => {
                    const value = typed.S ?? typed.N ?? typed.BOOL ?? typed.NULL ?? null;
                    return [key, value];
                })
            );
        }

        const logs = (raw.Items ?? []).map((item) => {
            const log = unwrap(item);
            // Split the composite sort key into a clean ISO timestamp the UI can parse
            log.timestamp = log["timestamp#id"]?.split("#")[0] ?? log.createdAt;
            return log;
        });

        // ── Return shaped exactly as audit-logs.js expects ────────────────────
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