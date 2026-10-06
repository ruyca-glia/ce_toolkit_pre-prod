// apply_gva_config_credentials.js
async function onInvoke(request, env) {
  try {
    const envelope = await request.json();
    const payload = typeof envelope.payload === "string" ? JSON.parse(envelope.payload) : envelope.payload || {};
    const { issueKey, coreConfig, credentials } = payload;
    if (coreConfig === void 0 && credentials === void 0) {
      return Response.json({ success: false, error: "Provide either coreConfig or credentials" }, { status: 400 });
    }
    if (coreConfig !== void 0) {
      if (!coreConfig || typeof coreConfig !== "object" || Array.isArray(coreConfig)) {
        return Response.json({ success: false, error: "coreConfig must be a JSON object" }, { status: 400 });
      }
      if (Object.keys(coreConfig).length === 0) {
        return Response.json({ success: false, error: "coreConfig has no keys to change" }, { status: 400 });
      }
    }
    if (credentials !== void 0) {
      if (!credentials?.secrets || !("api_key_id" in credentials.secrets) || !("api_key_secret" in credentials.secrets)) {
        return Response.json({
          success: false,
          error: 'credentials must be { "secrets": { "api_key_id": "", "api_key_secret": "" } }'
        }, { status: 400 });
      }
      const idPreview = String(credentials.secrets.api_key_id || "").substring(0, 5);
      console.log("api_key_id prefix: " + (idPreview ? idPreview + "..." : "(empty)"));
    }
    const doc = buildGvaConfigDocx({ issueKey: issueKey || "AD-HOC", coreConfig, credentials });
    const filename = doc.filename;
    const docBase64 = bytesToBase64(doc.bytes);
    return Response.json({
      success: true,
      filename,
      docBase64,
      summary: {
        item: issueKey || "AD-HOC",
        action: coreConfig ? "Wrote core configuration" : "Wrote credentials",
        status: "OK",
        logs: [
          coreConfig ? `${Object.keys(coreConfig).length} top-level configuration key(s)` : "Credentials payload",
          `Downloaded ${filename}`
        ],
        filename
      }
    });
  } catch (error) {
    console.error("ApplyGvaConfigCredentials error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
function buildGvaConfigDocx({ issueKey, coreConfig, credentials }) {
  const stamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
  const filename = `gva-${coreConfig ? "core-config" : "credentials"}-${issueKey}-${stamp}.docx`;
  const bodyXml = wordDocumentXml([
    [JSON.stringify(coreConfig || credentials, null, 2), false]
  ]);
  const files = {
    "[Content_Types].xml": contentTypesXml(),
    "_rels/.rels": relsXml(),
    "word/document.xml": bodyXml,
    "word/_rels/document.xml.rels": documentRelsXml()
  };
  return { filename, bytes: zipStore(files) };
}
function contentTypesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;
}
function relsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
}
function documentRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`;
}
function wordDocumentXml(blocks) {
  const paragraphs = blocks.flatMap(([text, heading]) => {
    return String(text).split("\n").map((line) => {
      const runProps = heading ? '<w:rPr><w:b/><w:sz w:val="28"/></w:rPr>' : "";
      return `<w:p><w:r>${runProps}<w:t xml:space="preserve">${xmlEscape(line)}</w:t></w:r></w:p>`;
    });
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>${paragraphs}<w:sectPr/></w:body>
</w:document>`;
}
function xmlEscape(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function bytesToBase64(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
var CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();
function crc32(bytes) {
  let crc = 4294967295;
  for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 255] ^ crc >>> 8;
  return (crc ^ 4294967295) >>> 0;
}
function concatBytes(parts) {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  parts.forEach((p) => {
    out.set(p, offset);
    offset += p.length;
  });
  return out;
}
function u16(n) {
  const b = new Uint8Array(2);
  new DataView(b.buffer).setUint16(0, n, true);
  return b;
}
function u32(n) {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, n, true);
  return b;
}
function zipStore(fileMap) {
  const encoder = new TextEncoder();
  const locals = [];
  const centrals = [];
  let offset = 0;
  Object.entries(fileMap).forEach(([name, text]) => {
    const nameBytes = encoder.encode(name);
    const data = encoder.encode(text);
    const crc = crc32(data);
    const local = concatBytes([
      encoder.encode("PK"),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(nameBytes.length),
      u16(0),
      nameBytes,
      data
    ]);
    const central = concatBytes([
      encoder.encode("PK"),
      u16(20),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(nameBytes.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      nameBytes
    ]);
    locals.push(local);
    centrals.push(central);
    offset += local.length;
  });
  const centralDir = concatBytes(centrals);
  const end = concatBytes([
    encoder.encode("PK"),
    u16(0),
    u16(0),
    u16(centrals.length),
    u16(centrals.length),
    u32(centralDir.length),
    u32(offset),
    u16(0)
  ]);
  return concatBytes([...locals, centralDir, end]);
}
export {
  onInvoke
};
