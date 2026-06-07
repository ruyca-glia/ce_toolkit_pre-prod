export async function onInvoke(request, env, kvStoreFactory) {
    try {
        // ── Credentials & config from environment variables ──────────────────────
        const accessKeyId     =  env["aws:accessKeyId"];
        const secretAccessKey =  env["aws:secretAccessKey"];
        const region          =  env["region"];
        const tableName       =  env["tableName"];

        // ── Hardcoded test log entry (will come from parameters later) ───────────
        const now        = new Date();
        const uniqueId   = Math.random().toString(36).slice(2, 8); // e.g. "f3a9c1"
        const sortKey    = now.toISOString() + "#" + uniqueId;
        const expiresAt  = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

        const logEntry = {
            siteId:          "site_test_001",
            "timestamp#id":  sortKey,
            userId:          "jane.doe@glia.com",
            action:          "Grant Auth0 access",
            url:             "https://glia.auth0.com/api/v2/users/auth0|123/roles",
            automation:      "Auth0 Automation",
            status:          200,
            durationMs:      143,
            createdAt:       now.toISOString(),
            expiresAt:       expiresAt,
        };

        // ── Build the DynamoDB PutItem request body ───────────────────────────────
        // DynamoDB requires each value to be wrapped in a type descriptor:
        // { S: "string value" } for strings, { N: "123" } for numbers
        const dynamoItem = {
            TableName: tableName,
            Item: {
                "siteId":        { S: logEntry.siteId },
                "timestamp#id":  { S: logEntry["timestamp#id"] },
                "userId":        { S: logEntry.userId },
                "action":        { S: logEntry.action },
                "url":           { S: logEntry.url },
                "automation":    { S: logEntry.automation },
                "status":        { N: String(logEntry.status) },
                "durationMs":    { N: String(logEntry.durationMs) },
                "createdAt":     { S: logEntry.createdAt },
                "expiresAt":     { N: String(logEntry.expiresAt) },
            },
        };

        // ── AWS Signature V4 helpers ──────────────────────────────────────────────
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

        // ── Build & send the signed DynamoDB request ──────────────────────────────
        const service    = "dynamodb";
        const host       = `dynamodb.${region}.amazonaws.com`;
        const endpoint   = `https://${host}/`;
        const target     = "DynamoDB_20120810.PutItem";
        const bodyStr    = JSON.stringify(dynamoItem);

        // Timestamps — DynamoDB requires a specific format
        const amzDate = now.toISOString().replace(/[:.-]/g, "").slice(0, 15) + "Z";
        const dateStamp = amzDate.slice(0, 8); // e.g. "20260602"

        const payloadHash = await sha256hex(bodyStr);

        // Headers must be sorted alphabetically for canonical form
        const headers = {
            "content-type" : "application/x-amz-json-1.0",
            "host"         : host,
            "x-amz-date"   : amzDate,
            "x-amz-target" : target,
        };

        const sortedHeaderKeys = Object.keys(headers).sort();
        const canonicalHeaders = sortedHeaderKeys
            .map(k => `${k}:${headers[k]}`)
            .join("\n") + "\n";
        const signedHeaders = sortedHeaderKeys.join(";");

        const canonicalRequest = [
            "POST",           // method
            "/",              // path
            "",               // query string (none)
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

        const signingKey  = await getSigningKey(secretAccessKey, dateStamp, region, service);
        const signature   = toHex(await hmac(signingKey, stringToSign));

        const authHeader =
            `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, ` +
            `SignedHeaders=${signedHeaders}, Signature=${signature}`;

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                ...headers,
                "Authorization": authHeader,
            },
            body: bodyStr,
        });

        // ── Return the result so you can inspect it in the Glia console ───────────
        const responseBody = await response.text();

        return new Response(
            JSON.stringify({
                success:      response.ok,
                status:       response.status,
                dynamoResponse: responseBody,
                itemWritten:  logEntry,
            }),
            {
                status: response.ok ? 200 : 500,
                headers: { "Content-Type": "application/json" },
            }
        );

    } catch (err) {
        // Now Glia always receives valid JSON, even on crashes
        return new Response(
            JSON.stringify({
                success: false,
                error:   err.message,
                stack:   err.stack ?? null,
            }),
            {
                status:  500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }   
    
}