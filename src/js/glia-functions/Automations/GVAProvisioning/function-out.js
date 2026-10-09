var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e3) {
    throw err = [e3], e3;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// node_modules/@smithy/types/dist-es/endpoint.js
var EndpointURLScheme;
var init_endpoint = __esm({
  "node_modules/@smithy/types/dist-es/endpoint.js"() {
    (function(EndpointURLScheme2) {
      EndpointURLScheme2["HTTP"] = "http";
      EndpointURLScheme2["HTTPS"] = "https";
    })(EndpointURLScheme || (EndpointURLScheme = {}));
  }
});

// node_modules/@smithy/types/dist-es/extensions/checksum.js
var AlgorithmId;
var init_checksum = __esm({
  "node_modules/@smithy/types/dist-es/extensions/checksum.js"() {
    (function(AlgorithmId2) {
      AlgorithmId2["MD5"] = "md5";
      AlgorithmId2["CRC32"] = "crc32";
      AlgorithmId2["CRC32C"] = "crc32c";
      AlgorithmId2["SHA1"] = "sha1";
      AlgorithmId2["SHA256"] = "sha256";
    })(AlgorithmId || (AlgorithmId = {}));
  }
});

// node_modules/@smithy/types/dist-es/extensions/index.js
var init_extensions = __esm({
  "node_modules/@smithy/types/dist-es/extensions/index.js"() {
    init_checksum();
  }
});

// node_modules/@smithy/types/dist-es/middleware.js
var SMITHY_CONTEXT_KEY;
var init_middleware = __esm({
  "node_modules/@smithy/types/dist-es/middleware.js"() {
    SMITHY_CONTEXT_KEY = "__smithy_context";
  }
});

// node_modules/@smithy/types/dist-es/index.js
var init_dist_es = __esm({
  "node_modules/@smithy/types/dist-es/index.js"() {
    init_endpoint();
    init_extensions();
    init_middleware();
  }
});

// node_modules/@smithy/core/dist-es/submodules/transport/getSmithyContext.js
var getSmithyContext;
var init_getSmithyContext = __esm({
  "node_modules/@smithy/core/dist-es/submodules/transport/getSmithyContext.js"() {
    init_dist_es();
    getSmithyContext = (context) => context[SMITHY_CONTEXT_KEY] || (context[SMITHY_CONTEXT_KEY] = {});
  }
});

// node_modules/@smithy/core/dist-es/submodules/transport/hasOwn.js
function hasOwn(o, k3) {
  return Object.prototype.hasOwnProperty.call(o, k3);
}
var init_hasOwn = __esm({
  "node_modules/@smithy/core/dist-es/submodules/transport/hasOwn.js"() {
  }
});

// node_modules/@smithy/core/dist-es/submodules/transport/httpRequest.js
function cloneQuery(query) {
  return Object.keys(query).reduce((carry, paramName) => {
    const param = query[paramName];
    return {
      ...carry,
      [paramName]: Array.isArray(param) ? [...param] : param
    };
  }, {});
}
var HttpRequest;
var init_httpRequest = __esm({
  "node_modules/@smithy/core/dist-es/submodules/transport/httpRequest.js"() {
    HttpRequest = class _HttpRequest {
      constructor(options) {
        __publicField(this, "method");
        __publicField(this, "protocol");
        __publicField(this, "hostname");
        __publicField(this, "port");
        __publicField(this, "path");
        __publicField(this, "query");
        __publicField(this, "headers");
        __publicField(this, "username");
        __publicField(this, "password");
        __publicField(this, "fragment");
        __publicField(this, "body");
        this.method = options.method || "GET";
        this.hostname = options.hostname || "localhost";
        this.port = options.port;
        this.query = options.query || {};
        this.headers = options.headers || {};
        this.body = options.body;
        this.protocol = options.protocol ? options.protocol.slice(-1) !== ":" ? `${options.protocol}:` : options.protocol : "https:";
        this.path = options.path ? options.path.charAt(0) !== "/" ? `/${options.path}` : options.path : "/";
        this.username = options.username;
        this.password = options.password;
        this.fragment = options.fragment;
      }
      static clone(request) {
        const cloned = new _HttpRequest({
          ...request,
          headers: { ...request.headers }
        });
        if (cloned.query) {
          cloned.query = cloneQuery(cloned.query);
        }
        return cloned;
      }
      static isInstance(request) {
        if (!request) {
          return false;
        }
        const req = request;
        return "method" in req && "protocol" in req && "hostname" in req && "path" in req && typeof req["query"] === "object" && typeof req["headers"] === "object";
      }
      clone() {
        return _HttpRequest.clone(this);
      }
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/transport/httpResponse.js
var HttpResponse;
var init_httpResponse = __esm({
  "node_modules/@smithy/core/dist-es/submodules/transport/httpResponse.js"() {
    HttpResponse = class {
      constructor(options) {
        __publicField(this, "statusCode");
        __publicField(this, "reason");
        __publicField(this, "headers");
        __publicField(this, "body");
        this.statusCode = options.statusCode;
        this.reason = options.reason;
        this.headers = options.headers || {};
        this.body = options.body;
      }
      static isInstance(response) {
        if (!response)
          return false;
        const resp = response;
        return typeof resp.statusCode === "number" && typeof resp.headers === "object";
      }
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/transport/isValidHostLabel.js
var VALID_HOST_LABEL_REGEX, isValidHostLabel;
var init_isValidHostLabel = __esm({
  "node_modules/@smithy/core/dist-es/submodules/transport/isValidHostLabel.js"() {
    VALID_HOST_LABEL_REGEX = new RegExp(`^(?!.*-$)(?!-)[a-zA-Z0-9-]{1,63}$`);
    isValidHostLabel = (value, allowSubDomains = false) => {
      if (!allowSubDomains) {
        return VALID_HOST_LABEL_REGEX.test(value);
      }
      const labels = value.split(".");
      for (const label of labels) {
        if (!isValidHostLabel(label)) {
          return false;
        }
      }
      return true;
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/transport/isValidHostname.js
function isValidHostname(hostname) {
  const hostPattern = /^[a-z0-9][a-z0-9.-]*[a-z0-9]$/;
  return hostPattern.test(hostname);
}
var init_isValidHostname = __esm({
  "node_modules/@smithy/core/dist-es/submodules/transport/isValidHostname.js"() {
  }
});

// node_modules/@smithy/core/dist-es/submodules/transport/normalizeProvider.js
var normalizeProvider;
var init_normalizeProvider = __esm({
  "node_modules/@smithy/core/dist-es/submodules/transport/normalizeProvider.js"() {
    normalizeProvider = (input) => {
      if (typeof input === "function")
        return input;
      const promisified = Promise.resolve(input);
      return () => promisified;
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/transport/parseQueryString.js
function parseQueryString(querystring) {
  const query = {};
  querystring = querystring.replace(/^\?/, "");
  if (querystring) {
    for (const pair of querystring.split("&")) {
      let [key, value = null] = pair.split("=");
      key = decodeURIComponent(key);
      if (value) {
        value = decodeURIComponent(value);
      }
      if (!(key in query)) {
        query[key] = value;
      } else if (Array.isArray(query[key])) {
        query[key].push(value);
      } else {
        query[key] = [query[key], value];
      }
    }
  }
  return query;
}
var init_parseQueryString = __esm({
  "node_modules/@smithy/core/dist-es/submodules/transport/parseQueryString.js"() {
  }
});

// node_modules/@smithy/core/dist-es/submodules/transport/parseUrl.js
var parseUrl;
var init_parseUrl = __esm({
  "node_modules/@smithy/core/dist-es/submodules/transport/parseUrl.js"() {
    init_parseQueryString();
    parseUrl = (url) => {
      if (typeof url === "string") {
        return parseUrl(new URL(url));
      }
      const { hostname, pathname, port, protocol, search } = url;
      let query;
      if (search) {
        query = parseQueryString(search);
      }
      return {
        hostname,
        port: port ? parseInt(port) : void 0,
        protocol,
        path: pathname,
        query
      };
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/transport/toEndpointV1.js
var toEndpointV1;
var init_toEndpointV1 = __esm({
  "node_modules/@smithy/core/dist-es/submodules/transport/toEndpointV1.js"() {
    init_hasOwn();
    init_parseUrl();
    toEndpointV1 = (endpoint) => {
      if (typeof endpoint === "object") {
        if ("url" in endpoint) {
          const v1Endpoint = parseUrl(endpoint.url);
          if (endpoint.headers) {
            v1Endpoint.headers = {};
            for (const name in endpoint.headers) {
              if (!hasOwn(endpoint.headers, name))
                continue;
              v1Endpoint.headers[name.toLowerCase()] = endpoint.headers[name].join(", ");
            }
          }
          return v1Endpoint;
        }
        return endpoint;
      }
      return parseUrl(endpoint);
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/transport/index.js
var init_transport = __esm({
  "node_modules/@smithy/core/dist-es/submodules/transport/index.js"() {
    init_getSmithyContext();
    init_hasOwn();
    init_httpRequest();
    init_httpResponse();
    init_isValidHostLabel();
    init_isValidHostname();
    init_normalizeProvider();
    init_parseUrl();
    init_toEndpointV1();
  }
});

// node_modules/@smithy/core/dist-es/submodules/schema/deref.js
var deref;
var init_deref = __esm({
  "node_modules/@smithy/core/dist-es/submodules/schema/deref.js"() {
    deref = (schemaRef) => {
      if (typeof schemaRef === "function") {
        return schemaRef();
      }
      return schemaRef;
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/schema/schemas/operation.js
var operation;
var init_operation = __esm({
  "node_modules/@smithy/core/dist-es/submodules/schema/schemas/operation.js"() {
    operation = (namespace, name, traits, input, output) => ({
      name,
      namespace,
      traits,
      input,
      output
    });
  }
});

// node_modules/@smithy/core/dist-es/submodules/schema/middleware/schemaDeserializationMiddleware.js
var schemaDeserializationMiddleware, findHeader;
var init_schemaDeserializationMiddleware = __esm({
  "node_modules/@smithy/core/dist-es/submodules/schema/middleware/schemaDeserializationMiddleware.js"() {
    init_transport();
    init_operation();
    schemaDeserializationMiddleware = (config) => (next, context) => async (args) => {
      const { response } = await next(args);
      const { operationSchema } = getSmithyContext(context);
      const [, ns, n, t, i3, o] = operationSchema ?? [];
      try {
        const parsed = await config.protocol.deserializeResponse(operation(ns, n, t, i3, o), {
          ...config,
          ...context
        }, response);
        return {
          response,
          output: parsed
        };
      } catch (error) {
        Object.defineProperty(error, "$response", {
          value: response,
          enumerable: false,
          writable: false,
          configurable: false
        });
        if (!("$metadata" in error)) {
          const hint = `Deserialization error: to see the raw response, inspect the hidden field {error}.$response on this object.`;
          try {
            error.message += "\n  " + hint;
          } catch (ignored) {
            if (!context.logger || context.logger?.constructor?.name === "NoOpLogger") {
              console.warn(hint);
            } else {
              context.logger?.warn?.(hint);
            }
          }
          if (typeof error.$responseBodyText !== "undefined") {
            if (error.$response) {
              error.$response.body = error.$responseBodyText;
            }
          }
          try {
            if (HttpResponse.isInstance(response)) {
              const { headers = {}, statusCode } = response;
              const headerEntries = Object.entries(headers);
              error.$metadata = {
                httpStatusCode: statusCode,
                requestId: findHeader(/^x-[\w-]+-request-?id$/, headerEntries),
                extendedRequestId: findHeader(/^x-[\w-]+-id-2$/, headerEntries),
                cfId: findHeader(/^x-[\w-]+-cf-id$/, headerEntries)
              };
            }
          } catch (ignored) {
          }
        }
        throw error;
      }
    };
    findHeader = (pattern, headers) => {
      return (headers.find(([k3]) => {
        return k3.match(pattern);
      }) || [void 0, void 0])[1];
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/schema/middleware/schemaSerializationMiddleware.js
var schemaSerializationMiddleware;
var init_schemaSerializationMiddleware = __esm({
  "node_modules/@smithy/core/dist-es/submodules/schema/middleware/schemaSerializationMiddleware.js"() {
    init_transport();
    init_operation();
    schemaSerializationMiddleware = (config) => (next, context) => async (args) => {
      const { operationSchema } = getSmithyContext(context);
      const [, ns, n, t, i3, o] = operationSchema ?? [];
      const endpoint = context.endpointV2 ? async () => toEndpointV1(context.endpointV2) : config.endpoint;
      const request = await config.protocol.serializeRequest(operation(ns, n, t, i3, o), args.input, {
        ...config,
        ...context,
        endpoint
      });
      return next({
        ...args,
        request
      });
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/schema/middleware/getSchemaSerdePlugin.js
function getSchemaSerdePlugin(config) {
  return {
    applyToStack: (commandStack) => {
      commandStack.add(schemaSerializationMiddleware(config), serializerMiddlewareOption);
      commandStack.add(schemaDeserializationMiddleware(config), deserializerMiddlewareOption);
      config.protocol.setSerdeContext(config);
    }
  };
}
var deserializerMiddlewareOption, serializerMiddlewareOption;
var init_getSchemaSerdePlugin = __esm({
  "node_modules/@smithy/core/dist-es/submodules/schema/middleware/getSchemaSerdePlugin.js"() {
    init_schemaDeserializationMiddleware();
    init_schemaSerializationMiddleware();
    deserializerMiddlewareOption = {
      name: "deserializerMiddleware",
      step: "deserialize",
      tags: ["DESERIALIZER"],
      override: true
    };
    serializerMiddlewareOption = {
      name: "serializerMiddleware",
      step: "serialize",
      tags: ["SERIALIZER"],
      override: true
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/schema/schemas/translateTraits.js
function translateTraits(indicator) {
  if (typeof indicator === "object") {
    return indicator;
  }
  indicator = indicator | 0;
  if (traitsCache[indicator]) {
    return traitsCache[indicator];
  }
  const traits = {};
  let i3 = 0;
  for (const trait of [
    "httpLabel",
    "idempotent",
    "idempotencyToken",
    "sensitive",
    "httpPayload",
    "httpResponseCode",
    "httpQueryParams"
  ]) {
    if ((indicator >> i3++ & 1) === 1) {
      traits[trait] = 1;
    }
  }
  return traitsCache[indicator] = traits;
}
var traitsCache;
var init_translateTraits = __esm({
  "node_modules/@smithy/core/dist-es/submodules/schema/schemas/translateTraits.js"() {
    traitsCache = [];
  }
});

// node_modules/@smithy/core/dist-es/submodules/schema/schemas/NormalizedSchema.js
function member(memberSchema, memberName) {
  if (memberSchema instanceof NormalizedSchema) {
    return Object.assign(memberSchema, {
      memberName,
      _isMemberSchema: true
    });
  }
  const internalCtorAccess = NormalizedSchema;
  return new internalCtorAccess(memberSchema, memberName);
}
var anno, simpleSchemaCacheN, simpleSchemaCacheS, _NormalizedSchema, NormalizedSchema, isMemberSchema, isStaticSchema;
var init_NormalizedSchema = __esm({
  "node_modules/@smithy/core/dist-es/submodules/schema/schemas/NormalizedSchema.js"() {
    init_deref();
    init_translateTraits();
    anno = {
      it: /* @__PURE__ */ Symbol.for("@smithy/nor-struct-it"),
      ns: /* @__PURE__ */ Symbol.for("@smithy/ns")
    };
    simpleSchemaCacheN = [];
    simpleSchemaCacheS = {};
    _NormalizedSchema = class _NormalizedSchema {
      constructor(ref, memberName) {
        __publicField(this, "ref");
        __publicField(this, "memberName");
        __publicField(this, "symbol", _NormalizedSchema.symbol);
        __publicField(this, "name");
        __publicField(this, "schema");
        __publicField(this, "_isMemberSchema");
        __publicField(this, "traits");
        __publicField(this, "memberTraits");
        __publicField(this, "normalizedTraits");
        this.ref = ref;
        this.memberName = memberName;
        const traitStack = [];
        let _ref = ref;
        let schema = ref;
        this._isMemberSchema = false;
        while (isMemberSchema(_ref)) {
          traitStack.push(_ref[1]);
          _ref = _ref[0];
          schema = deref(_ref);
          this._isMemberSchema = true;
        }
        if (traitStack.length > 0) {
          this.memberTraits = {};
          for (let i3 = traitStack.length - 1; i3 >= 0; --i3) {
            const traitSet = traitStack[i3];
            Object.assign(this.memberTraits, translateTraits(traitSet));
          }
        } else {
          this.memberTraits = 0;
        }
        if (schema instanceof _NormalizedSchema) {
          const computedMemberTraits = this.memberTraits;
          Object.assign(this, schema);
          this.memberTraits = Object.assign({}, computedMemberTraits, schema.getMemberTraits(), this.getMemberTraits());
          this.normalizedTraits = void 0;
          this.memberName = memberName ?? schema.memberName;
          return;
        }
        this.schema = deref(schema);
        if (isStaticSchema(this.schema)) {
          this.name = `${this.schema[1]}#${this.schema[2]}`;
          this.traits = this.schema[3];
        } else {
          this.name = this.memberName ?? String(schema);
          this.traits = 0;
        }
        if (this._isMemberSchema && !memberName) {
          throw new Error(`@smithy/core/schema - NormalizedSchema member init ${this.getName(true)} missing member name.`);
        }
      }
      static [Symbol.hasInstance](lhs) {
        const isPrototype = this.prototype.isPrototypeOf(lhs);
        if (!isPrototype && typeof lhs === "object" && lhs !== null) {
          const ns = lhs;
          return ns.symbol === this.symbol;
        }
        return isPrototype;
      }
      static of(ref) {
        const keyAble = typeof ref === "function" || typeof ref === "object" && ref !== null;
        if (typeof ref === "number") {
          if (simpleSchemaCacheN[ref]) {
            return simpleSchemaCacheN[ref];
          }
        } else if (typeof ref === "string") {
          if (simpleSchemaCacheS[ref]) {
            return simpleSchemaCacheS[ref];
          }
        } else if (keyAble) {
          if (ref[anno.ns]) {
            return ref[anno.ns];
          }
        }
        const sc = deref(ref);
        if (sc instanceof _NormalizedSchema) {
          return sc;
        }
        if (isMemberSchema(sc)) {
          const [ns2, traits] = sc;
          if (ns2 instanceof _NormalizedSchema) {
            Object.assign(ns2.getMergedTraits(), translateTraits(traits));
            return ns2;
          }
          throw new Error(`@smithy/core/schema - may not init unwrapped member schema=${JSON.stringify(ref, null, 2)}.`);
        }
        const ns = new _NormalizedSchema(sc);
        if (keyAble) {
          return ref[anno.ns] = ns;
        }
        if (typeof sc === "string") {
          return simpleSchemaCacheS[sc] = ns;
        }
        if (typeof sc === "number") {
          return simpleSchemaCacheN[sc] = ns;
        }
        return ns;
      }
      getSchema() {
        const sc = this.schema;
        if (Array.isArray(sc) && sc[0] === 0) {
          return sc[4];
        }
        return sc;
      }
      getName(withNamespace = false) {
        const { name } = this;
        const short = !withNamespace && name && name.includes("#");
        return short ? name.split("#")[1] : name || void 0;
      }
      getMemberName() {
        return this.memberName;
      }
      isMemberSchema() {
        return this._isMemberSchema;
      }
      isListSchema() {
        const sc = this.getSchema();
        return typeof sc === "number" ? sc >= 64 && sc < 128 : sc[0] === 1;
      }
      isMapSchema() {
        const sc = this.getSchema();
        return typeof sc === "number" ? sc >= 128 && sc <= 255 : sc[0] === 2;
      }
      isStructSchema() {
        const sc = this.getSchema();
        if (typeof sc !== "object") {
          return false;
        }
        const id = sc[0];
        return id === 3 || id === -3 || id === 4;
      }
      isUnionSchema() {
        const sc = this.getSchema();
        if (typeof sc !== "object") {
          return false;
        }
        return sc[0] === 4;
      }
      isBlobSchema() {
        const sc = this.getSchema();
        return sc === 21 || sc === 42;
      }
      isTimestampSchema() {
        const sc = this.getSchema();
        return typeof sc === "number" && sc >= 4 && sc <= 7;
      }
      isUnitSchema() {
        return this.getSchema() === "unit";
      }
      isDocumentSchema() {
        return this.getSchema() === 15;
      }
      isStringSchema() {
        return this.getSchema() === 0;
      }
      isBooleanSchema() {
        return this.getSchema() === 2;
      }
      isNumericSchema() {
        return this.getSchema() === 1;
      }
      isBigIntegerSchema() {
        return this.getSchema() === 17;
      }
      isBigDecimalSchema() {
        return this.getSchema() === 19;
      }
      isStreaming() {
        const { streaming } = this.getMergedTraits();
        return !!streaming || this.getSchema() === 42;
      }
      isIdempotencyToken() {
        return !!this.getMergedTraits().idempotencyToken;
      }
      getMergedTraits() {
        return this.normalizedTraits ?? (this.normalizedTraits = {
          ...this.getOwnTraits(),
          ...this.getMemberTraits()
        });
      }
      getMemberTraits() {
        return translateTraits(this.memberTraits);
      }
      getOwnTraits() {
        return translateTraits(this.traits);
      }
      getKeySchema() {
        const [isDoc, isMap] = [this.isDocumentSchema(), this.isMapSchema()];
        if (!isDoc && !isMap) {
          throw new Error(`@smithy/core/schema - cannot get key for non-map: ${this.getName(true)}`);
        }
        const schema = this.getSchema();
        const memberSchema = isDoc ? 15 : schema[4] ?? 0;
        return member([memberSchema, 0], "key");
      }
      getValueSchema() {
        const sc = this.getSchema();
        const [isDoc, isMap, isList] = [this.isDocumentSchema(), this.isMapSchema(), this.isListSchema()];
        const memberSchema = typeof sc === "number" ? 63 & sc : sc && typeof sc === "object" && (isMap || isList) ? sc[3 + sc[0]] : isDoc ? 15 : void 0;
        if (memberSchema != null) {
          return member([memberSchema, 0], isMap ? "value" : "member");
        }
        throw new Error(`@smithy/core/schema - ${this.getName(true)} has no value member.`);
      }
      getMemberSchema(memberName) {
        const struct = this.getSchema();
        if (this.isStructSchema() && struct[4].includes(memberName)) {
          const i3 = struct[4].indexOf(memberName);
          const memberSchema = struct[5][i3];
          return member(isMemberSchema(memberSchema) ? memberSchema : [memberSchema, 0], memberName);
        }
        if (this.isDocumentSchema()) {
          return member([15, 0], memberName);
        }
        throw new Error(`@smithy/core/schema - ${this.getName(true)} has no member=${memberName}.`);
      }
      getMemberSchemas() {
        const buffer = {};
        try {
          for (const [k3, v] of this.structIterator()) {
            buffer[k3] = v;
          }
        } catch (ignored) {
        }
        return buffer;
      }
      getEventStreamMember() {
        if (this.isStructSchema()) {
          for (const [memberName, memberSchema] of this.structIterator()) {
            if (memberSchema.isStreaming() && memberSchema.isStructSchema()) {
              return memberName;
            }
          }
        }
        return "";
      }
      *structIterator() {
        if (this.isUnitSchema()) {
          return;
        }
        if (!this.isStructSchema()) {
          throw new Error("@smithy/core/schema - cannot iterate non-struct schema.");
        }
        const struct = this.getSchema();
        const z = struct[4].length;
        let it = struct[anno.it];
        if (it && z === it.length) {
          yield* it;
          return;
        }
        it = Array(z);
        for (let i3 = 0; i3 < z; ++i3) {
          const k3 = struct[4][i3];
          const v = member([struct[5][i3], 0], k3);
          yield it[i3] = [k3, v];
        }
        struct[anno.it] = it;
      }
    };
    __publicField(_NormalizedSchema, "symbol", /* @__PURE__ */ Symbol.for("@smithy/nor"));
    NormalizedSchema = _NormalizedSchema;
    isMemberSchema = (sc) => Array.isArray(sc) && sc.length === 2;
    isStaticSchema = (sc) => Array.isArray(sc) && sc.length >= 5;
  }
});

// node_modules/@smithy/core/dist-es/submodules/schema/TypeRegistry.js
var _TypeRegistry, TypeRegistry;
var init_TypeRegistry = __esm({
  "node_modules/@smithy/core/dist-es/submodules/schema/TypeRegistry.js"() {
    _TypeRegistry = class _TypeRegistry {
      constructor(namespace, schemas = /* @__PURE__ */ new Map(), exceptions = /* @__PURE__ */ new Map()) {
        __publicField(this, "namespace");
        __publicField(this, "schemas");
        __publicField(this, "exceptions");
        this.namespace = namespace;
        this.schemas = schemas;
        this.exceptions = exceptions;
        if (!_TypeRegistry.registries.has(namespace)) {
          _TypeRegistry.registries.set(namespace, this);
        }
      }
      static for(namespace) {
        return _TypeRegistry.registries.get(namespace) ?? new _TypeRegistry(namespace);
      }
      copyFrom(other) {
        const { schemas, exceptions } = this;
        for (const [k3, v] of other.schemas) {
          if (!schemas.has(k3)) {
            schemas.set(k3, v);
          }
        }
        for (const [k3, v] of other.exceptions) {
          if (!exceptions.has(k3)) {
            exceptions.set(k3, v);
          }
        }
      }
      register(shapeId, schema) {
        const qualifiedName = this.normalizeShapeId(shapeId);
        for (const r3 of [this, _TypeRegistry.for(qualifiedName.split("#")[0])]) {
          if (!r3.schemas.has(qualifiedName)) {
            r3.schemas.set(qualifiedName, schema);
          }
        }
      }
      getSchema(shapeId) {
        const id = this.normalizeShapeId(shapeId);
        if (!this.schemas.has(id)) {
          if (!shapeId.includes("#")) {
            const suffix = "#" + shapeId;
            const candidates = [];
            for (const [shapeId2, schema] of this.schemas.entries()) {
              if (shapeId2.endsWith(suffix)) {
                candidates.push(schema);
              }
            }
            if (candidates.length === 1) {
              return candidates[0];
            }
          }
          throw new Error(`@smithy/core/schema - schema not found for ${id}`);
        }
        return this.schemas.get(id);
      }
      registerError(es, ctor) {
        const $error = es;
        const ns = $error[1];
        const qualifiedName = ns + "#" + $error[2];
        if (!ctor.hasOwnProperty?.("shapeId")) {
          ctor.shapeId = qualifiedName;
        }
        for (const r3 of [this, _TypeRegistry.for(ns)]) {
          if (!r3.schemas.has(qualifiedName) && !r3.exceptions.has($error)) {
            r3.schemas.set(qualifiedName, $error);
            r3.exceptions.set($error, ctor);
          }
        }
      }
      getErrorCtor(es) {
        const $error = es;
        if (this.exceptions.has($error)) {
          return this.exceptions.get($error);
        }
        const registry = _TypeRegistry.for($error[1]);
        return registry.exceptions.get($error);
      }
      getBaseException() {
        for (const exceptionKey of this.exceptions.keys()) {
          if (Array.isArray(exceptionKey)) {
            const [, ns, name] = exceptionKey;
            const id = ns + "#" + name;
            if (id.startsWith("smithy.ts.sdk.synthetic.") && id.endsWith("ServiceException")) {
              return exceptionKey;
            }
          }
        }
        return void 0;
      }
      find(predicate) {
        for (const schema of this.schemas.values()) {
          if (predicate(schema)) {
            return schema;
          }
        }
        return void 0;
      }
      clear() {
        this.schemas.clear();
        this.exceptions.clear();
      }
      normalizeShapeId(shapeId) {
        if (shapeId.includes("#")) {
          return shapeId;
        }
        return this.namespace + "#" + shapeId;
      }
    };
    __publicField(_TypeRegistry, "registries", /* @__PURE__ */ new Map());
    TypeRegistry = _TypeRegistry;
  }
});

// node_modules/@smithy/core/dist-es/submodules/schema/index.js
var init_schema = __esm({
  "node_modules/@smithy/core/dist-es/submodules/schema/index.js"() {
    init_deref();
    init_getSchemaSerdePlugin();
    init_NormalizedSchema();
    init_translateTraits();
    init_TypeRegistry();
  }
});

// node_modules/@smithy/core/dist-es/submodules/serde/util-base64/constants-for-browser.js
var chars, alphabetByEncoding, alphabetByValue, bitsPerLetter, bitsPerByte, maxLetterValue;
var init_constants_for_browser = __esm({
  "node_modules/@smithy/core/dist-es/submodules/serde/util-base64/constants-for-browser.js"() {
    chars = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/`;
    alphabetByEncoding = Object.entries(chars).reduce((acc, [i3, c3]) => {
      acc[c3] = Number(i3);
      return acc;
    }, {});
    alphabetByValue = chars.split("");
    bitsPerLetter = 6;
    bitsPerByte = 8;
    maxLetterValue = 63;
  }
});

// node_modules/@smithy/core/dist-es/submodules/serde/util-base64/fromBase64.browser.js
var fromBase64;
var init_fromBase64_browser = __esm({
  "node_modules/@smithy/core/dist-es/submodules/serde/util-base64/fromBase64.browser.js"() {
    init_constants_for_browser();
    fromBase64 = (input) => {
      let totalByteLength = input.length / 4 * 3;
      if (input.slice(-2) === "==") {
        totalByteLength -= 2;
      } else if (input.slice(-1) === "=") {
        totalByteLength--;
      }
      const out = new ArrayBuffer(totalByteLength);
      const dataView = new DataView(out);
      for (let i3 = 0; i3 < input.length; i3 += 4) {
        let bits = 0;
        let bitLength = 0;
        for (let j3 = i3, limit = i3 + 3; j3 <= limit; j3++) {
          if (input[j3] !== "=") {
            if (!(input[j3] in alphabetByEncoding)) {
              throw new TypeError(`Invalid character ${input[j3]} in base64 string.`);
            }
            bits |= alphabetByEncoding[input[j3]] << (limit - j3) * bitsPerLetter;
            bitLength += bitsPerLetter;
          } else {
            bits >>= bitsPerLetter;
          }
        }
        const chunkOffset = i3 / 4 * 3;
        bits >>= bitLength % bitsPerByte;
        const byteLength = Math.floor(bitLength / bitsPerByte);
        for (let k3 = 0; k3 < byteLength; k3++) {
          const offset = (byteLength - k3 - 1) * bitsPerByte;
          dataView.setUint8(chunkOffset + k3, (bits & 255 << offset) >> offset);
        }
      }
      return new Uint8Array(out);
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/serde/util-utf8/fromUtf8.browser.js
var fromUtf8;
var init_fromUtf8_browser = __esm({
  "node_modules/@smithy/core/dist-es/submodules/serde/util-utf8/fromUtf8.browser.js"() {
    fromUtf8 = (input) => new TextEncoder().encode(input);
  }
});

// node_modules/@smithy/core/dist-es/submodules/serde/util-base64/toBase64.browser.js
function toBase64(_input) {
  let input;
  if (typeof _input === "string") {
    input = fromUtf8(_input);
  } else {
    input = _input;
  }
  const isArrayLike = typeof input === "object" && typeof input.length === "number";
  const isUint8Array = typeof input === "object" && typeof input.byteOffset === "number" && typeof input.byteLength === "number";
  if (!isArrayLike && !isUint8Array) {
    throw new Error("@smithy/util-base64: toBase64 encoder function only accepts string | Uint8Array.");
  }
  let str = "";
  for (let i3 = 0; i3 < input.length; i3 += 3) {
    let bits = 0;
    let bitLength = 0;
    for (let j3 = i3, limit = Math.min(i3 + 3, input.length); j3 < limit; j3++) {
      bits |= input[j3] << (limit - j3 - 1) * bitsPerByte;
      bitLength += bitsPerByte;
    }
    const bitClusterCount = Math.ceil(bitLength / bitsPerLetter);
    bits <<= bitClusterCount * bitsPerLetter - bitLength;
    for (let k3 = 1; k3 <= bitClusterCount; k3++) {
      const offset = (bitClusterCount - k3) * bitsPerLetter;
      str += alphabetByValue[(bits & maxLetterValue << offset) >> offset];
    }
    str += "==".slice(0, 4 - bitClusterCount);
  }
  return str;
}
var init_toBase64_browser = __esm({
  "node_modules/@smithy/core/dist-es/submodules/serde/util-base64/toBase64.browser.js"() {
    init_fromUtf8_browser();
    init_constants_for_browser();
  }
});

// node_modules/@smithy/core/dist-es/submodules/serde/util-stream/blob/Uint8ArrayBlobAdapter.js
function bindUint8ArrayBlobAdapter(toUtf82, fromUtf82, toBase642, fromBase642) {
  return class Uint8ArrayBlobAdapter2 extends Uint8Array {
    static fromString(source, encoding = "utf-8") {
      if (typeof source === "string") {
        if (encoding === "base64") {
          return Uint8ArrayBlobAdapter2.mutate(fromBase642(source));
        }
        return Uint8ArrayBlobAdapter2.mutate(fromUtf82(source));
      }
      throw new Error(`Unsupported conversion from ${typeof source} to Uint8ArrayBlobAdapter.`);
    }
    static mutate(source) {
      Object.setPrototypeOf(source, Uint8ArrayBlobAdapter2.prototype);
      return source;
    }
    transformToString(encoding = "utf-8") {
      if (encoding === "base64") {
        return toBase642(this);
      }
      return toUtf82(this);
    }
  };
}
var init_Uint8ArrayBlobAdapter = __esm({
  "node_modules/@smithy/core/dist-es/submodules/serde/util-stream/blob/Uint8ArrayBlobAdapter.js"() {
  }
});

// node_modules/@smithy/core/dist-es/submodules/serde/util-utf8/toUtf8.browser.js
var toUtf8;
var init_toUtf8_browser = __esm({
  "node_modules/@smithy/core/dist-es/submodules/serde/util-utf8/toUtf8.browser.js"() {
    toUtf8 = (input) => {
      if (typeof input === "string") {
        return input;
      }
      if (typeof input !== "object" || typeof input.byteOffset !== "number" || typeof input.byteLength !== "number") {
        throw new Error("@smithy/util-utf8: toUtf8 encoder function only accepts string | Uint8Array.");
      }
      return new TextDecoder("utf-8").decode(input);
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/serde/uuid/v4.js
function bindV4(getRandomValues) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return () => crypto.randomUUID();
  }
  return () => {
    const rnds = new Uint8Array(16);
    getRandomValues(rnds);
    rnds[6] = rnds[6] & 15 | 64;
    rnds[8] = rnds[8] & 63 | 128;
    return decimalToHex[rnds[0]] + decimalToHex[rnds[1]] + decimalToHex[rnds[2]] + decimalToHex[rnds[3]] + "-" + decimalToHex[rnds[4]] + decimalToHex[rnds[5]] + "-" + decimalToHex[rnds[6]] + decimalToHex[rnds[7]] + "-" + decimalToHex[rnds[8]] + decimalToHex[rnds[9]] + "-" + decimalToHex[rnds[10]] + decimalToHex[rnds[11]] + decimalToHex[rnds[12]] + decimalToHex[rnds[13]] + decimalToHex[rnds[14]] + decimalToHex[rnds[15]];
  };
}
var decimalToHex;
var init_v4 = __esm({
  "node_modules/@smithy/core/dist-es/submodules/serde/uuid/v4.js"() {
    decimalToHex = Array.from({ length: 256 }, (_, i3) => i3.toString(16).padStart(2, "0"));
  }
});

// node_modules/@smithy/core/dist-es/submodules/serde/parse-utils.js
var expectNumber, MAX_FLOAT, expectFloat32, expectLong, expectShort, expectByte, expectSizedInt, castInt, strictParseDouble, strictParseFloat32, NUMBER_REGEX, parseNumber, strictParseShort, strictParseByte, stackTraceWarning, logger;
var init_parse_utils = __esm({
  "node_modules/@smithy/core/dist-es/submodules/serde/parse-utils.js"() {
    expectNumber = (value) => {
      if (value === null || value === void 0) {
        return void 0;
      }
      if (typeof value === "string") {
        const parsed = parseFloat(value);
        if (!Number.isNaN(parsed)) {
          if (String(parsed) !== String(value)) {
            logger.warn(stackTraceWarning(`Expected number but observed string: ${value}`));
          }
          return parsed;
        }
      }
      if (typeof value === "number") {
        return value;
      }
      throw new TypeError(`Expected number, got ${typeof value}: ${value}`);
    };
    MAX_FLOAT = Math.ceil(2 ** 127 * (2 - 2 ** -23));
    expectFloat32 = (value) => {
      const expected = expectNumber(value);
      if (expected !== void 0 && !Number.isNaN(expected) && expected !== Infinity && expected !== -Infinity) {
        if (Math.abs(expected) > MAX_FLOAT) {
          throw new TypeError(`Expected 32-bit float, got ${value}`);
        }
      }
      return expected;
    };
    expectLong = (value) => {
      if (value === null || value === void 0) {
        return void 0;
      }
      if (Number.isInteger(value) && !Number.isNaN(value)) {
        return value;
      }
      throw new TypeError(`Expected integer, got ${typeof value}: ${value}`);
    };
    expectShort = (value) => expectSizedInt(value, 16);
    expectByte = (value) => expectSizedInt(value, 8);
    expectSizedInt = (value, size) => {
      const expected = expectLong(value);
      if (expected !== void 0 && castInt(expected, size) !== expected) {
        throw new TypeError(`Expected ${size}-bit integer, got ${value}`);
      }
      return expected;
    };
    castInt = (value, size) => {
      switch (size) {
        case 32:
          return Int32Array.of(value)[0];
        case 16:
          return Int16Array.of(value)[0];
        case 8:
          return Int8Array.of(value)[0];
      }
    };
    strictParseDouble = (value) => {
      if (typeof value == "string") {
        return expectNumber(parseNumber(value));
      }
      return expectNumber(value);
    };
    strictParseFloat32 = (value) => {
      if (typeof value == "string") {
        return expectFloat32(parseNumber(value));
      }
      return expectFloat32(value);
    };
    NUMBER_REGEX = /(-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)|(-?Infinity)|(NaN)/g;
    parseNumber = (value) => {
      const matches = value.match(NUMBER_REGEX);
      if (matches === null || matches[0].length !== value.length) {
        throw new TypeError(`Expected real number, got implicit NaN`);
      }
      return parseFloat(value);
    };
    strictParseShort = (value) => {
      if (typeof value === "string") {
        return expectShort(parseNumber(value));
      }
      return expectShort(value);
    };
    strictParseByte = (value) => {
      if (typeof value === "string") {
        return expectByte(parseNumber(value));
      }
      return expectByte(value);
    };
    stackTraceWarning = (message) => {
      return String(new TypeError(message).stack || message).split("\n").slice(0, 5).filter((s) => !s.includes("stackTraceWarning")).join("\n");
    };
    logger = {
      warn: console.warn
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/serde/date-utils.js
function dateToUtcString(date2) {
  const year2 = date2.getUTCFullYear();
  const month = date2.getUTCMonth();
  const dayOfWeek = date2.getUTCDay();
  const dayOfMonthInt = date2.getUTCDate();
  const hoursInt = date2.getUTCHours();
  const minutesInt = date2.getUTCMinutes();
  const secondsInt = date2.getUTCSeconds();
  const dayOfMonthString = dayOfMonthInt < 10 ? `0${dayOfMonthInt}` : `${dayOfMonthInt}`;
  const hoursString = hoursInt < 10 ? `0${hoursInt}` : `${hoursInt}`;
  const minutesString = minutesInt < 10 ? `0${minutesInt}` : `${minutesInt}`;
  const secondsString = secondsInt < 10 ? `0${secondsInt}` : `${secondsInt}`;
  return `${DAYS[dayOfWeek]}, ${dayOfMonthString} ${MONTHS[month]} ${year2} ${hoursString}:${minutesString}:${secondsString} GMT`;
}
var DAYS, MONTHS, RFC3339, RFC3339_WITH_OFFSET, parseRfc3339DateTimeWithOffset, IMF_FIXDATE, RFC_850_DATE, ASC_TIME, parseRfc7231DateTime, parseEpochTimestamp, buildDate, parseTwoDigitYear, FIFTY_YEARS_IN_MILLIS, adjustRfc850Year, parseMonthByShortName, DAYS_IN_MONTH, validateDayOfMonth, isLeapYear, parseDateValue, parseMilliseconds, parseOffsetToMilliseconds, stripLeadingZeroes;
var init_date_utils = __esm({
  "node_modules/@smithy/core/dist-es/submodules/serde/date-utils.js"() {
    init_parse_utils();
    DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    RFC3339 = new RegExp(/^(\d{4})-(\d{2})-(\d{2})[tT](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?[zZ]$/);
    RFC3339_WITH_OFFSET = new RegExp(/^(\d{4})-(\d{2})-(\d{2})[tT](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(([-+]\d{2}:\d{2})|[zZ])$/);
    parseRfc3339DateTimeWithOffset = (value) => {
      if (value === null || value === void 0) {
        return void 0;
      }
      if (typeof value !== "string") {
        throw new TypeError("RFC-3339 date-times must be expressed as strings");
      }
      const match = RFC3339_WITH_OFFSET.exec(value);
      if (!match) {
        throw new TypeError("Invalid RFC-3339 date-time value");
      }
      const [_, yearStr, monthStr, dayStr, hours, minutes, seconds, fractionalMilliseconds, offsetStr] = match;
      const year2 = strictParseShort(stripLeadingZeroes(yearStr));
      const month = parseDateValue(monthStr, "month", 1, 12);
      const day = parseDateValue(dayStr, "day", 1, 31);
      const date2 = buildDate(year2, month, day, { hours, minutes, seconds, fractionalMilliseconds });
      if (offsetStr.toUpperCase() != "Z") {
        date2.setTime(date2.getTime() - parseOffsetToMilliseconds(offsetStr));
      }
      return date2;
    };
    IMF_FIXDATE = new RegExp(/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d{2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))? GMT$/);
    RFC_850_DATE = new RegExp(/^(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (\d{2})-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d{2}) (\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))? GMT$/);
    ASC_TIME = new RegExp(/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( [1-9]|\d{2}) (\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))? (\d{4})$/);
    parseRfc7231DateTime = (value) => {
      if (value === null || value === void 0) {
        return void 0;
      }
      if (typeof value !== "string") {
        throw new TypeError("RFC-7231 date-times must be expressed as strings");
      }
      let match = IMF_FIXDATE.exec(value);
      if (match) {
        const [_, dayStr, monthStr, yearStr, hours, minutes, seconds, fractionalMilliseconds] = match;
        return buildDate(strictParseShort(stripLeadingZeroes(yearStr)), parseMonthByShortName(monthStr), parseDateValue(dayStr, "day", 1, 31), { hours, minutes, seconds, fractionalMilliseconds });
      }
      match = RFC_850_DATE.exec(value);
      if (match) {
        const [_, dayStr, monthStr, yearStr, hours, minutes, seconds, fractionalMilliseconds] = match;
        return adjustRfc850Year(buildDate(parseTwoDigitYear(yearStr), parseMonthByShortName(monthStr), parseDateValue(dayStr, "day", 1, 31), {
          hours,
          minutes,
          seconds,
          fractionalMilliseconds
        }));
      }
      match = ASC_TIME.exec(value);
      if (match) {
        const [_, monthStr, dayStr, hours, minutes, seconds, fractionalMilliseconds, yearStr] = match;
        return buildDate(strictParseShort(stripLeadingZeroes(yearStr)), parseMonthByShortName(monthStr), parseDateValue(dayStr.trimLeft(), "day", 1, 31), { hours, minutes, seconds, fractionalMilliseconds });
      }
      throw new TypeError("Invalid RFC-7231 date-time value");
    };
    parseEpochTimestamp = (value) => {
      if (value === null || value === void 0) {
        return void 0;
      }
      let valueAsDouble;
      if (typeof value === "number") {
        valueAsDouble = value;
      } else if (typeof value === "string") {
        valueAsDouble = strictParseDouble(value);
      } else if (typeof value === "object" && value.tag === 1) {
        valueAsDouble = value.value;
      } else {
        throw new TypeError("Epoch timestamps must be expressed as floating point numbers or their string representation");
      }
      if (Number.isNaN(valueAsDouble) || valueAsDouble === Infinity || valueAsDouble === -Infinity) {
        throw new TypeError("Epoch timestamps must be valid, non-Infinite, non-NaN numerics");
      }
      return new Date(Math.round(valueAsDouble * 1e3));
    };
    buildDate = (year2, month, day, time2) => {
      const adjustedMonth = month - 1;
      validateDayOfMonth(year2, adjustedMonth, day);
      return new Date(Date.UTC(year2, adjustedMonth, day, parseDateValue(time2.hours, "hour", 0, 23), parseDateValue(time2.minutes, "minute", 0, 59), parseDateValue(time2.seconds, "seconds", 0, 60), parseMilliseconds(time2.fractionalMilliseconds)));
    };
    parseTwoDigitYear = (value) => {
      const thisYear = (/* @__PURE__ */ new Date()).getUTCFullYear();
      const valueInThisCentury = Math.floor(thisYear / 100) * 100 + strictParseShort(stripLeadingZeroes(value));
      if (valueInThisCentury < thisYear) {
        return valueInThisCentury + 100;
      }
      return valueInThisCentury;
    };
    FIFTY_YEARS_IN_MILLIS = 50 * 365 * 24 * 60 * 60 * 1e3;
    adjustRfc850Year = (input) => {
      if (input.getTime() - (/* @__PURE__ */ new Date()).getTime() > FIFTY_YEARS_IN_MILLIS) {
        return new Date(Date.UTC(input.getUTCFullYear() - 100, input.getUTCMonth(), input.getUTCDate(), input.getUTCHours(), input.getUTCMinutes(), input.getUTCSeconds(), input.getUTCMilliseconds()));
      }
      return input;
    };
    parseMonthByShortName = (value) => {
      const monthIdx = MONTHS.indexOf(value);
      if (monthIdx < 0) {
        throw new TypeError(`Invalid month: ${value}`);
      }
      return monthIdx + 1;
    };
    DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    validateDayOfMonth = (year2, month, day) => {
      let maxDays = DAYS_IN_MONTH[month];
      if (month === 1 && isLeapYear(year2)) {
        maxDays = 29;
      }
      if (day > maxDays) {
        throw new TypeError(`Invalid day for ${MONTHS[month]} in ${year2}: ${day}`);
      }
    };
    isLeapYear = (year2) => {
      return year2 % 4 === 0 && (year2 % 100 !== 0 || year2 % 400 === 0);
    };
    parseDateValue = (value, type, lower, upper) => {
      const dateVal = strictParseByte(stripLeadingZeroes(value));
      if (dateVal < lower || dateVal > upper) {
        throw new TypeError(`${type} must be between ${lower} and ${upper}, inclusive`);
      }
      return dateVal;
    };
    parseMilliseconds = (value) => {
      if (value === null || value === void 0) {
        return 0;
      }
      return strictParseFloat32("0." + value) * 1e3;
    };
    parseOffsetToMilliseconds = (value) => {
      const directionStr = value[0];
      let direction = 1;
      if (directionStr == "+") {
        direction = 1;
      } else if (directionStr == "-") {
        direction = -1;
      } else {
        throw new TypeError(`Offset direction, ${directionStr}, must be "+" or "-"`);
      }
      const hour = Number(value.substring(1, 3));
      const minute = Number(value.substring(4, 6));
      return direction * (hour * 60 + minute) * 60 * 1e3;
    };
    stripLeadingZeroes = (value) => {
      let idx = 0;
      while (idx < value.length - 1 && value.charAt(idx) === "0") {
        idx++;
      }
      if (idx === 0) {
        return value;
      }
      return value.slice(idx);
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/serde/lazy-json.js
var LazyJsonString;
var init_lazy_json = __esm({
  "node_modules/@smithy/core/dist-es/submodules/serde/lazy-json.js"() {
    LazyJsonString = function LazyJsonString2(val) {
      const str = Object.assign(new String(val), {
        deserializeJSON() {
          return JSON.parse(String(val));
        },
        toString() {
          return String(val);
        },
        toJSON() {
          return String(val);
        }
      });
      return str;
    };
    LazyJsonString.from = (object) => {
      if (object && typeof object === "object" && (object instanceof LazyJsonString || "deserializeJSON" in object)) {
        return object;
      } else if (typeof object === "string" || Object.getPrototypeOf(object) === String.prototype) {
        return LazyJsonString(String(object));
      }
      return LazyJsonString(JSON.stringify(object));
    };
    LazyJsonString.fromObject = LazyJsonString.from;
  }
});

// node_modules/@smithy/core/dist-es/submodules/serde/quote-header.js
function quoteHeader(part) {
  if (part.includes(",") || part.includes('"')) {
    part = `"${part.replace(/"/g, '\\"')}"`;
  }
  return part;
}
var init_quote_header = __esm({
  "node_modules/@smithy/core/dist-es/submodules/serde/quote-header.js"() {
  }
});

// node_modules/@smithy/core/dist-es/submodules/serde/schema-serde-lib/schema-date-utils.js
function range(v, min, max) {
  const _v = Number(v);
  if (_v < min || _v > max) {
    throw new Error(`Value ${_v} out of range [${min}, ${max}]`);
  }
}
var ddd, mmm, time, date, year, RFC3339_WITH_OFFSET2, IMF_FIXDATE2, RFC_850_DATE2, ASC_TIME2, months, _parseEpochTimestamp, _parseRfc3339DateTimeWithOffset, _parseRfc7231DateTime;
var init_schema_date_utils = __esm({
  "node_modules/@smithy/core/dist-es/submodules/serde/schema-serde-lib/schema-date-utils.js"() {
    ddd = `(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)(?:[ne|u?r]?s?day)?`;
    mmm = `(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)`;
    time = `(\\d?\\d):(\\d{2}):(\\d{2})(?:\\.(\\d+))?`;
    date = `(\\d?\\d)`;
    year = `(\\d{4})`;
    RFC3339_WITH_OFFSET2 = new RegExp(/^(\d{4})-(\d\d)-(\d\d)[tT](\d\d):(\d\d):(\d\d)(\.(\d+))?(([-+]\d\d:\d\d)|[zZ])$/);
    IMF_FIXDATE2 = new RegExp(`^${ddd}, ${date} ${mmm} ${year} ${time} GMT$`);
    RFC_850_DATE2 = new RegExp(`^${ddd}, ${date}-${mmm}-(\\d\\d) ${time} GMT$`);
    ASC_TIME2 = new RegExp(`^${ddd} ${mmm} ( [1-9]|\\d\\d) ${time} ${year}$`);
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    _parseEpochTimestamp = (value) => {
      if (value == null) {
        return void 0;
      }
      let num = NaN;
      if (typeof value === "number") {
        num = value;
      } else if (typeof value === "string") {
        if (!/^-?\d*\.?\d+$/.test(value)) {
          throw new TypeError(`parseEpochTimestamp - numeric string invalid.`);
        }
        num = Number.parseFloat(value);
      } else if (typeof value === "object" && value.tag === 1) {
        num = value.value;
      }
      if (isNaN(num) || Math.abs(num) === Infinity) {
        throw new TypeError("Epoch timestamps must be valid finite numbers.");
      }
      return new Date(Math.round(num * 1e3));
    };
    _parseRfc3339DateTimeWithOffset = (value) => {
      if (value == null) {
        return void 0;
      }
      if (typeof value !== "string") {
        throw new TypeError("RFC3339 timestamps must be strings");
      }
      const matches = RFC3339_WITH_OFFSET2.exec(value);
      if (!matches) {
        throw new TypeError(`Invalid RFC3339 timestamp format ${value}`);
      }
      const [, yearStr, monthStr, dayStr, hours, minutes, seconds, , ms, offsetStr] = matches;
      range(monthStr, 1, 12);
      range(dayStr, 1, 31);
      range(hours, 0, 23);
      range(minutes, 0, 59);
      range(seconds, 0, 60);
      const date2 = new Date(Date.UTC(Number(yearStr), Number(monthStr) - 1, Number(dayStr), Number(hours), Number(minutes), Number(seconds), Number(ms) ? Math.round(parseFloat(`0.${ms}`) * 1e3) : 0));
      date2.setUTCFullYear(Number(yearStr));
      if (offsetStr.toUpperCase() != "Z") {
        const [, sign2, offsetH, offsetM] = /([+-])(\d\d):(\d\d)/.exec(offsetStr) || [void 0, "+", 0, 0];
        const scalar = sign2 === "-" ? 1 : -1;
        date2.setTime(date2.getTime() + scalar * (Number(offsetH) * 60 * 60 * 1e3 + Number(offsetM) * 60 * 1e3));
      }
      return date2;
    };
    _parseRfc7231DateTime = (value) => {
      if (value == null) {
        return void 0;
      }
      if (typeof value !== "string") {
        throw new TypeError("RFC7231 timestamps must be strings.");
      }
      let day;
      let month;
      let year2;
      let hour;
      let minute;
      let second;
      let fraction;
      let matches;
      if (matches = IMF_FIXDATE2.exec(value)) {
        [, day, month, year2, hour, minute, second, fraction] = matches;
      } else if (matches = RFC_850_DATE2.exec(value)) {
        [, day, month, year2, hour, minute, second, fraction] = matches;
        year2 = (Number(year2) + 1900).toString();
      } else if (matches = ASC_TIME2.exec(value)) {
        [, month, day, hour, minute, second, fraction, year2] = matches;
      }
      if (year2 && second) {
        const timestamp = Date.UTC(Number(year2), months.indexOf(month), Number(day), Number(hour), Number(minute), Number(second), fraction ? Math.round(parseFloat(`0.${fraction}`) * 1e3) : 0);
        range(day, 1, 31);
        range(hour, 0, 23);
        range(minute, 0, 59);
        range(second, 0, 60);
        const date2 = new Date(timestamp);
        date2.setUTCFullYear(Number(year2));
        return date2;
      }
      throw new TypeError(`Invalid RFC7231 date-time value ${value}.`);
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/serde/split-every.js
function splitEvery(value, delimiter, numDelimiters) {
  if (numDelimiters <= 0 || !Number.isInteger(numDelimiters)) {
    throw new Error("Invalid number of delimiters (" + numDelimiters + ") for splitEvery.");
  }
  const segments = value.split(delimiter);
  if (numDelimiters === 1) {
    return segments;
  }
  const compoundSegments = [];
  let currentSegment = "";
  for (let i3 = 0; i3 < segments.length; i3++) {
    if (currentSegment === "") {
      currentSegment = segments[i3];
    } else {
      currentSegment += delimiter + segments[i3];
    }
    if ((i3 + 1) % numDelimiters === 0) {
      compoundSegments.push(currentSegment);
      currentSegment = "";
    }
  }
  if (currentSegment !== "") {
    compoundSegments.push(currentSegment);
  }
  return compoundSegments;
}
var init_split_every = __esm({
  "node_modules/@smithy/core/dist-es/submodules/serde/split-every.js"() {
  }
});

// node_modules/@smithy/core/dist-es/submodules/serde/split-header.js
var splitHeader;
var init_split_header = __esm({
  "node_modules/@smithy/core/dist-es/submodules/serde/split-header.js"() {
    splitHeader = (value) => {
      const z = value.length;
      const values = [];
      let withinQuotes = false;
      let prevChar = void 0;
      let anchor = 0;
      for (let i3 = 0; i3 < z; ++i3) {
        const char = value[i3];
        switch (char) {
          case `"`:
            if (prevChar !== "\\") {
              withinQuotes = !withinQuotes;
            }
            break;
          case ",":
            if (!withinQuotes) {
              values.push(value.slice(anchor, i3));
              anchor = i3 + 1;
            }
            break;
          default:
        }
        prevChar = char;
      }
      values.push(value.slice(anchor));
      return values.map((v) => {
        v = v.trim();
        const z2 = v.length;
        if (z2 < 2) {
          return v;
        }
        if (v[0] === `"` && v[z2 - 1] === `"`) {
          v = v.slice(1, z2 - 1);
        }
        return v.replace(/\\"/g, '"');
      });
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/serde/value/NumericValue.js
var format, NumericValue;
var init_NumericValue = __esm({
  "node_modules/@smithy/core/dist-es/submodules/serde/value/NumericValue.js"() {
    format = /^-?((0|[1-9]\d*)(\.\d+)?|\.\d+)([eE][+-]?\d+)?$/;
    NumericValue = class _NumericValue {
      constructor(string, type) {
        __publicField(this, "string");
        __publicField(this, "type");
        this.string = string;
        this.type = type;
        if (!format.test(string)) {
          throw new Error(`@smithy/core/serde - NumericValue string must conform to the Smithy bigDecimal format. Received: "${string}"`);
        }
      }
      toString() {
        return this.string;
      }
      static [Symbol.hasInstance](object) {
        if (!object || typeof object !== "object") {
          return false;
        }
        const _nv = object;
        return _NumericValue.prototype.isPrototypeOf(object) || _nv.type === "bigDecimal" && format.test(_nv.string);
      }
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/serde/util-hex-encoding/hex-encoding.js
function fromHex(encoded) {
  if (encoded.length % 2 !== 0) {
    throw new Error("Hex encoded strings must have an even number length");
  }
  const out = new Uint8Array(encoded.length / 2);
  for (let i3 = 0; i3 < encoded.length; i3 += 2) {
    const encodedByte = encoded.slice(i3, i3 + 2).toLowerCase();
    if (encodedByte in HEX_TO_SHORT) {
      out[i3 / 2] = HEX_TO_SHORT[encodedByte];
    } else {
      throw new Error(`Cannot decode unrecognized sequence ${encodedByte} as hexadecimal`);
    }
  }
  return out;
}
function toHex(bytes) {
  let out = "";
  for (let i3 = 0; i3 < bytes.byteLength; i3++) {
    out += SHORT_TO_HEX[bytes[i3]];
  }
  return out;
}
var SHORT_TO_HEX, HEX_TO_SHORT;
var init_hex_encoding = __esm({
  "node_modules/@smithy/core/dist-es/submodules/serde/util-hex-encoding/hex-encoding.js"() {
    SHORT_TO_HEX = {};
    HEX_TO_SHORT = {};
    for (let i3 = 0; i3 < 256; i3++) {
      let encodedByte = i3.toString(16).toLowerCase();
      if (encodedByte.length === 1) {
        encodedByte = `0${encodedByte}`;
      }
      SHORT_TO_HEX[i3] = encodedByte;
      HEX_TO_SHORT[encodedByte] = i3;
    }
  }
});

// node_modules/@smithy/core/dist-es/submodules/serde/util-body-length/calculateBodyLength.browser.js
var TEXT_ENCODER, calculateBodyLength;
var init_calculateBodyLength_browser = __esm({
  "node_modules/@smithy/core/dist-es/submodules/serde/util-body-length/calculateBodyLength.browser.js"() {
    TEXT_ENCODER = typeof TextEncoder == "function" ? new TextEncoder() : null;
    calculateBodyLength = (body) => {
      if (typeof body === "string") {
        if (TEXT_ENCODER) {
          return TEXT_ENCODER.encode(body).byteLength;
        }
        let len = body.length;
        for (let i3 = len - 1; i3 >= 0; i3--) {
          const code = body.charCodeAt(i3);
          if (code > 127 && code <= 2047)
            len++;
          else if (code > 2047 && code <= 65535)
            len += 2;
          if (code >= 56320 && code <= 57343)
            i3--;
        }
        return len;
      } else if (typeof body.byteLength === "number") {
        return body.byteLength;
      } else if (typeof body.size === "number") {
        return body.size;
      }
      throw new Error(`Body Length computation failed for ${body}`);
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/serde/util-utf8/toUint8Array.browser.js
var toUint8Array;
var init_toUint8Array_browser = __esm({
  "node_modules/@smithy/core/dist-es/submodules/serde/util-utf8/toUint8Array.browser.js"() {
    init_fromUtf8_browser();
    toUint8Array = (data) => {
      if (data instanceof Uint8Array) {
        return data;
      }
      if (typeof data === "string") {
        return fromUtf8(data);
      }
      if (ArrayBuffer.isView(data)) {
        return new Uint8Array(data.buffer, data.byteOffset, data.byteLength / Uint8Array.BYTES_PER_ELEMENT);
      }
      return new Uint8Array(data);
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/serde/concatBytes.js
function concatBytes(arrays, length) {
  if (length === void 0) {
    length = 0;
    for (const bytes of arrays) {
      length += bytes.byteLength;
    }
  }
  const result = new Uint8Array(length);
  let offset = 0;
  for (const buf of arrays) {
    result.set(buf, offset);
    offset += buf.byteLength;
  }
  return result;
}
var init_concatBytes = __esm({
  "node_modules/@smithy/core/dist-es/submodules/serde/concatBytes.js"() {
  }
});

// node_modules/@smithy/core/dist-es/submodules/serde/is-array-buffer/is-array-buffer.js
var isArrayBuffer;
var init_is_array_buffer = __esm({
  "node_modules/@smithy/core/dist-es/submodules/serde/is-array-buffer/is-array-buffer.js"() {
    isArrayBuffer = (arg) => typeof ArrayBuffer === "function" && arg instanceof ArrayBuffer || Object.prototype.toString.call(arg) === "[object ArrayBuffer]";
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/getEndpointFromConfig.browser.js
var getEndpointFromConfig;
var init_getEndpointFromConfig_browser = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/getEndpointFromConfig.browser.js"() {
    getEndpointFromConfig = async (serviceId) => void 0;
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/service-customizations/s3.js
var resolveParamsForS3, DOMAIN_PATTERN, IP_ADDRESS_PATTERN, DOTS_PATTERN, isDnsCompatibleBucketName, isArnBucketName;
var init_s3 = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/service-customizations/s3.js"() {
    resolveParamsForS3 = async (endpointParams) => {
      const bucket = endpointParams?.Bucket || "";
      if (typeof endpointParams.Bucket === "string") {
        endpointParams.Bucket = bucket.replace(/#/g, encodeURIComponent("#")).replace(/\?/g, encodeURIComponent("?"));
      }
      if (isArnBucketName(bucket)) {
        if (endpointParams.ForcePathStyle === true) {
          throw new Error("Path-style addressing cannot be used with ARN buckets");
        }
      } else if (!isDnsCompatibleBucketName(bucket) || bucket.indexOf(".") !== -1 && !String(endpointParams.Endpoint).startsWith("http:") || bucket.toLowerCase() !== bucket || bucket.length < 3) {
        endpointParams.ForcePathStyle = true;
      }
      if (endpointParams.DisableMultiRegionAccessPoints) {
        endpointParams.disableMultiRegionAccessPoints = true;
        endpointParams.DisableMRAP = true;
      }
      return endpointParams;
    };
    DOMAIN_PATTERN = /^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/;
    IP_ADDRESS_PATTERN = /(\d+\.){3}\d+/;
    DOTS_PATTERN = /\.\./;
    isDnsCompatibleBucketName = (bucketName) => DOMAIN_PATTERN.test(bucketName) && !IP_ADDRESS_PATTERN.test(bucketName) && !DOTS_PATTERN.test(bucketName);
    isArnBucketName = (bucketName) => {
      const [arn, partition2, service, , , bucket] = bucketName.split(":");
      const isArn = arn === "arn" && bucketName.split(":").length >= 6;
      const isValidArn = Boolean(isArn && partition2 && service && bucket);
      if (isArn && !isValidArn) {
        throw new Error(`Invalid ARN: ${bucketName} was an invalid ARN.`);
      }
      return isValidArn;
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/service-customizations/index.js
var init_service_customizations = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/service-customizations/index.js"() {
    init_s3();
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/createConfigValueProvider.js
var createConfigValueProvider;
var init_createConfigValueProvider = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/createConfigValueProvider.js"() {
    createConfigValueProvider = (configKey, canonicalEndpointParamKey, config, isClientContextParam = false) => {
      const configProvider = async () => {
        let configValue;
        if (isClientContextParam) {
          const clientContextParams = config.clientContextParams;
          const nestedValue = clientContextParams?.[configKey];
          configValue = nestedValue ?? config[configKey] ?? config[canonicalEndpointParamKey];
        } else {
          configValue = config[configKey] ?? config[canonicalEndpointParamKey];
        }
        if (typeof configValue === "function") {
          return configValue();
        }
        return configValue;
      };
      if (configKey === "credentialScope" || canonicalEndpointParamKey === "CredentialScope") {
        return async () => {
          const credentials = typeof config.credentials === "function" ? await config.credentials() : config.credentials;
          const configValue = credentials?.credentialScope ?? credentials?.CredentialScope;
          return configValue;
        };
      }
      if (configKey === "accountId" || canonicalEndpointParamKey === "AccountId") {
        return async () => {
          const credentials = typeof config.credentials === "function" ? await config.credentials() : config.credentials;
          const configValue = credentials?.accountId ?? credentials?.AccountId;
          return configValue;
        };
      }
      if (configKey === "endpoint" || canonicalEndpointParamKey === "endpoint") {
        return async () => {
          if (config.isCustomEndpoint === false) {
            return void 0;
          }
          const endpoint = await configProvider();
          if (endpoint && typeof endpoint === "object") {
            if ("url" in endpoint) {
              return endpoint.url.href;
            }
            if ("hostname" in endpoint) {
              const { protocol, hostname, port, path } = endpoint;
              return `${protocol}//${hostname}${port ? ":" + port : ""}${path}`;
            }
          }
          return endpoint;
        };
      }
      return configProvider;
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/toEndpointV1.js
var init_toEndpointV12 = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/toEndpointV1.js"() {
    init_transport();
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/getEndpointFromInstructions.js
function bindGetEndpointFromInstructions(getEndpointFromConfig2) {
  return async (commandInput, instructionsSupplier, clientConfig, context) => {
    if (!clientConfig.isCustomEndpoint && !clientConfig.ignoreConfiguredEndpointUrls) {
      let endpointFromConfig;
      if (clientConfig.serviceConfiguredEndpoint) {
        endpointFromConfig = await clientConfig.serviceConfiguredEndpoint();
      } else {
        endpointFromConfig = await getEndpointFromConfig2(clientConfig.serviceId);
      }
      if (endpointFromConfig) {
        clientConfig.endpoint = () => Promise.resolve(toEndpointV1(endpointFromConfig));
        clientConfig.isCustomEndpoint = true;
        context?.logger?.debug?.(`@smithy/core/endpoints - resolved endpoint from config: ${endpointFromConfig}`);
      }
    }
    const endpointParams = await resolveParams(commandInput, instructionsSupplier, clientConfig);
    if (typeof clientConfig.endpointProvider !== "function") {
      throw new Error("config.endpointProvider is not set.");
    }
    const endpoint = clientConfig.endpointProvider(endpointParams, context);
    if (clientConfig.isCustomEndpoint && clientConfig.endpoint) {
      const customEndpoint = await clientConfig.endpoint();
      if (customEndpoint?.headers) {
        endpoint.headers ?? (endpoint.headers = {});
        for (const [name, value] of Object.entries(customEndpoint.headers)) {
          endpoint.headers[name] = Array.isArray(value) ? value : [value];
        }
      }
    }
    return endpoint;
  };
}
var resolveParams;
var init_getEndpointFromInstructions = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/getEndpointFromInstructions.js"() {
    init_service_customizations();
    init_createConfigValueProvider();
    init_toEndpointV12();
    resolveParams = async (commandInput, instructionsSupplier, clientConfig) => {
      const endpointParams = {};
      const instructions = instructionsSupplier?.getEndpointParameterInstructions?.() || {};
      for (const [name, instruction] of Object.entries(instructions)) {
        switch (instruction.type) {
          case "staticContextParams":
            endpointParams[name] = instruction.value;
            break;
          case "contextParams":
            endpointParams[name] = commandInput[instruction.name];
            break;
          case "clientContextParams":
          case "builtInParams":
            endpointParams[name] = await createConfigValueProvider(instruction.name, name, clientConfig, instruction.type !== "builtInParams")();
            break;
          case "operationContextParams":
            endpointParams[name] = instruction.get(commandInput);
            break;
          default:
            throw new Error("Unrecognized endpoint parameter instruction: " + JSON.stringify(instruction));
        }
      }
      if (Object.keys(instructions).length === 0) {
        Object.assign(endpointParams, clientConfig);
      }
      if (String(clientConfig.serviceId).toLowerCase() === "s3") {
        await resolveParamsForS3(endpointParams);
      }
      return endpointParams;
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/endpointMiddleware.js
function setFeature(context, feature, value) {
  if (!context.__smithy_context) {
    context.__smithy_context = { features: {} };
  } else if (!context.__smithy_context.features) {
    context.__smithy_context.features = {};
  }
  context.__smithy_context.features[feature] = value;
}
function bindEndpointMiddleware(getEndpointFromConfig2) {
  const getEndpointFromInstructions2 = bindGetEndpointFromInstructions(getEndpointFromConfig2);
  return ({ config, instructions }) => {
    return (next, context) => async (args) => {
      if (config.isCustomEndpoint) {
        setFeature(context, "ENDPOINT_OVERRIDE", "N");
      }
      const endpoint = await getEndpointFromInstructions2(args.input, {
        getEndpointParameterInstructions() {
          return instructions;
        }
      }, { ...config }, context);
      context.endpointV2 = endpoint;
      context.authSchemes = endpoint.properties?.authSchemes;
      const authScheme = context.authSchemes?.[0];
      if (authScheme) {
        context["signing_region"] = authScheme.signingRegion;
        context["signing_service"] = authScheme.signingName;
        const smithyContext = getSmithyContext(context);
        const httpAuthOption = smithyContext?.selectedHttpAuthScheme?.httpAuthOption;
        if (httpAuthOption) {
          httpAuthOption.signingProperties = Object.assign(httpAuthOption.signingProperties || {}, {
            signing_region: authScheme.signingRegion,
            signingRegion: authScheme.signingRegion,
            signing_service: authScheme.signingName,
            signingName: authScheme.signingName,
            signingRegionSet: authScheme.signingRegionSet
          }, authScheme.properties);
        }
      }
      return next({
        ...args
      });
    };
  };
}
var init_endpointMiddleware = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/endpointMiddleware.js"() {
    init_transport();
    init_getEndpointFromInstructions();
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/getEndpointPlugin.js
function bindGetEndpointPlugin(getEndpointFromConfig2) {
  const endpointMiddleware2 = bindEndpointMiddleware(getEndpointFromConfig2);
  return (config, instructions) => ({
    applyToStack: (clientStack) => {
      clientStack.addRelativeTo(endpointMiddleware2({
        config,
        instructions
      }), endpointMiddlewareOptions);
    }
  });
}
var serializerMiddlewareOption2, endpointMiddlewareOptions;
var init_getEndpointPlugin = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/getEndpointPlugin.js"() {
    init_endpointMiddleware();
    serializerMiddlewareOption2 = {
      name: "serializerMiddleware",
      step: "serialize",
      tags: ["SERIALIZER"],
      override: true
    };
    endpointMiddlewareOptions = {
      step: "serialize",
      tags: ["ENDPOINT_PARAMETERS", "ENDPOINT_V2", "ENDPOINT"],
      name: "endpointV2Middleware",
      override: true,
      relation: "before",
      toMiddleware: serializerMiddlewareOption2.name
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/resolveEndpointConfig.js
function bindResolveEndpointConfig(getEndpointFromConfig2) {
  return (input) => {
    const tls = input.tls ?? true;
    const { endpoint, useDualstackEndpoint, useFipsEndpoint } = input;
    const customEndpointProvider = endpoint != null ? async () => toEndpointV1(await normalizeProvider(endpoint)()) : void 0;
    const isCustomEndpoint = !!endpoint;
    const resolvedConfig = Object.assign(input, {
      endpoint: customEndpointProvider,
      tls,
      isCustomEndpoint,
      useDualstackEndpoint: normalizeProvider(useDualstackEndpoint ?? false),
      useFipsEndpoint: normalizeProvider(useFipsEndpoint ?? false),
      ignoreConfiguredEndpointUrls: !!input.ignoreConfiguredEndpointUrls
    });
    let configuredEndpointPromise = void 0;
    resolvedConfig.serviceConfiguredEndpoint = async () => {
      if (input.serviceId && !configuredEndpointPromise) {
        configuredEndpointPromise = getEndpointFromConfig2(input.serviceId);
      }
      return configuredEndpointPromise;
    };
    return resolvedConfig;
  };
}
var init_resolveEndpointConfig = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/resolveEndpointConfig.js"() {
    init_transport();
    init_toEndpointV12();
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/bdd/BinaryDecisionDiagram.js
var BinaryDecisionDiagram;
var init_BinaryDecisionDiagram = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/bdd/BinaryDecisionDiagram.js"() {
    BinaryDecisionDiagram = class _BinaryDecisionDiagram {
      constructor(bdd3, root3, conditions, results) {
        __publicField(this, "nodes");
        __publicField(this, "root");
        __publicField(this, "conditions");
        __publicField(this, "results");
        this.nodes = bdd3;
        this.root = root3;
        this.conditions = conditions;
        this.results = results;
      }
      static from(bdd3, root3, conditions, results) {
        return new _BinaryDecisionDiagram(bdd3, root3, conditions, results);
      }
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/cache/EndpointCache.js
var EndpointCache;
var init_EndpointCache = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/cache/EndpointCache.js"() {
    EndpointCache = class {
      constructor({ size, params }) {
        __publicField(this, "capacity");
        __publicField(this, "data", /* @__PURE__ */ new Map());
        __publicField(this, "parameters", []);
        this.capacity = size ?? 50;
        if (params) {
          this.parameters = params;
        }
      }
      get(endpointParams, resolver) {
        const key = this.hash(endpointParams);
        if (key === false) {
          return resolver();
        }
        if (!this.data.has(key)) {
          if (this.data.size > this.capacity + 10) {
            const keys = this.data.keys();
            let i3 = 0;
            while (true) {
              const { value, done } = keys.next();
              this.data.delete(value);
              if (done || ++i3 > 10) {
                break;
              }
            }
          }
          this.data.set(key, resolver());
        }
        return this.data.get(key);
      }
      size() {
        return this.data.size;
      }
      hash(endpointParams) {
        let buffer = "";
        const { parameters } = this;
        if (parameters.length === 0) {
          return false;
        }
        for (const param of parameters) {
          const raw = endpointParams[param];
          const val = raw == null ? "\0" : String(raw);
          if (val.includes("|;")) {
            return false;
          }
          buffer += val + "|;";
        }
        return buffer;
      }
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/types/EndpointError.js
var EndpointError;
var init_EndpointError = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/types/EndpointError.js"() {
    EndpointError = class extends Error {
      constructor(message) {
        super(message);
        this.name = "EndpointError";
      }
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/types/index.js
var init_types = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/types/index.js"() {
    init_EndpointError();
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/debug/debugId.js
var debugId;
var init_debugId = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/debug/debugId.js"() {
    debugId = "endpoints";
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/debug/toDebugString.js
function toDebugString(input) {
  if (typeof input !== "object" || input == null) {
    return input;
  }
  if ("ref" in input) {
    return `$${toDebugString(input.ref)}`;
  }
  if ("fn" in input) {
    return `${input.fn}(${(input.argv || []).map(toDebugString).join(", ")})`;
  }
  return JSON.stringify(input, null, 2);
}
var init_toDebugString = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/debug/toDebugString.js"() {
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/debug/index.js
var init_debug = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/debug/index.js"() {
    init_debugId();
    init_toDebugString();
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/customEndpointFunctions.js
var customEndpointFunctions;
var init_customEndpointFunctions = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/customEndpointFunctions.js"() {
    customEndpointFunctions = {};
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/booleanEquals.js
var booleanEquals;
var init_booleanEquals = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/booleanEquals.js"() {
    booleanEquals = (value1, value2) => value1 === value2;
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/coalesce.js
function coalesce(...args) {
  for (const arg of args) {
    if (arg != null) {
      return arg;
    }
  }
  return void 0;
}
var init_coalesce = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/coalesce.js"() {
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/getAttrPathList.js
var getAttrPathList;
var init_getAttrPathList = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/getAttrPathList.js"() {
    init_types();
    getAttrPathList = (path) => {
      const parts = path.split(".");
      const pathList = [];
      for (const part of parts) {
        const squareBracketIndex = part.indexOf("[");
        if (squareBracketIndex !== -1) {
          if (part.indexOf("]") !== part.length - 1) {
            throw new EndpointError(`Path: '${path}' does not end with ']'`);
          }
          const arrayIndex = part.slice(squareBracketIndex + 1, -1);
          if (Number.isNaN(parseInt(arrayIndex))) {
            throw new EndpointError(`Invalid array index: '${arrayIndex}' in path: '${path}'`);
          }
          if (squareBracketIndex !== 0) {
            pathList.push(part.slice(0, squareBracketIndex));
          }
          pathList.push(arrayIndex);
        } else {
          pathList.push(part);
        }
      }
      return pathList;
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/getAttr.js
var getAttr;
var init_getAttr = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/getAttr.js"() {
    init_types();
    init_getAttrPathList();
    getAttr = (value, path) => getAttrPathList(path).reduce((acc, index) => {
      if (typeof acc !== "object") {
        throw new EndpointError(`Index '${index}' in '${path}' not found in '${JSON.stringify(value)}'`);
      } else if (Array.isArray(acc)) {
        const i3 = parseInt(index);
        return acc[i3 < 0 ? acc.length + i3 : i3];
      }
      return acc[index];
    }, value);
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/isSet.js
var isSet;
var init_isSet = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/isSet.js"() {
    isSet = (value) => value != null;
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/ite.js
function ite(condition, trueValue, falseValue) {
  return condition ? trueValue : falseValue;
}
var init_ite = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/ite.js"() {
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/not.js
var not;
var init_not = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/not.js"() {
    not = (value) => !value;
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/isIpAddress.js
var IP_V4_REGEX, isIpAddress;
var init_isIpAddress = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/isIpAddress.js"() {
    IP_V4_REGEX = new RegExp(`^(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}$`);
    isIpAddress = (value) => IP_V4_REGEX.test(value) || value.startsWith("[") && value.endsWith("]");
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/parseURL.js
var DEFAULT_PORTS, parseURL;
var init_parseURL = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/parseURL.js"() {
    init_dist_es();
    init_isIpAddress();
    DEFAULT_PORTS = {
      [EndpointURLScheme.HTTP]: 80,
      [EndpointURLScheme.HTTPS]: 443
    };
    parseURL = (value) => {
      const whatwgURL = (() => {
        try {
          if (value instanceof URL) {
            return value;
          }
          if (typeof value === "object" && "hostname" in value) {
            const { hostname: hostname2, port, protocol: protocol2 = "", path = "", query = {} } = value;
            const url = new URL(`${protocol2}//${hostname2}${port ? `:${port}` : ""}${path}`);
            url.search = Object.entries(query).map(([k3, v]) => `${k3}=${v}`).join("&");
            return url;
          }
          return new URL(value);
        } catch (ignored) {
          return null;
        }
      })();
      if (!whatwgURL) {
        console.error(`Unable to parse ${JSON.stringify(value)} as a whatwg URL.`);
        return null;
      }
      const urlString = whatwgURL.href;
      const { host, hostname, pathname, protocol, search } = whatwgURL;
      if (search) {
        return null;
      }
      const scheme = protocol.slice(0, -1);
      if (!Object.values(EndpointURLScheme).includes(scheme)) {
        return null;
      }
      const isIp = isIpAddress(hostname);
      const inputContainsDefaultPort = urlString.includes(`${host}:${DEFAULT_PORTS[scheme]}`) || typeof value === "string" && value.includes(`${host}:${DEFAULT_PORTS[scheme]}`);
      const authority = `${host}${inputContainsDefaultPort ? `:${DEFAULT_PORTS[scheme]}` : ``}`;
      return {
        scheme,
        authority,
        path: pathname,
        normalizedPath: pathname.endsWith("/") ? pathname : `${pathname}/`,
        isIp
      };
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/split.js
function split(value, delimiter, limit) {
  if (limit === 1) {
    return [value];
  }
  if (value === "") {
    return [""];
  }
  const parts = value.split(delimiter);
  if (limit === 0) {
    return parts;
  }
  return parts.slice(0, limit - 1).concat(parts.slice(1).join(delimiter));
}
var init_split = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/split.js"() {
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/stringEquals.js
var stringEquals;
var init_stringEquals = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/stringEquals.js"() {
    stringEquals = (value1, value2) => value1 === value2;
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/substring.js
var substring;
var init_substring = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/substring.js"() {
    substring = (input, start, stop, reverse) => {
      if (input == null || start >= stop || input.length < stop || /[^\u0000-\u007f]/.test(input)) {
        return null;
      }
      if (!reverse) {
        return input.substring(start, stop);
      }
      return input.substring(input.length - stop, input.length - start);
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/uriEncode.js
var uriEncode;
var init_uriEncode = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/uriEncode.js"() {
    uriEncode = (value) => encodeURIComponent(value).replace(/[!*'()]/g, (c3) => `%${c3.charCodeAt(0).toString(16).toUpperCase()}`);
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/index.js
var init_lib = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/index.js"() {
    init_booleanEquals();
    init_coalesce();
    init_getAttr();
    init_isSet();
    init_transport();
    init_ite();
    init_not();
    init_parseURL();
    init_split();
    init_stringEquals();
    init_substring();
    init_uriEncode();
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/endpointFunctions.js
var endpointFunctions;
var init_endpointFunctions = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/endpointFunctions.js"() {
    init_lib();
    endpointFunctions = {
      booleanEquals,
      coalesce,
      getAttr,
      isSet,
      isValidHostLabel,
      ite,
      not,
      parseURL,
      split,
      stringEquals,
      substring,
      uriEncode
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/evaluateTemplate.js
var evaluateTemplate;
var init_evaluateTemplate = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/evaluateTemplate.js"() {
    init_lib();
    evaluateTemplate = (template, options) => {
      const evaluatedTemplateArr = [];
      const { referenceRecord, endpointParams } = options;
      let currentIndex = 0;
      while (currentIndex < template.length) {
        const openingBraceIndex = template.indexOf("{", currentIndex);
        if (openingBraceIndex === -1) {
          evaluatedTemplateArr.push(template.slice(currentIndex));
          break;
        }
        evaluatedTemplateArr.push(template.slice(currentIndex, openingBraceIndex));
        const closingBraceIndex = template.indexOf("}", openingBraceIndex);
        if (closingBraceIndex === -1) {
          evaluatedTemplateArr.push(template.slice(openingBraceIndex));
          break;
        }
        if (template[openingBraceIndex + 1] === "{" && template[closingBraceIndex + 1] === "}") {
          evaluatedTemplateArr.push(template.slice(openingBraceIndex + 1, closingBraceIndex));
          currentIndex = closingBraceIndex + 2;
        }
        const parameterName = template.substring(openingBraceIndex + 1, closingBraceIndex);
        if (parameterName.includes("#")) {
          const [refName, attrName] = parameterName.split("#");
          evaluatedTemplateArr.push(getAttr(referenceRecord[refName] ?? endpointParams[refName], attrName));
        } else {
          evaluatedTemplateArr.push(referenceRecord[parameterName] ?? endpointParams[parameterName]);
        }
        currentIndex = closingBraceIndex + 1;
      }
      return evaluatedTemplateArr.join("");
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/getReferenceValue.js
var getReferenceValue;
var init_getReferenceValue = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/getReferenceValue.js"() {
    getReferenceValue = ({ ref }, options) => {
      return options.referenceRecord[ref] ?? options.endpointParams[ref];
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/evaluateExpression.js
var evaluateExpression, callFunction, group;
var init_evaluateExpression = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/evaluateExpression.js"() {
    init_types();
    init_customEndpointFunctions();
    init_endpointFunctions();
    init_evaluateTemplate();
    init_getReferenceValue();
    evaluateExpression = (obj, keyName, options) => {
      if (typeof obj === "string") {
        return evaluateTemplate(obj, options);
      } else if (obj["fn"]) {
        return group.callFunction(obj, options);
      } else if (obj["ref"]) {
        return getReferenceValue(obj, options);
      }
      throw new EndpointError(`'${keyName}': ${String(obj)} is not a string, function or reference.`);
    };
    callFunction = ({ fn, argv }, options) => {
      const evaluatedArgs = Array(argv.length);
      for (let i3 = 0; i3 < evaluatedArgs.length; ++i3) {
        const arg = argv[i3];
        if (typeof arg === "boolean" || typeof arg === "number") {
          evaluatedArgs[i3] = arg;
        } else {
          evaluatedArgs[i3] = group.evaluateExpression(arg, "arg", options);
        }
      }
      const namespaceSeparatorIndex = fn.indexOf(".");
      if (namespaceSeparatorIndex !== -1) {
        const namespaceFunctions = customEndpointFunctions[fn.slice(0, namespaceSeparatorIndex)];
        const customFunction = namespaceFunctions?.[fn.slice(namespaceSeparatorIndex + 1)];
        if (typeof customFunction === "function") {
          return customFunction(...evaluatedArgs);
        }
      }
      const callable = endpointFunctions[fn];
      if (typeof callable === "function") {
        return callable(...evaluatedArgs);
      }
      throw new Error(`function ${fn} not loaded in endpointFunctions.`);
    };
    group = {
      evaluateExpression,
      callFunction
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/callFunction.js
var init_callFunction = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/callFunction.js"() {
    init_evaluateExpression();
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/evaluateCondition.js
var evaluateCondition;
var init_evaluateCondition = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/evaluateCondition.js"() {
    init_debug();
    init_types();
    init_callFunction();
    evaluateCondition = (condition, options) => {
      const { assign } = condition;
      if (assign && assign in options.referenceRecord) {
        throw new EndpointError(`'${assign}' is already defined in Reference Record.`);
      }
      const value = callFunction(condition, options);
      options.logger?.debug?.(`${debugId} evaluateCondition: ${toDebugString(condition)} = ${toDebugString(value)}`);
      const result = value === "" ? true : !!value;
      if (assign != null) {
        return { result, toAssign: { name: assign, value } };
      }
      return { result };
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/getEndpointHeaders.js
var getEndpointHeaders;
var init_getEndpointHeaders = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/getEndpointHeaders.js"() {
    init_types();
    init_evaluateExpression();
    getEndpointHeaders = (headers, options) => Object.entries(headers ?? {}).reduce((acc, [headerKey, headerVal]) => {
      acc[headerKey] = headerVal.map((headerValEntry) => {
        const processedExpr = evaluateExpression(headerValEntry, "Header value entry", options);
        if (typeof processedExpr !== "string") {
          throw new EndpointError(`Header '${headerKey}' value '${processedExpr}' is not a string`);
        }
        return processedExpr;
      });
      return acc;
    }, {});
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/getEndpointProperties.js
var getEndpointProperties, getEndpointProperty, group2;
var init_getEndpointProperties = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/getEndpointProperties.js"() {
    init_types();
    init_evaluateTemplate();
    getEndpointProperties = (properties, options) => Object.entries(properties).reduce((acc, [propertyKey, propertyVal]) => {
      acc[propertyKey] = group2.getEndpointProperty(propertyVal, options);
      return acc;
    }, {});
    getEndpointProperty = (property, options) => {
      if (Array.isArray(property)) {
        return property.map((propertyEntry) => getEndpointProperty(propertyEntry, options));
      }
      switch (typeof property) {
        case "string":
          return evaluateTemplate(property, options);
        case "object":
          if (property === null) {
            throw new EndpointError(`Unexpected endpoint property: ${property}`);
          }
          return group2.getEndpointProperties(property, options);
        case "boolean":
          return property;
        default:
          throw new EndpointError(`Unexpected endpoint property type: ${typeof property}`);
      }
    };
    group2 = {
      getEndpointProperty,
      getEndpointProperties
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/getEndpointUrl.js
var getEndpointUrl;
var init_getEndpointUrl = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/getEndpointUrl.js"() {
    init_types();
    init_evaluateExpression();
    getEndpointUrl = (endpointUrl, options) => {
      const expression = evaluateExpression(endpointUrl, "Endpoint URL", options);
      if (typeof expression === "string") {
        try {
          return new URL(expression);
        } catch (error) {
          console.error(`Failed to construct URL with ${expression}`, error);
          throw error;
        }
      }
      throw new EndpointError(`Endpoint URL must be a string, got ${typeof expression}`);
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/decideEndpoint.js
var RESULT, decideEndpoint;
var init_decideEndpoint = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/decideEndpoint.js"() {
    init_types();
    init_evaluateCondition();
    init_evaluateExpression();
    init_getEndpointHeaders();
    init_getEndpointProperties();
    init_getEndpointUrl();
    RESULT = 1e8;
    decideEndpoint = (bdd3, options) => {
      const { nodes: nodes3, root: root3, results, conditions } = bdd3;
      let ref = root3;
      const referenceRecord = {};
      const closure = {
        referenceRecord,
        endpointParams: options.endpointParams,
        logger: options.logger
      };
      while (ref !== 1 && ref !== -1 && ref < RESULT) {
        const node_i = 3 * (Math.abs(ref) - 1);
        const [condition_i, highRef, lowRef] = [nodes3[node_i], nodes3[node_i + 1], nodes3[node_i + 2]];
        const [fn, argv, assign] = conditions[condition_i];
        const evaluation = evaluateCondition({ fn, assign, argv }, closure);
        if (evaluation.toAssign) {
          const { name, value } = evaluation.toAssign;
          referenceRecord[name] = value;
        }
        ref = ref >= 0 === evaluation.result ? highRef : lowRef;
      }
      if (ref >= RESULT) {
        const result = results[ref - RESULT];
        if (result[0] === -1) {
          const [, errorExpression] = result;
          throw new EndpointError(evaluateExpression(errorExpression, "Error", closure));
        }
        const [url, properties, headers] = result;
        return {
          url: getEndpointUrl(url, closure),
          properties: getEndpointProperties(properties, closure),
          headers: getEndpointHeaders(headers ?? {}, closure)
        };
      }
      throw new EndpointError(`No matching endpoint.`);
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/endpoints/index.browser.js
var getEndpointFromInstructions, resolveEndpointConfig, endpointMiddleware, getEndpointPlugin;
var init_index_browser = __esm({
  "node_modules/@smithy/core/dist-es/submodules/endpoints/index.browser.js"() {
    init_getEndpointFromConfig_browser();
    init_getEndpointFromInstructions();
    init_endpointMiddleware();
    init_getEndpointPlugin();
    init_resolveEndpointConfig();
    init_BinaryDecisionDiagram();
    init_EndpointCache();
    init_decideEndpoint();
    init_isIpAddress();
    init_transport();
    init_customEndpointFunctions();
    getEndpointFromInstructions = bindGetEndpointFromInstructions(getEndpointFromConfig);
    resolveEndpointConfig = bindResolveEndpointConfig(getEndpointFromConfig);
    endpointMiddleware = bindEndpointMiddleware(getEndpointFromConfig);
    getEndpointPlugin = bindGetEndpointPlugin(getEndpointFromConfig);
  }
});

// node_modules/@smithy/core/dist-es/submodules/serde/util-stream/stream-type-check.js
var isReadableStream, isBlob;
var init_stream_type_check = __esm({
  "node_modules/@smithy/core/dist-es/submodules/serde/util-stream/stream-type-check.js"() {
    isReadableStream = (stream) => typeof ReadableStream === "function" && (stream?.constructor?.name === ReadableStream.name || stream instanceof ReadableStream);
    isBlob = (blob) => {
      return typeof Blob === "function" && (blob?.constructor?.name === Blob.name || blob instanceof Blob);
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/serde/util-stream/stream-collector.browser.js
async function collectBlob(blob) {
  return blob.arrayBuffer().then((ab) => new Uint8Array(ab));
}
async function collectReadableStream(stream) {
  const chunks = [];
  const reader = stream.getReader();
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (value) {
      chunks.push(value);
      length += value.length;
    }
    if (done) {
      break;
    }
  }
  return concatBytes(chunks, length);
}
var streamCollector;
var init_stream_collector_browser = __esm({
  "node_modules/@smithy/core/dist-es/submodules/serde/util-stream/stream-collector.browser.js"() {
    init_concatBytes();
    init_stream_type_check();
    streamCollector = async (stream) => {
      if (isBlob(stream)) {
        return collectBlob(stream);
      }
      return collectReadableStream(stream);
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/serde/util-stream/sdk-stream-mixin.browser.js
var ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED, sdkStreamMixin, isBlobInstance;
var init_sdk_stream_mixin_browser = __esm({
  "node_modules/@smithy/core/dist-es/submodules/serde/util-stream/sdk-stream-mixin.browser.js"() {
    init_toBase64_browser();
    init_hex_encoding();
    init_toUtf8_browser();
    init_stream_collector_browser();
    init_stream_type_check();
    ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED = "The stream has already been transformed.";
    sdkStreamMixin = (stream) => {
      if (!isBlobInstance(stream) && !isReadableStream(stream)) {
        const name = stream?.__proto__?.constructor?.name || stream;
        throw new Error(`Unexpected stream implementation, expect Blob or ReadableStream, got ${name}`);
      }
      let transformed = false;
      const transformToByteArray = async () => {
        if (transformed) {
          throw new Error(ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED);
        }
        transformed = true;
        return await streamCollector(stream);
      };
      const blobToWebStream = (blob) => {
        if (typeof blob.stream !== "function") {
          throw new Error("Cannot transform payload Blob to web stream. Please make sure the Blob.stream() is polyfilled.\nIf you are using React Native, this API is not yet supported, see: https://react-native.canny.io/feature-requests/p/fetch-streaming-body");
        }
        return blob.stream();
      };
      return Object.assign(stream, {
        transformToByteArray,
        transformToString: async (encoding) => {
          const buf = await transformToByteArray();
          if (encoding === "base64") {
            return toBase64(buf);
          } else if (encoding === "hex") {
            return toHex(buf);
          } else if (encoding === void 0 || encoding === "utf8" || encoding === "utf-8") {
            return toUtf8(buf);
          } else if (typeof TextDecoder === "function") {
            return new TextDecoder(encoding).decode(buf);
          } else {
            throw new Error("TextDecoder is not available, please make sure polyfill is provided.");
          }
        },
        transformToWebStream: () => {
          if (transformed) {
            throw new Error(ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED);
          }
          transformed = true;
          if (isBlobInstance(stream)) {
            return blobToWebStream(stream);
          } else if (isReadableStream(stream)) {
            return stream;
          } else {
            throw new Error(`Cannot transform payload to web stream, got ${stream}`);
          }
        }
      });
    };
    isBlobInstance = (stream) => typeof Blob === "function" && stream instanceof Blob;
  }
});

// node_modules/@smithy/core/dist-es/submodules/serde/index.browser.js
var Uint8ArrayBlobAdapter, _getRandomValues, v4, generateIdempotencyToken;
var init_index_browser2 = __esm({
  "node_modules/@smithy/core/dist-es/submodules/serde/index.browser.js"() {
    init_fromBase64_browser();
    init_toBase64_browser();
    init_Uint8ArrayBlobAdapter();
    init_fromUtf8_browser();
    init_toUtf8_browser();
    init_v4();
    init_date_utils();
    init_lazy_json();
    init_quote_header();
    init_schema_date_utils();
    init_split_every();
    init_split_header();
    init_NumericValue();
    init_hex_encoding();
    init_calculateBodyLength_browser();
    init_toUint8Array_browser();
    init_concatBytes();
    init_is_array_buffer();
    init_sdk_stream_mixin_browser();
    init_stream_collector_browser();
    init_transport();
    Uint8ArrayBlobAdapter = class extends bindUint8ArrayBlobAdapter(toUtf8, fromUtf8, toBase64, fromBase64) {
    };
    _getRandomValues = (array) => crypto.getRandomValues(array);
    v4 = bindV4(_getRandomValues);
    generateIdempotencyToken = v4;
  }
});

// node_modules/@smithy/core/dist-es/submodules/checksum/crc32/Crc32Js.js
var CRC32_TABLE, ONES, Crc32Js;
var init_Crc32Js = __esm({
  "node_modules/@smithy/core/dist-es/submodules/checksum/crc32/Crc32Js.js"() {
    CRC32_TABLE = new Uint32Array(256);
    for (let i3 = 0; i3 < 256; ++i3) {
      let c3 = i3;
      for (let j3 = 0; j3 < 8; ++j3) {
        c3 = c3 & 1 ? 3988292384 ^ c3 >>> 1 : c3 >>> 1;
      }
      CRC32_TABLE[i3] = c3 >>> 0;
    }
    ONES = 4294967295;
    Crc32Js = class {
      constructor() {
        __publicField(this, "digestLength", 4);
        __publicField(this, "checksum", ONES);
      }
      update(data) {
        for (let i3 = 0; i3 < data.length; ++i3) {
          this.checksum = this.checksum >>> 8 ^ CRC32_TABLE[(this.checksum ^ data[i3]) & 255];
        }
      }
      digestSync() {
        return (this.checksum ^ ONES) >>> 0;
      }
      async digest() {
        const value = this.digestSync();
        const out = new Uint8Array(4);
        new DataView(out.buffer).setUint32(0, value, false);
        return out;
      }
      reset() {
        this.checksum = ONES;
      }
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/checksum/sha256/Sha256Js.js
var BLOCK, DIGEST_LENGTH, MAX_HASHABLE_LENGTH, Sha256Js, INIT, K;
var init_Sha256Js = __esm({
  "node_modules/@smithy/core/dist-es/submodules/checksum/sha256/Sha256Js.js"() {
    init_index_browser2();
    BLOCK = 64;
    DIGEST_LENGTH = 32;
    MAX_HASHABLE_LENGTH = 2 ** 53 - 1;
    Sha256Js = class _Sha256Js {
      constructor(secret) {
        __publicField(this, "digestLength", DIGEST_LENGTH);
        __publicField(this, "state", Int32Array.from(INIT));
        __publicField(this, "w");
        __publicField(this, "buffer", new Uint8Array(64));
        __publicField(this, "bufferLength", 0);
        __publicField(this, "bytesHashed", 0);
        __publicField(this, "finished", false);
        __publicField(this, "inner");
        __publicField(this, "outer");
        if (secret) {
          const key = _Sha256Js.normalizeKey(secret);
          this.inner = new _Sha256Js();
          this.outer = new _Sha256Js();
          const { inner, outer } = this;
          const pad = new Uint8Array(BLOCK * 2);
          for (let i3 = 0; i3 < BLOCK; ++i3) {
            pad[i3] = 54 ^ key[i3];
            pad[i3 + BLOCK] = 92 ^ key[i3];
          }
          inner.update(pad.subarray(0, BLOCK));
          outer.update(pad.subarray(BLOCK));
        }
      }
      update(data) {
        if (this.finished) {
          throw new Error("Attempted to update an already finished HMAC.");
        }
        if (this.inner) {
          this.inner.update(data);
          return;
        }
        const chunk = toUint8Array(data);
        let position = 0;
        let { byteLength } = chunk;
        this.bytesHashed += byteLength;
        if (this.bytesHashed * 8 > MAX_HASHABLE_LENGTH) {
          throw new Error("Cannot hash more than 2^53 - 1 bits");
        }
        while (byteLength > 0) {
          this.buffer[this.bufferLength++] = chunk[position++];
          byteLength--;
          if (this.bufferLength === BLOCK) {
            this.hashBuffer();
            this.bufferLength = 0;
          }
        }
      }
      async digest() {
        const { inner, outer } = this;
        if (inner && outer) {
          if (this.finished) {
            throw new Error("Attempted to digest an already finished HMAC.");
          }
          this.finished = true;
          const innerDigest = inner.digestSync();
          outer.update(innerDigest);
          return outer.digestSync();
        }
        return this.digestSync();
      }
      reset() {
        this.state = Int32Array.from(INIT);
        this.buffer = new Uint8Array(64);
        this.bufferLength = 0;
        this.bytesHashed = 0;
      }
      digestSync() {
        const state = this.state.slice();
        const buffer = this.buffer.slice();
        let bufferLength = this.bufferLength;
        const bitsHashed = this.bytesHashed * 8;
        const bufferView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        bufferView.setUint8(bufferLength++, 128);
        if ((bufferLength - 1) % BLOCK >= BLOCK - 8) {
          for (let i3 = bufferLength; i3 < BLOCK; ++i3) {
            bufferView.setUint8(i3, 0);
          }
          this.hashBufferWith(state, buffer);
          bufferLength = 0;
        }
        for (let i3 = bufferLength; i3 < BLOCK - 8; ++i3) {
          bufferView.setUint8(i3, 0);
        }
        bufferView.setUint32(BLOCK - 8, Math.floor(bitsHashed / 4294967296), false);
        bufferView.setUint32(BLOCK - 4, bitsHashed, false);
        this.hashBufferWith(state, buffer);
        const out = new Uint8Array(DIGEST_LENGTH);
        for (let i3 = 0; i3 < 8; ++i3) {
          out[i3 * 4] = state[i3] >>> 24 & 255;
          out[i3 * 4 + 1] = state[i3] >>> 16 & 255;
          out[i3 * 4 + 2] = state[i3] >>> 8 & 255;
          out[i3 * 4 + 3] = state[i3] >>> 0 & 255;
        }
        return out;
      }
      static normalizeKey(secret) {
        const key = toUint8Array(secret);
        if (key.byteLength > BLOCK) {
          const h3 = new _Sha256Js();
          h3.update(key);
          const out = h3.digestSync();
          const padded = new Uint8Array(BLOCK);
          padded.set(out);
          return padded;
        }
        if (key.byteLength < BLOCK) {
          const padded = new Uint8Array(BLOCK);
          padded.set(key);
          return padded;
        }
        return key;
      }
      hashBuffer() {
        this.hashBufferWith(this.state, this.buffer);
      }
      hashBufferWith(state, buffer) {
        const w = this.w ?? (this.w = new Int32Array(64));
        let s0 = state[0], s1 = state[1], s2 = state[2], s3 = state[3], s4 = state[4], s5 = state[5], s6 = state[6], s7 = state[7];
        for (let i3 = 0; i3 < BLOCK; ++i3) {
          if (i3 < 16) {
            w[i3] = (buffer[i3 * 4] & 255) << 24 | (buffer[i3 * 4 + 1] & 255) << 16 | (buffer[i3 * 4 + 2] & 255) << 8 | buffer[i3 * 4 + 3] & 255;
          } else {
            let u = w[i3 - 2];
            const t12 = (u >>> 17 | u << 15) ^ (u >>> 19 | u << 13) ^ u >>> 10;
            u = w[i3 - 15];
            const t22 = (u >>> 7 | u << 25) ^ (u >>> 18 | u << 14) ^ u >>> 3;
            w[i3] = (t12 + w[i3 - 7] | 0) + (t22 + w[i3 - 16] | 0);
          }
          const t1 = (((s4 >>> 6 | s4 << 26) ^ (s4 >>> 11 | s4 << 21) ^ (s4 >>> 25 | s4 << 7)) + (s4 & s5 ^ ~s4 & s6) | 0) + (s7 + (K[i3] + w[i3] | 0) | 0) | 0;
          const t2 = ((s0 >>> 2 | s0 << 30) ^ (s0 >>> 13 | s0 << 19) ^ (s0 >>> 22 | s0 << 10)) + (s0 & s1 ^ s0 & s2 ^ s1 & s2) | 0;
          s7 = s6;
          s6 = s5;
          s5 = s4;
          s4 = s3 + t1 | 0;
          s3 = s2;
          s2 = s1;
          s1 = s0;
          s0 = t1 + t2 | 0;
        }
        state[0] += s0;
        state[1] += s1;
        state[2] += s2;
        state[3] += s3;
        state[4] += s4;
        state[5] += s5;
        state[6] += s6;
        state[7] += s7;
      }
    };
    INIT = new Int32Array([
      1779033703,
      3144134277,
      1013904242,
      2773480762,
      1359893119,
      2600822924,
      528734635,
      1541459225
    ]);
    K = new Int32Array([
      1116352408,
      1899447441,
      3049323471,
      3921009573,
      961987163,
      1508970993,
      2453635748,
      2870763221,
      3624381080,
      310598401,
      607225278,
      1426881987,
      1925078388,
      2162078206,
      2614888103,
      3248222580,
      3835390401,
      4022224774,
      264347078,
      604807628,
      770255983,
      1249150122,
      1555081692,
      1996064986,
      2554220882,
      2821834349,
      2952996808,
      3210313671,
      3336571891,
      3584528711,
      113926993,
      338241895,
      666307205,
      773529912,
      1294757372,
      1396182291,
      1695183700,
      1986661051,
      2177026350,
      2456956037,
      2730485921,
      2820302411,
      3259730800,
      3345764771,
      3516065817,
      3600352804,
      4094571909,
      275423344,
      430227734,
      506948616,
      659060556,
      883997877,
      958139571,
      1322822218,
      1537002063,
      1747873779,
      1955562222,
      2024104815,
      2227730452,
      2361852424,
      2428436474,
      2756734187,
      3204031479,
      3329325298
    ]);
  }
});

// node_modules/@smithy/core/dist-es/submodules/checksum/sha256/Sha256WebCrypto.js
var digest, sign, importKey, subtle, MAX_PENDING_BYTES, Sha256WebCrypto;
var init_Sha256WebCrypto = __esm({
  "node_modules/@smithy/core/dist-es/submodules/checksum/sha256/Sha256WebCrypto.js"() {
    init_index_browser2();
    init_Sha256Js();
    ({ digest, sign, importKey } = globalThis?.crypto?.subtle ?? {});
    subtle = typeof digest === "function" && typeof sign === "function" && typeof importKey === "function" ? globalThis.crypto.subtle : void 0;
    MAX_PENDING_BYTES = 8 * 1024 * 1024;
    Sha256WebCrypto = class {
      constructor(secret) {
        __publicField(this, "digestLength", 32);
        __publicField(this, "secret");
        __publicField(this, "pending", []);
        __publicField(this, "pendingBytes", 0);
        __publicField(this, "fallback");
        __publicField(this, "finished", false);
        if (secret) {
          this.secret = toUint8Array(secret);
        }
      }
      update(data) {
        if (this.finished) {
          throw new Error("Attempted to update an already finished HMAC.");
        }
        if (this.fallback) {
          this.fallback.update(data);
          return;
        }
        this.pending.push(data.slice());
        this.pendingBytes += data.byteLength;
        if (this.pendingBytes >= MAX_PENDING_BYTES) {
          this.switchToFallback();
        }
      }
      async digest() {
        if (this.fallback) {
          return this.fallback.digest();
        }
        if (this.secret && this.finished) {
          throw new Error("Attempted to digest an already finished HMAC.");
        }
        const data = concatBytes(this.pending);
        if (subtle) {
          if (this.secret) {
            this.finished = true;
            const key = await subtle.importKey("raw", this.secret, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
            const sig = await subtle.sign("HMAC", key, data);
            return new Uint8Array(sig);
          }
          const hash = await subtle.digest("SHA-256", data);
          return new Uint8Array(hash);
        }
        const sha256 = new Sha256Js(this.secret);
        sha256.update(data);
        return sha256.digest();
      }
      reset() {
        this.pending = [];
        this.pendingBytes = 0;
        this.fallback = void 0;
        this.finished = false;
      }
      switchToFallback() {
        const sha256Js = new Sha256Js(this.secret);
        for (const chunk of this.pending) {
          sha256Js.update(chunk);
        }
        this.fallback = sha256Js;
        this.pending = [];
        this.pendingBytes = 0;
      }
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/checksum/index.browser.js
var init_index_browser3 = __esm({
  "node_modules/@smithy/core/dist-es/submodules/checksum/index.browser.js"() {
    init_Crc32Js();
    init_Sha256WebCrypto();
  }
});

// node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/Int64.js
function negate(bytes) {
  for (let i3 = 0; i3 < 8; i3++) {
    bytes[i3] ^= 255;
  }
  for (let i3 = 7; i3 > -1; i3--) {
    bytes[i3]++;
    if (bytes[i3] !== 0)
      break;
  }
}
var Int64;
var init_Int64 = __esm({
  "node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/Int64.js"() {
    init_index_browser2();
    Int64 = class _Int64 {
      constructor(bytes) {
        __publicField(this, "bytes");
        this.bytes = bytes;
        if (bytes.byteLength !== 8) {
          throw new Error("Int64 buffers must be exactly 8 bytes");
        }
      }
      static fromNumber(number) {
        if (number > 9223372036854776e3 || number < -9223372036854776e3) {
          throw new Error(`${number} is too large (or, if negative, too small) to represent as an Int64`);
        }
        const bytes = new Uint8Array(8);
        for (let i3 = 7, remaining = Math.abs(Math.round(number)); i3 > -1 && remaining > 0; i3--, remaining /= 256) {
          bytes[i3] = remaining;
        }
        if (number < 0) {
          negate(bytes);
        }
        return new _Int64(bytes);
      }
      valueOf() {
        const bytes = this.bytes.slice(0);
        const negative = bytes[0] & 128;
        if (negative) {
          negate(bytes);
        }
        return parseInt(toHex(bytes), 16) * (negative ? -1 : 1);
      }
      toString() {
        return String(this.valueOf());
      }
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/HeaderMarshaller.js
var HeaderMarshaller, HEADER_VALUE_TYPE, BOOLEAN_TAG, BYTE_TAG, SHORT_TAG, INT_TAG, LONG_TAG, BINARY_TAG, STRING_TAG, TIMESTAMP_TAG, UUID_TAG, UUID_PATTERN;
var init_HeaderMarshaller = __esm({
  "node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/HeaderMarshaller.js"() {
    init_transport();
    init_index_browser2();
    init_Int64();
    HeaderMarshaller = class {
      constructor(toUtf82, fromUtf82) {
        __publicField(this, "toUtf8");
        __publicField(this, "fromUtf8");
        this.toUtf8 = toUtf82;
        this.fromUtf8 = fromUtf82;
      }
      format(headers) {
        const chunks = [];
        for (const headerName in headers) {
          if (!hasOwn(headers, headerName))
            continue;
          const bytes = this.fromUtf8(headerName);
          chunks.push(Uint8Array.from([bytes.byteLength]), bytes, this.formatHeaderValue(headers[headerName]));
        }
        const out = new Uint8Array(chunks.reduce((carry, bytes) => carry + bytes.byteLength, 0));
        let position = 0;
        for (const chunk of chunks) {
          out.set(chunk, position);
          position += chunk.byteLength;
        }
        return out;
      }
      formatHeaderValue(header) {
        switch (header.type) {
          case "boolean":
            return Uint8Array.from([header.value ? 0 : 1]);
          case "byte":
            return Uint8Array.from([2, header.value]);
          case "short":
            const shortView = new DataView(new ArrayBuffer(3));
            shortView.setUint8(0, 3);
            shortView.setInt16(1, header.value, false);
            return new Uint8Array(shortView.buffer);
          case "integer":
            const intView = new DataView(new ArrayBuffer(5));
            intView.setUint8(0, 4);
            intView.setInt32(1, header.value, false);
            return new Uint8Array(intView.buffer);
          case "long":
            const longBytes = new Uint8Array(9);
            longBytes[0] = 5;
            longBytes.set(header.value.bytes, 1);
            return longBytes;
          case "binary":
            const binView = new DataView(new ArrayBuffer(3 + header.value.byteLength));
            binView.setUint8(0, 6);
            binView.setUint16(1, header.value.byteLength, false);
            const binBytes = new Uint8Array(binView.buffer);
            binBytes.set(header.value, 3);
            return binBytes;
          case "string":
            const utf8Bytes = this.fromUtf8(header.value);
            const strView = new DataView(new ArrayBuffer(3 + utf8Bytes.byteLength));
            strView.setUint8(0, 7);
            strView.setUint16(1, utf8Bytes.byteLength, false);
            const strBytes = new Uint8Array(strView.buffer);
            strBytes.set(utf8Bytes, 3);
            return strBytes;
          case "timestamp":
            const tsBytes = new Uint8Array(9);
            tsBytes[0] = 8;
            tsBytes.set(Int64.fromNumber(header.value.valueOf()).bytes, 1);
            return tsBytes;
          case "uuid":
            if (!UUID_PATTERN.test(header.value)) {
              throw new Error(`Invalid UUID received: ${header.value}`);
            }
            const uuidBytes = new Uint8Array(17);
            uuidBytes[0] = 9;
            uuidBytes.set(fromHex(header.value.replace(/-/g, "")), 1);
            return uuidBytes;
        }
      }
      parse(headers) {
        const out = {};
        let position = 0;
        while (position < headers.byteLength) {
          const nameLength = headers.getUint8(position++);
          const name = this.toUtf8(new Uint8Array(headers.buffer, headers.byteOffset + position, nameLength));
          position += nameLength;
          switch (headers.getUint8(position++)) {
            case 0:
              out[name] = {
                type: BOOLEAN_TAG,
                value: true
              };
              break;
            case 1:
              out[name] = {
                type: BOOLEAN_TAG,
                value: false
              };
              break;
            case 2:
              out[name] = {
                type: BYTE_TAG,
                value: headers.getInt8(position++)
              };
              break;
            case 3:
              out[name] = {
                type: SHORT_TAG,
                value: headers.getInt16(position, false)
              };
              position += 2;
              break;
            case 4:
              out[name] = {
                type: INT_TAG,
                value: headers.getInt32(position, false)
              };
              position += 4;
              break;
            case 5:
              out[name] = {
                type: LONG_TAG,
                value: new Int64(new Uint8Array(headers.buffer, headers.byteOffset + position, 8))
              };
              position += 8;
              break;
            case 6:
              const binaryLength = headers.getUint16(position, false);
              position += 2;
              out[name] = {
                type: BINARY_TAG,
                value: new Uint8Array(headers.buffer, headers.byteOffset + position, binaryLength)
              };
              position += binaryLength;
              break;
            case 7:
              const stringLength = headers.getUint16(position, false);
              position += 2;
              out[name] = {
                type: STRING_TAG,
                value: this.toUtf8(new Uint8Array(headers.buffer, headers.byteOffset + position, stringLength))
              };
              position += stringLength;
              break;
            case 8:
              out[name] = {
                type: TIMESTAMP_TAG,
                value: new Date(new Int64(new Uint8Array(headers.buffer, headers.byteOffset + position, 8)).valueOf())
              };
              position += 8;
              break;
            case 9:
              const uuidBytes = new Uint8Array(headers.buffer, headers.byteOffset + position, 16);
              position += 16;
              out[name] = {
                type: UUID_TAG,
                value: `${toHex(uuidBytes.subarray(0, 4))}-${toHex(uuidBytes.subarray(4, 6))}-${toHex(uuidBytes.subarray(6, 8))}-${toHex(uuidBytes.subarray(8, 10))}-${toHex(uuidBytes.subarray(10))}`
              };
              break;
            default:
              throw new Error(`Unrecognized header type tag`);
          }
        }
        return out;
      }
    };
    (function(HEADER_VALUE_TYPE3) {
      HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["boolTrue"] = 0] = "boolTrue";
      HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["boolFalse"] = 1] = "boolFalse";
      HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["byte"] = 2] = "byte";
      HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["short"] = 3] = "short";
      HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["integer"] = 4] = "integer";
      HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["long"] = 5] = "long";
      HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["byteArray"] = 6] = "byteArray";
      HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["string"] = 7] = "string";
      HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["timestamp"] = 8] = "timestamp";
      HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["uuid"] = 9] = "uuid";
    })(HEADER_VALUE_TYPE || (HEADER_VALUE_TYPE = {}));
    BOOLEAN_TAG = "boolean";
    BYTE_TAG = "byte";
    SHORT_TAG = "short";
    INT_TAG = "integer";
    LONG_TAG = "long";
    BINARY_TAG = "binary";
    STRING_TAG = "string";
    TIMESTAMP_TAG = "timestamp";
    UUID_TAG = "uuid";
    UUID_PATTERN = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
  }
});

// node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/splitMessage.js
function splitMessage({ byteLength, byteOffset, buffer }) {
  if (byteLength < MINIMUM_MESSAGE_LENGTH) {
    throw new Error("Provided message too short to accommodate event stream message overhead");
  }
  const view = new DataView(buffer, byteOffset, byteLength);
  const messageLength = view.getUint32(0, false);
  if (byteLength !== messageLength) {
    throw new Error("Reported message length does not match received message length");
  }
  const headerLength = view.getUint32(PRELUDE_MEMBER_LENGTH, false);
  const expectedPreludeChecksum = view.getUint32(PRELUDE_LENGTH, false);
  const expectedMessageChecksum = view.getUint32(byteLength - CHECKSUM_LENGTH, false);
  const checksummer = new Crc32Js();
  checksummer.update(new Uint8Array(buffer, byteOffset, PRELUDE_LENGTH));
  if (expectedPreludeChecksum !== checksummer.digestSync()) {
    throw new Error(`The prelude checksum specified in the message (${expectedPreludeChecksum}) does not match the calculated CRC32 checksum (${checksummer.digestSync()})`);
  }
  checksummer.update(new Uint8Array(buffer, byteOffset + PRELUDE_LENGTH, byteLength - (PRELUDE_LENGTH + CHECKSUM_LENGTH)));
  if (expectedMessageChecksum !== checksummer.digestSync()) {
    throw new Error(`The message checksum (${checksummer.digestSync()}) did not match the expected value of ${expectedMessageChecksum}`);
  }
  return {
    headers: new DataView(buffer, byteOffset + PRELUDE_LENGTH + CHECKSUM_LENGTH, headerLength),
    body: new Uint8Array(buffer, byteOffset + PRELUDE_LENGTH + CHECKSUM_LENGTH + headerLength, messageLength - headerLength - (PRELUDE_LENGTH + CHECKSUM_LENGTH + CHECKSUM_LENGTH))
  };
}
var PRELUDE_MEMBER_LENGTH, PRELUDE_LENGTH, CHECKSUM_LENGTH, MINIMUM_MESSAGE_LENGTH;
var init_splitMessage = __esm({
  "node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/splitMessage.js"() {
    init_index_browser3();
    PRELUDE_MEMBER_LENGTH = 4;
    PRELUDE_LENGTH = PRELUDE_MEMBER_LENGTH * 2;
    CHECKSUM_LENGTH = 4;
    MINIMUM_MESSAGE_LENGTH = PRELUDE_LENGTH + CHECKSUM_LENGTH * 2;
  }
});

// node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/EventStreamCodec.js
var EventStreamCodec;
var init_EventStreamCodec = __esm({
  "node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/EventStreamCodec.js"() {
    init_index_browser3();
    init_HeaderMarshaller();
    init_splitMessage();
    EventStreamCodec = class {
      constructor(toUtf82, fromUtf82) {
        __publicField(this, "headerMarshaller");
        __publicField(this, "messageBuffer");
        __publicField(this, "isEndOfStream");
        this.headerMarshaller = new HeaderMarshaller(toUtf82, fromUtf82);
        this.messageBuffer = [];
        this.isEndOfStream = false;
      }
      feed(message) {
        this.messageBuffer.push(this.decode(message));
      }
      endOfStream() {
        this.isEndOfStream = true;
      }
      getMessage() {
        const message = this.messageBuffer.pop();
        const isEndOfStream = this.isEndOfStream;
        return {
          getMessage() {
            return message;
          },
          isEndOfStream() {
            return isEndOfStream;
          }
        };
      }
      getAvailableMessages() {
        const messages = this.messageBuffer;
        this.messageBuffer = [];
        const isEndOfStream = this.isEndOfStream;
        return {
          getMessages() {
            return messages;
          },
          isEndOfStream() {
            return isEndOfStream;
          }
        };
      }
      encode({ headers: rawHeaders, body }) {
        const headers = this.headerMarshaller.format(rawHeaders);
        const length = headers.byteLength + body.byteLength + 16;
        const out = new Uint8Array(length);
        const view = new DataView(out.buffer, out.byteOffset, out.byteLength);
        const checksum = new Crc32Js();
        view.setUint32(0, length, false);
        view.setUint32(4, headers.byteLength, false);
        checksum.update(out.subarray(0, 8));
        view.setUint32(8, checksum.digestSync(), false);
        out.set(headers, 12);
        out.set(body, headers.byteLength + 12);
        checksum.update(out.subarray(8, length - 4));
        view.setUint32(length - 4, checksum.digestSync(), false);
        return out;
      }
      decode(message) {
        const { headers, body } = splitMessage(message);
        return { headers: this.headerMarshaller.parse(headers), body };
      }
      formatHeaders(rawHeaders) {
        return this.headerMarshaller.format(rawHeaders);
      }
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/MessageDecoderStream.js
var MessageDecoderStream;
var init_MessageDecoderStream = __esm({
  "node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/MessageDecoderStream.js"() {
    MessageDecoderStream = class {
      constructor(options) {
        __publicField(this, "options");
        this.options = options;
      }
      [Symbol.asyncIterator]() {
        return this.asyncIterator();
      }
      async *asyncIterator() {
        for await (const bytes of this.options.inputStream) {
          const decoded = this.options.decoder.decode(bytes);
          yield decoded;
        }
      }
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/MessageEncoderStream.js
var MessageEncoderStream;
var init_MessageEncoderStream = __esm({
  "node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/MessageEncoderStream.js"() {
    MessageEncoderStream = class {
      constructor(options) {
        __publicField(this, "options");
        this.options = options;
      }
      [Symbol.asyncIterator]() {
        return this.asyncIterator();
      }
      async *asyncIterator() {
        for await (const msg of this.options.messageStream) {
          const encoded = this.options.encoder.encode(msg);
          yield encoded;
        }
        if (this.options.includeEndFrame) {
          yield new Uint8Array(0);
        }
      }
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/SmithyMessageDecoderStream.js
var SmithyMessageDecoderStream;
var init_SmithyMessageDecoderStream = __esm({
  "node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/SmithyMessageDecoderStream.js"() {
    SmithyMessageDecoderStream = class {
      constructor(options) {
        __publicField(this, "options");
        this.options = options;
      }
      [Symbol.asyncIterator]() {
        return this.asyncIterator();
      }
      async *asyncIterator() {
        for await (const message of this.options.messageStream) {
          const deserialized = await this.options.deserializer(message);
          if (deserialized === void 0)
            continue;
          yield deserialized;
        }
      }
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/SmithyMessageEncoderStream.js
var SmithyMessageEncoderStream;
var init_SmithyMessageEncoderStream = __esm({
  "node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/SmithyMessageEncoderStream.js"() {
    SmithyMessageEncoderStream = class {
      constructor(options) {
        __publicField(this, "options");
        this.options = options;
      }
      [Symbol.asyncIterator]() {
        return this.asyncIterator();
      }
      async *asyncIterator() {
        for await (const chunk of this.options.inputStream) {
          const payloadBuf = this.options.serializer(chunk);
          yield payloadBuf;
        }
      }
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-serde-universal/getChunkedStream.js
function getChunkedStream(source) {
  let currentMessageTotalLength = 0;
  let currentMessagePendingLength = 0;
  let currentMessage = null;
  let messageLengthBuffer = null;
  const allocateMessage = (size) => {
    if (typeof size !== "number") {
      throw new Error("Attempted to allocate an event message where size was not a number: " + size);
    }
    currentMessageTotalLength = size;
    currentMessagePendingLength = 4;
    currentMessage = new Uint8Array(size);
    const currentMessageView = new DataView(currentMessage.buffer);
    currentMessageView.setUint32(0, size, false);
  };
  const iterator = async function* () {
    const sourceIterator = source[Symbol.asyncIterator]();
    while (true) {
      const { value, done } = await sourceIterator.next();
      if (done) {
        if (!currentMessageTotalLength) {
          return;
        } else if (currentMessageTotalLength === currentMessagePendingLength) {
          yield currentMessage;
        } else {
          throw new Error("Truncated event message received.");
        }
        return;
      }
      const chunkLength = value.length;
      let currentOffset = 0;
      while (currentOffset < chunkLength) {
        if (!currentMessage) {
          const bytesRemaining = chunkLength - currentOffset;
          if (!messageLengthBuffer) {
            messageLengthBuffer = new Uint8Array(4);
          }
          const numBytesForTotal = Math.min(4 - currentMessagePendingLength, bytesRemaining);
          messageLengthBuffer.set(value.slice(currentOffset, currentOffset + numBytesForTotal), currentMessagePendingLength);
          currentMessagePendingLength += numBytesForTotal;
          currentOffset += numBytesForTotal;
          if (currentMessagePendingLength < 4) {
            break;
          }
          allocateMessage(new DataView(messageLengthBuffer.buffer).getUint32(0, false));
          messageLengthBuffer = null;
        }
        const numBytesToWrite = Math.min(currentMessageTotalLength - currentMessagePendingLength, chunkLength - currentOffset);
        currentMessage.set(value.slice(currentOffset, currentOffset + numBytesToWrite), currentMessagePendingLength);
        currentMessagePendingLength += numBytesToWrite;
        currentOffset += numBytesToWrite;
        if (currentMessageTotalLength && currentMessageTotalLength === currentMessagePendingLength) {
          yield currentMessage;
          currentMessage = null;
          currentMessageTotalLength = 0;
          currentMessagePendingLength = 0;
        }
      }
    }
  };
  return {
    [Symbol.asyncIterator]: iterator
  };
}
var init_getChunkedStream = __esm({
  "node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-serde-universal/getChunkedStream.js"() {
  }
});

// node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-serde-universal/getUnmarshalledStream.js
function getUnmarshalledStream(source, options) {
  const messageUnmarshaller = getMessageUnmarshaller(options.deserializer, options.toUtf8);
  return {
    [Symbol.asyncIterator]: async function* () {
      for await (const chunk of source) {
        const message = options.eventStreamCodec.decode(chunk);
        const type = await messageUnmarshaller(message);
        if (type === void 0)
          continue;
        yield type;
      }
    }
  };
}
function getMessageUnmarshaller(deserializer, toUtf82) {
  return async function(message) {
    const { value: messageType } = message.headers[":message-type"];
    if (messageType === "error") {
      const unmodeledError = new Error(message.headers[":error-message"].value || "UnknownError");
      unmodeledError.name = message.headers[":error-code"].value;
      throw unmodeledError;
    } else if (messageType === "exception") {
      const code = message.headers[":exception-type"].value;
      const exception = { [code]: message };
      const deserializedException = await deserializer(exception);
      if (deserializedException.$unknown) {
        const error = new Error(toUtf82(message.body));
        error.name = code;
        throw error;
      }
      throw deserializedException[code];
    } else if (messageType === "event") {
      const event = {
        [message.headers[":event-type"].value]: message
      };
      const deserialized = await deserializer(event);
      if (deserialized.$unknown)
        return;
      return deserialized;
    } else {
      throw Error(`Unrecognizable event type: ${message.headers[":event-type"].value}`);
    }
  };
}
var init_getUnmarshalledStream = __esm({
  "node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-serde-universal/getUnmarshalledStream.js"() {
  }
});

// node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-serde-universal/EventStreamMarshaller.js
var EventStreamMarshaller, eventStreamSerdeProvider;
var init_EventStreamMarshaller = __esm({
  "node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-serde-universal/EventStreamMarshaller.js"() {
    init_EventStreamCodec();
    init_MessageDecoderStream();
    init_MessageEncoderStream();
    init_SmithyMessageDecoderStream();
    init_SmithyMessageEncoderStream();
    init_getChunkedStream();
    init_getUnmarshalledStream();
    EventStreamMarshaller = class {
      constructor({ utf8Encoder, utf8Decoder }) {
        __publicField(this, "eventStreamCodec");
        __publicField(this, "utfEncoder");
        this.eventStreamCodec = new EventStreamCodec(utf8Encoder, utf8Decoder);
        this.utfEncoder = utf8Encoder;
      }
      deserialize(body, deserializer) {
        const inputStream = getChunkedStream(body);
        return new SmithyMessageDecoderStream({
          messageStream: new MessageDecoderStream({ inputStream, decoder: this.eventStreamCodec }),
          deserializer: getMessageUnmarshaller(deserializer, this.utfEncoder)
        });
      }
      serialize(inputStream, serializer) {
        return new MessageEncoderStream({
          messageStream: new SmithyMessageEncoderStream({ inputStream, serializer }),
          encoder: this.eventStreamCodec,
          includeEndFrame: true
        });
      }
    };
    eventStreamSerdeProvider = (options) => new EventStreamMarshaller(options);
  }
});

// node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-serde/utils.js
var readableStreamToIterable, iterableToReadableStream;
var init_utils = __esm({
  "node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-serde/utils.js"() {
    readableStreamToIterable = (readableStream) => ({
      [Symbol.asyncIterator]: async function* () {
        const reader = readableStream.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done)
              return;
            yield value;
          }
        } finally {
          reader.releaseLock();
        }
      }
    });
    iterableToReadableStream = (asyncIterable) => {
      const iterator = asyncIterable[Symbol.asyncIterator]();
      return new ReadableStream({
        async pull(controller) {
          const { done, value } = await iterator.next();
          if (done) {
            return controller.close();
          }
          controller.enqueue(value);
        }
      });
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-serde/EventStreamMarshaller.browser.js
var EventStreamMarshaller2, isReadableStream2, eventStreamSerdeProvider2;
var init_EventStreamMarshaller_browser = __esm({
  "node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-serde/EventStreamMarshaller.browser.js"() {
    init_EventStreamMarshaller();
    init_utils();
    EventStreamMarshaller2 = class {
      constructor({ utf8Encoder, utf8Decoder }) {
        __publicField(this, "universalMarshaller");
        this.universalMarshaller = new EventStreamMarshaller({
          utf8Decoder,
          utf8Encoder
        });
      }
      deserialize(body, deserializer) {
        const bodyIterable = isReadableStream2(body) ? readableStreamToIterable(body) : body;
        return this.universalMarshaller.deserialize(bodyIterable, deserializer);
      }
      serialize(input, serializer) {
        const serializedIterable = this.universalMarshaller.serialize(input, serializer);
        return typeof ReadableStream === "function" ? iterableToReadableStream(serializedIterable) : serializedIterable;
      }
    };
    isReadableStream2 = (body) => typeof ReadableStream === "function" && body instanceof ReadableStream;
    eventStreamSerdeProvider2 = (options) => new EventStreamMarshaller2(options);
  }
});

// node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-serde-config-resolver/EventStreamSerdeConfig.js
var resolveEventStreamSerdeConfig;
var init_EventStreamSerdeConfig = __esm({
  "node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-serde-config-resolver/EventStreamSerdeConfig.js"() {
    resolveEventStreamSerdeConfig = (input) => Object.assign(input, {
      eventStreamMarshaller: input.eventStreamSerdeProvider(input)
    });
  }
});

// node_modules/@smithy/core/dist-es/submodules/event-streams/EventStreamSerde.js
var EventStreamSerde;
var init_EventStreamSerde = __esm({
  "node_modules/@smithy/core/dist-es/submodules/event-streams/EventStreamSerde.js"() {
    init_transport();
    init_schema();
    init_index_browser2();
    EventStreamSerde = class {
      constructor({ marshaller, serializer, deserializer, serdeContext, defaultContentType, compositeErrorRegistry }) {
        __publicField(this, "marshaller");
        __publicField(this, "serializer");
        __publicField(this, "deserializer");
        __publicField(this, "serdeContext");
        __publicField(this, "defaultContentType");
        __publicField(this, "compositeErrorRegistry");
        this.marshaller = marshaller;
        this.serializer = serializer;
        this.deserializer = deserializer;
        this.serdeContext = serdeContext;
        this.defaultContentType = defaultContentType;
        this.compositeErrorRegistry = compositeErrorRegistry;
      }
      async serializeEventStream({ eventStream, requestSchema, initialRequest, initialMessageType }) {
        const marshaller = this.marshaller;
        const eventStreamMember = requestSchema.getEventStreamMember();
        const unionSchema = requestSchema.getMemberSchema(eventStreamMember);
        const serializer = this.serializer;
        const defaultContentType = this.defaultContentType;
        const initialRequestMarker = /* @__PURE__ */ Symbol("initialRequestMarker");
        const eventStreamIterable = {
          async *[Symbol.asyncIterator]() {
            if (initialRequest) {
              const headers = {
                ":event-type": { type: "string", value: initialMessageType ?? "initial-request" },
                ":message-type": { type: "string", value: "event" },
                ":content-type": { type: "string", value: defaultContentType }
              };
              serializer.write(requestSchema, initialRequest);
              const body = serializer.flush();
              yield {
                [initialRequestMarker]: true,
                headers,
                body
              };
            }
            for await (const page of eventStream) {
              yield page;
            }
          }
        };
        return marshaller.serialize(eventStreamIterable, (event) => {
          if (event[initialRequestMarker]) {
            return {
              headers: event.headers,
              body: event.body
            };
          }
          let unionMember = "";
          for (const key in event) {
            if (!hasOwn(event, key))
              continue;
            if (key !== "__type") {
              unionMember = key;
              break;
            }
          }
          const { additionalHeaders, body, eventType, explicitPayloadContentType } = this.writeEventBody(unionMember, unionSchema, event);
          const headers = {
            ":event-type": { type: "string", value: eventType },
            ":message-type": { type: "string", value: "event" },
            ":content-type": { type: "string", value: explicitPayloadContentType ?? defaultContentType },
            ...additionalHeaders
          };
          return {
            headers,
            body
          };
        });
      }
      async deserializeEventStream({ response, responseSchema, initialResponseContainer, initialMessageType }) {
        const marshaller = this.marshaller;
        const eventStreamMember = responseSchema.getEventStreamMember();
        const unionSchema = responseSchema.getMemberSchema(eventStreamMember);
        const memberSchemas = unionSchema.getMemberSchemas();
        const initialResponseMarker = /* @__PURE__ */ Symbol("initialResponseMarker");
        const asyncIterable = marshaller.deserialize(response.body, async (event) => {
          let unionMember = "";
          for (const key in event) {
            if (!hasOwn(event, key))
              continue;
            if (key !== "__type") {
              unionMember = key;
              break;
            }
          }
          const body = event[unionMember].body;
          if (unionMember === (initialMessageType ?? "initial-response")) {
            const dataObject = await this.deserializer.read(responseSchema, body);
            delete dataObject[eventStreamMember];
            return {
              [initialResponseMarker]: true,
              ...dataObject
            };
          } else if (unionMember in memberSchemas) {
            const eventStreamSchema = memberSchemas[unionMember];
            if (eventStreamSchema.isStructSchema()) {
              const out = {};
              let hasBindings = false;
              for (const [name, member2] of eventStreamSchema.structIterator()) {
                const { eventHeader, eventPayload } = member2.getMergedTraits();
                hasBindings = hasBindings || Boolean(eventHeader || eventPayload);
                if (eventPayload) {
                  if (member2.isBlobSchema()) {
                    out[name] = body;
                  } else if (member2.isStringSchema()) {
                    out[name] = (this.serdeContext?.utf8Encoder ?? toUtf8)(body);
                  } else if (member2.isStructSchema()) {
                    out[name] = await this.deserializer.read(member2, body);
                  }
                } else if (eventHeader) {
                  const value = event[unionMember].headers[name]?.value;
                  if (value != null) {
                    if (member2.isNumericSchema()) {
                      if (value && typeof value === "object" && "bytes" in value) {
                        out[name] = BigInt(value.toString());
                      } else {
                        out[name] = Number(value);
                      }
                    } else {
                      out[name] = value;
                    }
                  }
                }
              }
              return {
                [unionMember]: await this.readEventMember(eventStreamSchema, body, hasBindings, out)
              };
            }
            return {
              [unionMember]: await this.deserializer.read(eventStreamSchema, body)
            };
          } else {
            return {
              $unknown: event
            };
          }
        });
        const asyncIterator = asyncIterable[Symbol.asyncIterator]();
        const firstEvent = await asyncIterator.next();
        if (firstEvent.done) {
          return asyncIterable;
        }
        if (firstEvent.value?.[initialResponseMarker]) {
          if (!responseSchema) {
            throw new Error("@smithy::core/protocols - initial-response event encountered in event stream but no response schema given.");
          }
          for (const key in firstEvent.value) {
            if (!hasOwn(firstEvent.value, key))
              continue;
            initialResponseContainer[key] = firstEvent.value[key];
          }
        }
        return {
          async *[Symbol.asyncIterator]() {
            if (!firstEvent?.value?.[initialResponseMarker]) {
              yield firstEvent.value;
            }
            while (true) {
              const { done, value } = await asyncIterator.next();
              if (done) {
                break;
              }
              yield value;
            }
          }
        };
      }
      async readEventMember(eventStreamSchema, body, hasBindings, out) {
        let ErrCtor;
        const staticStructuralSchema = eventStreamSchema.getSchema();
        if (Array.isArray(staticStructuralSchema) && staticStructuralSchema[0] === -3) {
          const namespace = staticStructuralSchema[1];
          const nsRegistry = TypeRegistry.for(namespace);
          this.compositeErrorRegistry?.copyFrom(nsRegistry);
          ErrCtor = (this.compositeErrorRegistry ?? nsRegistry)?.getErrorCtor(staticStructuralSchema);
        }
        const dataObject = hasBindings ? out : body.byteLength === 0 ? {} : await this.deserializer.read(eventStreamSchema, body);
        if (ErrCtor) {
          const message = dataObject.message ?? dataObject.Message ?? "Unknown";
          const metadata = {};
          const $fault = eventStreamSchema.getMergedTraits().error;
          if ($fault) {
            metadata.$fault = $fault;
          }
          return Object.assign(new ErrCtor({}), metadata, {
            message
          }, dataObject);
        }
        return dataObject;
      }
      writeEventBody(unionMember, unionSchema, event) {
        const serializer = this.serializer;
        let eventType = unionMember;
        let explicitPayloadMember = null;
        let explicitPayloadContentType;
        const isKnownSchema = (() => {
          const struct = unionSchema.getSchema();
          return struct[4].includes(unionMember);
        })();
        const additionalHeaders = {};
        if (!isKnownSchema) {
          const [type, value] = event[unionMember];
          eventType = type;
          serializer.write(15, value);
        } else {
          const eventSchema = unionSchema.getMemberSchema(unionMember);
          if (eventSchema.isStructSchema()) {
            for (const [memberName, memberSchema] of eventSchema.structIterator()) {
              const { eventHeader, eventPayload } = memberSchema.getMergedTraits();
              if (eventPayload) {
                explicitPayloadMember = memberName;
              } else if (eventHeader) {
                const value = event[unionMember][memberName];
                let type = "binary";
                if (memberSchema.isNumericSchema()) {
                  if ((-2) ** 31 <= value && value <= 2 ** 31 - 1) {
                    type = "integer";
                  } else {
                    type = "long";
                  }
                } else if (memberSchema.isTimestampSchema()) {
                  type = "timestamp";
                } else if (memberSchema.isStringSchema()) {
                  type = "string";
                } else if (memberSchema.isBooleanSchema()) {
                  type = "boolean";
                }
                if (value != null) {
                  additionalHeaders[memberName] = {
                    type,
                    value
                  };
                  delete event[unionMember][memberName];
                }
              }
            }
            if (explicitPayloadMember !== null) {
              const payloadSchema = eventSchema.getMemberSchema(explicitPayloadMember);
              if (payloadSchema.isBlobSchema()) {
                explicitPayloadContentType = "application/octet-stream";
              } else if (payloadSchema.isStringSchema()) {
                explicitPayloadContentType = "text/plain";
              }
              serializer.write(payloadSchema, event[unionMember][explicitPayloadMember]);
            } else {
              serializer.write(eventSchema, event[unionMember]);
            }
          } else if (eventSchema.isUnitSchema()) {
            serializer.write(eventSchema, {});
          } else {
            throw new Error("@smithy/core/event-streams - non-struct member not supported in event stream union.");
          }
        }
        const messageSerialization = serializer.flush() ?? new Uint8Array();
        const body = typeof messageSerialization === "string" ? (this.serdeContext?.utf8Decoder ?? fromUtf8)(messageSerialization) : messageSerialization;
        return {
          body,
          eventType,
          explicitPayloadContentType,
          additionalHeaders
        };
      }
    };
  }
});

// node_modules/@smithy/core/dist-es/submodules/event-streams/index.browser.js
var index_browser_exports = {};
__export(index_browser_exports, {
  EventStreamCodec: () => EventStreamCodec,
  EventStreamMarshaller: () => EventStreamMarshaller2,
  EventStreamSerde: () => EventStreamSerde,
  HeaderMarshaller: () => HeaderMarshaller,
  Int64: () => Int64,
  MessageDecoderStream: () => MessageDecoderStream,
  MessageEncoderStream: () => MessageEncoderStream,
  SmithyMessageDecoderStream: () => SmithyMessageDecoderStream,
  SmithyMessageEncoderStream: () => SmithyMessageEncoderStream,
  UniversalEventStreamMarshaller: () => EventStreamMarshaller,
  eventStreamSerdeProvider: () => eventStreamSerdeProvider2,
  getChunkedStream: () => getChunkedStream,
  getMessageUnmarshaller: () => getMessageUnmarshaller,
  getUnmarshalledStream: () => getUnmarshalledStream,
  iterableToReadableStream: () => iterableToReadableStream,
  readableStreamToIterable: () => readableStreamToIterable,
  resolveEventStreamSerdeConfig: () => resolveEventStreamSerdeConfig,
  universalEventStreamSerdeProvider: () => eventStreamSerdeProvider
});
var init_index_browser4 = __esm({
  "node_modules/@smithy/core/dist-es/submodules/event-streams/index.browser.js"() {
    init_EventStreamCodec();
    init_HeaderMarshaller();
    init_Int64();
    init_MessageDecoderStream();
    init_MessageEncoderStream();
    init_SmithyMessageDecoderStream();
    init_SmithyMessageEncoderStream();
    init_EventStreamMarshaller_browser();
    init_utils();
    init_EventStreamMarshaller();
    init_getChunkedStream();
    init_getUnmarshalledStream();
    init_EventStreamSerdeConfig();
    init_EventStreamSerde();
  }
});

// node_modules/@aws-sdk/core/dist-es/submodules/client/setCredentialFeature.js
function setCredentialFeature(credentials, feature, value) {
  if (!credentials.$source) {
    credentials.$source = {};
  }
  credentials.$source[feature] = value;
  return credentials;
}

// node_modules/@smithy/core/dist-es/submodules/retry/middleware-retry/isStreamingPayload/isStreamingPayload.browser.js
var isStreamingPayload = (request) => request?.body instanceof ReadableStream;

// node_modules/@smithy/core/dist-es/submodules/client/middleware-stack/MiddlewareStack.js
var getAllAliases = (name, aliases) => {
  const _aliases = [];
  if (name) {
    _aliases.push(name);
  }
  if (aliases) {
    for (const alias of aliases) {
      _aliases.push(alias);
    }
  }
  return _aliases;
};
var getMiddlewareNameWithAliases = (name, aliases) => {
  return `${name || "anonymous"}${aliases && aliases.length > 0 ? ` (a.k.a. ${aliases.join(",")})` : ""}`;
};
var constructStack = () => {
  let absoluteEntries = [];
  let relativeEntries = [];
  let identifyOnResolve = false;
  const entriesNameSet = /* @__PURE__ */ new Set();
  const sort = (entries) => entries.sort((a3, b3) => stepWeights[b3.step] - stepWeights[a3.step] || priorityWeights[b3.priority || "normal"] - priorityWeights[a3.priority || "normal"]);
  const removeByName = (toRemove) => {
    let isRemoved = false;
    const filterCb = (entry) => {
      const aliases = getAllAliases(entry.name, entry.aliases);
      if (aliases.includes(toRemove)) {
        isRemoved = true;
        for (const alias of aliases) {
          entriesNameSet.delete(alias);
        }
        return false;
      }
      return true;
    };
    absoluteEntries = absoluteEntries.filter(filterCb);
    relativeEntries = relativeEntries.filter(filterCb);
    return isRemoved;
  };
  const removeByReference = (toRemove) => {
    let isRemoved = false;
    const filterCb = (entry) => {
      if (entry.middleware === toRemove) {
        isRemoved = true;
        for (const alias of getAllAliases(entry.name, entry.aliases)) {
          entriesNameSet.delete(alias);
        }
        return false;
      }
      return true;
    };
    absoluteEntries = absoluteEntries.filter(filterCb);
    relativeEntries = relativeEntries.filter(filterCb);
    return isRemoved;
  };
  const cloneTo = (toStack) => {
    absoluteEntries.forEach((entry) => {
      toStack.add(entry.middleware, { ...entry });
    });
    relativeEntries.forEach((entry) => {
      toStack.addRelativeTo(entry.middleware, { ...entry });
    });
    toStack.identifyOnResolve?.(stack.identifyOnResolve());
    return toStack;
  };
  const expandRelativeMiddlewareList = (from) => {
    const expandedMiddlewareList = [];
    from.before.forEach((entry) => {
      if (entry.before.length === 0 && entry.after.length === 0) {
        expandedMiddlewareList.push(entry);
      } else {
        expandedMiddlewareList.push(...expandRelativeMiddlewareList(entry));
      }
    });
    expandedMiddlewareList.push(from);
    from.after.reverse().forEach((entry) => {
      if (entry.before.length === 0 && entry.after.length === 0) {
        expandedMiddlewareList.push(entry);
      } else {
        expandedMiddlewareList.push(...expandRelativeMiddlewareList(entry));
      }
    });
    return expandedMiddlewareList;
  };
  const getMiddlewareList = (debug = false) => {
    const normalizedAbsoluteEntries = [];
    const normalizedRelativeEntries = [];
    const normalizedEntriesNameMap = {};
    absoluteEntries.forEach((entry) => {
      const normalizedEntry = {
        ...entry,
        before: [],
        after: []
      };
      for (const alias of getAllAliases(normalizedEntry.name, normalizedEntry.aliases)) {
        normalizedEntriesNameMap[alias] = normalizedEntry;
      }
      normalizedAbsoluteEntries.push(normalizedEntry);
    });
    relativeEntries.forEach((entry) => {
      const normalizedEntry = {
        ...entry,
        before: [],
        after: []
      };
      for (const alias of getAllAliases(normalizedEntry.name, normalizedEntry.aliases)) {
        normalizedEntriesNameMap[alias] = normalizedEntry;
      }
      normalizedRelativeEntries.push(normalizedEntry);
    });
    normalizedRelativeEntries.forEach((entry) => {
      if (entry.toMiddleware) {
        const toMiddleware = normalizedEntriesNameMap[entry.toMiddleware];
        if (toMiddleware === void 0) {
          if (debug) {
            return;
          }
          throw new Error(`${entry.toMiddleware} is not found when adding ${getMiddlewareNameWithAliases(entry.name, entry.aliases)} middleware ${entry.relation} ${entry.toMiddleware}`);
        }
        if (entry.relation === "after") {
          toMiddleware.after.push(entry);
        }
        if (entry.relation === "before") {
          toMiddleware.before.push(entry);
        }
      }
    });
    const mainChain = sort(normalizedAbsoluteEntries).map(expandRelativeMiddlewareList).reduce((wholeList, expandedMiddlewareList) => {
      wholeList.push(...expandedMiddlewareList);
      return wholeList;
    }, []);
    return mainChain;
  };
  const stack = {
    add: (middleware, options = {}) => {
      const { name, override, aliases: _aliases } = options;
      const entry = {
        step: "initialize",
        priority: "normal",
        middleware,
        ...options
      };
      const aliases = getAllAliases(name, _aliases);
      if (aliases.length > 0) {
        if (aliases.some((alias) => entriesNameSet.has(alias))) {
          if (!override)
            throw new Error(`Duplicate middleware name '${getMiddlewareNameWithAliases(name, _aliases)}'`);
          for (const alias of aliases) {
            const toOverrideIndex = absoluteEntries.findIndex((entry2) => entry2.name === alias || entry2.aliases?.some((a3) => a3 === alias));
            if (toOverrideIndex === -1) {
              continue;
            }
            const toOverride = absoluteEntries[toOverrideIndex];
            if (toOverride.step !== entry.step || entry.priority !== toOverride.priority) {
              throw new Error(`"${getMiddlewareNameWithAliases(toOverride.name, toOverride.aliases)}" middleware with ${toOverride.priority} priority in ${toOverride.step} step cannot be overridden by "${getMiddlewareNameWithAliases(name, _aliases)}" middleware with ${entry.priority} priority in ${entry.step} step.`);
            }
            absoluteEntries.splice(toOverrideIndex, 1);
          }
        }
        for (const alias of aliases) {
          entriesNameSet.add(alias);
        }
      }
      absoluteEntries.push(entry);
    },
    addRelativeTo: (middleware, options) => {
      const { name, override, aliases: _aliases } = options;
      const entry = {
        middleware,
        ...options
      };
      const aliases = getAllAliases(name, _aliases);
      if (aliases.length > 0) {
        if (aliases.some((alias) => entriesNameSet.has(alias))) {
          if (!override)
            throw new Error(`Duplicate middleware name '${getMiddlewareNameWithAliases(name, _aliases)}'`);
          for (const alias of aliases) {
            const toOverrideIndex = relativeEntries.findIndex((entry2) => entry2.name === alias || entry2.aliases?.some((a3) => a3 === alias));
            if (toOverrideIndex === -1) {
              continue;
            }
            const toOverride = relativeEntries[toOverrideIndex];
            if (toOverride.toMiddleware !== entry.toMiddleware || toOverride.relation !== entry.relation) {
              throw new Error(`"${getMiddlewareNameWithAliases(toOverride.name, toOverride.aliases)}" middleware ${toOverride.relation} "${toOverride.toMiddleware}" middleware cannot be overridden by "${getMiddlewareNameWithAliases(name, _aliases)}" middleware ${entry.relation} "${entry.toMiddleware}" middleware.`);
            }
            relativeEntries.splice(toOverrideIndex, 1);
          }
        }
        for (const alias of aliases) {
          entriesNameSet.add(alias);
        }
      }
      relativeEntries.push(entry);
    },
    clone: () => cloneTo(constructStack()),
    use: (plugin) => {
      plugin.applyToStack(stack);
    },
    remove: (toRemove) => {
      if (typeof toRemove === "string")
        return removeByName(toRemove);
      else
        return removeByReference(toRemove);
    },
    removeByTag: (toRemove) => {
      let isRemoved = false;
      const filterCb = (entry) => {
        const { tags, name, aliases: _aliases } = entry;
        if (tags && tags.includes(toRemove)) {
          const aliases = getAllAliases(name, _aliases);
          for (const alias of aliases) {
            entriesNameSet.delete(alias);
          }
          isRemoved = true;
          return false;
        }
        return true;
      };
      absoluteEntries = absoluteEntries.filter(filterCb);
      relativeEntries = relativeEntries.filter(filterCb);
      return isRemoved;
    },
    concat: (from) => {
      const cloned = cloneTo(constructStack());
      cloned.use(from);
      cloned.identifyOnResolve(identifyOnResolve || cloned.identifyOnResolve() || (from.identifyOnResolve?.() ?? false));
      return cloned;
    },
    applyToStack: cloneTo,
    identify: () => {
      return getMiddlewareList(true).map((mw) => {
        const step = mw.step ?? mw.relation + " " + mw.toMiddleware;
        return getMiddlewareNameWithAliases(mw.name, mw.aliases) + " - " + step;
      });
    },
    identifyOnResolve(toggle) {
      if (typeof toggle === "boolean")
        identifyOnResolve = toggle;
      return identifyOnResolve;
    },
    resolve: (handler, context) => {
      for (const middleware of getMiddlewareList().map((entry) => entry.middleware).reverse()) {
        handler = middleware(handler, context);
      }
      if (identifyOnResolve) {
        console.log(stack.identify());
      }
      return handler;
    }
  };
  return stack;
};
var stepWeights = {
  initialize: 5,
  serialize: 4,
  build: 3,
  finalizeRequest: 2,
  deserialize: 1
};
var priorityWeights = {
  high: 3,
  normal: 2,
  low: 1
};

// node_modules/@smithy/core/dist-es/submodules/client/index.js
init_transport();
init_transport();

// node_modules/@smithy/core/dist-es/submodules/client/invalid-dependency/invalidProvider.js
var invalidProvider = (message) => () => Promise.reject(message);

// node_modules/@smithy/core/dist-es/submodules/client/smithy-client/client.js
var Client = class {
  constructor(config) {
    __publicField(this, "config");
    __publicField(this, "middlewareStack", constructStack());
    __publicField(this, "initConfig");
    __publicField(this, "handlers");
    this.config = config;
    const { protocol, protocolSettings } = config;
    if (protocolSettings) {
      if (typeof protocol === "function") {
        config.protocol = new protocol(protocolSettings);
      }
    }
  }
  send(command3, optionsOrCb, cb) {
    const options = typeof optionsOrCb !== "function" ? optionsOrCb : void 0;
    const callback = typeof optionsOrCb === "function" ? optionsOrCb : cb;
    const useHandlerCache = options === void 0 && this.config.cacheMiddleware === true;
    let handler;
    if (useHandlerCache) {
      if (!this.handlers) {
        this.handlers = /* @__PURE__ */ new WeakMap();
      }
      const handlers = this.handlers;
      if (handlers.has(command3.constructor)) {
        handler = handlers.get(command3.constructor);
      } else {
        handler = command3.resolveMiddleware(this.middlewareStack, this.config, options);
        handlers.set(command3.constructor, handler);
      }
    } else {
      delete this.handlers;
      handler = command3.resolveMiddleware(this.middlewareStack, this.config, options);
    }
    if (callback) {
      handler(command3).then((result) => callback(null, result.output), (err) => callback(err)).catch(() => {
      });
    } else {
      return handler(command3).then((result) => result.output);
    }
  }
  destroy() {
    this.config?.requestHandler?.destroy?.();
    delete this.handlers;
  }
};

// node_modules/@smithy/core/dist-es/submodules/client/smithy-client/command.js
init_dist_es();

// node_modules/@smithy/core/dist-es/submodules/client/smithy-client/schemaLogFilter.js
init_schema();
var SENSITIVE_STRING = "***SensitiveInformation***";
function schemaLogFilter(schema, data) {
  if (data == null) {
    return data;
  }
  const ns = NormalizedSchema.of(schema);
  if (ns.getMergedTraits().sensitive) {
    return SENSITIVE_STRING;
  }
  if (ns.isListSchema()) {
    const isSensitive = !!ns.getValueSchema().getMergedTraits().sensitive;
    if (isSensitive) {
      return SENSITIVE_STRING;
    }
  } else if (ns.isMapSchema()) {
    const isSensitive = !!ns.getKeySchema().getMergedTraits().sensitive || !!ns.getValueSchema().getMergedTraits().sensitive;
    if (isSensitive) {
      return SENSITIVE_STRING;
    }
  } else if (ns.isStructSchema() && typeof data === "object") {
    const object = data;
    const newObject = {};
    for (const [member2, memberNs] of ns.structIterator()) {
      if (object[member2] != null) {
        newObject[member2] = schemaLogFilter(memberNs, object[member2]);
      }
    }
    return newObject;
  }
  return data;
}

// node_modules/@smithy/core/dist-es/submodules/client/smithy-client/command.js
var Command = class {
  constructor() {
    __publicField(this, "middlewareStack", constructStack());
    __publicField(this, "schema");
  }
  static classBuilder() {
    return new ClassBuilder();
  }
  resolveMiddlewareWithContext(clientStack, configuration, options, { middlewareFn, clientName, commandName, inputFilterSensitiveLog, outputFilterSensitiveLog, smithyContext, additionalContext, CommandCtor }) {
    for (const mw of middlewareFn.bind(this)(CommandCtor, clientStack, configuration, options)) {
      this.middlewareStack.use(mw);
    }
    const stack = clientStack.concat(this.middlewareStack);
    const { logger: logger2 } = configuration;
    const additionalSmithyContext = additionalContext[SMITHY_CONTEXT_KEY];
    const handlerExecutionContext = {
      logger: logger2,
      clientName,
      commandName,
      inputFilterSensitiveLog,
      outputFilterSensitiveLog,
      ...additionalContext,
      [SMITHY_CONTEXT_KEY]: {
        ...additionalSmithyContext,
        commandInstance: this,
        ...smithyContext,
        ...options?.metricsRecorder === void 0 ? {} : { metricsRecorder: options.metricsRecorder }
      }
    };
    const { requestHandler } = configuration;
    let requestOptions = options ?? {};
    if (requestOptions.metricsRecorder) {
      requestOptions = { ...requestOptions };
      delete requestOptions.metricsRecorder;
    }
    if (smithyContext.eventStream) {
      requestOptions = {
        isEventStream: true,
        ...requestOptions
      };
    }
    return stack.resolve((request) => requestHandler.handle(request.request, requestOptions), handlerExecutionContext);
  }
};
var ClassBuilder = class {
  constructor() {
    __publicField(this, "_init", () => {
    });
    __publicField(this, "_ep", {});
    __publicField(this, "_middlewareFn", () => []);
    __publicField(this, "_commandName", "");
    __publicField(this, "_clientName", "");
    __publicField(this, "_additionalContext", {});
    __publicField(this, "_smithyContext", {});
    __publicField(this, "_inputFilterSensitiveLog");
    __publicField(this, "_outputFilterSensitiveLog");
    __publicField(this, "_serializer", null);
    __publicField(this, "_deserializer", null);
    __publicField(this, "_operationSchema");
  }
  init(cb) {
    this._init = cb;
  }
  ep(endpointParameterInstructions) {
    this._ep = endpointParameterInstructions;
    return this;
  }
  m(middlewareSupplier) {
    this._middlewareFn = middlewareSupplier;
    return this;
  }
  s(service, operation2, smithyContext = {}) {
    this._smithyContext = {
      service,
      operation: operation2,
      ...smithyContext
    };
    return this;
  }
  c(additionalContext = {}) {
    this._additionalContext = additionalContext;
    return this;
  }
  n(clientName, commandName) {
    this._clientName = clientName;
    this._commandName = commandName;
    return this;
  }
  f(inputFilter = (_) => _, outputFilter = (_) => _) {
    this._inputFilterSensitiveLog = inputFilter;
    this._outputFilterSensitiveLog = outputFilter;
    return this;
  }
  ser(serializer) {
    this._serializer = serializer;
    return this;
  }
  de(deserializer) {
    this._deserializer = deserializer;
    return this;
  }
  sc(operation2) {
    this._operationSchema = operation2;
    this._smithyContext.operationSchema = operation2;
    return this;
  }
  build() {
    const closure = this;
    let CommandRef;
    return CommandRef = class extends Command {
      constructor(...[input]) {
        super();
        __publicField(this, "input");
        __publicField(this, "serialize", closure._serializer);
        __publicField(this, "deserialize", closure._deserializer);
        this.input = input ?? {};
        closure._init(this);
        this.schema = closure._operationSchema;
      }
      static getEndpointParameterInstructions() {
        return closure._ep;
      }
      resolveMiddleware(stack, configuration, options) {
        const op = closure._operationSchema;
        const input = op?.[4] ?? op?.input;
        const output = op?.[5] ?? op?.output;
        return this.resolveMiddlewareWithContext(stack, configuration, options, {
          CommandCtor: CommandRef,
          middlewareFn: closure._middlewareFn,
          clientName: closure._clientName,
          commandName: closure._commandName,
          inputFilterSensitiveLog: closure._inputFilterSensitiveLog ?? (op ? schemaLogFilter.bind(null, input) : (_) => _),
          outputFilterSensitiveLog: closure._outputFilterSensitiveLog ?? (op ? schemaLogFilter.bind(null, output) : (_) => _),
          smithyContext: closure._smithyContext,
          additionalContext: closure._additionalContext
        });
      }
    };
  }
};

// node_modules/@smithy/core/dist-es/submodules/client/smithy-client/exceptions.js
var _ServiceException = class _ServiceException extends Error {
  constructor(options) {
    super(options.message);
    __publicField(this, "$fault");
    __publicField(this, "$response");
    __publicField(this, "$retryable");
    __publicField(this, "$metadata");
    Object.setPrototypeOf(this, Object.getPrototypeOf(this).constructor.prototype);
    this.name = options.name;
    this.$fault = options.$fault;
    this.$metadata = options.$metadata;
  }
  static isInstance(value) {
    if (!value)
      return false;
    const candidate = value;
    return _ServiceException.prototype.isPrototypeOf(candidate) || Boolean(candidate.$fault) && Boolean(candidate.$metadata) && (candidate.$fault === "client" || candidate.$fault === "server");
  }
  static [Symbol.hasInstance](instance) {
    if (!instance)
      return false;
    const candidate = instance;
    if (this === _ServiceException) {
      return _ServiceException.isInstance(instance);
    }
    if (_ServiceException.isInstance(instance)) {
      if (this.prototype.isPrototypeOf(instance)) {
        return true;
      }
      const targetId = Object.prototype.hasOwnProperty.call(this, "shapeId") ? this.shapeId : void 0;
      let candidateHasShapeId = false;
      if (targetId) {
        let proto = Object.getPrototypeOf(candidate);
        while (proto && proto !== Object.prototype) {
          const ctor = proto.constructor;
          const candidateId = ctor !== _ServiceException && Object.prototype.hasOwnProperty.call(ctor, "shapeId") ? ctor?.shapeId : void 0;
          if (candidateId) {
            candidateHasShapeId = true;
            if (candidateId === targetId) {
              return true;
            }
          }
          proto = Object.getPrototypeOf(proto);
        }
      }
      if (targetId && candidateHasShapeId) {
        return false;
      }
      const targetName = this.name;
      if (targetName && targetName.length >= 6) {
        if (candidate.name === targetName) {
          return true;
        }
        let proto = Object.getPrototypeOf(candidate);
        while (proto && proto !== Object.prototype) {
          const ctorName = proto.constructor?.name;
          if (ctorName && ctorName !== "Error" && ctorName === targetName) {
            return true;
          }
          proto = Object.getPrototypeOf(proto);
        }
      }
    }
    return false;
  }
};
__publicField(_ServiceException, "shapeId", "smithy.ts.sdk.synthetic.nonamespace.client#ServiceException");
var ServiceException = _ServiceException;
var decorateServiceException = (exception, additions = {}) => {
  Object.entries(additions).filter(([, v]) => v !== void 0).forEach(([k3, v]) => {
    if (exception[k3] == void 0 || exception[k3] === "") {
      exception[k3] = v;
    }
  });
  const message = exception.message || exception.Message || "UnknownError";
  exception.message = message;
  delete exception.Message;
  return exception;
};

// node_modules/@smithy/core/dist-es/submodules/client/smithy-client/defaults-mode.js
var loadConfigsForDefaultMode = (mode) => {
  switch (mode) {
    case "standard":
      return {
        retryMode: "standard",
        connectionTimeout: 3100
      };
    case "in-region":
      return {
        retryMode: "standard",
        connectionTimeout: 1100
      };
    case "cross-region":
      return {
        retryMode: "standard",
        connectionTimeout: 3100
      };
    case "mobile":
      return {
        retryMode: "standard",
        connectionTimeout: 3e4
      };
    default:
      return {};
  }
};

// node_modules/@smithy/core/dist-es/submodules/client/smithy-client/extensions/checksum.js
init_transport();
init_dist_es();
var knownAlgorithms = Object.values(AlgorithmId);
var getChecksumConfiguration = (runtimeConfig) => {
  const checksumAlgorithms = [];
  for (const id in AlgorithmId) {
    if (!hasOwn(AlgorithmId, id))
      continue;
    const algorithmId = AlgorithmId[id];
    if (runtimeConfig[algorithmId] === void 0) {
      continue;
    }
    checksumAlgorithms.push({
      algorithmId: () => algorithmId,
      checksumConstructor: () => runtimeConfig[algorithmId]
    });
  }
  for (const [id, ChecksumCtor] of Object.entries(runtimeConfig.checksumAlgorithms ?? {})) {
    checksumAlgorithms.push({
      algorithmId: () => id,
      checksumConstructor: () => ChecksumCtor
    });
  }
  return {
    addChecksumAlgorithm(algo) {
      runtimeConfig.checksumAlgorithms = runtimeConfig.checksumAlgorithms ?? {};
      const id = algo.algorithmId();
      const ctor = algo.checksumConstructor();
      if (knownAlgorithms.includes(id)) {
        runtimeConfig.checksumAlgorithms[id.toUpperCase()] = ctor;
      } else {
        runtimeConfig.checksumAlgorithms[id] = ctor;
      }
      checksumAlgorithms.push(algo);
    },
    checksumAlgorithms() {
      return checksumAlgorithms;
    }
  };
};
var resolveChecksumRuntimeConfig = (clientConfig) => {
  const runtimeConfig = {};
  clientConfig.checksumAlgorithms().forEach((checksumAlgorithm) => {
    const id = checksumAlgorithm.algorithmId();
    if (knownAlgorithms.includes(id)) {
      runtimeConfig[id] = checksumAlgorithm.checksumConstructor();
    }
  });
  return runtimeConfig;
};

// node_modules/@smithy/core/dist-es/submodules/client/smithy-client/extensions/retry.js
var getRetryConfiguration = (runtimeConfig) => {
  return {
    setRetryStrategy(retryStrategy) {
      runtimeConfig.retryStrategy = retryStrategy;
    },
    retryStrategy() {
      return runtimeConfig.retryStrategy;
    }
  };
};
var resolveRetryRuntimeConfig = (retryStrategyConfiguration) => {
  const runtimeConfig = {};
  runtimeConfig.retryStrategy = retryStrategyConfiguration.retryStrategy();
  return runtimeConfig;
};

// node_modules/@smithy/core/dist-es/submodules/client/smithy-client/extensions/defaultExtensionConfiguration.js
var getDefaultExtensionConfiguration = (runtimeConfig) => {
  return Object.assign(getChecksumConfiguration(runtimeConfig), getRetryConfiguration(runtimeConfig));
};
var resolveDefaultRuntimeConfig2 = (config) => {
  return Object.assign(resolveChecksumRuntimeConfig(config), resolveRetryRuntimeConfig(config));
};

// node_modules/@smithy/core/dist-es/submodules/client/smithy-client/NoOpLogger.js
var NoOpLogger = class {
  trace() {
  }
  debug() {
  }
  info() {
  }
  warn() {
  }
  error() {
  }
};

// node_modules/@smithy/core/dist-es/submodules/client/smithy-client/client-command-builder.js
function makeBuilder(common, service, name, ep) {
  return function makeCommand(added, plugins, op, $, smithyContext = {}) {
    const epMerged = Object.assign({}, common, added);
    return Command.classBuilder().ep(epMerged).m(function(CommandCtor, clientStack, config, options) {
      const list = plugins.call(this, CommandCtor, clientStack, config, options);
      list.unshift(ep(config, CommandCtor.getEndpointParameterInstructions()));
      return list;
    }).s(service, op, smithyContext).n(name, op.charAt(0).toUpperCase() + op.slice(1) + "Command").sc($).build();
  };
}

// node_modules/@smithy/core/dist-es/submodules/protocols/collect-stream-body.js
init_index_browser2();
var collectBody = async (streamBody = new Uint8Array(), context) => {
  if (streamBody instanceof Uint8Array) {
    return Uint8ArrayBlobAdapter.mutate(streamBody);
  }
  if (!streamBody) {
    return Uint8ArrayBlobAdapter.mutate(new Uint8Array());
  }
  const fromContext = context.streamCollector(streamBody);
  return Uint8ArrayBlobAdapter.mutate(await fromContext);
};

// node_modules/@smithy/core/dist-es/submodules/protocols/extended-encode-uri-component.js
function extendedEncodeURIComponent(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function(c3) {
    return "%" + c3.charCodeAt(0).toString(16).toUpperCase();
  });
}

// node_modules/@smithy/core/dist-es/submodules/protocols/HttpBindingProtocol.js
init_transport();
init_schema();
init_index_browser2();
init_transport();

// node_modules/@smithy/core/dist-es/submodules/protocols/HttpProtocol.js
init_transport();
init_schema();
init_transport();

// node_modules/@smithy/core/dist-es/submodules/protocols/SerdeContext.js
var SerdeContext = class {
  constructor() {
    __publicField(this, "serdeContext");
  }
  setSerdeContext(serdeContext) {
    this.serdeContext = serdeContext;
  }
};

// node_modules/@smithy/core/dist-es/submodules/protocols/HttpProtocol.js
var HttpProtocol = class extends SerdeContext {
  constructor(options) {
    super();
    __publicField(this, "options");
    __publicField(this, "compositeErrorRegistry");
    this.options = options;
    this.compositeErrorRegistry = new TypeRegistry(options.defaultNamespace);
    for (const etr of options.errorTypeRegistries ?? []) {
      this.compositeErrorRegistry.copyFrom(etr);
    }
  }
  getRequestType() {
    return HttpRequest;
  }
  getResponseType() {
    return HttpResponse;
  }
  setSerdeContext(serdeContext) {
    this.serdeContext = serdeContext;
    this.serializer.setSerdeContext(serdeContext);
    this.deserializer.setSerdeContext(serdeContext);
    if (this.getPayloadCodec()) {
      this.getPayloadCodec().setSerdeContext(serdeContext);
    }
  }
  updateServiceEndpoint(request, endpoint) {
    if ("url" in endpoint) {
      request.protocol = endpoint.url.protocol;
      request.hostname = endpoint.url.hostname;
      request.port = endpoint.url.port ? Number(endpoint.url.port) : void 0;
      request.path = endpoint.url.pathname;
      request.fragment = endpoint.url.hash || void 0;
      request.username = endpoint.url.username || void 0;
      request.password = endpoint.url.password || void 0;
      if (!request.query) {
        request.query = {};
      }
      for (const [k3, v] of endpoint.url.searchParams.entries()) {
        request.query[k3] = v;
      }
      if (endpoint.headers) {
        for (const name in endpoint.headers) {
          if (!hasOwn(endpoint.headers, name))
            continue;
          request.headers[name] = endpoint.headers[name].join(", ");
        }
      }
      return request;
    } else {
      request.protocol = endpoint.protocol;
      request.hostname = endpoint.hostname;
      request.port = endpoint.port ? Number(endpoint.port) : void 0;
      request.path = endpoint.path;
      request.query = {
        ...endpoint.query
      };
      if (endpoint.headers) {
        for (const name in endpoint.headers) {
          if (!hasOwn(endpoint.headers, name))
            continue;
          request.headers[name] = endpoint.headers[name];
        }
      }
      return request;
    }
  }
  setHostPrefix(request, operationSchema, input) {
    if (this.serdeContext?.disableHostPrefix) {
      return;
    }
    const inputNs = NormalizedSchema.of(operationSchema.input);
    const opTraits = translateTraits(operationSchema.traits ?? {});
    if (opTraits.endpoint) {
      let hostPrefix = opTraits.endpoint?.[0];
      if (typeof hostPrefix === "string") {
        for (const [name, member2] of inputNs.structIterator()) {
          if (!member2.getMergedTraits().hostLabel) {
            continue;
          }
          const replacement = input[name];
          if (typeof replacement !== "string") {
            throw new Error(`@smithy/core/schema - ${name} in input must be a string as hostLabel.`);
          }
          hostPrefix = hostPrefix.replace(`{${name}}`, replacement);
        }
        request.hostname = hostPrefix + request.hostname;
        if (!isValidHostname(request.hostname)) {
          throw new Error(`[${request.hostname}] is not a valid hostname.`);
        }
      }
    }
  }
  deserializeMetadata(output) {
    return {
      httpStatusCode: output.statusCode,
      requestId: output.headers["x-amzn-requestid"] ?? output.headers["x-amzn-request-id"] ?? output.headers["x-amz-request-id"],
      extendedRequestId: output.headers["x-amz-id-2"],
      cfId: output.headers["x-amz-cf-id"]
    };
  }
  resolveError(name, namespaces, registries) {
    const defaultErrorSchema = [-3, "", "Error", 0, [], [], 0];
    let schema;
    for (const registry of registries) {
      for (const ns of namespaces) {
        try {
          if (ns === "*") {
            schema = registry.getSchema(name);
          } else {
            schema = registry.getSchema(ns + "#" + name);
          }
          const errorCtor = registry.getErrorCtor(schema);
          if (errorCtor) {
            return [schema, errorCtor, "modeled"];
          } else {
            const syntheticErrorSchema = registry.getBaseException();
            if (syntheticErrorSchema) {
              const syntheticErrorCtor = registry.getErrorCtor(syntheticErrorSchema);
              if (syntheticErrorCtor) {
                return [schema, syntheticErrorCtor, "synthetic"];
              }
            }
          }
        } catch (ignored) {
        }
      }
    }
    for (const registry of registries) {
      const syntheticErrorSchema = registry.getBaseException();
      if (syntheticErrorSchema) {
        const syntheticErrorCtor = registry.getErrorCtor(syntheticErrorSchema);
        if (syntheticErrorCtor) {
          return [syntheticErrorSchema, syntheticErrorCtor, "synthetic"];
        }
      }
    }
    return [defaultErrorSchema, Error, "native"];
  }
  async serializeEventStream({ eventStream, requestSchema, initialRequest }) {
    const eventStreamSerde = await this.loadEventStreamCapability();
    return eventStreamSerde.serializeEventStream({
      eventStream,
      requestSchema,
      initialRequest
    });
  }
  async deserializeEventStream({ response, responseSchema, initialResponseContainer }) {
    const eventStreamSerde = await this.loadEventStreamCapability();
    return eventStreamSerde.deserializeEventStream({
      response,
      responseSchema,
      initialResponseContainer
    });
  }
  async loadEventStreamCapability() {
    const { EventStreamSerde: EventStreamSerde2, eventStreamSerdeProvider: eventStreamSerdeProvider3 } = await Promise.resolve().then(() => (init_index_browser4(), index_browser_exports));
    const marshaller = this.resolveEventStreamMarshaller(eventStreamSerdeProvider3);
    return new EventStreamSerde2({
      marshaller,
      serializer: this.serializer,
      deserializer: this.deserializer,
      serdeContext: this.serdeContext,
      defaultContentType: this.getDefaultContentType(),
      compositeErrorRegistry: this.compositeErrorRegistry
    });
  }
  getDefaultContentType() {
    throw new Error(`@smithy/core/protocols - ${this.constructor.name} getDefaultContentType() implementation missing.`);
  }
  async deserializeHttpMessage(schema, context, response, arg4, arg5) {
    void schema;
    void context;
    void response;
    void arg4;
    void arg5;
    return [];
  }
  getEventStreamMarshaller() {
    const context = this.serdeContext;
    if (!context.eventStreamMarshaller) {
      throw new Error("@smithy/core - HttpProtocol: eventStreamMarshaller missing in serdeContext.");
    }
    return context.eventStreamMarshaller;
  }
  resolveEventStreamMarshaller(importedProvider) {
    const context = this.serdeContext;
    if (context.eventStreamMarshaller) {
      return context.eventStreamMarshaller;
    }
    return importedProvider(this.serdeContext);
  }
};

// node_modules/@smithy/core/dist-es/submodules/protocols/HttpBindingProtocol.js
var HttpBindingProtocol = class extends HttpProtocol {
  async serializeRequest(operationSchema, _input, context) {
    const input = _input && typeof _input === "object" ? _input : {};
    const serializer = this.serializer;
    const query = {};
    const headers = {};
    const endpoint = await context.endpoint();
    const ns = NormalizedSchema.of(operationSchema?.input);
    const payloadMemberNames = [];
    const payloadMemberSchemas = [];
    let hasNonHttpBindingMember = false;
    let payload;
    const request = new HttpRequest({
      protocol: "",
      hostname: "",
      port: void 0,
      path: "",
      fragment: void 0,
      query,
      headers,
      body: void 0
    });
    if (endpoint) {
      this.updateServiceEndpoint(request, endpoint);
      this.setHostPrefix(request, operationSchema, input);
      const opTraits = translateTraits(operationSchema.traits);
      if (opTraits.http) {
        request.method = opTraits.http[0];
        const [path, search] = opTraits.http[1].split("?");
        if (request.path == "/") {
          request.path = path;
        } else {
          request.path += path;
        }
        const traitSearchParams = new URLSearchParams(search ?? "");
        for (const [key, value] of traitSearchParams) {
          query[key] = value;
        }
      }
    }
    for (const [memberName, memberNs] of ns.structIterator()) {
      const memberTraits = memberNs.getMergedTraits() ?? {};
      const inputMemberValue = input[memberName];
      if (inputMemberValue == null && !memberNs.isIdempotencyToken()) {
        if (memberTraits.httpLabel) {
          if (request.path.includes(`{${memberName}+}`) || request.path.includes(`{${memberName}}`)) {
            throw new Error(`No value provided for input HTTP label: ${memberName}.`);
          }
        }
        continue;
      }
      if (memberTraits.httpPayload) {
        const isStreaming = memberNs.isStreaming();
        if (isStreaming) {
          const isEventStream = memberNs.isStructSchema();
          if (isEventStream) {
            if (input[memberName]) {
              payload = await this.serializeEventStream({
                eventStream: input[memberName],
                requestSchema: ns
              });
            }
          } else {
            payload = inputMemberValue;
          }
        } else {
          serializer.write(memberNs, inputMemberValue);
          payload = serializer.flush();
        }
      } else if (memberTraits.httpLabel) {
        serializer.write(memberNs, inputMemberValue);
        const replacement = serializer.flush();
        if (request.path.includes(`{${memberName}+}`)) {
          request.path = request.path.replace(`{${memberName}+}`, replacement.split("/").map(extendedEncodeURIComponent).join("/"));
        } else if (request.path.includes(`{${memberName}}`)) {
          request.path = request.path.replace(`{${memberName}}`, extendedEncodeURIComponent(replacement));
        }
      } else if (memberTraits.httpHeader) {
        serializer.write(memberNs, inputMemberValue);
        headers[memberTraits.httpHeader.toLowerCase()] = String(serializer.flush());
      } else if (typeof memberTraits.httpPrefixHeaders === "string") {
        for (const key in inputMemberValue) {
          if (!hasOwn(inputMemberValue, key))
            continue;
          const val = inputMemberValue[key];
          const amalgam = memberTraits.httpPrefixHeaders + key;
          serializer.write([memberNs.getValueSchema(), { httpHeader: amalgam }], val);
          headers[amalgam.toLowerCase()] = serializer.flush();
        }
      } else if (memberTraits.httpQuery || memberTraits.httpQueryParams) {
        this.serializeQuery(memberNs, inputMemberValue, query);
      } else {
        hasNonHttpBindingMember = true;
        payloadMemberNames.push(memberName);
        payloadMemberSchemas.push(memberNs);
      }
    }
    if (hasNonHttpBindingMember && input) {
      const [namespace, name] = (ns.getName(true) ?? "#Unknown").split("#");
      const requiredMembers = ns.getSchema()[6];
      const payloadSchema = [
        3,
        namespace,
        name,
        ns.getMergedTraits(),
        payloadMemberNames,
        payloadMemberSchemas,
        void 0
      ];
      if (requiredMembers) {
        payloadSchema[6] = requiredMembers;
      } else {
        payloadSchema.pop();
      }
      serializer.write(payloadSchema, input);
      payload = serializer.flush();
    }
    request.headers = headers;
    request.query = query;
    request.body = payload;
    return request;
  }
  serializeQuery(ns, data, query) {
    const serializer = this.serializer;
    const traits = ns.getMergedTraits();
    if (traits.httpQueryParams) {
      for (const key in data) {
        if (!hasOwn(data, key))
          continue;
        if (!(key in query)) {
          const val = data[key];
          const valueSchema = ns.getValueSchema();
          Object.assign(valueSchema.getMergedTraits(), {
            ...traits,
            httpQuery: key,
            httpQueryParams: void 0
          });
          this.serializeQuery(valueSchema, val, query);
        }
      }
      return;
    }
    if (ns.isListSchema()) {
      const sparse = !!ns.getMergedTraits().sparse;
      const buffer = [];
      for (const item of data) {
        serializer.write([ns.getValueSchema(), traits], item);
        const serializable = serializer.flush();
        if (sparse || serializable !== void 0) {
          buffer.push(serializable);
        }
      }
      query[traits.httpQuery] = buffer;
    } else {
      serializer.write([ns, traits], data);
      query[traits.httpQuery] = serializer.flush();
    }
  }
  async deserializeResponse(operationSchema, context, response) {
    const deserializer = this.deserializer;
    const ns = NormalizedSchema.of(operationSchema.output);
    const dataObject = {};
    if (response.statusCode >= 300) {
      const bytes = await collectBody(response.body, context);
      if (bytes.byteLength > 0) {
        Object.assign(dataObject, await deserializer.read(15, bytes));
      }
      await this.handleError(operationSchema, context, response, dataObject, this.deserializeMetadata(response));
      throw new Error("@smithy/core/protocols - HTTP Protocol error handler failed to throw.");
    }
    for (const header in response.headers) {
      if (!hasOwn(response.headers, header))
        continue;
      const value = response.headers[header];
      delete response.headers[header];
      response.headers[header.toLowerCase()] = value;
    }
    const nonHttpBindingMembers = await this.deserializeHttpMessage(ns, context, response, dataObject);
    if (nonHttpBindingMembers.length) {
      const bytes = await collectBody(response.body, context);
      if (bytes.byteLength > 0) {
        const dataFromBody = await deserializer.read(ns, bytes);
        for (const member2 of nonHttpBindingMembers) {
          if (dataFromBody[member2] != null) {
            dataObject[member2] = dataFromBody[member2];
          }
        }
      }
    } else if (nonHttpBindingMembers.discardResponseBody) {
      await collectBody(response.body, context);
    }
    dataObject.$metadata = this.deserializeMetadata(response);
    return dataObject;
  }
  async deserializeHttpMessage(schema, context, response, arg4, arg5) {
    let dataObject;
    if (arg4 instanceof Set) {
      dataObject = arg5;
    } else {
      dataObject = arg4;
    }
    let discardResponseBody = true;
    const deserializer = this.deserializer;
    const ns = NormalizedSchema.of(schema);
    const nonHttpBindingMembers = [];
    for (const [memberName, memberSchema] of ns.structIterator()) {
      const memberTraits = memberSchema.getMemberTraits();
      if (memberTraits.httpPayload) {
        discardResponseBody = false;
        const isStreaming = memberSchema.isStreaming();
        if (isStreaming) {
          const isEventStream = memberSchema.isStructSchema();
          if (isEventStream) {
            dataObject[memberName] = await this.deserializeEventStream({
              response,
              responseSchema: ns
            });
          } else {
            dataObject[memberName] = sdkStreamMixin(response.body);
          }
        } else if (response.body) {
          const bytes = await collectBody(response.body, context);
          if (bytes.byteLength > 0) {
            dataObject[memberName] = await deserializer.read(memberSchema, bytes);
          }
        }
      } else if (memberTraits.httpHeader) {
        const key = String(memberTraits.httpHeader).toLowerCase();
        const value = response.headers[key];
        if (null != value) {
          if (memberSchema.isListSchema()) {
            const headerListValueSchema = memberSchema.getValueSchema();
            headerListValueSchema.getMergedTraits().httpHeader = key;
            let sections;
            if (headerListValueSchema.isTimestampSchema() && headerListValueSchema.getSchema() === 4) {
              sections = splitEvery(value, ",", 2);
            } else {
              sections = splitHeader(value);
            }
            const list = [];
            for (const section of sections) {
              list.push(await deserializer.read(headerListValueSchema, section.trim()));
            }
            dataObject[memberName] = list;
          } else {
            dataObject[memberName] = await deserializer.read(memberSchema, value);
          }
        }
      } else if (memberTraits.httpPrefixHeaders !== void 0) {
        dataObject[memberName] = {};
        for (const header in response.headers) {
          if (!hasOwn(response.headers, header))
            continue;
          if (header.startsWith(memberTraits.httpPrefixHeaders)) {
            const value = response.headers[header];
            const valueSchema = memberSchema.getValueSchema();
            valueSchema.getMergedTraits().httpHeader = header;
            dataObject[memberName][header.slice(memberTraits.httpPrefixHeaders.length)] = await deserializer.read(valueSchema, value);
          }
        }
      } else if (memberTraits.httpResponseCode) {
        dataObject[memberName] = response.statusCode;
      } else {
        nonHttpBindingMembers.push(memberName);
      }
    }
    nonHttpBindingMembers.discardResponseBody = discardResponseBody;
    return nonHttpBindingMembers;
  }
};

// node_modules/@smithy/core/dist-es/submodules/protocols/RpcProtocol.js
init_transport();
init_schema();
init_transport();
var RpcProtocol = class extends HttpProtocol {
  async serializeRequest(operationSchema, _input, context) {
    const serializer = this.serializer;
    const query = {};
    const headers = {};
    const endpoint = await context.endpoint();
    const ns = NormalizedSchema.of(operationSchema?.input);
    const schema = ns.getSchema();
    let payload;
    const input = _input && typeof _input === "object" ? _input : {};
    const request = new HttpRequest({
      protocol: "",
      hostname: "",
      port: void 0,
      path: "/",
      fragment: void 0,
      query,
      headers,
      body: void 0
    });
    if (endpoint) {
      this.updateServiceEndpoint(request, endpoint);
      this.setHostPrefix(request, operationSchema, input);
    }
    if (input) {
      const eventStreamMember = ns.getEventStreamMember();
      if (eventStreamMember) {
        if (input[eventStreamMember]) {
          const initialRequest = {};
          for (const [memberName] of ns.structIterator()) {
            if (memberName !== eventStreamMember && input[memberName] != null) {
              initialRequest[memberName] = input[memberName];
            }
          }
          payload = await this.serializeEventStream({
            eventStream: input[eventStreamMember],
            requestSchema: ns,
            initialRequest
          });
        }
      } else {
        serializer.write(schema, input);
        payload = serializer.flush();
      }
    }
    request.headers = Object.assign(request.headers, headers);
    request.query = query;
    request.body = payload;
    request.method = "POST";
    return request;
  }
  async deserializeResponse(operationSchema, context, response) {
    const deserializer = this.deserializer;
    const ns = NormalizedSchema.of(operationSchema.output);
    const dataObject = {};
    if (response.statusCode >= 300) {
      const bytes = await collectBody(response.body, context);
      if (bytes.byteLength > 0) {
        Object.assign(dataObject, await deserializer.read(15, bytes));
      }
      await this.handleError(operationSchema, context, response, dataObject, this.deserializeMetadata(response));
      throw new Error("@smithy/core/protocols - RPC Protocol error handler failed to throw.");
    }
    for (const header in response.headers) {
      if (!hasOwn(response.headers, header))
        continue;
      const value = response.headers[header];
      delete response.headers[header];
      response.headers[header.toLowerCase()] = value;
    }
    const eventStreamMember = ns.getEventStreamMember();
    if (eventStreamMember) {
      dataObject[eventStreamMember] = await this.deserializeEventStream({
        response,
        responseSchema: ns,
        initialResponseContainer: dataObject
      });
    } else {
      const bytes = await collectBody(response.body, context);
      if (bytes.byteLength > 0) {
        Object.assign(dataObject, await deserializer.read(ns, bytes));
      }
    }
    dataObject.$metadata = this.deserializeMetadata(response);
    return dataObject;
  }
};

// node_modules/@smithy/core/dist-es/submodules/protocols/serde/FromStringShapeDeserializer.js
init_schema();
init_index_browser2();

// node_modules/@smithy/core/dist-es/submodules/protocols/serde/determineTimestampFormat.js
function determineTimestampFormat(ns, settings) {
  if (settings.timestampFormat.useTrait) {
    if (ns.isTimestampSchema() && (ns.getSchema() === 5 || ns.getSchema() === 6 || ns.getSchema() === 7)) {
      return ns.getSchema();
    }
  }
  const { httpLabel, httpPrefixHeaders, httpHeader, httpQuery } = ns.getMergedTraits();
  const bindingFormat = settings.httpBindings ? typeof httpPrefixHeaders === "string" || Boolean(httpHeader) ? 6 : Boolean(httpQuery) || Boolean(httpLabel) ? 5 : void 0 : void 0;
  return bindingFormat ?? settings.timestampFormat.default;
}

// node_modules/@smithy/core/dist-es/submodules/protocols/serde/FromStringShapeDeserializer.js
var FromStringShapeDeserializer = class extends SerdeContext {
  constructor(settings) {
    super();
    __publicField(this, "settings");
    this.settings = settings;
  }
  read(_schema, data) {
    const ns = NormalizedSchema.of(_schema);
    if (ns.isListSchema()) {
      return splitHeader(data).map((item) => this.read(ns.getValueSchema(), item));
    }
    if (ns.isBlobSchema()) {
      return (this.serdeContext?.base64Decoder ?? fromBase64)(data);
    }
    if (ns.isTimestampSchema()) {
      const format2 = determineTimestampFormat(ns, this.settings);
      switch (format2) {
        case 5:
          return _parseRfc3339DateTimeWithOffset(data);
        case 6:
          return _parseRfc7231DateTime(data);
        case 7:
          return _parseEpochTimestamp(data);
        default:
          console.warn("Missing timestamp format, parsing value with Date constructor:", data);
          return new Date(data);
      }
    }
    if (ns.isStringSchema()) {
      const mediaType = ns.getMergedTraits().mediaType;
      let intermediateValue = data;
      if (mediaType) {
        if (ns.getMergedTraits().httpHeader) {
          intermediateValue = this.base64ToUtf8(intermediateValue);
        }
        const isJson = mediaType === "application/json" || mediaType.endsWith("+json");
        if (isJson) {
          intermediateValue = LazyJsonString.from(intermediateValue);
        }
        return intermediateValue;
      }
    }
    if (ns.isNumericSchema()) {
      return Number(data);
    }
    if (ns.isBigIntegerSchema()) {
      return BigInt(data);
    }
    if (ns.isBigDecimalSchema()) {
      return new NumericValue(data, "bigDecimal");
    }
    if (ns.isBooleanSchema()) {
      return String(data).toLowerCase() === "true";
    }
    return data;
  }
  base64ToUtf8(base64String) {
    return (this.serdeContext?.utf8Encoder ?? toUtf8)((this.serdeContext?.base64Decoder ?? fromBase64)(base64String));
  }
};

// node_modules/@smithy/core/dist-es/submodules/protocols/serde/HttpInterceptingShapeDeserializer.js
init_schema();
init_index_browser2();
var HttpInterceptingShapeDeserializer = class extends SerdeContext {
  constructor(codecDeserializer, codecSettings) {
    super();
    __publicField(this, "codecDeserializer");
    __publicField(this, "stringDeserializer");
    this.codecDeserializer = codecDeserializer;
    this.stringDeserializer = new FromStringShapeDeserializer(codecSettings);
  }
  setSerdeContext(serdeContext) {
    this.stringDeserializer.setSerdeContext(serdeContext);
    this.codecDeserializer.setSerdeContext(serdeContext);
    this.serdeContext = serdeContext;
  }
  read(schema, data) {
    const ns = NormalizedSchema.of(schema);
    const traits = ns.getMergedTraits();
    const toString = this.serdeContext?.utf8Encoder ?? toUtf8;
    if (traits.httpHeader || traits.httpResponseCode) {
      return this.stringDeserializer.read(ns, toString(data));
    }
    if (traits.httpPayload) {
      if (ns.isBlobSchema()) {
        const toBytes = this.serdeContext?.utf8Decoder ?? fromUtf8;
        if (typeof data === "string") {
          return toBytes(data);
        }
        return data;
      } else if (ns.isStringSchema()) {
        if ("byteLength" in data) {
          return toString(data);
        }
        return data;
      }
    }
    return this.codecDeserializer.read(ns, data);
  }
};

// node_modules/@smithy/core/dist-es/submodules/protocols/serde/HttpInterceptingShapeSerializer.js
init_schema();

// node_modules/@smithy/core/dist-es/submodules/protocols/serde/ToStringShapeSerializer.js
init_schema();
init_index_browser2();
var ToStringShapeSerializer = class extends SerdeContext {
  constructor(settings) {
    super();
    __publicField(this, "settings");
    __publicField(this, "stringBuffer", "");
    this.settings = settings;
  }
  write(schema, value) {
    const ns = NormalizedSchema.of(schema);
    switch (typeof value) {
      case "object":
        if (value === null) {
          this.stringBuffer = "null";
          return;
        }
        if (ns.isTimestampSchema()) {
          if (!(value instanceof Date)) {
            throw new Error(`@smithy/core/protocols - received non-Date value ${value} when schema expected Date in ${ns.getName(true)}`);
          }
          const format2 = determineTimestampFormat(ns, this.settings);
          switch (format2) {
            case 5:
              this.stringBuffer = value.toISOString().replace(".000Z", "Z");
              break;
            case 6:
              this.stringBuffer = dateToUtcString(value);
              break;
            case 7:
              this.stringBuffer = String(value.getTime() / 1e3);
              break;
            default:
              console.warn("Missing timestamp format, using epoch seconds", value);
              this.stringBuffer = String(value.getTime() / 1e3);
          }
          return;
        }
        if (ns.isBlobSchema() && "byteLength" in value) {
          this.stringBuffer = (this.serdeContext?.base64Encoder ?? toBase64)(value);
          return;
        }
        if (ns.isListSchema() && Array.isArray(value)) {
          let buffer = "";
          for (const item of value) {
            this.write([ns.getValueSchema(), ns.getMergedTraits()], item);
            const headerItem = this.flush();
            const serialized = ns.getValueSchema().isTimestampSchema() ? headerItem : quoteHeader(headerItem);
            if (buffer !== "") {
              buffer += ", ";
            }
            buffer += serialized;
          }
          this.stringBuffer = buffer;
          return;
        }
        this.stringBuffer = JSON.stringify(value, null, 2);
        break;
      case "string":
        const mediaType = ns.getMergedTraits().mediaType;
        let intermediateValue = value;
        if (mediaType) {
          const isJson = mediaType === "application/json" || mediaType.endsWith("+json");
          if (isJson) {
            intermediateValue = LazyJsonString.from(intermediateValue);
          }
          if (ns.getMergedTraits().httpHeader) {
            this.stringBuffer = (this.serdeContext?.base64Encoder ?? toBase64)(intermediateValue.toString());
            return;
          }
        }
        this.stringBuffer = value;
        break;
      default:
        if (ns.isIdempotencyToken()) {
          this.stringBuffer = generateIdempotencyToken();
        } else {
          this.stringBuffer = String(value);
        }
    }
  }
  flush() {
    const buffer = this.stringBuffer;
    this.stringBuffer = "";
    return buffer;
  }
};

// node_modules/@smithy/core/dist-es/submodules/protocols/serde/HttpInterceptingShapeSerializer.js
var HttpInterceptingShapeSerializer = class {
  constructor(codecSerializer, codecSettings, stringSerializer = new ToStringShapeSerializer(codecSettings)) {
    __publicField(this, "codecSerializer");
    __publicField(this, "stringSerializer");
    __publicField(this, "buffer");
    this.codecSerializer = codecSerializer;
    this.stringSerializer = stringSerializer;
  }
  setSerdeContext(serdeContext) {
    this.codecSerializer.setSerdeContext(serdeContext);
    this.stringSerializer.setSerdeContext(serdeContext);
  }
  write(schema, value) {
    const ns = NormalizedSchema.of(schema);
    const traits = ns.getMergedTraits();
    if (traits.httpHeader || traits.httpLabel || traits.httpQuery) {
      this.stringSerializer.write(ns, value);
      this.buffer = this.stringSerializer.flush();
      return;
    }
    return this.codecSerializer.write(ns, value);
  }
  flush() {
    if (this.buffer !== void 0) {
      const buffer = this.buffer;
      this.buffer = void 0;
      return buffer;
    }
    return this.codecSerializer.flush();
  }
};

// node_modules/@smithy/core/dist-es/submodules/protocols/index.js
init_transport();
init_transport();

// node_modules/@smithy/core/dist-es/submodules/protocols/protocol-http/extensions/httpExtensionConfiguration.js
var getHttpHandlerExtensionConfiguration = (runtimeConfig) => {
  if (runtimeConfig.logger && runtimeConfig.logger.constructor?.name !== "NoOpLogger") {
    runtimeConfig.requestHandler?.updateHttpClientConfig?.(/* @__PURE__ */ Symbol.for("logger"), runtimeConfig.logger);
  }
  return {
    setHttpHandler(handler) {
      runtimeConfig.requestHandler = handler;
    },
    httpHandler() {
      return runtimeConfig.requestHandler;
    },
    updateHttpClientConfig(key, value) {
      runtimeConfig.requestHandler?.updateHttpClientConfig(key, value);
    },
    httpHandlerConfigs() {
      return runtimeConfig.requestHandler.httpHandlerConfigs();
    }
  };
};
var resolveHttpHandlerRuntimeConfig = (httpHandlerExtensionConfiguration) => {
  return {
    requestHandler: httpHandlerExtensionConfiguration.httpHandler()
  };
};

// node_modules/@smithy/core/dist-es/submodules/protocols/middleware-content-length/contentLengthMiddleware.js
init_transport();
var CONTENT_LENGTH_HEADER = "content-length";
function contentLengthMiddleware(bodyLengthChecker) {
  return (next) => async (args) => {
    const request = args.request;
    if (HttpRequest.isInstance(request)) {
      const { body, headers } = request;
      if (body && Object.keys(headers).map((str) => str.toLowerCase()).indexOf(CONTENT_LENGTH_HEADER) === -1) {
        try {
          const length = bodyLengthChecker(body);
          if (length != null) {
            request.headers = {
              ...request.headers,
              [CONTENT_LENGTH_HEADER]: String(length)
            };
          }
        } catch (ignored) {
        }
      }
    }
    return next({
      ...args,
      request
    });
  };
}
var contentLengthMiddlewareOptions = {
  step: "build",
  tags: ["SET_CONTENT_LENGTH", "CONTENT_LENGTH"],
  name: "contentLengthMiddleware",
  override: true
};
var getContentLengthPlugin = (options) => ({
  applyToStack: (clientStack) => {
    clientStack.add(contentLengthMiddleware(options.bodyLengthChecker), contentLengthMiddlewareOptions);
  }
});

// node_modules/@smithy/core/dist-es/submodules/protocols/util-uri-escape/escape-uri.js
var escapeUri = (uri) => encodeURIComponent(uri).replace(/[!'()*]/g, hexEncode);
var hexEncode = (c3) => `%${c3.charCodeAt(0).toString(16).toUpperCase()}`;

// node_modules/@smithy/core/dist-es/submodules/protocols/querystring-builder/buildQueryString.js
function buildQueryString(query) {
  const parts = [];
  for (let key of Object.keys(query).sort()) {
    const value = query[key];
    key = escapeUri(key);
    if (Array.isArray(value)) {
      for (let i3 = 0, iLen = value.length; i3 < iLen; i3++) {
        parts.push(`${key}=${escapeUri(value[i3])}`);
      }
    } else {
      let qsEntry = key;
      if (value || typeof value === "string") {
        qsEntry += `=${escapeUri(value)}`;
      }
      parts.push(qsEntry);
    }
  }
  return parts.join("&");
}

// node_modules/@smithy/core/dist-es/submodules/protocols/index.js
init_transport();

// node_modules/@smithy/core/dist-es/submodules/retry/middleware-retry/retryMiddleware.js
init_index_browser2();

// node_modules/@smithy/core/dist-es/submodules/retry/service-error-classification/constants.js
var THROTTLING_ERROR_CODES = [
  "BandwidthLimitExceeded",
  "EC2ThrottledException",
  "LimitExceededException",
  "PriorRequestNotComplete",
  "ProvisionedThroughputExceededException",
  "RequestLimitExceeded",
  "RequestThrottled",
  "RequestThrottledException",
  "SlowDown",
  "ThrottledException",
  "Throttling",
  "ThrottlingException",
  "TooManyRequestsException",
  "TransactionInProgressException"
];
var TRANSIENT_ERROR_CODES = ["TimeoutError", "RequestTimeout", "RequestTimeoutException"];
var TRANSIENT_ERROR_STATUS_CODES = [500, 502, 503, 504];
var NODEJS_TIMEOUT_ERROR_CODES = ["ECONNRESET", "ECONNREFUSED", "EPIPE", "ETIMEDOUT"];
var NODEJS_NETWORK_ERROR_CODES = ["EHOSTUNREACH", "ENETUNREACH", "ENOTFOUND", "EAI_AGAIN"];

// node_modules/@smithy/core/dist-es/submodules/retry/service-error-classification/service-error-classification.js
var isRetryableByTrait = (error) => error?.$retryable !== void 0;
var isClockSkewCorrectedError = (error) => error.$metadata?.clockSkewCorrected;
var isBrowserNetworkError = (error) => {
  const errorMessages = /* @__PURE__ */ new Set([
    "Failed to fetch",
    "NetworkError when attempting to fetch resource",
    "The Internet connection appears to be offline",
    "Load failed",
    "Network request failed"
  ]);
  const isValid = error && error instanceof TypeError;
  if (!isValid) {
    return false;
  }
  return errorMessages.has(error.message);
};
var isThrottlingError = (error) => error.$metadata?.httpStatusCode === 429 || THROTTLING_ERROR_CODES.includes(error.name) || error.$retryable?.throttling == true;
var isTransientError = (error, depth = 0) => error?.name !== "AbortError" && (isRetryableByTrait(error) || isClockSkewCorrectedError(error) || error.name === "InvalidSignatureException" && error.message?.includes("Signature expired") || TRANSIENT_ERROR_CODES.includes(error.name) || NODEJS_TIMEOUT_ERROR_CODES.includes(error?.code || "") || NODEJS_NETWORK_ERROR_CODES.includes(error?.code || "") || TRANSIENT_ERROR_STATUS_CODES.includes(error.$metadata?.httpStatusCode || 0) || isBrowserNetworkError(error) || isNodeJsHttp2TransientError(error) || error.cause !== void 0 && depth <= 10 && isTransientError(error.cause, depth + 1));
var isServerError = (error) => {
  if (error.$metadata?.httpStatusCode !== void 0) {
    const statusCode = error.$metadata.httpStatusCode;
    if (500 <= statusCode && statusCode <= 599 && !isTransientError(error)) {
      return true;
    }
    return false;
  }
  return false;
};
function isNodeJsHttp2TransientError(error) {
  return error.code === "ERR_HTTP2_STREAM_ERROR" && error.message.includes("NGHTTP2_REFUSED_STREAM");
}

// node_modules/@smithy/core/dist-es/submodules/retry/util-retry/constants.js
var MAXIMUM_RETRY_DELAY = 20 * 1e3;
var INITIAL_RETRY_TOKENS = 500;
var NO_RETRY_INCREMENT = 1;
var INVOCATION_ID_HEADER = "amz-sdk-invocation-id";
var REQUEST_HEADER = "amz-sdk-request";

// node_modules/@smithy/core/dist-es/submodules/retry/middleware-retry/parseRetryAfterHeader.js
init_transport();
init_index_browser2();
function parseRetryAfterHeader(response, logger2) {
  if (!HttpResponse.isInstance(response)) {
    return;
  }
  for (const header in response.headers) {
    if (!hasOwn(response.headers, header))
      continue;
    const h3 = header.toLowerCase();
    if (h3 === "retry-after") {
      const retryAfter = response.headers[header];
      let retryAfterSeconds = NaN;
      if (retryAfter.endsWith("GMT")) {
        try {
          const date2 = parseRfc7231DateTime(retryAfter);
          retryAfterSeconds = (date2.getTime() - Date.now()) / 1e3;
        } catch (e3) {
          logger2?.trace?.("Failed to parse retry-after header");
          logger2?.trace?.(e3);
        }
      } else if (retryAfter.match(/ GMT, ((\d+)|(\d+\.\d+))$/)) {
        retryAfterSeconds = Number(retryAfter.match(/ GMT, ([\d.]+)$/)?.[1]);
      } else if (retryAfter.match(/^((\d+)|(\d+\.\d+))$/)) {
        retryAfterSeconds = Number(retryAfter);
      } else if (Date.parse(retryAfter) >= Date.now()) {
        retryAfterSeconds = (Date.parse(retryAfter) - Date.now()) / 1e3;
      }
      if (isNaN(retryAfterSeconds)) {
        return;
      }
      return new Date(Date.now() + retryAfterSeconds * 1e3);
    } else if (h3 === "x-amz-retry-after") {
      const v = response.headers[header];
      const backoffMilliseconds = Number(v);
      if (isNaN(backoffMilliseconds)) {
        logger2?.trace?.(`Failed to parse x-amz-retry-after=${v}`);
        return;
      }
      return new Date(Date.now() + backoffMilliseconds);
    }
  }
}

// node_modules/@smithy/core/dist-es/submodules/retry/middleware-retry/util.js
var asSdkError = (error) => {
  if (error instanceof Error)
    return error;
  if (error instanceof Object)
    return Object.assign(new Error(), error);
  if (typeof error === "string")
    return new Error(error);
  return new Error(`AWS SDK error wrapper for ${error}`);
};

// node_modules/@smithy/core/dist-es/submodules/retry/middleware-retry/retryMiddleware.js
function bindRetryMiddleware(isStreamingPayload2) {
  return (options) => (next, context) => async (args) => {
    let retryStrategy = await options.retryStrategy();
    const maxAttempts = await options.maxAttempts();
    if (isRetryStrategyV2(retryStrategy)) {
      retryStrategy = retryStrategy;
      let retryToken = await retryStrategy.acquireInitialRetryToken((context["partition_id"] ?? "") + (context.__retryLongPoll ? ":longpoll" : ""));
      let lastError = new Error();
      let attempts = 0;
      let totalRetryDelay = 0;
      const { request } = args;
      const isRequest = HttpRequest.isInstance(request);
      if (isRequest) {
        request.headers[INVOCATION_ID_HEADER] = v4();
      }
      while (true) {
        try {
          if (isRequest) {
            request.headers[REQUEST_HEADER] = `attempt=${attempts + 1}; max=${maxAttempts}`;
          }
          const { response, output } = await next(args);
          retryStrategy.recordSuccess(retryToken);
          output.$metadata.attempts = attempts + 1;
          output.$metadata.totalRetryDelay = totalRetryDelay;
          return { response, output };
        } catch (e3) {
          const retryErrorInfo = getRetryErrorInfo(e3, options.logger);
          lastError = asSdkError(e3);
          if (isRequest && isStreamingPayload2(request)) {
            (context.logger instanceof NoOpLogger ? console : context.logger)?.warn("An error was encountered in a non-retryable streaming request.");
            throw lastError;
          }
          try {
            retryToken = await retryStrategy.refreshRetryTokenForRetry(retryToken, retryErrorInfo);
          } catch (ignoredRefreshError) {
            if (!lastError.$metadata) {
              lastError.$metadata = {};
            }
            lastError.$metadata.attempts = attempts + 1;
            lastError.$metadata.totalRetryDelay = totalRetryDelay;
            throw lastError;
          }
          attempts = retryToken.getRetryCount();
          const delay = retryToken.getRetryDelay();
          totalRetryDelay += (retryToken?.$retryLog?.acquisitionDelay ?? 0) + delay;
          if (delay > 0) {
            await cooldown(delay);
          }
        }
      }
    } else {
      retryStrategy = retryStrategy;
      if (retryStrategy?.mode) {
        context.userAgent = [...context.userAgent || [], ["cfg/retry-mode", retryStrategy.mode]];
      }
      return retryStrategy.retry(next, args);
    }
  };
}
var cooldown = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var isRetryStrategyV2 = (retryStrategy) => typeof retryStrategy.acquireInitialRetryToken !== "undefined" && typeof retryStrategy.refreshRetryTokenForRetry !== "undefined" && typeof retryStrategy.recordSuccess !== "undefined";
var getRetryErrorInfo = (error, logger2) => {
  const errorInfo = {
    error,
    errorType: getRetryErrorType(error)
  };
  const retryAfterHint = parseRetryAfterHeader(error.$response, logger2);
  if (retryAfterHint) {
    errorInfo.retryAfterHint = retryAfterHint;
  }
  return errorInfo;
};
var getRetryErrorType = (error) => {
  if (isThrottlingError(error))
    return "THROTTLING";
  if (isTransientError(error))
    return "TRANSIENT";
  if (isServerError(error))
    return "SERVER_ERROR";
  return "CLIENT_ERROR";
};
var retryMiddlewareOptions = {
  name: "retryMiddleware",
  tags: ["RETRY"],
  step: "finalizeRequest",
  priority: "high",
  override: true
};
function bindGetRetryPlugin(isStreamingPayload2) {
  const retryMiddleware2 = bindRetryMiddleware(isStreamingPayload2);
  return (options) => ({
    applyToStack: (clientStack) => {
      clientStack.add(retryMiddleware2(options), retryMiddlewareOptions);
    }
  });
}

// node_modules/@smithy/core/dist-es/submodules/retry/util-retry/DefaultRateLimiter.js
var _DefaultRateLimiter = class _DefaultRateLimiter {
  constructor(options) {
    __publicField(this, "beta");
    __publicField(this, "minCapacity");
    __publicField(this, "minFillRate");
    __publicField(this, "scaleConstant");
    __publicField(this, "smooth");
    __publicField(this, "enabled", false);
    __publicField(this, "availableTokens", 0);
    __publicField(this, "lastMaxRate", 0);
    __publicField(this, "measuredTxRate", 0);
    __publicField(this, "requestCount", 0);
    __publicField(this, "fillRate");
    __publicField(this, "lastThrottleTime");
    __publicField(this, "lastTimestamp", 0);
    __publicField(this, "lastTxRateBucket");
    __publicField(this, "maxCapacity");
    __publicField(this, "timeWindow", 0);
    this.beta = options?.beta ?? 0.7;
    this.minCapacity = options?.minCapacity ?? 1;
    this.minFillRate = options?.minFillRate ?? 0.5;
    this.scaleConstant = options?.scaleConstant ?? 0.4;
    this.smooth = options?.smooth ?? 0.8;
    this.lastThrottleTime = this.getCurrentTimeInSeconds();
    this.lastTxRateBucket = Math.floor(this.getCurrentTimeInSeconds());
    this.fillRate = this.minFillRate;
    this.maxCapacity = this.minCapacity;
  }
  async getSendToken() {
    return this.acquireTokenBucket(1);
  }
  updateClientSendingRate(response) {
    let calculatedRate;
    this.updateMeasuredRate();
    const retryErrorInfo = response;
    const isThrottling = retryErrorInfo?.errorType === "THROTTLING" || isThrottlingError(retryErrorInfo?.error ?? response);
    if (isThrottling) {
      const rateToUse = !this.enabled ? this.measuredTxRate : Math.min(this.measuredTxRate, this.fillRate);
      this.lastMaxRate = rateToUse;
      this.calculateTimeWindow();
      this.lastThrottleTime = this.getCurrentTimeInSeconds();
      calculatedRate = this.cubicThrottle(rateToUse);
      this.enableTokenBucket();
    } else {
      this.calculateTimeWindow();
      calculatedRate = this.cubicSuccess(this.getCurrentTimeInSeconds());
    }
    const newRate = Math.min(calculatedRate, 2 * this.measuredTxRate);
    this.updateTokenBucketRate(newRate);
  }
  getCurrentTimeInSeconds() {
    return Date.now() / 1e3;
  }
  async acquireTokenBucket(amount) {
    if (!this.enabled) {
      return;
    }
    this.refillTokenBucket();
    while (amount > this.availableTokens) {
      const delay = (amount - this.availableTokens) / this.fillRate * 1e3;
      await new Promise((resolve) => _DefaultRateLimiter.setTimeoutFn(resolve, delay));
      this.refillTokenBucket();
    }
    this.availableTokens = this.availableTokens - amount;
  }
  refillTokenBucket() {
    const timestamp = this.getCurrentTimeInSeconds();
    if (!this.lastTimestamp) {
      this.lastTimestamp = timestamp;
      return;
    }
    const fillAmount = (timestamp - this.lastTimestamp) * this.fillRate;
    this.availableTokens = Math.min(this.maxCapacity, this.availableTokens + fillAmount);
    this.lastTimestamp = timestamp;
  }
  calculateTimeWindow() {
    this.timeWindow = this.getPrecise(Math.pow(this.lastMaxRate * (1 - this.beta) / this.scaleConstant, 1 / 3));
  }
  cubicThrottle(rateToUse) {
    return this.getPrecise(rateToUse * this.beta);
  }
  cubicSuccess(timestamp) {
    return this.getPrecise(this.scaleConstant * Math.pow(timestamp - this.lastThrottleTime - this.timeWindow, 3) + this.lastMaxRate);
  }
  enableTokenBucket() {
    this.enabled = true;
  }
  updateTokenBucketRate(newRate) {
    this.refillTokenBucket();
    this.fillRate = Math.max(newRate, this.minFillRate);
    this.maxCapacity = Math.max(newRate, this.minCapacity);
    this.availableTokens = Math.min(this.availableTokens, this.maxCapacity);
  }
  updateMeasuredRate() {
    const t = this.getCurrentTimeInSeconds();
    const timeBucket = Math.floor(t * 2) / 2;
    this.requestCount++;
    if (timeBucket > this.lastTxRateBucket) {
      const currentRate = this.requestCount / (timeBucket - this.lastTxRateBucket);
      this.measuredTxRate = this.getPrecise(currentRate * this.smooth + this.measuredTxRate * (1 - this.smooth));
      this.requestCount = 0;
      this.lastTxRateBucket = timeBucket;
    }
  }
  getPrecise(num) {
    return parseFloat(num.toFixed(8));
  }
};
__publicField(_DefaultRateLimiter, "setTimeoutFn", (fn, delay) => setTimeout(fn, delay));
var DefaultRateLimiter = _DefaultRateLimiter;

// node_modules/@smithy/core/dist-es/submodules/retry/util-retry/retries-2026-config.js
var _Retry = class _Retry {
  static delay() {
    return _Retry.v2026 ? 50 : 100;
  }
  static throttlingDelay() {
    return _Retry.v2026 ? 1e3 : 500;
  }
  static cost() {
    return _Retry.v2026 ? 14 : 5;
  }
  static throttlingCost() {
    return _Retry.v2026 ? 5 : 10;
  }
  static modifiedCostType() {
    return _Retry.v2026 ? "THROTTLING" : "TRANSIENT";
  }
};
__publicField(_Retry, "v2026", typeof process !== "undefined" && process.env?.SMITHY_NEW_RETRIES_2026 === "true");
var Retry = _Retry;

// node_modules/@smithy/core/dist-es/submodules/retry/util-retry/DefaultRetryBackoffStrategy.js
var DefaultRetryBackoffStrategy = class {
  constructor() {
    __publicField(this, "x", Retry.delay());
  }
  computeNextBackoffDelay(i3) {
    const b3 = Math.random();
    const r3 = 2;
    const t_i = b3 * Math.min(this.x * r3 ** i3, MAXIMUM_RETRY_DELAY);
    return Math.floor(t_i);
  }
  setDelayBase(delay) {
    this.x = delay;
  }
};

// node_modules/@smithy/core/dist-es/submodules/retry/util-retry/DefaultRetryToken.js
var DefaultRetryToken = class {
  constructor(delay, count, cost, longPoll) {
    __publicField(this, "delay");
    __publicField(this, "count");
    __publicField(this, "cost");
    __publicField(this, "longPoll");
    __publicField(this, "$retryLog", {
      acquisitionDelay: 0
    });
    this.delay = delay;
    this.count = count;
    this.cost = cost;
    this.longPoll = longPoll;
  }
  getRetryCount() {
    return this.count;
  }
  getRetryDelay() {
    return Math.min(MAXIMUM_RETRY_DELAY, this.delay);
  }
  getRetryCost() {
    return this.cost;
  }
  isLongPoll() {
    return this.longPoll;
  }
};

// node_modules/@smithy/core/dist-es/submodules/retry/util-retry/config.js
var RETRY_MODES;
(function(RETRY_MODES2) {
  RETRY_MODES2["STANDARD"] = "standard";
  RETRY_MODES2["ADAPTIVE"] = "adaptive";
})(RETRY_MODES || (RETRY_MODES = {}));
var DEFAULT_MAX_ATTEMPTS = 3;
var DEFAULT_RETRY_MODE = RETRY_MODES.STANDARD;

// node_modules/@smithy/core/dist-es/submodules/retry/util-retry/StandardRetryStrategy.js
var refusal = {
  incompatible: 1,
  attempts: 2,
  capacity: 3
};
var StandardRetryStrategy = class {
  constructor(arg1) {
    __publicField(this, "mode", RETRY_MODES.STANDARD);
    __publicField(this, "retryBackoffStrategy");
    __publicField(this, "capacity", INITIAL_RETRY_TOKENS);
    __publicField(this, "maxAttemptsProvider");
    __publicField(this, "baseDelay");
    if (typeof arg1 === "number") {
      this.maxAttemptsProvider = async () => arg1;
    } else if (typeof arg1 === "function") {
      this.maxAttemptsProvider = arg1;
    } else if (arg1 && typeof arg1 === "object") {
      this.maxAttemptsProvider = async () => arg1.maxAttempts;
      this.baseDelay = arg1.baseDelay;
      this.retryBackoffStrategy = arg1.backoff;
    }
    this.maxAttemptsProvider ?? (this.maxAttemptsProvider = async () => DEFAULT_MAX_ATTEMPTS);
    this.baseDelay ?? (this.baseDelay = Retry.delay());
    this.retryBackoffStrategy ?? (this.retryBackoffStrategy = new DefaultRetryBackoffStrategy());
  }
  async acquireInitialRetryToken(retryTokenScope) {
    return new DefaultRetryToken(Retry.delay(), 0, void 0, Retry.v2026 && retryTokenScope.includes(":longpoll"));
  }
  async refreshRetryTokenForRetry(token, errorInfo) {
    const maxAttempts = await this.getMaxAttempts();
    const retryCode = this.retryCode(token, errorInfo, maxAttempts);
    const shouldRetry = retryCode === 0;
    const isLongPoll = token.isLongPoll?.();
    if (shouldRetry || isLongPoll) {
      const errorType = errorInfo.errorType;
      this.retryBackoffStrategy.setDelayBase(errorType === "THROTTLING" ? Retry.throttlingDelay() : this.baseDelay);
      const delayFromErrorType = this.retryBackoffStrategy.computeNextBackoffDelay(token.getRetryCount());
      let retryDelay = delayFromErrorType;
      if (errorInfo.retryAfterHint instanceof Date) {
        retryDelay = Math.max(delayFromErrorType, Math.min(errorInfo.retryAfterHint.getTime() - Date.now(), delayFromErrorType + 5e3));
      }
      if (!shouldRetry) {
        const longPollBackoff = Retry.v2026 && retryCode === refusal.capacity && isLongPoll ? retryDelay : 0;
        if (longPollBackoff > 0) {
          await new Promise((r3) => setTimeout(r3, longPollBackoff));
        }
      } else {
        const capacityCost = this.getCapacityCost(errorType);
        this.capacity -= capacityCost;
        const nextToken = new DefaultRetryToken(0, token.getRetryCount() + 1, capacityCost, token.isLongPoll?.() ?? false);
        await new Promise((r3) => setTimeout(r3, retryDelay));
        nextToken.$retryLog.acquisitionDelay = retryDelay;
        return nextToken;
      }
    }
    throw new Error("No retry token available");
  }
  recordSuccess(token) {
    this.capacity = Math.min(INITIAL_RETRY_TOKENS, this.capacity + (token.getRetryCost() ?? NO_RETRY_INCREMENT));
  }
  getCapacity() {
    return this.capacity;
  }
  async maxAttempts() {
    return this.maxAttemptsProvider();
  }
  async getMaxAttempts() {
    try {
      return await this.maxAttemptsProvider();
    } catch (ignored) {
      console.warn(`Max attempts provider could not resolve. Using default of ${DEFAULT_MAX_ATTEMPTS}`);
      return DEFAULT_MAX_ATTEMPTS;
    }
  }
  retryCode(tokenToRenew, errorInfo, maxAttempts) {
    const attempts = tokenToRenew.getRetryCount() + 1;
    const retryableStatus = this.isRetryableError(errorInfo.errorType) ? 0 : refusal.incompatible;
    const attemptStatus = attempts < maxAttempts ? 0 : refusal.attempts;
    const capacityStatus = this.capacity >= this.getCapacityCost(errorInfo.errorType) ? 0 : refusal.capacity;
    return retryableStatus || attemptStatus || capacityStatus;
  }
  getCapacityCost(errorType) {
    return errorType === Retry.modifiedCostType() ? Retry.throttlingCost() : Retry.cost();
  }
  isRetryableError(errorType) {
    return errorType === "THROTTLING" || errorType === "TRANSIENT";
  }
};

// node_modules/@smithy/core/dist-es/submodules/retry/util-retry/AdaptiveRetryStrategy.js
var AdaptiveRetryStrategy = class {
  constructor(maxAttemptsProvider, options) {
    __publicField(this, "mode", RETRY_MODES.ADAPTIVE);
    __publicField(this, "rateLimiter");
    __publicField(this, "standardRetryStrategy");
    const { rateLimiter } = options ?? {};
    this.rateLimiter = rateLimiter ?? new DefaultRateLimiter();
    this.standardRetryStrategy = options ? new StandardRetryStrategy({
      maxAttempts: typeof maxAttemptsProvider === "number" ? maxAttemptsProvider : 3,
      ...options
    }) : new StandardRetryStrategy(maxAttemptsProvider);
  }
  async acquireInitialRetryToken(retryTokenScope) {
    const token = await this.standardRetryStrategy.acquireInitialRetryToken(retryTokenScope);
    await this.rateLimiter.getSendToken();
    return token;
  }
  async refreshRetryTokenForRetry(tokenToRenew, errorInfo) {
    this.rateLimiter.updateClientSendingRate(errorInfo);
    const token = await this.standardRetryStrategy.refreshRetryTokenForRetry(tokenToRenew, errorInfo);
    await this.rateLimiter.getSendToken();
    return token;
  }
  recordSuccess(token) {
    this.rateLimiter.updateClientSendingRate({});
    this.standardRetryStrategy.recordSuccess(token);
  }
  async maxAttemptsProvider() {
    return this.standardRetryStrategy.maxAttempts();
  }
};

// node_modules/@smithy/core/dist-es/submodules/retry/middleware-retry/configurations.js
var resolveRetryConfig = (input, defaults) => {
  const { retryStrategy, retryMode } = input;
  const { defaultMaxAttempts = DEFAULT_MAX_ATTEMPTS, defaultBaseDelay = Retry.delay() } = defaults ?? {};
  const maxAttemptsProvider = normalizeProvider(input.maxAttempts ?? defaultMaxAttempts);
  let controller = retryStrategy ? Promise.resolve(retryStrategy) : void 0;
  const getDefault = async () => {
    const maxAttempts = await maxAttemptsProvider();
    const adaptive = await normalizeProvider(retryMode)() === RETRY_MODES.ADAPTIVE;
    if (adaptive) {
      return new AdaptiveRetryStrategy(maxAttemptsProvider, {
        maxAttempts,
        baseDelay: defaultBaseDelay
      });
    }
    return new StandardRetryStrategy({
      maxAttempts,
      baseDelay: defaultBaseDelay
    });
  };
  return Object.assign(input, {
    maxAttempts: maxAttemptsProvider,
    retryStrategy: () => controller ?? (controller = getDefault())
  });
};

// node_modules/@smithy/core/dist-es/submodules/retry/index.browser.js
var retryMiddleware = bindRetryMiddleware(isStreamingPayload);
var getRetryPlugin = bindGetRetryPlugin(isStreamingPayload);

// node_modules/@aws-sdk/core/dist-es/submodules/client/setFeature.js
var _a;
(_a = Retry).v2026 || (_a.v2026 = typeof process === "object" && process.env?.AWS_NEW_RETRIES_2026 === "true");
function setFeature2(context, feature, value) {
  if (!context.__aws_sdk_context) {
    context.__aws_sdk_context = {
      features: {}
    };
  } else if (!context.__aws_sdk_context.features) {
    context.__aws_sdk_context.features = {};
  }
  context.__aws_sdk_context.features[feature] = value;
}

// node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-host-header/hostHeaderMiddleware.js
function resolveHostHeaderConfig(input) {
  return input;
}
var hostHeaderMiddleware = (options) => (next) => async (args) => {
  if (!HttpRequest.isInstance(args.request))
    return next(args);
  const { request } = args;
  const { handlerProtocol = "" } = options.requestHandler.metadata || {};
  if (handlerProtocol.indexOf("h2") >= 0 && !request.headers[":authority"]) {
    delete request.headers["host"];
    request.headers[":authority"] = request.hostname + (request.port ? ":" + request.port : "");
  } else if (!request.headers["host"]) {
    let host = request.hostname;
    if (request.port != null)
      host += `:${request.port}`;
    request.headers["host"] = host;
  }
  return next(args);
};
var hostHeaderMiddlewareOptions = {
  name: "hostHeaderMiddleware",
  step: "build",
  priority: "low",
  tags: ["HOST"],
  override: true
};
var getHostHeaderPlugin = (options) => ({
  applyToStack: (clientStack) => {
    clientStack.add(hostHeaderMiddleware(options), hostHeaderMiddlewareOptions);
  }
});

// node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-logger/loggerMiddleware.js
var loggerMiddleware = () => (next, context) => async (args) => {
  try {
    const response = await next(args);
    const { clientName, commandName, logger: logger2, dynamoDbDocumentClientOptions = {} } = context;
    const { overrideInputFilterSensitiveLog, overrideOutputFilterSensitiveLog } = dynamoDbDocumentClientOptions;
    const inputFilterSensitiveLog = overrideInputFilterSensitiveLog ?? context.inputFilterSensitiveLog;
    const outputFilterSensitiveLog = overrideOutputFilterSensitiveLog ?? context.outputFilterSensitiveLog;
    const { $metadata, ...outputWithoutMetadata } = response.output;
    logger2?.info?.({
      clientName,
      commandName,
      input: inputFilterSensitiveLog(args.input),
      output: outputFilterSensitiveLog(outputWithoutMetadata),
      metadata: $metadata
    });
    return response;
  } catch (error) {
    const { clientName, commandName, logger: logger2, dynamoDbDocumentClientOptions = {} } = context;
    const { overrideInputFilterSensitiveLog } = dynamoDbDocumentClientOptions;
    const inputFilterSensitiveLog = overrideInputFilterSensitiveLog ?? context.inputFilterSensitiveLog;
    logger2?.error?.({
      clientName,
      commandName,
      input: inputFilterSensitiveLog(args.input),
      error,
      metadata: error.$metadata
    });
    throw error;
  }
};
var loggerMiddlewareOptions = {
  name: "loggerMiddleware",
  tags: ["LOGGER"],
  step: "initialize",
  override: true
};
var getLoggerPlugin = (options) => ({
  applyToStack: (clientStack) => {
    clientStack.add(loggerMiddleware(), loggerMiddlewareOptions);
  }
});

// node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-recursion-detection/getRecursionDetectionPlugin.browser.js
var getRecursionDetectionPlugin = (options) => ({
  applyToStack: (clientStack) => {
  }
});

// node_modules/@smithy/core/dist-es/legacy-root-exports/middleware-http-auth-scheme/httpAuthSchemeMiddleware.js
init_transport();

// node_modules/@smithy/core/dist-es/legacy-root-exports/middleware-http-auth-scheme/resolveAuthOptions.js
var resolveAuthOptions = (candidateAuthOptions, authSchemePreference) => {
  if (!authSchemePreference || authSchemePreference.length === 0) {
    return candidateAuthOptions;
  }
  const preferredAuthOptions = [];
  for (const preferredSchemeName of authSchemePreference) {
    for (const candidateAuthOption of candidateAuthOptions) {
      const candidateAuthSchemeName = candidateAuthOption.schemeId.split("#")[1];
      if (candidateAuthSchemeName === preferredSchemeName) {
        preferredAuthOptions.push(candidateAuthOption);
      }
    }
  }
  for (const candidateAuthOption of candidateAuthOptions) {
    if (!preferredAuthOptions.find(({ schemeId }) => schemeId === candidateAuthOption.schemeId)) {
      preferredAuthOptions.push(candidateAuthOption);
    }
  }
  return preferredAuthOptions;
};

// node_modules/@smithy/core/dist-es/legacy-root-exports/middleware-http-auth-scheme/httpAuthSchemeMiddleware.js
function convertHttpAuthSchemesToMap(httpAuthSchemes) {
  const map = /* @__PURE__ */ new Map();
  for (const scheme of httpAuthSchemes) {
    map.set(scheme.schemeId, scheme);
  }
  return map;
}
var httpAuthSchemeMiddleware = (config, mwOptions) => (next, context) => async (args) => {
  const options = config.httpAuthSchemeProvider(await mwOptions.httpAuthSchemeParametersProvider(config, context, args.input));
  const authSchemePreference = config.authSchemePreference ? await config.authSchemePreference() : [];
  const resolvedOptions = resolveAuthOptions(options, authSchemePreference);
  const authSchemes = convertHttpAuthSchemesToMap(config.httpAuthSchemes);
  const smithyContext = getSmithyContext(context);
  const failureReasons = [];
  for (const option of resolvedOptions) {
    const scheme = authSchemes.get(option.schemeId);
    if (!scheme) {
      failureReasons.push(`HttpAuthScheme \`${option.schemeId}\` was not enabled for this service.`);
      continue;
    }
    const identityProvider = scheme.identityProvider(await mwOptions.identityProviderConfigProvider(config));
    if (!identityProvider) {
      failureReasons.push(`HttpAuthScheme \`${option.schemeId}\` did not have an IdentityProvider configured.`);
      continue;
    }
    const { identityProperties = {}, signingProperties = {} } = option.propertiesExtractor?.(config, context) || {};
    option.identityProperties = Object.assign(option.identityProperties || {}, identityProperties);
    option.signingProperties = Object.assign(option.signingProperties || {}, signingProperties);
    smithyContext.selectedHttpAuthScheme = {
      httpAuthOption: option,
      identity: await identityProvider(option.identityProperties),
      signer: scheme.signer
    };
    break;
  }
  if (!smithyContext.selectedHttpAuthScheme) {
    throw new Error(failureReasons.join("\n"));
  }
  return next(args);
};

// node_modules/@smithy/core/dist-es/legacy-root-exports/middleware-http-auth-scheme/getHttpAuthSchemeEndpointRuleSetPlugin.js
var httpAuthSchemeEndpointRuleSetMiddlewareOptions = {
  step: "serialize",
  tags: ["HTTP_AUTH_SCHEME"],
  name: "httpAuthSchemeMiddleware",
  override: true,
  relation: "before",
  toMiddleware: "endpointV2Middleware"
};
var getHttpAuthSchemeEndpointRuleSetPlugin = (config, { httpAuthSchemeParametersProvider, identityProviderConfigProvider }) => ({
  applyToStack: (clientStack) => {
    clientStack.addRelativeTo(httpAuthSchemeMiddleware(config, {
      httpAuthSchemeParametersProvider,
      identityProviderConfigProvider
    }), httpAuthSchemeEndpointRuleSetMiddlewareOptions);
  }
});

// node_modules/@smithy/core/dist-es/legacy-root-exports/middleware-http-signing/httpSigningMiddleware.js
init_transport();
var defaultErrorHandler = (signingProperties) => (error) => {
  throw error;
};
var defaultSuccessHandler = (httpResponse, signingProperties) => {
};
var httpSigningMiddleware = (config) => (next, context) => async (args) => {
  if (!HttpRequest.isInstance(args.request)) {
    return next(args);
  }
  const smithyContext = getSmithyContext(context);
  const scheme = smithyContext.selectedHttpAuthScheme;
  if (!scheme) {
    throw new Error(`No HttpAuthScheme was selected: unable to sign request`);
  }
  const { httpAuthOption: { signingProperties = {} }, identity, signer } = scheme;
  const output = await next({
    ...args,
    request: await signer.sign(args.request, identity, signingProperties)
  }).catch((signer.errorHandler || defaultErrorHandler)(signingProperties));
  (signer.successHandler || defaultSuccessHandler)(output.response, signingProperties);
  return output;
};

// node_modules/@smithy/core/dist-es/legacy-root-exports/middleware-http-signing/getHttpSigningMiddleware.js
var httpSigningMiddlewareOptions = {
  step: "finalizeRequest",
  tags: ["HTTP_SIGNING"],
  name: "httpSigningMiddleware",
  aliases: ["apiKeyMiddleware", "tokenMiddleware", "awsAuthMiddleware"],
  override: true,
  relation: "after",
  toMiddleware: "retryMiddleware"
};
var getHttpSigningPlugin = (config) => ({
  applyToStack: (clientStack) => {
    clientStack.addRelativeTo(httpSigningMiddleware(config), httpSigningMiddlewareOptions);
  }
});

// node_modules/@smithy/core/dist-es/normalizeProvider.js
var normalizeProvider2 = (input) => {
  if (typeof input === "function")
    return input;
  const promisified = Promise.resolve(input);
  return () => promisified;
};

// node_modules/@smithy/core/dist-es/legacy-root-exports/util-identity-and-auth/DefaultIdentityProviderConfig.js
init_transport();
var DefaultIdentityProviderConfig = class {
  constructor(config) {
    __publicField(this, "authSchemes", /* @__PURE__ */ new Map());
    for (const key in config) {
      if (!hasOwn(config, key))
        continue;
      const value = config[key];
      if (value !== void 0) {
        this.authSchemes.set(key, value);
      }
    }
  }
  getIdentityProvider(schemeId) {
    return this.authSchemes.get(schemeId);
  }
};

// node_modules/@smithy/core/dist-es/legacy-root-exports/util-identity-and-auth/memoizeIdentityProvider.js
var createIsIdentityExpiredFunction = (expirationMs) => function isIdentityExpired2(identity) {
  return doesIdentityRequireRefresh(identity) && identity.expiration.getTime() - Date.now() < expirationMs;
};
var EXPIRATION_MS = 3e5;
var isIdentityExpired = createIsIdentityExpiredFunction(EXPIRATION_MS);
var doesIdentityRequireRefresh = (identity) => identity.expiration !== void 0;
var memoizeIdentityProvider = (provider, isExpired, requiresRefresh) => {
  if (provider === void 0) {
    return void 0;
  }
  const normalizedProvider = typeof provider !== "function" ? async () => Promise.resolve(provider) : provider;
  let resolved;
  let pending;
  let hasResult;
  let isConstant = false;
  const coalesceProvider = async (options) => {
    if (!pending) {
      pending = normalizedProvider(options);
    }
    try {
      resolved = await pending;
      hasResult = true;
      isConstant = false;
    } finally {
      pending = void 0;
    }
    return resolved;
  };
  if (isExpired === void 0) {
    return async (options) => {
      if (!hasResult || options?.forceRefresh) {
        resolved = await coalesceProvider(options);
      }
      return resolved;
    };
  }
  return async (options) => {
    if (!hasResult || options?.forceRefresh) {
      resolved = await coalesceProvider(options);
    }
    if (isConstant) {
      return resolved;
    }
    if (!requiresRefresh(resolved)) {
      isConstant = true;
      return resolved;
    }
    if (isExpired(resolved)) {
      await coalesceProvider(options);
      return resolved;
    }
    return resolved;
  };
};

// node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-user-agent/configurations.js
var DEFAULT_UA_APP_ID = void 0;
function isValidUserAgentAppId(appId) {
  if (appId === void 0) {
    return true;
  }
  return typeof appId === "string" && appId.length <= 50;
}
function resolveUserAgentConfig(input) {
  const normalizedAppIdProvider = normalizeProvider2(input.userAgentAppId ?? DEFAULT_UA_APP_ID);
  const { customUserAgent } = input;
  return Object.assign(input, {
    customUserAgent: typeof customUserAgent === "string" ? [[customUserAgent]] : customUserAgent,
    userAgentAppId: async () => {
      const appId = await normalizedAppIdProvider();
      if (!isValidUserAgentAppId(appId)) {
        const logger2 = input.logger?.constructor?.name === "NoOpLogger" || !input.logger ? console : input.logger;
        if (typeof appId !== "string") {
          logger2?.warn("userAgentAppId must be a string or undefined.");
        } else if (appId.length > 50) {
          logger2?.warn("The provided userAgentAppId exceeds the maximum length of 50 characters.");
        }
      }
      return appId;
    }
  });
}

// node_modules/@aws-sdk/core/dist-es/submodules/client/util-endpoints/lib/aws/partitions.js
var partitionsInfo = {
  "partitions": [
    {
      "id": "aws",
      "outputs": {
        "dnsSuffix": "amazonaws.com",
        "dualStackDnsSuffix": "api.aws",
        "implicitGlobalRegion": "us-east-1",
        "name": "aws",
        "supportsDualStack": true,
        "supportsFIPS": true
      },
      "regionRegex": "^(us|eu|ap|sa|ca|me|af|il|mx)\\-\\w+\\-\\d+$",
      "regions": {
        "af-south-1": {
          "description": "Africa (Cape Town)"
        },
        "ap-east-1": {
          "description": "Asia Pacific (Hong Kong)"
        },
        "ap-east-2": {
          "description": "Asia Pacific (Taipei)"
        },
        "ap-northeast-1": {
          "description": "Asia Pacific (Tokyo)"
        },
        "ap-northeast-2": {
          "description": "Asia Pacific (Seoul)"
        },
        "ap-northeast-3": {
          "description": "Asia Pacific (Osaka)"
        },
        "ap-south-1": {
          "description": "Asia Pacific (Mumbai)"
        },
        "ap-south-2": {
          "description": "Asia Pacific (Hyderabad)"
        },
        "ap-southeast-1": {
          "description": "Asia Pacific (Singapore)"
        },
        "ap-southeast-2": {
          "description": "Asia Pacific (Sydney)"
        },
        "ap-southeast-3": {
          "description": "Asia Pacific (Jakarta)"
        },
        "ap-southeast-4": {
          "description": "Asia Pacific (Melbourne)"
        },
        "ap-southeast-5": {
          "description": "Asia Pacific (Malaysia)"
        },
        "ap-southeast-6": {
          "description": "Asia Pacific (New Zealand)"
        },
        "ap-southeast-7": {
          "description": "Asia Pacific (Thailand)"
        },
        "aws-global": {
          "description": "aws global region"
        },
        "ca-central-1": {
          "description": "Canada (Central)"
        },
        "ca-west-1": {
          "description": "Canada West (Calgary)"
        },
        "eu-central-1": {
          "description": "Europe (Frankfurt)"
        },
        "eu-central-2": {
          "description": "Europe (Zurich)"
        },
        "eu-north-1": {
          "description": "Europe (Stockholm)"
        },
        "eu-south-1": {
          "description": "Europe (Milan)"
        },
        "eu-south-2": {
          "description": "Europe (Spain)"
        },
        "eu-west-1": {
          "description": "Europe (Ireland)"
        },
        "eu-west-2": {
          "description": "Europe (London)"
        },
        "eu-west-3": {
          "description": "Europe (Paris)"
        },
        "il-central-1": {
          "description": "Israel (Tel Aviv)"
        },
        "me-central-1": {
          "description": "Middle East (UAE)"
        },
        "me-south-1": {
          "description": "Middle East (Bahrain)"
        },
        "mx-central-1": {
          "description": "Mexico (Central)"
        },
        "sa-east-1": {
          "description": "South America (Sao Paulo)"
        },
        "us-east-1": {
          "description": "US East (N. Virginia)"
        },
        "us-east-2": {
          "description": "US East (Ohio)"
        },
        "us-west-1": {
          "description": "US West (N. California)"
        },
        "us-west-2": {
          "description": "US West (Oregon)"
        }
      }
    },
    {
      "id": "aws-cn",
      "outputs": {
        "dnsSuffix": "amazonaws.com.cn",
        "dualStackDnsSuffix": "api.amazonwebservices.com.cn",
        "implicitGlobalRegion": "cn-northwest-1",
        "name": "aws-cn",
        "supportsDualStack": true,
        "supportsFIPS": true
      },
      "regionRegex": "^cn\\-\\w+\\-\\d+$",
      "regions": {
        "aws-cn-global": {
          "description": "aws-cn global region"
        },
        "cn-north-1": {
          "description": "China (Beijing)"
        },
        "cn-northwest-1": {
          "description": "China (Ningxia)"
        }
      }
    },
    {
      "id": "aws-eusc",
      "outputs": {
        "dnsSuffix": "amazonaws.eu",
        "dualStackDnsSuffix": "api.amazonwebservices.eu",
        "implicitGlobalRegion": "eusc-de-east-1",
        "name": "aws-eusc",
        "supportsDualStack": true,
        "supportsFIPS": true
      },
      "regionRegex": "^eusc\\-(de)\\-\\w+\\-\\d+$",
      "regions": {
        "eusc-de-east-1": {
          "description": "AWS European Sovereign Cloud (Germany)"
        }
      }
    },
    {
      "id": "aws-iso",
      "outputs": {
        "dnsSuffix": "c2s.ic.gov",
        "dualStackDnsSuffix": "api.aws.ic.gov",
        "implicitGlobalRegion": "us-iso-east-1",
        "name": "aws-iso",
        "supportsDualStack": true,
        "supportsFIPS": true
      },
      "regionRegex": "^us\\-iso\\-\\w+\\-\\d+$",
      "regions": {
        "aws-iso-global": {
          "description": "aws-iso global region"
        },
        "us-iso-east-1": {
          "description": "US ISO East"
        },
        "us-iso-west-1": {
          "description": "US ISO WEST"
        }
      }
    },
    {
      "id": "aws-iso-b",
      "outputs": {
        "dnsSuffix": "sc2s.sgov.gov",
        "dualStackDnsSuffix": "api.aws.scloud",
        "implicitGlobalRegion": "us-isob-east-1",
        "name": "aws-iso-b",
        "supportsDualStack": true,
        "supportsFIPS": true
      },
      "regionRegex": "^us\\-isob\\-\\w+\\-\\d+$",
      "regions": {
        "aws-iso-b-global": {
          "description": "aws-iso-b global region"
        },
        "us-isob-east-1": {
          "description": "US ISOB East (Ohio)"
        },
        "us-isob-west-1": {
          "description": "US ISOB West"
        }
      }
    },
    {
      "id": "aws-iso-e",
      "outputs": {
        "dnsSuffix": "cloud.adc-e.uk",
        "dualStackDnsSuffix": "api.cloud-aws.adc-e.uk",
        "implicitGlobalRegion": "eu-isoe-west-1",
        "name": "aws-iso-e",
        "supportsDualStack": true,
        "supportsFIPS": true
      },
      "regionRegex": "^eu\\-isoe\\-\\w+\\-\\d+$",
      "regions": {
        "aws-iso-e-global": {
          "description": "aws-iso-e global region"
        },
        "eu-isoe-west-1": {
          "description": "EU ISOE West"
        }
      }
    },
    {
      "id": "aws-iso-f",
      "outputs": {
        "dnsSuffix": "csp.hci.ic.gov",
        "dualStackDnsSuffix": "api.aws.hci.ic.gov",
        "implicitGlobalRegion": "us-isof-south-1",
        "name": "aws-iso-f",
        "supportsDualStack": true,
        "supportsFIPS": true
      },
      "regionRegex": "^us\\-isof\\-\\w+\\-\\d+$",
      "regions": {
        "aws-iso-f-global": {
          "description": "aws-iso-f global region"
        },
        "us-isof-east-1": {
          "description": "US ISOF EAST"
        },
        "us-isof-south-1": {
          "description": "US ISOF SOUTH"
        }
      }
    },
    {
      "id": "aws-us-gov",
      "outputs": {
        "dnsSuffix": "amazonaws.com",
        "dualStackDnsSuffix": "api.aws",
        "implicitGlobalRegion": "us-gov-west-1",
        "name": "aws-us-gov",
        "supportsDualStack": true,
        "supportsFIPS": true
      },
      "regionRegex": "^us\\-gov\\-\\w+\\-\\d+$",
      "regions": {
        "aws-us-gov-global": {
          "description": "aws-us-gov global region"
        },
        "us-gov-east-1": {
          "description": "AWS GovCloud (US-East)"
        },
        "us-gov-west-1": {
          "description": "AWS GovCloud (US-West)"
        }
      }
    }
  ],
  "version": "1.1"
};

// node_modules/@aws-sdk/core/dist-es/submodules/client/util-endpoints/lib/aws/partition.js
var selectedPartitionsInfo = partitionsInfo;
var selectedUserAgentPrefix = "";
var partition = (value) => {
  const { partitions } = selectedPartitionsInfo;
  for (const partition2 of partitions) {
    const { regions, outputs } = partition2;
    for (const [region, regionData] of Object.entries(regions)) {
      if (region === value) {
        return {
          ...outputs,
          ...regionData
        };
      }
    }
  }
  for (const partition2 of partitions) {
    const { regionRegex, outputs } = partition2;
    if (new RegExp(regionRegex).test(value)) {
      return {
        ...outputs
      };
    }
  }
  const DEFAULT_PARTITION = partitions.find((partition2) => partition2.id === "aws");
  if (!DEFAULT_PARTITION) {
    throw new Error("Provided region was not found in the partition array or regex, and default partition with id 'aws' doesn't exist.");
  }
  return {
    ...DEFAULT_PARTITION.outputs
  };
};
var getUserAgentPrefix = () => selectedUserAgentPrefix;

// node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-user-agent/check-features.js
var ACCOUNT_ID_ENDPOINT_REGEX = /\d{12}\.ddb/;
async function checkFeatures(context, config, args) {
  const request = args.request;
  if (request?.headers?.["smithy-protocol"] === "rpc-v2-cbor") {
    setFeature2(context, "PROTOCOL_RPC_V2_CBOR", "M");
  }
  if (typeof config.retryStrategy === "function") {
    const retryStrategy = await config.retryStrategy();
    if (typeof retryStrategy.mode === "string") {
      switch (retryStrategy.mode) {
        case RETRY_MODES.ADAPTIVE:
          setFeature2(context, "RETRY_MODE_ADAPTIVE", "F");
          break;
        case RETRY_MODES.STANDARD:
          setFeature2(context, "RETRY_MODE_STANDARD", "E");
          break;
      }
    }
  }
  if (typeof config.accountIdEndpointMode === "function") {
    const endpointV2 = context.endpointV2;
    if (String(endpointV2?.url?.hostname).match(ACCOUNT_ID_ENDPOINT_REGEX)) {
      setFeature2(context, "ACCOUNT_ID_ENDPOINT", "O");
    }
    switch (await config.accountIdEndpointMode?.()) {
      case "disabled":
        setFeature2(context, "ACCOUNT_ID_MODE_DISABLED", "Q");
        break;
      case "preferred":
        setFeature2(context, "ACCOUNT_ID_MODE_PREFERRED", "P");
        break;
      case "required":
        setFeature2(context, "ACCOUNT_ID_MODE_REQUIRED", "R");
        break;
    }
  }
  const identity = context.__smithy_context?.selectedHttpAuthScheme?.identity;
  if (identity?.$source) {
    const credentials = identity;
    if (credentials.accountId) {
      setFeature2(context, "RESOLVED_ACCOUNT_ID", "T");
    }
    for (const [key, value] of Object.entries(credentials.$source ?? {})) {
      setFeature2(context, key, value);
    }
  }
}

// node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-user-agent/constants.js
var USER_AGENT = "user-agent";
var X_AMZ_USER_AGENT = "x-amz-user-agent";
var SPACE = " ";
var UA_NAME_SEPARATOR = "/";
var UA_NAME_ESCAPE_REGEX = /[^!$%&'*+\-.^_`|~\w]/g;
var UA_VALUE_ESCAPE_REGEX = /[^!$%&'*+\-.^_`|~\w#]/g;
var UA_ESCAPE_CHAR = "-";

// node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-user-agent/encode-features.js
var BYTE_LIMIT = 1024;
function encodeFeatures(features) {
  let buffer = "";
  for (const key in features) {
    const val = features[key];
    if (buffer.length + val.length + 1 <= BYTE_LIMIT) {
      if (buffer.length) {
        buffer += "," + val;
      } else {
        buffer += val;
      }
      continue;
    }
    break;
  }
  return buffer;
}

// node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-user-agent/user-agent-middleware.js
var userAgentMiddleware = (options) => (next, context) => async (args) => {
  const { request } = args;
  if (!HttpRequest.isInstance(request)) {
    return next(args);
  }
  const { headers } = request;
  const userAgent = context?.userAgent?.map(escapeUserAgent) || [];
  const defaultUserAgent2 = (await options.defaultUserAgentProvider()).map(escapeUserAgent);
  await checkFeatures(context, options, args);
  const awsContext = context;
  defaultUserAgent2.push(`m/${encodeFeatures(Object.assign({}, context.__smithy_context?.features, awsContext.__aws_sdk_context?.features))}`);
  const customUserAgent = options?.customUserAgent?.map(escapeUserAgent) || [];
  const appId = await options.userAgentAppId();
  if (appId) {
    defaultUserAgent2.push(escapeUserAgent([`app`, `${appId}`]));
  }
  const prefix = getUserAgentPrefix();
  const sdkUserAgentValue = (prefix ? [prefix] : []).concat([...defaultUserAgent2, ...userAgent, ...customUserAgent]).join(SPACE);
  const normalUAValue = [
    ...defaultUserAgent2.filter((section) => section.startsWith("aws-sdk-")),
    ...customUserAgent
  ].join(SPACE);
  if (options.runtime !== "browser") {
    if (normalUAValue) {
      headers[X_AMZ_USER_AGENT] = headers[X_AMZ_USER_AGENT] ? `${headers[USER_AGENT]} ${normalUAValue}` : normalUAValue;
    }
    headers[USER_AGENT] = sdkUserAgentValue;
  } else {
    headers[X_AMZ_USER_AGENT] = sdkUserAgentValue;
  }
  return next({
    ...args,
    request
  });
};
var escapeUserAgent = (userAgentPair) => {
  const name = userAgentPair[0].split(UA_NAME_SEPARATOR).map((part) => part.replace(UA_NAME_ESCAPE_REGEX, UA_ESCAPE_CHAR)).join(UA_NAME_SEPARATOR);
  const version = userAgentPair[1]?.replace(UA_VALUE_ESCAPE_REGEX, UA_ESCAPE_CHAR);
  const prefixSeparatorIndex = name.indexOf(UA_NAME_SEPARATOR);
  const prefix = name.substring(0, prefixSeparatorIndex);
  let uaName = name.substring(prefixSeparatorIndex + 1);
  if (prefix === "api") {
    uaName = uaName.toLowerCase();
  }
  return [prefix, uaName, version].filter((item) => item && item.length > 0).reduce((acc, item, index) => {
    switch (index) {
      case 0:
        return item;
      case 1:
        return `${acc}/${item}`;
      default:
        return `${acc}#${item}`;
    }
  }, "");
};
var getUserAgentMiddlewareOptions = {
  name: "getUserAgentMiddleware",
  step: "build",
  priority: "low",
  tags: ["SET_USER_AGENT", "USER_AGENT"],
  override: true
};
var getUserAgentPlugin = (config) => ({
  applyToStack: (clientStack) => {
    clientStack.add(userAgentMiddleware(config), getUserAgentMiddlewareOptions);
  }
});

// node_modules/@aws-sdk/core/dist-es/submodules/client/util-user-agent-browser/defaultUserAgent.js
var createDefaultUserAgentProvider = ({ serviceId, clientVersion }) => async (config) => {
  const navigator = typeof window !== "undefined" ? window.navigator : void 0;
  const uaString = navigator?.userAgent ?? "";
  const osName = navigator?.userAgentData?.platform ?? fallback.os(uaString) ?? "other";
  const osVersion = void 0;
  const brands = navigator?.userAgentData?.brands ?? [];
  const brand = brands[brands.length - 1];
  const browserName = brand?.brand ?? fallback.browser(uaString) ?? "unknown";
  const browserVersion = brand?.version ?? "unknown";
  const sections = [
    ["aws-sdk-js", clientVersion],
    ["ua", "2.1"],
    [`os/${osName}`, osVersion],
    ["lang/js"],
    ["md/browser", `${browserName}_${browserVersion}`]
  ];
  if (serviceId) {
    sections.push([`api/${serviceId}`, clientVersion]);
  }
  const appId = await config?.userAgentAppId?.();
  if (appId) {
    sections.push([`app/${appId}`]);
  }
  return sections;
};
var fallback = {
  os(ua) {
    if (/iPhone|iPad|iPod/.test(ua))
      return "iOS";
    if (/Macintosh|Mac OS X/.test(ua))
      return "macOS";
    if (/Windows NT/.test(ua))
      return "Windows";
    if (/Android/.test(ua))
      return "Android";
    if (/Linux/.test(ua))
      return "Linux";
    return void 0;
  },
  browser(ua) {
    if (/EdgiOS|EdgA|Edg\//.test(ua))
      return "Microsoft Edge";
    if (/Firefox\//.test(ua))
      return "Firefox";
    if (/Chrome\//.test(ua))
      return "Chrome";
    if (/Safari\//.test(ua))
      return "Safari";
    return void 0;
  }
};

// node_modules/@aws-sdk/core/dist-es/submodules/client/util-endpoints/aws.js
init_index_browser();

// node_modules/@aws-sdk/core/dist-es/submodules/client/util-endpoints/lib/aws/isVirtualHostableS3Bucket.js
init_index_browser();

// node_modules/@aws-sdk/core/dist-es/submodules/client/util-endpoints/lib/isIpAddress.js
init_index_browser();

// node_modules/@aws-sdk/core/dist-es/submodules/client/util-endpoints/lib/aws/isVirtualHostableS3Bucket.js
var isVirtualHostableS3Bucket = (value, allowSubDomains = false) => {
  if (allowSubDomains) {
    for (const label of value.split(".")) {
      if (!isVirtualHostableS3Bucket(label)) {
        return false;
      }
    }
    return true;
  }
  if (!isValidHostLabel(value)) {
    return false;
  }
  if (value.length < 3 || value.length > 63) {
    return false;
  }
  if (value !== value.toLowerCase()) {
    return false;
  }
  if (isIpAddress(value)) {
    return false;
  }
  return true;
};

// node_modules/@aws-sdk/core/dist-es/submodules/client/util-endpoints/lib/aws/parseArn.js
var ARN_DELIMITER = ":";
var RESOURCE_DELIMITER = "/";
var parseArn = (value) => {
  const segments = value.split(ARN_DELIMITER);
  if (segments.length < 6)
    return null;
  const [arn, partition2, service, region, accountId, ...resourcePath] = segments;
  if (arn !== "arn" || partition2 === "" || service === "" || resourcePath.join(ARN_DELIMITER) === "")
    return null;
  const resourceId = resourcePath.map((resource) => resource.split(RESOURCE_DELIMITER)).flat();
  return {
    partition: partition2,
    service,
    region,
    accountId,
    resourceId
  };
};

// node_modules/@aws-sdk/core/dist-es/submodules/client/util-endpoints/aws.js
var awsEndpointFunctions = {
  isVirtualHostableS3Bucket,
  parseArn,
  partition
};
customEndpointFunctions.aws = awsEndpointFunctions;

// node_modules/@smithy/core/dist-es/submodules/config/property-provider/memoize.js
var memoize = (provider, isExpired, requiresRefresh) => {
  let resolved;
  let pending;
  let hasResult;
  let isConstant = false;
  const coalesceProvider = async () => {
    if (!pending) {
      pending = provider();
    }
    try {
      resolved = await pending;
      hasResult = true;
      isConstant = false;
    } finally {
      pending = void 0;
    }
    return resolved;
  };
  if (isExpired === void 0) {
    return async (options) => {
      if (!hasResult || options?.forceRefresh) {
        resolved = await coalesceProvider();
      }
      return resolved;
    };
  }
  return async (options) => {
    if (!hasResult || options?.forceRefresh) {
      resolved = await coalesceProvider();
    }
    if (isConstant) {
      return resolved;
    }
    if (requiresRefresh && !requiresRefresh(resolved)) {
      isConstant = true;
      return resolved;
    }
    if (isExpired(resolved)) {
      await coalesceProvider();
      return resolved;
    }
    return resolved;
  };
};

// node_modules/@smithy/core/dist-es/submodules/config/config-resolver/regionConfig/checkRegion.js
init_transport();
var validRegions = /* @__PURE__ */ new Set();
var checkRegion = (region, check = isValidHostLabel) => {
  if (!validRegions.has(region) && !check(region)) {
    if (region === "*") {
      console.warn(`@smithy/config-resolver WARN - Please use the caller region instead of "*". See "sigv4a" in https://github.com/aws/aws-sdk-js-v3/blob/main/supplemental-docs/CLIENTS.md.`);
    } else {
      throw new Error(`Region not accepted: region="${region}" is not a valid hostname component.`);
    }
  } else {
    validRegions.add(region);
  }
};

// node_modules/@smithy/core/dist-es/submodules/config/config-resolver/regionConfig/isFipsRegion.js
var isFipsRegion = (region) => typeof region === "string" && (region.startsWith("fips-") || region.endsWith("-fips"));

// node_modules/@smithy/core/dist-es/submodules/config/config-resolver/regionConfig/getRealRegion.js
var getRealRegion = (region) => isFipsRegion(region) ? ["fips-aws-global", "aws-fips"].includes(region) ? "us-east-1" : region.replace(/fips-(dkr-|prod-)?|-fips/, "") : region;

// node_modules/@smithy/core/dist-es/submodules/config/config-resolver/regionConfig/resolveRegionConfig.js
var resolveRegionConfig = (input) => {
  const { region, useFipsEndpoint } = input;
  if (!region) {
    throw new Error("Region is missing");
  }
  return Object.assign(input, {
    region: async () => {
      const providedRegion = typeof region === "function" ? await region() : region;
      const realRegion = getRealRegion(providedRegion);
      checkRegion(realRegion);
      return realRegion;
    },
    useFipsEndpoint: async () => {
      const providedRegion = typeof region === "string" ? region : await region();
      if (isFipsRegion(providedRegion)) {
        return true;
      }
      return typeof useFipsEndpoint !== "function" ? Promise.resolve(!!useFipsEndpoint) : useFipsEndpoint();
    }
  });
};

// node_modules/@smithy/core/dist-es/submodules/config/defaults-mode/constants.js
var DEFAULTS_MODE_OPTIONS = ["in-region", "cross-region", "mobile", "standard", "legacy"];

// node_modules/@smithy/core/dist-es/submodules/config/defaults-mode/resolveDefaultsModeConfig.browser.js
var resolveDefaultsModeConfig = ({ defaultsMode } = {}) => memoize(async () => {
  const mode = typeof defaultsMode === "function" ? await defaultsMode() : defaultsMode;
  switch (mode?.toLowerCase()) {
    case "auto":
      return Promise.resolve(useMobileConfiguration() ? "mobile" : "standard");
    case "mobile":
    case "in-region":
    case "cross-region":
    case "standard":
    case "legacy":
      return Promise.resolve(mode?.toLocaleLowerCase());
    case void 0:
      return Promise.resolve("legacy");
    default:
      throw new Error(`Invalid parameter for "defaultsMode", expect ${DEFAULTS_MODE_OPTIONS.join(", ")}, got ${mode}`);
  }
});
var useMobileConfiguration = () => {
  const navigator = window?.navigator;
  if (navigator?.connection) {
    const { effectiveType, rtt, downlink } = navigator.connection;
    const slow = typeof effectiveType === "string" && effectiveType !== "4g" || Number(rtt) > 100 || Number(downlink) < 10;
    if (slow) {
      return true;
    }
  }
  return navigator?.userAgentData?.mobile || typeof navigator?.maxTouchPoints === "number" && navigator?.maxTouchPoints > 1;
};

// node_modules/@smithy/core/dist-es/submodules/config/index.browser.js
var DEFAULT_USE_DUALSTACK_ENDPOINT = false;
var DEFAULT_USE_FIPS_ENDPOINT = false;

// node_modules/@aws-sdk/core/dist-es/submodules/client/region-config-resolver/extensions.js
var getAwsRegionExtensionConfiguration = (runtimeConfig) => {
  return {
    setRegion(region) {
      runtimeConfig.region = region;
    },
    region() {
      return runtimeConfig.region;
    }
  };
};
var resolveAwsRegionExtensionConfiguration = (awsRegionExtensionConfiguration) => {
  return {
    region: awsRegionExtensionConfiguration.region()
  };
};

// node_modules/@aws-sdk/client-secrets-manager/dist-es/SecretsManagerClient.js
init_index_browser();
init_schema();

// node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/utils/getDateHeader.js
var getDateHeader = (response) => HttpResponse.isInstance(response) ? response.headers?.date ?? response.headers?.Date : void 0;
var getAgeHeader = (response) => HttpResponse.isInstance(response) ? response.headers?.age ?? response.headers?.Age : void 0;

// node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/utils/getSkewCorrectedDate.js
var getSkewCorrectedDate = (systemClockOffset) => new Date(Date.now() + systemClockOffset);

// node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/utils/getUpdatedSystemClockOffset.js
var getUpdatedSystemClockOffset = (clockTime, currentSystemClockOffset, timeRequestSent, ageHeader) => {
  if (ageHeader !== void 0) {
    return currentSystemClockOffset;
  }
  const serverTime = Date.parse(clockTime);
  const timeResponseReceived = Date.now();
  if (timeRequestSent !== void 0 && timeResponseReceived - timeRequestSent > 9e5) {
    return currentSystemClockOffset;
  }
  const candidateSkew = timeRequestSent !== void 0 ? serverTime - (timeRequestSent + timeResponseReceived) / 2 : serverTime - timeResponseReceived;
  return candidateSkew;
};

// node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/aws_sdk/AwsSdkSigV4Signer.js
var throwSigningPropertyError = (name, property) => {
  if (!property) {
    throw new Error(`Property \`${name}\` is not resolved for AWS SDK SigV4Auth`);
  }
  return property;
};
var validateSigningProperties = async (signingProperties) => {
  const context = throwSigningPropertyError("context", signingProperties.context);
  const config = throwSigningPropertyError("config", signingProperties.config);
  const authScheme = context.endpointV2?.properties?.authSchemes?.[0];
  const signerFunction = throwSigningPropertyError("signer", config.signer);
  const signer = await signerFunction(authScheme);
  const signingRegion = signingProperties?.signingRegion;
  const signingRegionSet = signingProperties?.signingRegionSet;
  const signingName = signingProperties?.signingName;
  return {
    config,
    signer,
    signingRegion,
    signingRegionSet,
    signingName
  };
};
var AwsSdkSigV4Signer = class {
  async sign(httpRequest, identity, signingProperties) {
    if (!HttpRequest.isInstance(httpRequest)) {
      throw new Error("The request is not an instance of `HttpRequest` and cannot be signed");
    }
    const validatedProps = await validateSigningProperties(signingProperties);
    const { config, signer } = validatedProps;
    let { signingRegion, signingName } = validatedProps;
    const handlerExecutionContext = signingProperties.context;
    if (handlerExecutionContext?.authSchemes?.length ?? 0 > 1) {
      const [first, second] = handlerExecutionContext.authSchemes;
      if (first?.name === "sigv4a" && second?.name === "sigv4") {
        signingRegion = second?.signingRegion ?? signingRegion;
        signingName = second?.signingName ?? signingName;
      }
    }
    const noSkewCorrection = await config.disableClockSkewCorrection?.() === true;
    signingProperties._disableClockSkewCorrection = noSkewCorrection;
    if (!noSkewCorrection) {
      signingProperties._preRequestSystemClockOffset = config.systemClockOffset;
      signingProperties._requestSentAt = Date.now();
    }
    const signedRequest = await signer.sign(httpRequest, {
      signingDate: noSkewCorrection ? /* @__PURE__ */ new Date() : getSkewCorrectedDate(config.systemClockOffset),
      signingRegion,
      signingService: signingName
    });
    return signedRequest;
  }
  errorHandler(signingProperties) {
    return (error) => {
      const errorException = error;
      if (!signingProperties._disableClockSkewCorrection) {
        const serverTime = errorException.ServerTime ?? getDateHeader(errorException.$response);
        if (serverTime) {
          const config = throwSigningPropertyError("config", signingProperties.config);
          const preRequestOffset = signingProperties._preRequestSystemClockOffset;
          const timeRequestSent = signingProperties._requestSentAt;
          const ageHeader = getAgeHeader(errorException.$response);
          const newOffset = getUpdatedSystemClockOffset(serverTime, config.systemClockOffset, timeRequestSent, ageHeader);
          config.systemClockOffset = newOffset;
          const skewExceedsThreshold = Math.abs(newOffset) >= 24e4;
          const isLocalCorrection = newOffset !== preRequestOffset;
          const isConcurrentCorrection = preRequestOffset !== void 0 && preRequestOffset !== newOffset;
          if (skewExceedsThreshold && (isLocalCorrection || isConcurrentCorrection) && errorException.$metadata) {
            errorException.$metadata.clockSkewCorrected = true;
          }
        }
      }
      throw error;
    };
  }
  successHandler(httpResponse, signingProperties) {
    if (signingProperties._disableClockSkewCorrection) {
      return;
    }
    const dateHeader = getDateHeader(httpResponse);
    if (dateHeader) {
      const config = throwSigningPropertyError("config", signingProperties.config);
      const timeRequestSent = signingProperties._requestSentAt;
      const ageHeader = getAgeHeader(httpResponse);
      config.systemClockOffset = getUpdatedSystemClockOffset(dateHeader, config.systemClockOffset, timeRequestSent, ageHeader);
    }
  }
};

// node_modules/@smithy/signature-v4/dist-es/SignatureV4.js
init_index_browser2();

// node_modules/@smithy/signature-v4/dist-es/HeaderFormatter.js
init_index_browser2();
init_index_browser2();
var HeaderFormatter = class {
  format(headers) {
    const chunks = [];
    for (const headerName in headers) {
      if (!hasOwn(headers, headerName))
        continue;
      const bytes = fromUtf8(headerName);
      chunks.push(Uint8Array.from([bytes.byteLength]), bytes, this.formatHeaderValue(headers[headerName]));
    }
    const out = new Uint8Array(chunks.reduce((carry, bytes) => carry + bytes.byteLength, 0));
    let position = 0;
    for (const chunk of chunks) {
      out.set(chunk, position);
      position += chunk.byteLength;
    }
    return out;
  }
  formatHeaderValue(header) {
    switch (header.type) {
      case "boolean":
        return Uint8Array.from([header.value ? 0 : 1]);
      case "byte":
        return Uint8Array.from([2, header.value]);
      case "short":
        const shortView = new DataView(new ArrayBuffer(3));
        shortView.setUint8(0, 3);
        shortView.setInt16(1, header.value, false);
        return new Uint8Array(shortView.buffer);
      case "integer":
        const intView = new DataView(new ArrayBuffer(5));
        intView.setUint8(0, 4);
        intView.setInt32(1, header.value, false);
        return new Uint8Array(intView.buffer);
      case "long":
        const longBytes = new Uint8Array(9);
        longBytes[0] = 5;
        longBytes.set(header.value.bytes, 1);
        return longBytes;
      case "binary":
        const binView = new DataView(new ArrayBuffer(3 + header.value.byteLength));
        binView.setUint8(0, 6);
        binView.setUint16(1, header.value.byteLength, false);
        const binBytes = new Uint8Array(binView.buffer);
        binBytes.set(header.value, 3);
        return binBytes;
      case "string":
        const utf8Bytes = fromUtf8(header.value);
        const strView = new DataView(new ArrayBuffer(3 + utf8Bytes.byteLength));
        strView.setUint8(0, 7);
        strView.setUint16(1, utf8Bytes.byteLength, false);
        const strBytes = new Uint8Array(strView.buffer);
        strBytes.set(utf8Bytes, 3);
        return strBytes;
      case "timestamp":
        const tsBytes = new Uint8Array(9);
        tsBytes[0] = 8;
        tsBytes.set(Int642.fromNumber(header.value.valueOf()).bytes, 1);
        return tsBytes;
      case "uuid":
        if (!UUID_PATTERN2.test(header.value)) {
          throw new Error(`Invalid UUID received: ${header.value}`);
        }
        const uuidBytes = new Uint8Array(17);
        uuidBytes[0] = 9;
        uuidBytes.set(fromHex(header.value.replace(/-/g, "")), 1);
        return uuidBytes;
    }
  }
};
var HEADER_VALUE_TYPE2;
(function(HEADER_VALUE_TYPE3) {
  HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["boolTrue"] = 0] = "boolTrue";
  HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["boolFalse"] = 1] = "boolFalse";
  HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["byte"] = 2] = "byte";
  HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["short"] = 3] = "short";
  HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["integer"] = 4] = "integer";
  HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["long"] = 5] = "long";
  HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["byteArray"] = 6] = "byteArray";
  HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["string"] = 7] = "string";
  HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["timestamp"] = 8] = "timestamp";
  HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["uuid"] = 9] = "uuid";
})(HEADER_VALUE_TYPE2 || (HEADER_VALUE_TYPE2 = {}));
var UUID_PATTERN2 = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
var Int642 = class _Int64 {
  constructor(bytes) {
    __publicField(this, "bytes");
    this.bytes = bytes;
    if (bytes.byteLength !== 8) {
      throw new Error("Int64 buffers must be exactly 8 bytes");
    }
  }
  static fromNumber(number) {
    if (number > 9223372036854776e3 || number < -9223372036854776e3) {
      throw new Error(`${number} is too large (or, if negative, too small) to represent as an Int64`);
    }
    const bytes = new Uint8Array(8);
    for (let i3 = 7, remaining = Math.abs(Math.round(number)); i3 > -1 && remaining > 0; i3--, remaining /= 256) {
      bytes[i3] = remaining;
    }
    if (number < 0) {
      negate2(bytes);
    }
    return new _Int64(bytes);
  }
  valueOf() {
    const bytes = this.bytes.slice(0);
    const negative = bytes[0] & 128;
    if (negative) {
      negate2(bytes);
    }
    return parseInt(toHex(bytes), 16) * (negative ? -1 : 1);
  }
  toString() {
    return String(this.valueOf());
  }
};
function negate2(bytes) {
  for (let i3 = 0; i3 < 8; i3++) {
    bytes[i3] ^= 255;
  }
  for (let i3 = 7; i3 > -1; i3--) {
    bytes[i3]++;
    if (bytes[i3] !== 0)
      break;
  }
}

// node_modules/@smithy/signature-v4/dist-es/SignatureV4Base.js
init_index_browser2();

// node_modules/@smithy/signature-v4/dist-es/getCanonicalQuery.js
init_index_browser2();

// node_modules/@smithy/signature-v4/dist-es/constants.js
var ALGORITHM_QUERY_PARAM = "X-Amz-Algorithm";
var CREDENTIAL_QUERY_PARAM = "X-Amz-Credential";
var AMZ_DATE_QUERY_PARAM = "X-Amz-Date";
var SIGNED_HEADERS_QUERY_PARAM = "X-Amz-SignedHeaders";
var EXPIRES_QUERY_PARAM = "X-Amz-Expires";
var SIGNATURE_QUERY_PARAM = "X-Amz-Signature";
var TOKEN_QUERY_PARAM = "X-Amz-Security-Token";
var AUTH_HEADER = "authorization";
var AMZ_DATE_HEADER = AMZ_DATE_QUERY_PARAM.toLowerCase();
var DATE_HEADER = "date";
var GENERATED_HEADERS = [AUTH_HEADER, AMZ_DATE_HEADER, DATE_HEADER];
var SIGNATURE_HEADER = SIGNATURE_QUERY_PARAM.toLowerCase();
var SHA256_HEADER = "x-amz-content-sha256";
var TOKEN_HEADER = TOKEN_QUERY_PARAM.toLowerCase();
var ALWAYS_UNSIGNABLE_HEADERS = {
  authorization: true,
  "cache-control": true,
  connection: true,
  expect: true,
  from: true,
  "keep-alive": true,
  "max-forwards": true,
  pragma: true,
  referer: true,
  te: true,
  trailer: true,
  "transfer-encoding": true,
  upgrade: true,
  "user-agent": true,
  "x-amzn-trace-id": true
};
var PROXY_HEADER_PATTERN = /^proxy-/;
var SEC_HEADER_PATTERN = /^sec-/;
var ALGORITHM_IDENTIFIER = "AWS4-HMAC-SHA256";
var EVENT_ALGORITHM_IDENTIFIER = "AWS4-HMAC-SHA256-PAYLOAD";
var UNSIGNED_PAYLOAD = "UNSIGNED-PAYLOAD";
var MAX_CACHE_SIZE = 50;
var KEY_TYPE_IDENTIFIER = "aws4_request";
var MAX_PRESIGNED_TTL = 60 * 60 * 24 * 7;

// node_modules/@smithy/signature-v4/dist-es/getCanonicalQuery.js
var getCanonicalQuery = ({ query = {} }) => {
  const keys = [];
  const serialized = {};
  for (const key in query) {
    if (!hasOwn(query, key))
      continue;
    if (key.toLowerCase() === SIGNATURE_HEADER) {
      continue;
    }
    const encodedKey = escapeUri(key);
    keys.push(encodedKey);
    const value = query[key];
    if (typeof value === "string") {
      serialized[encodedKey] = `${encodedKey}=${escapeUri(value)}`;
    } else if (Array.isArray(value)) {
      serialized[encodedKey] = value.slice(0).reduce((encoded, value2) => encoded.concat([`${encodedKey}=${escapeUri(value2)}`]), []).sort().join("&");
    }
  }
  return keys.sort().map((key) => serialized[key]).filter((serialized2) => serialized2).join("&");
};

// node_modules/@smithy/signature-v4/dist-es/utilDate.js
var iso8601 = (time2) => toDate(time2).toISOString().replace(/\.\d{3}Z$/, "Z");
var toDate = (time2) => {
  if (typeof time2 === "number") {
    return new Date(time2 * 1e3);
  }
  if (typeof time2 === "string") {
    if (Number(time2)) {
      return new Date(Number(time2) * 1e3);
    }
    return new Date(time2);
  }
  return time2;
};

// node_modules/@smithy/signature-v4/dist-es/SignatureV4Base.js
var SignatureV4Base = class {
  constructor({ applyChecksum, credentials, region, service, sha256, uriEscapePath = true }) {
    __publicField(this, "service");
    __publicField(this, "regionProvider");
    __publicField(this, "credentialProvider");
    __publicField(this, "sha256");
    __publicField(this, "uriEscapePath");
    __publicField(this, "applyChecksum");
    this.service = service;
    this.sha256 = sha256;
    this.uriEscapePath = uriEscapePath;
    this.applyChecksum = typeof applyChecksum === "boolean" ? applyChecksum : true;
    this.regionProvider = normalizeProvider(region);
    this.credentialProvider = normalizeProvider(credentials);
  }
  createCanonicalRequest(request, canonicalHeaders, payloadHash) {
    const sortedHeaders = Object.keys(canonicalHeaders).sort();
    return `${request.method}
${this.getCanonicalPath(request)}
${getCanonicalQuery(request)}
${sortedHeaders.map((name) => `${name}:${canonicalHeaders[name]}`).join("\n")}

${sortedHeaders.join(";")}
${payloadHash}`;
  }
  async createStringToSign(longDate, credentialScope, canonicalRequest, algorithmIdentifier) {
    const hash = new this.sha256();
    hash.update(toUint8Array(canonicalRequest));
    const hashedRequest = await hash.digest();
    return `${algorithmIdentifier}
${longDate}
${credentialScope}
${toHex(hashedRequest)}`;
  }
  getCanonicalPath({ path }) {
    if (this.uriEscapePath) {
      const normalizedPathSegments = [];
      for (const pathSegment of path.split("/")) {
        if (pathSegment?.length === 0)
          continue;
        if (pathSegment === ".")
          continue;
        if (pathSegment === "..") {
          normalizedPathSegments.pop();
        } else {
          normalizedPathSegments.push(pathSegment);
        }
      }
      const normalizedPath = `${path?.startsWith("/") ? "/" : ""}${normalizedPathSegments.join("/")}${normalizedPathSegments.length > 0 && path?.endsWith("/") ? "/" : ""}`;
      const doubleEncoded = escapeUri(normalizedPath);
      return doubleEncoded.replace(/%2F/g, "/");
    }
    return path;
  }
  validateResolvedCredentials(credentials) {
    if (typeof credentials !== "object" || typeof credentials.accessKeyId !== "string" || typeof credentials.secretAccessKey !== "string") {
      throw new Error("Resolved credential object is not valid");
    }
  }
  formatDate(now) {
    const longDate = iso8601(now).replace(/[-:]/g, "");
    return {
      longDate,
      shortDate: longDate.slice(0, 8)
    };
  }
  getCanonicalHeaderList(headers) {
    return Object.keys(headers).sort().join(";");
  }
};

// node_modules/@smithy/signature-v4/dist-es/credentialDerivation.js
init_index_browser2();
var signingKeyCache = {};
var cacheQueue = [];
var createScope = (shortDate, region, service) => `${shortDate}/${region}/${service}/${KEY_TYPE_IDENTIFIER}`;
var getSigningKey = async (sha256Constructor, credentials, shortDate, region, service) => {
  const credsHash = await hmac(sha256Constructor, credentials.secretAccessKey, credentials.accessKeyId);
  const cacheKey = `${shortDate}:${region}:${service}:${toHex(credsHash)}:${credentials.sessionToken}`;
  if (cacheKey in signingKeyCache) {
    return signingKeyCache[cacheKey];
  }
  cacheQueue.push(cacheKey);
  while (cacheQueue.length > MAX_CACHE_SIZE) {
    delete signingKeyCache[cacheQueue.shift()];
  }
  let key = `AWS4${credentials.secretAccessKey}`;
  for (const signable of [shortDate, region, service, KEY_TYPE_IDENTIFIER]) {
    key = await hmac(sha256Constructor, key, signable);
  }
  return signingKeyCache[cacheKey] = key;
};
var hmac = (ctor, secret, data) => {
  const hash = new ctor(secret);
  hash.update(toUint8Array(data));
  return hash.digest();
};

// node_modules/@smithy/signature-v4/dist-es/getCanonicalHeaders.js
var getCanonicalHeaders = ({ headers }, unsignableHeaders, signableHeaders) => {
  const canonical = {};
  for (const headerName of Object.keys(headers).sort()) {
    if (headers[headerName] == void 0) {
      continue;
    }
    const canonicalHeaderName = headerName.toLowerCase();
    if (canonicalHeaderName in ALWAYS_UNSIGNABLE_HEADERS || unsignableHeaders?.has(canonicalHeaderName) || PROXY_HEADER_PATTERN.test(canonicalHeaderName) || SEC_HEADER_PATTERN.test(canonicalHeaderName)) {
      if (!signableHeaders || signableHeaders && !signableHeaders.has(canonicalHeaderName)) {
        continue;
      }
    }
    canonical[canonicalHeaderName] = headers[headerName].replace(/[\r\n]/g, " ").replace(/[ \t]+/g, " ").replace(/^ | $/g, "");
  }
  return canonical;
};

// node_modules/@smithy/signature-v4/dist-es/getPayloadHash.js
init_index_browser2();
init_index_browser2();
var getPayloadHash = async ({ headers, body }, hashConstructor) => {
  for (const headerName in headers) {
    if (!hasOwn(headers, headerName))
      continue;
    if (headerName.toLowerCase() === SHA256_HEADER) {
      return headers[headerName];
    }
  }
  if (body == void 0) {
    return "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  } else if (typeof body === "string" || ArrayBuffer.isView(body) || isArrayBuffer(body)) {
    const hashCtor = new hashConstructor();
    hashCtor.update(toUint8Array(body));
    return toHex(await hashCtor.digest());
  }
  return UNSIGNED_PAYLOAD;
};

// node_modules/@smithy/signature-v4/dist-es/headerUtil.js
init_index_browser2();
var hasHeader = (soughtHeader, headers) => {
  soughtHeader = soughtHeader.toLowerCase();
  for (const headerName in headers) {
    if (!hasOwn(headers, headerName))
      continue;
    if (soughtHeader === headerName.toLowerCase()) {
      return true;
    }
  }
  return false;
};

// node_modules/@smithy/signature-v4/dist-es/moveHeadersToQuery.js
init_index_browser2();
var moveHeadersToQuery = (request, options = {}) => {
  const { headers, query = {} } = HttpRequest.clone(request);
  for (const name in headers) {
    if (!hasOwn(headers, name))
      continue;
    const lname = name.toLowerCase();
    if (lname.slice(0, 6) === "x-amz-" && !options.unhoistableHeaders?.has(lname) || options.hoistableHeaders?.has(lname)) {
      query[name] = headers[name];
      delete headers[name];
    }
  }
  return {
    ...request,
    headers,
    query
  };
};

// node_modules/@smithy/signature-v4/dist-es/prepareRequest.js
init_index_browser2();
var prepareRequest = (request) => {
  request = HttpRequest.clone(request);
  for (const headerName in request.headers) {
    if (!hasOwn(request.headers, headerName))
      continue;
    if (GENERATED_HEADERS.indexOf(headerName.toLowerCase()) > -1) {
      delete request.headers[headerName];
    }
  }
  return request;
};

// node_modules/@smithy/signature-v4/dist-es/SignatureV4.js
var SignatureV4 = class extends SignatureV4Base {
  constructor({ applyChecksum, credentials, region, service, sha256, uriEscapePath = true }) {
    super({
      applyChecksum,
      credentials,
      region,
      service,
      sha256,
      uriEscapePath
    });
    __publicField(this, "headerFormatter", new HeaderFormatter());
  }
  async presign(originalRequest, options = {}) {
    const { signingDate = /* @__PURE__ */ new Date(), expiresIn = 3600, unsignableHeaders, unhoistableHeaders, signableHeaders, hoistableHeaders, signingRegion, signingService } = options;
    const credentials = await this.credentialProvider();
    this.validateResolvedCredentials(credentials);
    const region = signingRegion ?? await this.regionProvider();
    const { longDate, shortDate } = this.formatDate(signingDate);
    if (expiresIn > MAX_PRESIGNED_TTL) {
      return Promise.reject("Signature version 4 presigned URLs must have an expiration date less than one week in the future");
    }
    const scope = createScope(shortDate, region, signingService ?? this.service);
    const request = moveHeadersToQuery(prepareRequest(originalRequest), { unhoistableHeaders, hoistableHeaders });
    if (credentials.sessionToken) {
      request.query[TOKEN_QUERY_PARAM] = credentials.sessionToken;
    }
    request.query[ALGORITHM_QUERY_PARAM] = ALGORITHM_IDENTIFIER;
    request.query[CREDENTIAL_QUERY_PARAM] = `${credentials.accessKeyId}/${scope}`;
    request.query[AMZ_DATE_QUERY_PARAM] = longDate;
    request.query[EXPIRES_QUERY_PARAM] = expiresIn.toString(10);
    const canonicalHeaders = getCanonicalHeaders(request, unsignableHeaders, signableHeaders);
    request.query[SIGNED_HEADERS_QUERY_PARAM] = this.getCanonicalHeaderList(canonicalHeaders);
    request.query[SIGNATURE_QUERY_PARAM] = await this.getSignature(longDate, scope, this.getSigningKey(credentials, region, shortDate, signingService), this.createCanonicalRequest(request, canonicalHeaders, await getPayloadHash(originalRequest, this.sha256)));
    return request;
  }
  async sign(toSign, options) {
    if (typeof toSign === "string") {
      return this.signString(toSign, options);
    } else if (toSign.headers && toSign.payload) {
      return this.signEvent(toSign, options);
    } else if (toSign.message) {
      return this.signMessage(toSign, options);
    } else {
      return this.signRequest(toSign, options);
    }
  }
  async signEvent({ headers, payload }, { signingDate = /* @__PURE__ */ new Date(), priorSignature, signingRegion, signingService, eventStreamCredentials }) {
    const region = signingRegion ?? await this.regionProvider();
    const { shortDate, longDate } = this.formatDate(signingDate);
    const scope = createScope(shortDate, region, signingService ?? this.service);
    const hashedPayload = await getPayloadHash({ headers: {}, body: payload }, this.sha256);
    const hash = new this.sha256();
    hash.update(headers);
    const hashedHeaders = toHex(await hash.digest());
    const stringToSign = [
      EVENT_ALGORITHM_IDENTIFIER,
      longDate,
      scope,
      priorSignature,
      hashedHeaders,
      hashedPayload
    ].join("\n");
    return this.signString(stringToSign, {
      signingDate,
      signingRegion: region,
      signingService,
      eventStreamCredentials
    });
  }
  async signMessage(signableMessage, { signingDate = /* @__PURE__ */ new Date(), signingRegion, signingService, eventStreamCredentials }) {
    const promise = this.signEvent({
      headers: this.headerFormatter.format(signableMessage.message.headers),
      payload: signableMessage.message.body
    }, {
      signingDate,
      signingRegion,
      signingService,
      priorSignature: signableMessage.priorSignature,
      eventStreamCredentials
    });
    return promise.then((signature) => {
      return { message: signableMessage.message, signature };
    });
  }
  async signString(stringToSign, { signingDate = /* @__PURE__ */ new Date(), signingRegion, signingService, eventStreamCredentials } = {}) {
    const credentials = eventStreamCredentials ?? await this.credentialProvider();
    this.validateResolvedCredentials(credentials);
    const region = signingRegion ?? await this.regionProvider();
    const { shortDate } = this.formatDate(signingDate);
    const hash = new this.sha256(await this.getSigningKey(credentials, region, shortDate, signingService));
    hash.update(toUint8Array(stringToSign));
    return toHex(await hash.digest());
  }
  async signRequest(requestToSign, { signingDate = /* @__PURE__ */ new Date(), signableHeaders, unsignableHeaders, signingRegion, signingService } = {}) {
    const credentials = await this.credentialProvider();
    this.validateResolvedCredentials(credentials);
    const region = signingRegion ?? await this.regionProvider();
    const request = prepareRequest(requestToSign);
    const { longDate, shortDate } = this.formatDate(signingDate);
    const scope = createScope(shortDate, region, signingService ?? this.service);
    request.headers[AMZ_DATE_HEADER] = longDate;
    if (credentials.sessionToken) {
      request.headers[TOKEN_HEADER] = credentials.sessionToken;
    }
    const payloadHash = await getPayloadHash(request, this.sha256);
    if (!hasHeader(SHA256_HEADER, request.headers) && this.applyChecksum) {
      request.headers[SHA256_HEADER] = payloadHash;
    }
    const canonicalHeaders = getCanonicalHeaders(request, unsignableHeaders, signableHeaders);
    const signature = await this.getSignature(longDate, scope, this.getSigningKey(credentials, region, shortDate, signingService), this.createCanonicalRequest(request, canonicalHeaders, payloadHash));
    request.headers[AUTH_HEADER] = `${ALGORITHM_IDENTIFIER} Credential=${credentials.accessKeyId}/${scope}, SignedHeaders=${this.getCanonicalHeaderList(canonicalHeaders)}, Signature=${signature}`;
    return request;
  }
  async getSignature(longDate, credentialScope, keyPromise, canonicalRequest) {
    const stringToSign = await this.createStringToSign(longDate, credentialScope, canonicalRequest, ALGORITHM_IDENTIFIER);
    const hash = new this.sha256(await keyPromise);
    hash.update(toUint8Array(stringToSign));
    return toHex(await hash.digest());
  }
  getSigningKey(credentials, region, shortDate, service) {
    return getSigningKey(this.sha256, credentials, shortDate, region, service || this.service);
  }
};

// node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/aws_sdk/resolveAwsSdkSigV4Config.js
var bindResolveAwsSdkSigV4Config = (defaultDisableClockSkewCorrection) => (config) => {
  let inputCredentials = config.credentials;
  let isUserSupplied = !!config.credentials;
  let resolvedCredentials = void 0;
  Object.defineProperty(config, "credentials", {
    set(credentials) {
      if (credentials && credentials !== inputCredentials && credentials !== resolvedCredentials) {
        isUserSupplied = true;
      }
      inputCredentials = credentials;
      const memoizedProvider = normalizeCredentialProvider(config, {
        credentials: inputCredentials,
        credentialDefaultProvider: config.credentialDefaultProvider
      });
      const boundProvider = bindCallerConfig(config, memoizedProvider);
      if (isUserSupplied && !boundProvider.attributed) {
        const isCredentialObject = typeof inputCredentials === "object" && inputCredentials !== null;
        resolvedCredentials = async (options) => {
          const creds = await boundProvider(options);
          const attributedCreds = creds;
          if (isCredentialObject && (!attributedCreds.$source || Object.keys(attributedCreds.$source).length === 0)) {
            return setCredentialFeature(attributedCreds, "CREDENTIALS_CODE", "e");
          }
          return attributedCreds;
        };
        resolvedCredentials.memoized = boundProvider.memoized;
        resolvedCredentials.configBound = boundProvider.configBound;
        resolvedCredentials.attributed = true;
      } else {
        resolvedCredentials = boundProvider;
      }
    },
    get() {
      return resolvedCredentials;
    },
    enumerable: true,
    configurable: true
  });
  config.credentials = inputCredentials;
  const { signingEscapePath = true, systemClockOffset = config.systemClockOffset || 0, sha256 } = config;
  let signer;
  if (config.signer) {
    signer = normalizeProvider2(config.signer);
  } else if (config.regionInfoProvider) {
    signer = () => normalizeProvider2(config.region)().then(async (region) => [
      await config.regionInfoProvider(region, {
        useFipsEndpoint: await config.useFipsEndpoint(),
        useDualstackEndpoint: await config.useDualstackEndpoint()
      }) || {},
      region
    ]).then(([regionInfo, region]) => {
      const { signingRegion, signingService } = regionInfo;
      config.signingRegion = config.signingRegion || signingRegion || region;
      config.signingName = config.signingName || signingService || config.serviceId;
      const params = {
        ...config,
        credentials: config.credentials,
        region: config.signingRegion,
        service: config.signingName,
        sha256,
        uriEscapePath: signingEscapePath
      };
      const SignerCtor = config.signerConstructor || SignatureV4;
      return new SignerCtor(params);
    });
  } else {
    signer = async (authScheme) => {
      authScheme = Object.assign({}, {
        name: "sigv4",
        signingName: config.signingName || config.defaultSigningName,
        signingRegion: await normalizeProvider2(config.region)(),
        properties: {}
      }, authScheme);
      const signingRegion = authScheme.signingRegion;
      const signingService = authScheme.signingName;
      config.signingRegion = config.signingRegion || signingRegion;
      config.signingName = config.signingName || signingService || config.serviceId;
      const params = {
        ...config,
        credentials: config.credentials,
        region: config.signingRegion,
        service: config.signingName,
        sha256,
        uriEscapePath: signingEscapePath
      };
      const SignerCtor = config.signerConstructor || SignatureV4;
      return new SignerCtor(params);
    };
  }
  const resolvedConfig = Object.assign(config, {
    systemClockOffset,
    signingEscapePath,
    signer,
    disableClockSkewCorrection: normalizeProvider2(config.disableClockSkewCorrection ?? defaultDisableClockSkewCorrection)
  });
  return resolvedConfig;
};
function normalizeCredentialProvider(config, { credentials, credentialDefaultProvider }) {
  let credentialsProvider;
  if (credentials) {
    if (!credentials?.memoized) {
      credentialsProvider = memoizeIdentityProvider(credentials, isIdentityExpired, doesIdentityRequireRefresh);
    } else {
      credentialsProvider = credentials;
    }
  } else {
    if (credentialDefaultProvider) {
      credentialsProvider = normalizeProvider2(credentialDefaultProvider(Object.assign({}, config, {
        parentClientConfig: config
      })));
    } else {
      credentialsProvider = async () => {
        throw new Error("@aws-sdk/core::resolveAwsSdkSigV4Config - `credentials` not provided and no credentialDefaultProvider was configured.");
      };
    }
  }
  credentialsProvider.memoized = true;
  return credentialsProvider;
}
function bindCallerConfig(config, credentialsProvider) {
  if (credentialsProvider.configBound) {
    return credentialsProvider;
  }
  const fn = async (options) => credentialsProvider({ ...options, callerClientConfig: config });
  fn.memoized = credentialsProvider.memoized;
  fn.configBound = true;
  return fn;
}

// node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/aws_sdk/clock-skew-defaults.browser.js
var DEFAULT_DISABLE_CLOCK_SKEW_CORRECTION = false;

// node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/index.browser.js
var resolveAwsSdkSigV4Config = bindResolveAwsSdkSigV4Config(DEFAULT_DISABLE_CLOCK_SKEW_CORRECTION);

// node_modules/@aws-sdk/client-secrets-manager/dist-es/auth/httpAuthSchemeProvider.js
var defaultSecretsManagerHttpAuthSchemeParametersProvider = async (config, context, input) => {
  return {
    operation: getSmithyContext(context).operation,
    region: await normalizeProvider(config.region)() || (() => {
      throw new Error("expected `region` to be configured for `aws.auth#sigv4`");
    })()
  };
};
function createAwsAuthSigv4HttpAuthOption(authParameters) {
  return {
    schemeId: "aws.auth#sigv4",
    signingProperties: {
      name: "secretsmanager",
      region: authParameters.region
    },
    propertiesExtractor: (config, context) => ({
      signingProperties: {
        config,
        context
      }
    })
  };
}
var defaultSecretsManagerHttpAuthSchemeProvider = (authParameters) => {
  const options = [];
  switch (authParameters.operation) {
    default: {
      options.push(createAwsAuthSigv4HttpAuthOption(authParameters));
    }
  }
  return options;
};
var resolveHttpAuthSchemeConfig = (config) => {
  const config_0 = resolveAwsSdkSigV4Config(config);
  return Object.assign(config_0, {
    authSchemePreference: normalizeProvider(config.authSchemePreference ?? [])
  });
};

// node_modules/@aws-sdk/client-secrets-manager/dist-es/endpoint/EndpointParameters.js
var resolveClientEndpointParameters = (options) => {
  return Object.assign(options, {
    useDualstackEndpoint: options.useDualstackEndpoint ?? false,
    useFipsEndpoint: options.useFipsEndpoint ?? false,
    defaultSigningName: "secretsmanager"
  });
};
var commonParams = {
  UseFIPS: { type: "builtInParams", name: "useFipsEndpoint" },
  Endpoint: { type: "builtInParams", name: "endpoint" },
  Region: { type: "builtInParams", name: "region" },
  UseDualStack: { type: "builtInParams", name: "useDualstackEndpoint" }
};

// node_modules/@aws-sdk/client-secrets-manager/package.json
var package_default = {
  name: "@aws-sdk/client-secrets-manager",
  version: "3.1148.0",
  description: "AWS SDK for JavaScript Secrets Manager Client for Node.js, Browser and React Native",
  homepage: "https://github.com/aws/aws-sdk-js-v3/tree/main/clients/client-secrets-manager",
  license: "Apache-2.0",
  author: {
    name: "AWS SDK for JavaScript Team",
    url: "https://aws.amazon.com/sdk-for-javascript/"
  },
  repository: {
    type: "git",
    url: "https://github.com/aws/aws-sdk-js-v3.git",
    directory: "clients/client-secrets-manager"
  },
  files: [
    "dist-*/**"
  ],
  sideEffects: false,
  main: "./dist-cjs/index.js",
  module: "./dist-es/index.js",
  browser: {
    "./dist-es/runtimeConfig": "./dist-es/runtimeConfig.browser"
  },
  types: "./dist-types/index.d.ts",
  typesVersions: {
    "<4.5": {
      "dist-types/*": [
        "dist-types/ts3.4/*"
      ]
    }
  },
  "react-native": {
    "./dist-es/runtimeConfig": "./dist-es/runtimeConfig.native"
  },
  scripts: {
    build: "concurrently 'yarn:build:types' 'yarn:build:es' && yarn build:cjs",
    "build:cjs": "node ../../scripts/compilation/inline",
    "build:es": "premove dist-es && tsc -p tsconfig.es.json",
    "build:include:deps": 'yarn g:turbo run build -F="$npm_package_name"',
    "build:types": "premove dist-types && tsc -p tsconfig.types.json",
    "build:types:downlevel": "downlevel-dts dist-types dist-types/ts3.4",
    clean: "premove dist-cjs dist-es dist-types",
    "extract:docs": "api-extractor run --local",
    "generate:client": "node ../../scripts/generate-clients/single-service",
    test: "yarn g:vitest run --passWithNoTests",
    "test:watch": "yarn g:vitest watch --passWithNoTests",
    "test:integration": "yarn g:vitest run --passWithNoTests -c vitest.config.integ.mts",
    "test:integration:watch": "yarn g:vitest watch --passWithNoTests -c vitest.config.integ.mts",
    "test:index": "tsc -p tsconfig.test.json && node ./test/index-objects.spec.mjs"
  },
  dependencies: {
    "@aws-sdk/core": "^3.978.1",
    "@aws-sdk/credential-provider-node": "^3.972.84",
    "@aws-sdk/types": "^3.974.6",
    "@smithy/core": "^3.35.0",
    "@smithy/fetch-http-handler": "^5.8.0",
    "@smithy/node-http-handler": "^4.12.1",
    "@smithy/types": "^4.19.0",
    tslib: "^2.6.2"
  },
  devDependencies: {
    "@smithy/snapshot-testing": "^2.3.2",
    "@tsconfig/node20": "20.1.8",
    "@types/node": "^20.14.8",
    concurrently: "7.0.0",
    "downlevel-dts": "0.10.1",
    premove: "4.0.0",
    typescript: "~7.0.2",
    vitest: "^4.0.17"
  },
  engines: {
    node: ">=20.0.0"
  }
};

// node_modules/@aws-sdk/client-secrets-manager/dist-es/runtimeConfig.browser.js
init_index_browser2();

// node_modules/@smithy/fetch-http-handler/dist-es/create-request.js
function createRequest(url, requestOptions) {
  return new Request(url, requestOptions);
}

// node_modules/@smithy/fetch-http-handler/dist-es/request-timeout.js
function requestTimeout(timeoutInMs = 0) {
  return new Promise((resolve, reject) => {
    if (timeoutInMs) {
      setTimeout(() => {
        const timeoutError = new Error(`Request did not complete within ${timeoutInMs} ms`);
        timeoutError.name = "TimeoutError";
        reject(timeoutError);
      }, timeoutInMs);
    }
  });
}

// node_modules/@smithy/fetch-http-handler/dist-es/fetch-http-handler.js
var keepAliveSupport = {
  supported: void 0
};
var FetchHttpHandler = class _FetchHttpHandler {
  constructor(options) {
    __publicField(this, "config");
    __publicField(this, "configProvider");
    if (typeof options === "function") {
      this.configProvider = options().then((opts) => opts || {});
    } else {
      this.config = options ?? {};
      this.configProvider = Promise.resolve(this.config);
    }
    if (keepAliveSupport.supported === void 0) {
      keepAliveSupport.supported = Boolean(typeof Request !== "undefined" && "keepalive" in createRequest("https://[::1]"));
    }
  }
  static create(instanceOrOptions) {
    if (typeof instanceOrOptions?.handle === "function") {
      return instanceOrOptions;
    }
    return new _FetchHttpHandler(instanceOrOptions);
  }
  destroy() {
  }
  async handle(request, { abortSignal, requestTimeout: requestTimeout2 } = {}) {
    if (!this.config) {
      this.config = await this.configProvider;
    }
    const requestTimeoutInMs = requestTimeout2 ?? this.config.requestTimeout;
    const keepAlive = this.config.keepAlive === true;
    const credentials = this.config.credentials;
    const fetchFn = this.config.customFetch ?? fetch;
    if (abortSignal?.aborted) {
      const abortError = buildAbortError(abortSignal);
      return Promise.reject(abortError);
    }
    let path = request.path;
    const queryString = buildQueryString(request.query || {});
    if (queryString) {
      path += `?${queryString}`;
    }
    if (request.fragment) {
      path += `#${request.fragment}`;
    }
    let auth = "";
    if (request.username != null || request.password != null) {
      const username = request.username ?? "";
      const password = request.password ?? "";
      auth = `${username}:${password}@`;
    }
    const { port, method } = request;
    const url = `${request.protocol}//${auth}${request.hostname}${port ? `:${port}` : ""}${path}`;
    const body = method === "GET" || method === "HEAD" ? void 0 : request.body;
    const requestOptions = {
      body,
      headers: new Headers(request.headers),
      method,
      credentials
    };
    if (this.config?.cache) {
      requestOptions.cache = this.config.cache;
    }
    if (body) {
      requestOptions.duplex = "half";
    }
    if (typeof AbortController !== "undefined") {
      requestOptions.signal = abortSignal;
    }
    if (keepAliveSupport.supported) {
      requestOptions.keepalive = keepAlive;
    }
    if (typeof this.config.requestInit === "function") {
      Object.assign(requestOptions, this.config.requestInit(request));
    }
    let removeSignalEventListener = () => {
    };
    const fetchRequest = createRequest(url, requestOptions);
    const raceOfPromises = [
      fetchFn(fetchRequest).then((response) => {
        const fetchHeaders = response.headers;
        const transformedHeaders = {};
        for (const pair of fetchHeaders.entries()) {
          transformedHeaders[pair[0]] = pair[1];
        }
        const hasReadableStream = response.body != void 0;
        if (!hasReadableStream) {
          return response.blob().then((body2) => ({
            response: new HttpResponse({
              headers: transformedHeaders,
              reason: response.statusText,
              statusCode: response.status,
              body: body2
            })
          }));
        }
        return {
          response: new HttpResponse({
            headers: transformedHeaders,
            reason: response.statusText,
            statusCode: response.status,
            body: response.body
          })
        };
      }),
      requestTimeout(requestTimeoutInMs)
    ];
    if (abortSignal) {
      raceOfPromises.push(new Promise((resolve, reject) => {
        const onAbort = () => {
          const abortError = buildAbortError(abortSignal);
          reject(abortError);
        };
        if (typeof abortSignal.addEventListener === "function") {
          const signal = abortSignal;
          signal.addEventListener("abort", onAbort, { once: true });
          removeSignalEventListener = () => signal.removeEventListener("abort", onAbort);
        } else {
          abortSignal.onabort = onAbort;
        }
      }));
    }
    return Promise.race(raceOfPromises).finally(removeSignalEventListener);
  }
  updateHttpClientConfig(key, value) {
    this.config = void 0;
    this.configProvider = this.configProvider.then((config) => {
      config[key] = value;
      return config;
    });
  }
  httpHandlerConfigs() {
    return this.config ?? {};
  }
};
function buildAbortError(abortSignal) {
  const reason = abortSignal && typeof abortSignal === "object" && "reason" in abortSignal ? abortSignal.reason : void 0;
  if (reason) {
    if (reason instanceof Error) {
      const abortError3 = new Error("Request aborted");
      abortError3.name = "AbortError";
      abortError3.cause = reason;
      return abortError3;
    }
    const abortError2 = new Error(String(reason));
    abortError2.name = "AbortError";
    return abortError2;
  }
  const abortError = new Error("Request aborted");
  abortError.name = "AbortError";
  return abortError;
}

// node_modules/@smithy/fetch-http-handler/dist-es/index.js
init_index_browser2();

// node_modules/@aws-sdk/core/dist-es/submodules/protocols/ProtocolLib.js
init_schema();
var ProtocolLib = class {
  constructor(queryCompat = false) {
    __publicField(this, "queryCompat");
    __publicField(this, "errorRegistry");
    this.queryCompat = queryCompat;
  }
  resolveRestContentType(defaultContentType, inputSchema) {
    const members = inputSchema.getMemberSchemas();
    const httpPayloadMember = Object.values(members).find((m2) => {
      return !!m2.getMergedTraits().httpPayload;
    });
    if (httpPayloadMember) {
      const mediaType = httpPayloadMember.getMergedTraits().mediaType;
      if (mediaType) {
        return mediaType;
      } else if (httpPayloadMember.isStringSchema()) {
        return "text/plain";
      } else if (httpPayloadMember.isBlobSchema()) {
        return "application/octet-stream";
      } else {
        return defaultContentType;
      }
    } else if (!inputSchema.isUnitSchema()) {
      const hasBody = Object.values(members).find((m2) => {
        const { httpQuery, httpQueryParams, httpHeader, httpLabel, httpPrefixHeaders } = m2.getMergedTraits();
        const noPrefixHeaders = httpPrefixHeaders === void 0;
        return !httpQuery && !httpQueryParams && !httpHeader && !httpLabel && noPrefixHeaders;
      });
      if (hasBody) {
        return defaultContentType;
      }
    }
  }
  async getErrorSchemaOrThrowBaseException(errorIdentifier, defaultNamespace, response, dataObject, metadata, getErrorSchema) {
    let errorName = errorIdentifier;
    if (errorIdentifier.includes("#")) {
      [, errorName] = errorIdentifier.split("#");
    }
    const errorMetadata = {
      $metadata: metadata,
      $fault: response.statusCode < 500 ? "client" : "server"
    };
    if (!this.errorRegistry) {
      throw new Error("@aws-sdk/core/protocols - error handler not initialized.");
    }
    try {
      const errorSchema = getErrorSchema?.(this.errorRegistry, errorName) ?? this.errorRegistry.getSchema(errorIdentifier);
      return { errorSchema, errorMetadata };
    } catch (e3) {
      dataObject.message = dataObject.message ?? dataObject.Message ?? "UnknownError";
      const synthetic = this.errorRegistry;
      const baseExceptionSchema = synthetic.getBaseException();
      if (baseExceptionSchema) {
        const ErrorCtor = synthetic.getErrorCtor(baseExceptionSchema) ?? Error;
        throw this.decorateServiceException(Object.assign(new ErrorCtor({ name: errorName }), errorMetadata), dataObject);
      }
      const d3 = dataObject;
      const message = d3?.message ?? d3?.Message ?? d3?.Error?.Message ?? d3?.Error?.message;
      throw this.decorateServiceException(Object.assign(new Error(message), {
        name: errorName
      }, errorMetadata), dataObject);
    }
  }
  compose(composite, errorIdentifier, defaultNamespace) {
    let namespace = defaultNamespace;
    if (errorIdentifier.includes("#")) {
      [namespace] = errorIdentifier.split("#");
    }
    const staticRegistry = TypeRegistry.for(namespace);
    const defaultSyntheticRegistry = TypeRegistry.for("smithy.ts.sdk.synthetic." + defaultNamespace);
    composite.copyFrom(staticRegistry);
    composite.copyFrom(defaultSyntheticRegistry);
    this.errorRegistry = composite;
  }
  decorateServiceException(exception, additions = {}) {
    if (this.queryCompat) {
      const msg = exception.Message ?? additions.Message;
      const error = decorateServiceException(exception, additions);
      if (msg) {
        error.message = msg;
      }
      const errorObj = error.Error ?? {};
      errorObj.Type = error.Error?.Type;
      errorObj.Code = error.Error?.Code;
      errorObj.Message = error.Error?.message ?? error.Error?.Message ?? msg;
      error.Error = errorObj;
      const reqId = error.$metadata.requestId;
      if (reqId) {
        error.RequestId = reqId;
      }
      return error;
    }
    return decorateServiceException(exception, additions);
  }
  setQueryCompatError(output, response) {
    const queryErrorHeader = response.headers?.["x-amzn-query-error"];
    if (output !== void 0 && queryErrorHeader != null) {
      const [Code, Type] = queryErrorHeader.split(";");
      const keys = Object.keys(output);
      const Error2 = {
        Code,
        Type
      };
      output.Code = Code;
      output.Type = Type;
      for (let i3 = 0; i3 < keys.length; i3++) {
        const k3 = keys[i3];
        Error2[k3 === "message" ? "Message" : k3] = output[k3];
      }
      delete Error2.__type;
      output.Error = Error2;
    }
  }
  queryCompatOutput(queryCompatErrorData, errorData) {
    if (queryCompatErrorData.Error) {
      errorData.Error = queryCompatErrorData.Error;
    }
    if (queryCompatErrorData.Type) {
      errorData.Type = queryCompatErrorData.Type;
    }
    if (queryCompatErrorData.Code) {
      errorData.Code = queryCompatErrorData.Code;
    }
  }
  findQueryCompatibleError(registry, errorName) {
    try {
      return registry.getSchema(errorName);
    } catch (e3) {
      return registry.find((schema) => NormalizedSchema.of(schema).getMergedTraits().awsQueryError?.[0] === errorName);
    }
  }
};

// node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/AwsJsonRpcProtocol.js
init_schema();

// node_modules/@aws-sdk/core/dist-es/submodules/protocols/ConfigurableSerdeContext.js
var SerdeContextConfig = class {
  constructor() {
    __publicField(this, "serdeContext");
  }
  setSerdeContext(serdeContext) {
    this.serdeContext = serdeContext;
  }
};

// node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/codec-v2/JsonShapeDeserializer2.js
init_schema();
init_index_browser2();

// node_modules/@aws-sdk/core/dist-es/submodules/protocols/UnionSerde.js
var UnionSerde = class {
  constructor(from, to) {
    __publicField(this, "from");
    __publicField(this, "to");
    __publicField(this, "keys");
    this.from = from;
    this.to = to;
    const keys = Object.keys(this.from);
    const set = new Set(keys);
    set.delete("__type");
    this.keys = set;
  }
  mark(key) {
    this.keys.delete(key);
  }
  hasUnknown() {
    return this.keys.size === 1 && Object.keys(this.to).length === 0;
  }
  writeUnknown() {
    if (this.hasUnknown()) {
      const k3 = this.keys.values().next().value;
      const v = this.from[k3];
      this.to.$unknown = [k3, v];
    }
  }
};

// node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/detectBufferParsing.js
var canParseBuffer;
function detectBufferParsing() {
  if (canParseBuffer === void 0) {
    try {
      if (typeof Buffer !== "function") {
        canParseBuffer = false;
      } else {
        const result = JSON.parse(Buffer.from([123, 125]));
        canParseBuffer = result !== null && typeof result === "object";
      }
    } catch {
      canParseBuffer = false;
    }
  }
  return canParseBuffer;
}

// node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/jsonReviver.js
init_index_browser2();
function jsonReviver(key, value, context) {
  if (context?.source) {
    const numericString = context.source;
    if (typeof value === "number") {
      const inSafeRange = value <= Number.MAX_SAFE_INTEGER && value >= Number.MIN_SAFE_INTEGER;
      if (inSafeRange) {
        if (isRepresentable(numericString, value)) {
          return value;
        }
        return new NumericValue(numericString, "bigDecimal");
      } else {
        if (isFractionalBigNumeric(numericString)) {
          return new NumericValue(numericString, "bigDecimal");
        }
        if (/[eE]/.test(numericString)) {
          return expandExponentToBigInt(numericString);
        }
        return BigInt(numericString);
      }
    }
  }
  return value;
}
function isFractionalBigNumeric(s) {
  const dotIndex = s.indexOf(".");
  if (dotIndex === -1) {
    return false;
  }
  const eIndex = s.search(/[eE]/);
  if (eIndex === -1) {
    return true;
  }
  const fracDigits = eIndex - dotIndex - 1;
  const exp = parseInt(s.slice(eIndex + 1), 10);
  return exp < fracDigits;
}
function isRepresentable(numericString, value) {
  if (numericString === String(value)) {
    return true;
  }
  if (Object.is(value, -0)) {
    return true;
  }
  if (/[eE]/.test(numericString)) {
    return expandToDecimal(numericString) === expandToDecimal(String(value));
  }
  const normalized = numericString.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  const canonical = String(value);
  if (normalized === canonical) {
    return true;
  }
  if (/[eE]/.test(canonical)) {
    return normalized === expandToDecimal(canonical);
  }
  return false;
}
function expandToDecimal(s) {
  const negative = s.startsWith("-");
  const abs = negative ? s.slice(1) : s;
  const eIndex = abs.search(/[eE]/);
  let result;
  if (eIndex === -1) {
    result = abs;
  } else {
    const exp = parseInt(abs.slice(eIndex + 1), 10);
    const mantissa = abs.slice(0, eIndex);
    const dotIndex = mantissa.indexOf(".");
    let digits;
    let intLen;
    if (dotIndex === -1) {
      digits = mantissa;
      intLen = mantissa.length;
    } else {
      digits = mantissa.slice(0, dotIndex) + mantissa.slice(dotIndex + 1);
      intLen = dotIndex;
    }
    digits = digits.replace(/0+$/, "") || "0";
    const newDotPos = intLen + exp;
    if (digits === "0") {
      result = "0";
    } else if (newDotPos <= 0) {
      result = "0." + "0".repeat(-newDotPos) + digits;
    } else if (newDotPos >= digits.length) {
      result = digits + "0".repeat(newDotPos - digits.length);
    } else {
      result = digits.slice(0, newDotPos) + "." + digits.slice(newDotPos);
    }
  }
  if (result.includes(".")) {
    result = result.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  }
  return (negative ? "-" : "") + result;
}
function expandExponentToBigInt(s) {
  const eIndex = s.search(/[eE]/);
  const exp = parseInt(s.slice(eIndex + 1), 10);
  const negative = s.startsWith("-");
  const mantissa = s.slice(negative ? 1 : 0, eIndex);
  const dotIndex = mantissa.indexOf(".");
  let digits;
  let shift;
  if (dotIndex === -1) {
    digits = mantissa;
    shift = exp;
  } else {
    digits = mantissa.slice(0, dotIndex) + mantissa.slice(dotIndex + 1);
    const fracDigits = mantissa.length - dotIndex - 1;
    shift = exp - fracDigits;
  }
  digits = digits.replace(/0+$/, "") || "0";
  const result = BigInt(digits) * 10n ** BigInt(shift + (mantissa.replace(".", "").length - digits.length));
  return negative ? -result : result;
}

// node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/needsReviver.js
init_schema();
var REVIVER_SYMBOL = /* @__PURE__ */ Symbol.for("@aws-sdk/reviver");
function needsReviver(schema) {
  const ns = NormalizedSchema.of(schema);
  const raw = ns.getSchema();
  if (Array.isArray(raw) && ns.isStructSchema()) {
    if (REVIVER_SYMBOL in raw) {
      return raw[REVIVER_SYMBOL];
    }
    const result = _check(ns, /* @__PURE__ */ new Set());
    raw[REVIVER_SYMBOL] = result;
    return result;
  }
  return _check(ns, /* @__PURE__ */ new Set());
}
function _check(ns, seen) {
  const raw = ns.getSchema();
  if (seen.has(raw)) {
    return false;
  }
  seen.add(raw);
  if (ns.isBigIntegerSchema() || ns.isBigDecimalSchema()) {
    return true;
  }
  if (ns.isStructSchema()) {
    for (const [, memberSchema] of ns.structIterator()) {
      if (_check(memberSchema, seen)) {
        return true;
      }
    }
  } else if (ns.isListSchema() || ns.isMapSchema()) {
    if (_check(ns.getValueSchema(), seen)) {
      return true;
    }
  } else if (ns.isDocumentSchema()) {
    return true;
  }
  return false;
}

// node_modules/@aws-sdk/core/dist-es/submodules/protocols/common.js
init_index_browser2();
var collectBodyString = (streamBody, context) => collectBody(streamBody, context).then((body) => (context?.utf8Encoder ?? toUtf8)(body));

// node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/parseJsonBody.js
async function parseJsonBody(streamBody, context, schema) {
  let parsingInput;
  if (detectBufferParsing() && typeof streamBody?.[Symbol.asyncIterator] === "function") {
    const buffer = await collectBody(streamBody, context);
    if (typeof Buffer === "function") {
      if (Buffer.isBuffer(buffer)) {
        parsingInput = buffer;
      } else {
        parsingInput = Buffer.from(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      }
    }
  }
  if (!parsingInput) {
    parsingInput = await collectBodyString(streamBody, context);
  }
  if (parsingInput.length === 0) {
    return {};
  }
  const reviver = schema && needsReviver(schema) ? jsonReviver : void 0;
  try {
    return JSON.parse(parsingInput, reviver);
  } catch (e3) {
    if (e3?.name === "SyntaxError") {
      Object.defineProperty(e3, "$responseBodyText", {
        value: typeof parsingInput === "string" ? parsingInput : parsingInput.toString("utf8")
      });
    }
    throw e3;
  }
}
var findKey = (object, key) => Object.keys(object).find((k3) => k3.toLowerCase() === key.toLowerCase());
var sanitizeErrorCode = (rawValue) => {
  let cleanValue = rawValue;
  if (typeof cleanValue === "number") {
    cleanValue = cleanValue.toString();
  }
  if (cleanValue.indexOf(",") >= 0) {
    cleanValue = cleanValue.split(",")[0];
  }
  if (cleanValue.indexOf(":") >= 0) {
    cleanValue = cleanValue.split(":")[0];
  }
  if (cleanValue.indexOf("#") >= 0) {
    cleanValue = cleanValue.split("#")[1];
  }
  return cleanValue;
};
var loadRestJsonErrorCode = (output, data) => {
  return loadErrorCode(output, data, ["header", "code", "type"]);
};
var loadJsonRpcErrorCode = (output, data, queryCompat = false) => {
  return loadErrorCode(output, data, queryCompat ? ["code", "header", "type"] : ["type", "code", "header"]);
};
var loadErrorCode = ({ headers }, data, order) => {
  while (order.length > 0) {
    const location = order.shift();
    switch (location) {
      case "header":
        const headerKey = findKey(headers ?? {}, "x-amzn-errortype");
        if (headerKey !== void 0) {
          return sanitizeErrorCode(headers[headerKey]);
        }
        break;
      case "code":
        const codeKey = findKey(data ?? {}, "code");
        if (codeKey && data[codeKey] !== void 0) {
          return sanitizeErrorCode(data[codeKey]);
        }
        break;
      case "type":
        if (data?.__type !== void 0) {
          return sanitizeErrorCode(data.__type);
        }
        break;
    }
  }
};

// node_modules/@aws-sdk/core/dist-es/submodules/protocols/writeKey.js
function writeKey(obj) {
  Object.defineProperty(obj, "__proto__", { value: void 0, writable: true, enumerable: true, configurable: true });
}

// node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/codec-v2/JsonShapeDeserializer2.js
var JsonShapeDeserializer2 = class extends SerdeContextConfig {
  constructor(settings) {
    super();
    __publicField(this, "settings");
    this.settings = settings;
  }
  async read(schema, data) {
    const reviver = needsReviver(schema) ? jsonReviver : void 0;
    let parsed;
    if (typeof data === "string") {
      if (data.length === 0) {
        return {};
      }
      parsed = JSON.parse(data, reviver);
    } else if (data instanceof Uint8Array && detectBufferParsing()) {
      if (data.byteLength === 0) {
        return {};
      }
      const buf = Buffer.isBuffer(data) ? data : Buffer.from(data.buffer, data.byteOffset, data.byteLength);
      parsed = JSON.parse(buf, reviver);
    } else {
      parsed = await parseJsonBody(data, this.serdeContext, schema);
    }
    return this._read(schema, parsed);
  }
  readObject(schema, data) {
    return this._read(schema, data);
  }
  _read(schema, value) {
    const isObject = value !== null && typeof value === "object";
    const ns = NormalizedSchema.of(schema);
    if (isObject) {
      if (ns.isStructSchema()) {
        return this._readStruct(ns, value);
      }
      if (Array.isArray(value) && ns.isListSchema()) {
        const listMember = ns.getValueSchema();
        if (this.needsTransform(listMember)) {
          for (let i3 = 0; i3 < value.length; ++i3) {
            value[i3] = this._read(listMember, value[i3]);
          }
        }
        return value;
      }
      if (ns.isMapSchema()) {
        const mapMember = ns.getValueSchema();
        const map = value;
        if (this.needsTransform(mapMember)) {
          for (const k3 in map) {
            if (k3 === "__proto__") {
              writeKey(map);
            }
            map[k3] = this._read(mapMember, map[k3]);
          }
        }
        return map;
      }
    }
    if (ns.isBlobSchema() && typeof value === "string") {
      return fromBase64(value);
    }
    const mediaType = ns.getMergedTraits().mediaType;
    if (ns.isStringSchema() && typeof value === "string" && mediaType) {
      const isJson = mediaType === "application/json" || mediaType.endsWith("+json");
      if (isJson) {
        return LazyJsonString.from(value);
      }
      return value;
    }
    if (ns.isTimestampSchema() && value != null) {
      const format2 = determineTimestampFormat(ns, this.settings);
      switch (format2) {
        case 5:
          return parseRfc3339DateTimeWithOffset(value);
        case 6:
          return parseRfc7231DateTime(value);
        case 7:
          return parseEpochTimestamp(value);
        default:
          console.warn("Missing timestamp format, parsing value with Date constructor:", value);
          return new Date(value);
      }
    }
    if (ns.isBigIntegerSchema() && (typeof value === "number" || typeof value === "string")) {
      return BigInt(value);
    }
    if (ns.isBigDecimalSchema() && value != void 0) {
      if (value instanceof NumericValue) {
        return value;
      }
      const untyped = value;
      if (untyped.type === "bigDecimal" && "string" in untyped) {
        return new NumericValue(untyped.string, untyped.type);
      }
      return new NumericValue(String(value), "bigDecimal");
    }
    if (ns.isNumericSchema() && typeof value === "string") {
      switch (value) {
        case "Infinity":
          return Infinity;
        case "-Infinity":
          return -Infinity;
        case "NaN":
          return NaN;
      }
      return value;
    }
    if (ns.isDocumentSchema()) {
      if (isObject) {
        if (Array.isArray(value)) {
          for (let i3 = 0; i3 < value.length; ++i3) {
            const v = value[i3];
            if (!(v instanceof NumericValue)) {
              value[i3] = this._read(ns, v);
            }
          }
        } else {
          const doc = value;
          for (const k3 in doc) {
            if (k3 === "__proto__") {
              writeKey(doc);
            }
            const v = doc[k3];
            if (!(v instanceof NumericValue)) {
              doc[k3] = this._read(ns, v);
            }
          }
        }
      }
    }
    return value;
  }
  _readStruct(ns, record) {
    const union = ns.isUnionSchema();
    const out = {};
    let nameMap;
    const hasType = typeof record.__type === "string";
    const { jsonName } = this.settings;
    if (jsonName && hasType) {
      nameMap = {};
    }
    let unionSerde;
    if (union) {
      unionSerde = new UnionSerde(record, out);
    }
    for (const [memberName, memberSchema] of ns.structIterator()) {
      let fromKey = memberName;
      if (jsonName) {
        fromKey = memberSchema.getMergedTraits().jsonName ?? fromKey;
        if (hasType) {
          nameMap[fromKey] = memberName;
        }
      }
      if (union) {
        unionSerde.mark(fromKey);
      }
      if (record[fromKey] != null) {
        out[memberName] = this._read(memberSchema, record[fromKey]);
      }
    }
    if (union) {
      unionSerde.writeUnknown();
    } else if (hasType) {
      for (const k3 in record) {
        const v = record[k3];
        const t = jsonName ? nameMap[k3] ?? k3 : k3;
        if (!(t in out)) {
          out[t] = v;
        }
      }
    }
    return out;
  }
  needsTransform(ns) {
    if (ns.isBlobSchema() || ns.isTimestampSchema() || ns.isBigIntegerSchema() || ns.isBigDecimalSchema()) {
      return true;
    }
    if (ns.isDocumentSchema() || ns.isStructSchema() || ns.isListSchema() || ns.isMapSchema()) {
      return true;
    }
    if (ns.isStringSchema() && ns.getMergedTraits().mediaType) {
      return true;
    }
    return false;
  }
};

// node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/codec-v2/JsonShapeSerializer2.js
init_schema();
init_index_browser2();

// node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/codec-v2/JsonBytesStringAdapter.js
init_index_browser2();
var JsonBytesStringAdapter = class _JsonBytesStringAdapter extends Uint8Array {
  constructor() {
    super(...arguments);
    __publicField(this, "string", null);
  }
  static allocUnsafe(bytes) {
    if (typeof Buffer === "function") {
      const buffer = Buffer.allocUnsafe(bytes);
      return new _JsonBytesStringAdapter(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    }
    return new _JsonBytesStringAdapter(bytes);
  }
  toString() {
    return this.s();
  }
  valueOf() {
    return this.s();
  }
  includes(searchString, position) {
    if (typeof searchString === "string") {
      return this.s().includes(searchString, position);
    }
    return Uint8Array.prototype.includes.call(this, searchString, position);
  }
  indexOf(searchString, position) {
    if (typeof searchString === "string") {
      return this.s().indexOf(searchString, position);
    }
    return Uint8Array.prototype.indexOf.call(this, searchString, position);
  }
  lastIndexOf(searchString, position) {
    if (typeof searchString === "string") {
      return this.s().lastIndexOf(searchString, position);
    }
    const fn = Uint8Array.prototype.lastIndexOf;
    if (position !== void 0) {
      return fn.call(this, searchString, position);
    }
    return fn.call(this, searchString);
  }
  startsWith(searchString, position) {
    return this.s().startsWith(searchString, position);
  }
  endsWith(searchString, endPosition) {
    return this.s().endsWith(searchString, endPosition);
  }
  match(regexp) {
    return this.s().match(regexp);
  }
  replace(searchValue, replaceValue) {
    return this.s().replace(searchValue, replaceValue);
  }
  search(regexp) {
    return this.s().search(regexp);
  }
  split(separator, limit) {
    return this.s().split(separator, limit);
  }
  substring(start, end) {
    return this.s().substring(start, end);
  }
  trim() {
    return this.s().trim();
  }
  trimStart() {
    return this.s().trimStart();
  }
  trimEnd() {
    return this.s().trimEnd();
  }
  charAt(pos) {
    return this.s().charAt(pos);
  }
  charCodeAt(index) {
    return this.s().charCodeAt(index);
  }
  padStart(maxLength, fillString) {
    return this.s().padStart(maxLength, fillString);
  }
  padEnd(maxLength, fillString) {
    return this.s().padEnd(maxLength, fillString);
  }
  repeat(count) {
    return this.s().repeat(count);
  }
  toUpperCase() {
    return this.s().toUpperCase();
  }
  toLowerCase() {
    return this.s().toLowerCase();
  }
  s() {
    if (this.string == null) {
      const n = Date.now();
      if (n > warned + 6e4) {
        console.warn("@aws-sdk/core/protocols - WARN - JsonCodec2: you have called a string method on a Uint8Array request body. It has been automatically converted to string. In a future version this will throw an error.");
        warned = n;
      }
      this.string = toUtf8(this);
    }
    return this.string;
  }
};
var warned = 0;

// node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/codec-v2/JsonShapeSerializer2.js
var encoder = new TextEncoder();
var OPEN_BRACE = 123;
var CLOSE_BRACE = 125;
var OPEN_BRACKET = 91;
var CLOSE_BRACKET = 93;
var QUOTE = 34;
var COLON = 58;
var COMMA = 44;
var BACKSLASH = 92;
var TRUE = new Uint8Array([116, 114, 117, 101]);
var FALSE = new Uint8Array([102, 97, 108, 115, 101]);
var NULL = new Uint8Array([110, 117, 108, 108]);
var ESCAPE_TABLE = new Array(128).fill(null);
ESCAPE_TABLE[8] = "b";
ESCAPE_TABLE[9] = "t";
ESCAPE_TABLE[10] = "n";
ESCAPE_TABLE[12] = "f";
ESCAPE_TABLE[13] = "r";
ESCAPE_TABLE[34] = '"';
ESCAPE_TABLE[92] = "\\";
for (let i3 = 0; i3 < 32; i3++) {
  if (ESCAPE_TABLE[i3] === null) {
    ESCAPE_TABLE[i3] = "u00" + i3.toString(16).padStart(2, "0");
  }
}
var INITIAL_BUFFER_SIZE = 2048;
function alloc(size) {
  return JsonBytesStringAdapter.allocUnsafe(size);
}
var _JsonShapeSerializer2 = class _JsonShapeSerializer2 extends SerdeContextConfig {
  constructor(settings) {
    super();
    __publicField(this, "settings");
    __publicField(this, "json");
    __publicField(this, "i", 0);
    __publicField(this, "rootSchema");
    __publicField(this, "rawValue");
    __publicField(this, "passthrough", false);
    this.settings = settings;
    this.json = alloc(INITIAL_BUFFER_SIZE);
  }
  write(schema, value) {
    this.i = 0;
    this.rawValue = value;
    this.rootSchema = NormalizedSchema.of(schema);
    this.passthrough = this.rootSchema.isBlobSchema() || this.rootSchema.isStringSchema();
    if (!this.passthrough) {
      this.writeValue(this.rootSchema, value, void 0);
    }
  }
  writeDiscriminatedDocument(schema, value) {
    this.i = 0;
    this.rootSchema = NormalizedSchema.of(schema);
    const ns = this.rootSchema;
    if (ns.isStructSchema() && value != null && typeof value === "object") {
      this.writeValue(ns, value, void 0);
      const prefix = `"__type":"${ns.getName(true) ?? "Unknown"}",`;
      const z = prefix.length;
      this.ensure(z);
      this.json.copyWithin(1 + z, 1, this.i);
      encoder.encodeInto(prefix, this.json.subarray(1));
      this.i += z;
    } else {
      this.writeValue(ns, value, void 0);
    }
  }
  flush() {
    this.rootSchema = void 0;
    const finalPosition = this.i;
    this.i = 0;
    const raw = this.rawValue;
    this.rawValue = void 0;
    if (finalPosition === 0) {
      return raw;
    }
    const result = this.json.subarray(0, finalPosition);
    this.json = alloc(INITIAL_BUFFER_SIZE);
    return result;
  }
  ensure(byteCount) {
    const { i: i3, json } = this;
    if (i3 + byteCount > json.length) {
      let newSize = json.length * 2;
      while (newSize < i3 + byteCount) {
        newSize *= 2;
      }
      const next = alloc(newSize);
      next.set(this.json);
      this.json = next;
    }
  }
  writeAscii(s) {
    const z = s.length;
    this.ensure(z);
    let { i: i3, json } = this;
    for (let j3 = 0; j3 < z; ++j3) {
      json[i3] = s.charCodeAt(j3);
      i3 += 1;
    }
    this.i = i3;
  }
  writeAsciiQuoted(s) {
    const z = s.length;
    this.ensure(z + 4);
    let { json, i: i3 } = this;
    json[i3++] = QUOTE;
    for (let j3 = 0; j3 < z; ++j3) {
      json[i3++] = s.charCodeAt(j3);
    }
    json[i3++] = QUOTE;
    this.i = i3;
  }
  writeJsonString(s) {
    this.ensure(s.length * 3 + 2);
    this.json[this.i++] = QUOTE;
    const z = s.length;
    for (let j3 = 0; j3 < z; ++j3) {
      const c3 = s.charCodeAt(j3);
      if (c3 > 34 && c3 < 92) {
        this.json[this.i++] = c3;
      } else if (c3 < 128) {
        const esc = ESCAPE_TABLE[c3];
        if (esc !== null) {
          this.ensure(esc.length + 1);
          this.json[this.i++] = BACKSLASH;
          for (let k3 = 0; k3 < esc.length; k3++) {
            this.json[this.i++] = esc.charCodeAt(k3);
          }
        } else {
          this.json[this.i++] = c3;
        }
      } else if (c3 >= 55296 && c3 <= 56319) {
        const next = j3 + 1 < z ? s.charCodeAt(j3 + 1) : 0;
        if (next >= 56320 && next <= 57343) {
          this.ensure(4);
          const { written } = encoder.encodeInto(s.substring(j3, j3 + 2), this.json.subarray(this.i));
          this.i += written;
          ++j3;
        } else {
          this.ensure(6);
          this.writeUnicodeEscape(c3);
        }
      } else if (c3 >= 56320 && c3 <= 57343) {
        this.ensure(6);
        this.writeUnicodeEscape(c3);
      } else {
        let { i: i3, json } = this;
        if (c3 < 2048) {
          json[i3++] = 192 | c3 >> 6;
          json[i3++] = 128 | c3 & 63;
        } else {
          json[i3++] = 224 | c3 >> 12;
          json[i3++] = 128 | c3 >> 6 & 63;
          json[i3++] = 128 | c3 & 63;
        }
        this.i = i3;
      }
    }
    this.json[this.i++] = QUOTE;
  }
  writeUnicodeEscape(code) {
    let { json, i: i3 } = this;
    json[i3++] = BACKSLASH;
    json[i3++] = 117;
    const hex = code.toString(16).padStart(4, "0");
    for (let j3 = 0; j3 < 4; ++j3) {
      json[i3++] = hex.charCodeAt(j3);
    }
    this.i = i3;
  }
  writeBase64(data) {
    const b64Len = Math.ceil(data.length / 3) * 4;
    this.ensure(b64Len + 2);
    const json = this.json;
    const B64 = _JsonShapeSerializer2.B64;
    let i3 = this.i;
    json[i3++] = QUOTE;
    const len = data.length;
    const remainder = len % 3;
    const mainLen = len - remainder;
    for (let j3 = 0; j3 < mainLen; j3 += 3) {
      const a3 = data[j3];
      const b3 = data[j3 + 1];
      const c3 = data[j3 + 2];
      json[i3++] = B64[a3 >> 2];
      json[i3++] = B64[(a3 & 3) << 4 | b3 >> 4];
      json[i3++] = B64[(b3 & 15) << 2 | c3 >> 6];
      json[i3++] = B64[c3 & 63];
    }
    if (remainder === 2) {
      const a3 = data[mainLen];
      const b3 = data[mainLen + 1];
      json[i3++] = B64[a3 >> 2];
      json[i3++] = B64[(a3 & 3) << 4 | b3 >> 4];
      json[i3++] = B64[(b3 & 15) << 2];
      json[i3++] = 61;
    } else if (remainder === 1) {
      const a3 = data[mainLen];
      json[i3++] = B64[a3 >> 2];
      json[i3++] = B64[(a3 & 3) << 4];
      json[i3++] = 61;
      json[i3++] = 61;
    }
    json[i3++] = QUOTE;
    this.i = i3;
  }
  writeValue(schema, value, container) {
    if (value == null) {
      if (container?.isStructSchema()) {
        if (value === void 0) {
          const ns2 = NormalizedSchema.of(schema);
          if (ns2.isIdempotencyToken()) {
            this.writeAsciiQuoted(generateIdempotencyToken());
            return;
          }
        }
        return;
      }
      this.ensure(4);
      this.json.set(NULL, this.i);
      this.i += 4;
      return;
    }
    const ns = NormalizedSchema.of(schema);
    const isObject = typeof value === "object";
    if (ns.isStringSchema()) {
      const mediaType = ns.getMergedTraits().mediaType;
      if (mediaType) {
        const isJson = mediaType === "application/json" || mediaType.endsWith("+json");
        if (isJson) {
          this.writeJsonString(LazyJsonString.from(value).toString());
          return;
        }
      }
    }
    if (isObject) {
      if (ns.isStructSchema()) {
        this.writeStruct(ns, value);
        return;
      }
      if (Array.isArray(value) && (ns.isListSchema() || ns.isDocumentSchema())) {
        this.writeList(ns, value, ns.isDocumentSchema());
        return;
      }
      if (ns.isMapSchema()) {
        this.writeMap(ns, value, false);
        return;
      }
      if (value instanceof Uint8Array && (ns.isBlobSchema() || ns.isDocumentSchema())) {
        this.writeBase64(value);
        return;
      }
      if (value instanceof Date && (ns.isTimestampSchema() || ns.isDocumentSchema())) {
        this.writeTimestamp(ns, value);
        return;
      }
      if (value instanceof NumericValue) {
        this.writeAscii(value.string);
        return;
      }
      if (ns.isDocumentSchema()) {
        if (Array.isArray(value)) {
          this.writeList(ns, value, true);
        } else {
          this.writeMap(ns, value, true);
        }
        return;
      }
      const json = JSON.stringify(value);
      this.writeAscii(json);
      return;
    }
    if (typeof value === "string") {
      if (ns.isBlobSchema()) {
        const b64 = (this.serdeContext?.base64Encoder ?? toBase64)(value);
        this.writeAsciiQuoted(b64);
        return;
      }
      this.writeJsonString(value);
      return;
    }
    if (typeof value === "number") {
      if (Math.abs(value) === Infinity || Number.isNaN(value)) {
        this.writeAsciiQuoted(String(value));
        return;
      }
      const numStr = String(value);
      this.writeAscii(numStr);
      return;
    }
    if (typeof value === "boolean") {
      this.ensure(5);
      let { i: i3, json } = this;
      if (value) {
        json.set(TRUE, i3);
        i3 += 4;
      } else {
        json.set(FALSE, i3);
        i3 += 5;
      }
      this.i = i3;
      return;
    }
    if (typeof value === "bigint") {
      this.writeAscii(value.toString());
      return;
    }
    this.writeAscii(String(value));
  }
  writeStruct(ns, value) {
    this.ensure(2);
    this.json[this.i++] = OPEN_BRACE;
    let wroteAny = false;
    const hasType = typeof value.__type === "string";
    let writtenKeys;
    if (hasType) {
      writtenKeys = /* @__PURE__ */ new Set();
    }
    for (const [memberName, memberSchema] of ns.structIterator()) {
      const item = value[memberName];
      if (item == null && !memberSchema.isIdempotencyToken()) {
        continue;
      }
      if (wroteAny) {
        this.ensure(1);
        this.json[this.i++] = COMMA;
      }
      wroteAny = true;
      const targetKey = this.settings.jsonName ? memberSchema.getMergedTraits().jsonName ?? memberName : memberName;
      if (writtenKeys) {
        writtenKeys.add(memberName);
        writtenKeys.add(targetKey);
      }
      this.writeAsciiQuoted(targetKey);
      this.json[this.i++] = COLON;
      this.writeValue(memberSchema, item, ns);
    }
    if (!wroteAny && ns.isUnionSchema()) {
      const { $unknown } = value;
      if (Array.isArray($unknown)) {
        const [k3, v] = $unknown;
        this.writeAsciiQuoted(k3);
        this.ensure(1);
        this.json[this.i++] = COLON;
        this.writeValue(15, v, ns);
      }
    } else if (hasType) {
      for (const k3 in value) {
        if (writtenKeys.has(k3)) {
          continue;
        }
        writtenKeys.add(k3);
        const v = value[k3];
        if (wroteAny) {
          this.ensure(1);
          this.json[this.i++] = COMMA;
        }
        wroteAny = true;
        this.writeAsciiQuoted(k3);
        this.ensure(1);
        this.json[this.i++] = COLON;
        this.writeValue(15, v, void 0);
      }
    }
    this.ensure(1);
    this.json[this.i++] = CLOSE_BRACE;
  }
  writeList(ns, value, isDocument) {
    const sparse = !!ns.getMergedTraits().sparse;
    const valueSchema = ns.getValueSchema();
    if (!isDocument) {
      if (valueSchema.isStringSchema() || valueSchema.isNumericSchema() || valueSchema.isBooleanSchema()) {
        let hasSpecials = false;
        for (let i3 = 0; i3 < value.length; ++i3) {
          const v = value[i3];
          if (Number.isNaN(v) || v === Infinity || v === -Infinity || v == null && !sparse) {
            hasSpecials = true;
            break;
          }
        }
        let json;
        if (!hasSpecials) {
          json = JSON.stringify(value);
        } else {
          const out = [];
          for (let i3 = 0; i3 < value.length; ++i3) {
            const v = value[i3];
            if (v == null && !sparse)
              continue;
            if (Number.isNaN(v) || v === Infinity || v === -Infinity) {
              out.push(String(v));
            } else {
              out.push(v);
            }
          }
          json = JSON.stringify(out);
        }
        this.ensure(json.length * 3);
        this.i += encoder.encodeInto(json, this.json.subarray(this.i)).written;
        return;
      }
    }
    this.ensure(2);
    this.json[this.i++] = OPEN_BRACKET;
    let wroteFirstItem = false;
    for (let i3 = 0; i3 < value.length; ++i3) {
      const item = value[i3];
      if (isDocument ? item === void 0 : item == null && !sparse) {
        continue;
      }
      if (wroteFirstItem) {
        this.ensure(1);
        this.json[this.i++] = COMMA;
      }
      this.writeValue(valueSchema, item, void 0);
      wroteFirstItem = true;
    }
    this.ensure(1);
    this.json[this.i++] = CLOSE_BRACKET;
  }
  writeMap(ns, value, isDocument) {
    const sparse = !!ns.getMergedTraits().sparse;
    const valueSchema = ns.getValueSchema();
    if (!isDocument) {
      if (valueSchema.isStringSchema() || valueSchema.isNumericSchema() || valueSchema.isBooleanSchema()) {
        let modifications;
        for (const k3 in value) {
          const v = value[k3];
          if (Number.isNaN(v) || v === Infinity || v === -Infinity) {
            (modifications ?? (modifications = {}))[k3] = v;
            value[k3] = String(v);
          } else if (v === null && !sparse) {
            (modifications ?? (modifications = {}))[k3] = null;
            value[k3] = void 0;
          }
        }
        const json = JSON.stringify(value);
        if (modifications) {
          Object.assign(value, modifications);
        }
        this.ensure(json.length * 3);
        this.i += encoder.encodeInto(json, this.json.subarray(this.i)).written;
        return;
      }
    }
    this.ensure(2);
    this.json[this.i++] = OPEN_BRACE;
    let first = true;
    for (const k3 in value) {
      const v = value[k3];
      if (isDocument ? v === void 0 : v == null && !sparse) {
        continue;
      }
      if (!first) {
        this.ensure(1);
        this.json[this.i++] = COMMA;
      }
      first = false;
      this.writeJsonString(k3);
      this.ensure(1);
      this.json[this.i++] = COLON;
      this.writeValue(valueSchema, v, void 0);
    }
    this.ensure(1);
    this.json[this.i++] = CLOSE_BRACE;
  }
  writeTimestamp(ns, value) {
    const format2 = determineTimestampFormat(ns, this.settings);
    switch (format2) {
      case 5: {
        const iso = value.toISOString().replace(".000Z", "Z");
        this.writeAsciiQuoted(iso);
        return;
      }
      case 6: {
        this.writeAsciiQuoted(dateToUtcString(value));
        return;
      }
      case 7: {
        const epochSecs = String(value.getTime() / 1e3);
        this.writeAscii(epochSecs);
        return;
      }
      default: {
        const epochSecs = String(value.getTime() / 1e3);
        this.writeAscii(epochSecs);
        return;
      }
    }
  }
};
__publicField(_JsonShapeSerializer2, "B64", (() => {
  const chars2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const table = new Uint8Array(64);
  for (let i3 = 0; i3 < 64; ++i3) {
    table[i3] = chars2.charCodeAt(i3);
  }
  return table;
})());
var JsonShapeSerializer2 = _JsonShapeSerializer2;

// node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/codec-v2/JsonCodec2.js
var JsonCodec2 = class extends SerdeContextConfig {
  constructor(settings) {
    super();
    __publicField(this, "settings");
    this.settings = settings;
  }
  createSerializer() {
    const serializer = new JsonShapeSerializer2(this.settings);
    serializer.setSerdeContext(this.serdeContext);
    return serializer;
  }
  createDeserializer() {
    const deserializer = new JsonShapeDeserializer2(this.settings);
    deserializer.setSerdeContext(this.serdeContext);
    return deserializer;
  }
};

// node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/AwsJsonRpcProtocol.js
var AwsJsonRpcProtocol = class extends RpcProtocol {
  constructor({ defaultNamespace, errorTypeRegistries: errorTypeRegistries3, serviceTarget, awsQueryCompatible, jsonCodec }) {
    super({
      defaultNamespace,
      errorTypeRegistries: errorTypeRegistries3
    });
    __publicField(this, "serializer");
    __publicField(this, "deserializer");
    __publicField(this, "serviceTarget");
    __publicField(this, "codec");
    __publicField(this, "mixin");
    __publicField(this, "awsQueryCompatible");
    this.serviceTarget = serviceTarget;
    this.codec = jsonCodec ?? new JsonCodec2({
      timestampFormat: {
        useTrait: true,
        default: 7
      },
      jsonName: false
    });
    this.serializer = this.codec.createSerializer();
    this.deserializer = this.codec.createDeserializer();
    this.awsQueryCompatible = !!awsQueryCompatible;
    this.mixin = new ProtocolLib(this.awsQueryCompatible);
  }
  async serializeRequest(operationSchema, input, context) {
    const request = await super.serializeRequest(operationSchema, input, context);
    if (!request.path.endsWith("/")) {
      request.path += "/";
    }
    request.headers["content-type"] = `application/x-amz-json-${this.getJsonRpcVersion()}`;
    request.headers["x-amz-target"] = `${this.serviceTarget}.${operationSchema.name}`;
    if (this.awsQueryCompatible) {
      request.headers["x-amzn-query-mode"] = "true";
    }
    if (deref(operationSchema.input) === "unit" || !request.body) {
      request.body = "{}";
    }
    return request;
  }
  getPayloadCodec() {
    return this.codec;
  }
  async handleError(operationSchema, context, response, dataObject, metadata) {
    const { awsQueryCompatible } = this;
    if (awsQueryCompatible) {
      this.mixin.setQueryCompatError(dataObject, response);
    }
    const errorIdentifier = loadJsonRpcErrorCode(response, dataObject, awsQueryCompatible) ?? "Unknown";
    this.mixin.compose(this.compositeErrorRegistry, errorIdentifier, this.options.defaultNamespace);
    const { errorSchema, errorMetadata } = await this.mixin.getErrorSchemaOrThrowBaseException(errorIdentifier, this.options.defaultNamespace, response, dataObject, metadata, awsQueryCompatible ? this.mixin.findQueryCompatibleError : void 0);
    const ns = NormalizedSchema.of(errorSchema);
    const message = dataObject.message ?? dataObject.Message ?? "UnknownError";
    const ErrorCtor = this.compositeErrorRegistry.getErrorCtor(errorSchema) ?? Error;
    const exception = new ErrorCtor({});
    const output = {};
    const errorDeserializer = this.codec.createDeserializer();
    for (const [name, member2] of ns.structIterator()) {
      if (dataObject[name] != null) {
        output[name] = errorDeserializer.readObject(member2, dataObject[name]);
      }
    }
    if (awsQueryCompatible) {
      this.mixin.queryCompatOutput(dataObject, output);
    }
    throw this.mixin.decorateServiceException(Object.assign(exception, errorMetadata, {
      $fault: ns.getMergedTraits().error,
      message
    }, output), dataObject);
  }
};

// node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/AwsJson1_1Protocol.js
var AwsJson1_1Protocol = class extends AwsJsonRpcProtocol {
  constructor({ defaultNamespace, errorTypeRegistries: errorTypeRegistries3, serviceTarget, awsQueryCompatible, jsonCodec }) {
    super({
      defaultNamespace,
      errorTypeRegistries: errorTypeRegistries3,
      serviceTarget,
      awsQueryCompatible,
      jsonCodec
    });
  }
  getShapeId() {
    return "aws.protocols#awsJson1_1";
  }
  getJsonRpcVersion() {
    return "1.1";
  }
  getDefaultContentType() {
    return "application/x-amz-json-1.1";
  }
};

// node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/AwsRestJsonProtocol.js
init_schema();
var AwsRestJsonProtocol = class extends HttpBindingProtocol {
  constructor({ defaultNamespace, errorTypeRegistries: errorTypeRegistries3, jsonCodec }) {
    super({
      defaultNamespace,
      errorTypeRegistries: errorTypeRegistries3
    });
    __publicField(this, "serializer");
    __publicField(this, "deserializer");
    __publicField(this, "codec");
    __publicField(this, "mixin", new ProtocolLib());
    const settings = {
      timestampFormat: {
        useTrait: true,
        default: 7
      },
      httpBindings: true,
      jsonName: true
    };
    this.codec = jsonCodec ?? new JsonCodec2(settings);
    this.serializer = new HttpInterceptingShapeSerializer(this.codec.createSerializer(), settings);
    this.deserializer = new HttpInterceptingShapeDeserializer(this.codec.createDeserializer(), settings);
  }
  getShapeId() {
    return "aws.protocols#restJson1";
  }
  getPayloadCodec() {
    return this.codec;
  }
  setSerdeContext(serdeContext) {
    this.codec.setSerdeContext(serdeContext);
    super.setSerdeContext(serdeContext);
  }
  async serializeRequest(operationSchema, input, context) {
    const request = await super.serializeRequest(operationSchema, input, context);
    const inputSchema = NormalizedSchema.of(operationSchema.input);
    if (!request.headers["content-type"]) {
      const contentType = this.mixin.resolveRestContentType(this.getDefaultContentType(), inputSchema);
      if (contentType) {
        request.headers["content-type"] = contentType;
      }
    }
    if (request.body == null && request.headers["content-type"] === this.getDefaultContentType()) {
      request.body = "{}";
    }
    return request;
  }
  async deserializeResponse(operationSchema, context, response) {
    const output = await super.deserializeResponse(operationSchema, context, response);
    const outputSchema = NormalizedSchema.of(operationSchema.output);
    for (const [name, member2] of outputSchema.structIterator()) {
      if (member2.getMemberTraits().httpPayload && !(name in output)) {
        output[name] = null;
      }
    }
    return output;
  }
  async handleError(operationSchema, context, response, dataObject, metadata) {
    const errorIdentifier = loadRestJsonErrorCode(response, dataObject) ?? "Unknown";
    this.mixin.compose(this.compositeErrorRegistry, errorIdentifier, this.options.defaultNamespace);
    const { errorSchema, errorMetadata } = await this.mixin.getErrorSchemaOrThrowBaseException(errorIdentifier, this.options.defaultNamespace, response, dataObject, metadata);
    const ns = NormalizedSchema.of(errorSchema);
    const message = dataObject.message ?? dataObject.Message ?? "UnknownError";
    const ErrorCtor = this.compositeErrorRegistry.getErrorCtor(errorSchema) ?? Error;
    const exception = new ErrorCtor({});
    await this.deserializeHttpMessage(errorSchema, context, response, dataObject);
    const output = {};
    const errorDeserializer = this.codec.createDeserializer();
    for (const [name, member2] of ns.structIterator()) {
      const target = member2.getMergedTraits().jsonName ?? name;
      output[name] = errorDeserializer.readObject(member2, dataObject[target]);
    }
    throw this.mixin.decorateServiceException(Object.assign(exception, errorMetadata, {
      $fault: ns.getMergedTraits().error,
      message
    }, output), dataObject);
  }
  getDefaultContentType() {
    return "application/json";
  }
};

// node_modules/@aws-sdk/client-secrets-manager/dist-es/runtimeConfig.shared.js
init_index_browser3();
init_index_browser2();

// node_modules/@aws-sdk/client-secrets-manager/dist-es/endpoint/endpointResolver.js
init_index_browser();

// node_modules/@aws-sdk/client-secrets-manager/dist-es/endpoint/bdd.js
init_index_browser();
var m = "ref";
var a = -1;
var b = true;
var c = "isSet";
var d = "PartitionResult";
var e = "booleanEquals";
var f = "getAttr";
var g = "stringEquals";
var h = { [m]: "Endpoint" };
var i = { [m]: d };
var j = { "fn": f, "argv": [i, "name"] };
var k = {};
var l = [{ [m]: "Region" }];
var _data = {
  conditions: [
    [c, [h]],
    [c, l],
    ["aws.partition", l, d],
    [e, [{ [m]: "UseFIPS" }, b]],
    [e, [{ [m]: "UseDualStack" }, b]],
    [e, [{ fn: f, argv: [i, "supportsDualStack"] }, b]],
    [e, [{ fn: f, argv: [i, "supportsFIPS"] }, b]],
    [g, [j, "aws"]],
    [g, [j, "aws-cn"]],
    [g, [j, "aws-us-gov"]]
  ],
  results: [
    [a],
    [a, "Invalid Configuration: FIPS and custom endpoint are not supported"],
    [a, "Invalid Configuration: Dualstack and custom endpoint are not supported"],
    [h, k],
    ["https://secretsmanager-fips.{Region}.amazonaws.com", k],
    ["https://secretsmanager-fips.{Region}.{PartitionResult#dualStackDnsSuffix}", k],
    [a, "FIPS and DualStack are enabled, but this partition does not support one or both"],
    ["https://secretsmanager-fips.{Region}.{PartitionResult#dnsSuffix}", k],
    [a, "FIPS is enabled but this partition does not support FIPS"],
    ["https://secretsmanager.{Region}.amazonaws.com", k],
    ["https://secretsmanager.{Region}.amazonaws.com.cn", k],
    ["https://secretsmanager.{Region}.{PartitionResult#dualStackDnsSuffix}", k],
    [a, "DualStack is enabled but this partition does not support DualStack"],
    ["https://secretsmanager.{Region}.{PartitionResult#dnsSuffix}", k],
    [a, "Invalid Configuration: Missing Region"]
  ]
};
var root = 2;
var r = 1e8;
var nodes = new Int32Array([
  -1,
  1,
  -1,
  0,
  17,
  3,
  1,
  4,
  r + 14,
  2,
  5,
  r + 14,
  3,
  11,
  6,
  4,
  7,
  r + 13,
  5,
  8,
  r + 12,
  7,
  r + 9,
  9,
  8,
  r + 10,
  10,
  9,
  r + 9,
  r + 11,
  4,
  13,
  12,
  6,
  r + 7,
  r + 8,
  5,
  14,
  r + 6,
  6,
  15,
  r + 6,
  7,
  r + 4,
  16,
  9,
  r + 4,
  r + 5,
  3,
  r + 1,
  18,
  4,
  r + 2,
  r + 3
]);
var bdd = BinaryDecisionDiagram.from(nodes, root, _data.conditions, _data.results);

// node_modules/@aws-sdk/client-secrets-manager/dist-es/endpoint/endpointResolver.js
var cache = new EndpointCache({
  size: 50,
  params: ["Endpoint", "Region", "UseDualStack", "UseFIPS"]
});
var defaultEndpointResolver = (endpointParams, context = {}) => {
  return cache.get(endpointParams, () => decideEndpoint(bdd, {
    endpointParams,
    logger: context.logger
  }));
};
customEndpointFunctions.aws = awsEndpointFunctions;

// node_modules/@aws-sdk/client-secrets-manager/dist-es/schemas/schemas_0.js
init_schema();

// node_modules/@aws-sdk/client-secrets-manager/dist-es/models/SecretsManagerServiceException.js
var SecretsManagerServiceException = class _SecretsManagerServiceException extends ServiceException {
  constructor(options) {
    super(options);
    Object.setPrototypeOf(this, _SecretsManagerServiceException.prototype);
  }
};

// node_modules/@aws-sdk/client-secrets-manager/dist-es/models/errors.js
var DecryptionFailure = class _DecryptionFailure extends SecretsManagerServiceException {
  constructor(opts) {
    super({
      name: "DecryptionFailure",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "DecryptionFailure");
    __publicField(this, "$fault", "client");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _DecryptionFailure.prototype);
    this.Message = opts.Message;
  }
};
var InternalServiceError = class _InternalServiceError extends SecretsManagerServiceException {
  constructor(opts) {
    super({
      name: "InternalServiceError",
      $fault: "server",
      ...opts
    });
    __publicField(this, "name", "InternalServiceError");
    __publicField(this, "$fault", "server");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _InternalServiceError.prototype);
    this.Message = opts.Message;
  }
};
var InvalidNextTokenException = class _InvalidNextTokenException extends SecretsManagerServiceException {
  constructor(opts) {
    super({
      name: "InvalidNextTokenException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "InvalidNextTokenException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _InvalidNextTokenException.prototype);
    this.Message = opts.Message;
  }
};
var InvalidParameterException = class _InvalidParameterException extends SecretsManagerServiceException {
  constructor(opts) {
    super({
      name: "InvalidParameterException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "InvalidParameterException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _InvalidParameterException.prototype);
    this.Message = opts.Message;
  }
};
var InvalidRequestException = class _InvalidRequestException extends SecretsManagerServiceException {
  constructor(opts) {
    super({
      name: "InvalidRequestException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "InvalidRequestException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _InvalidRequestException.prototype);
    this.Message = opts.Message;
  }
};
var ResourceNotFoundException = class _ResourceNotFoundException extends SecretsManagerServiceException {
  constructor(opts) {
    super({
      name: "ResourceNotFoundException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "ResourceNotFoundException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _ResourceNotFoundException.prototype);
    this.Message = opts.Message;
  }
};
var EncryptionFailure = class _EncryptionFailure extends SecretsManagerServiceException {
  constructor(opts) {
    super({
      name: "EncryptionFailure",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "EncryptionFailure");
    __publicField(this, "$fault", "client");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _EncryptionFailure.prototype);
    this.Message = opts.Message;
  }
};
var LimitExceededException = class _LimitExceededException extends SecretsManagerServiceException {
  constructor(opts) {
    super({
      name: "LimitExceededException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "LimitExceededException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _LimitExceededException.prototype);
    this.Message = opts.Message;
  }
};
var MalformedPolicyDocumentException = class _MalformedPolicyDocumentException extends SecretsManagerServiceException {
  constructor(opts) {
    super({
      name: "MalformedPolicyDocumentException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "MalformedPolicyDocumentException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _MalformedPolicyDocumentException.prototype);
    this.Message = opts.Message;
  }
};
var PreconditionNotMetException = class _PreconditionNotMetException extends SecretsManagerServiceException {
  constructor(opts) {
    super({
      name: "PreconditionNotMetException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "PreconditionNotMetException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _PreconditionNotMetException.prototype);
    this.Message = opts.Message;
  }
};
var ResourceExistsException = class _ResourceExistsException extends SecretsManagerServiceException {
  constructor(opts) {
    super({
      name: "ResourceExistsException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "ResourceExistsException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _ResourceExistsException.prototype);
    this.Message = opts.Message;
  }
};
var PublicPolicyException = class _PublicPolicyException extends SecretsManagerServiceException {
  constructor(opts) {
    super({
      name: "PublicPolicyException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "PublicPolicyException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _PublicPolicyException.prototype);
    this.Message = opts.Message;
  }
};

// node_modules/@aws-sdk/client-secrets-manager/dist-es/schemas/schemas_0.js
var _AAD = "AutomaticallyAfterDays";
var _ARN = "ARN";
var _BGSVR = "BatchGetSecretValueRequest";
var _CD = "CreatedDate";
var _CRT = "ClientRequestToken";
var _D = "Description";
var _DDe = "DeletedDate";
var _DF = "DecryptionFailure";
var _DSResc = "DescribeSecretResponse";
var _Du = "Duration";
var _EF = "EncryptionFailure";
var _ESRM = "ExternalSecretRotationMetadata";
var _ESRMI = "ExternalSecretRotationMetadataItem";
var _ESRMT = "ExternalSecretRotationMetadataType";
var _ESRRA = "ExternalSecretRotationRoleArn";
var _F = "Filters";
var _FLT = "FiltersListType";
var _Fi = "Filter";
var _GSV = "GetSecretValue";
var _GSVR = "GetSecretValueRequest";
var _GSVRe = "GetSecretValueResponse";
var _INTE = "InvalidNextTokenException";
var _IPE = "InvalidParameterException";
var _IRE = "InvalidRequestException";
var _ISE = "InternalServiceError";
var _K = "Key";
var _KKI = "KmsKeyId";
var _KKIm = "KmsKeyIds";
var _LAD = "LastAccessedDate";
var _LCD = "LastChangedDate";
var _LEE = "LimitExceededException";
var _LRD = "LastRotatedDate";
var _M = "Message";
var _MPDE = "MalformedPolicyDocumentException";
var _MR = "MaxResults";
var _N = "Name";
var _NRD = "NextRotationDate";
var _NT = "NextToken";
var _OS = "OwningService";
var _PNME = "PreconditionNotMetException";
var _PPE = "PublicPolicyException";
var _PR = "PrimaryRegion";
var _PSVR = "PutSecretValueRequest";
var _PSVRu = "PutSecretValueResponse";
var _R = "Region";
var _RE = "RotationEnabled";
var _REE = "ResourceExistsException";
var _RLARN = "RotationLambdaARN";
var _RNFE = "ResourceNotFoundException";
var _RR = "RotationRules";
var _RRFRR = "RemoveRegionsFromReplicationRequest";
var _RRR = "RemoveReplicaRegions";
var _RRTo = "RotationRulesType";
var _RS = "ReplicationStatus";
var _RSLT = "ReplicationStatusListType";
var _RST = "ReplicationStatusType";
var _RT = "RotationToken";
var _RTT = "RotationTokenType";
var _S = "Status";
var _SB = "SecretBinary";
var _SBT = "SecretBinaryType";
var _SE = "ScheduleExpression";
var _SI = "SecretId";
var _SIL = "SecretIdList";
var _SLE = "SecretListEntry";
var _SM = "StatusMessage";
var _SS = "SecretString";
var _SST = "SecretStringType";
var _SVE = "SecretValueEntry";
var _SVLE = "SecretVersionsListEntry";
var _SVTS = "SecretVersionsToStages";
var _SVTSMT = "SecretVersionsToStagesMapType";
var _T = "Tags";
var _TK = "TagKeys";
var _TLT = "TagListType";
var _Ta = "Tag";
var _Ty = "Type";
var _URR = "UntagResourceRequest";
var _V = "Value";
var _VI = "VersionId";
var _VITS = "VersionIdsToStages";
var _VS = "VersionStage";
var _VSe = "VersionStages";
var _Va = "Values";
var _c = "client";
var _e = "error";
var _s = "smithy.ts.sdk.synthetic.com.amazonaws.secretsmanager";
var _se = "server";
var n0 = "com.amazonaws.secretsmanager";
var _s_registry = new TypeRegistry(_s);
var SecretsManagerServiceException$ = [-3, _s, "SecretsManagerServiceException", 0, [], []];
_s_registry.registerError(SecretsManagerServiceException$, SecretsManagerServiceException);
var n0_registry = new TypeRegistry(n0);
var DecryptionFailure$ = [
  -3,
  n0,
  _DF,
  { [_e]: _c },
  [_M],
  [0]
];
n0_registry.registerError(DecryptionFailure$, DecryptionFailure);
var EncryptionFailure$ = [
  -3,
  n0,
  _EF,
  { [_e]: _c },
  [_M],
  [0]
];
n0_registry.registerError(EncryptionFailure$, EncryptionFailure);
var InternalServiceError$ = [
  -3,
  n0,
  _ISE,
  { [_e]: _se },
  [_M],
  [0]
];
n0_registry.registerError(InternalServiceError$, InternalServiceError);
var InvalidNextTokenException$ = [
  -3,
  n0,
  _INTE,
  { [_e]: _c },
  [_M],
  [0]
];
n0_registry.registerError(InvalidNextTokenException$, InvalidNextTokenException);
var InvalidParameterException$ = [
  -3,
  n0,
  _IPE,
  { [_e]: _c },
  [_M],
  [0]
];
n0_registry.registerError(InvalidParameterException$, InvalidParameterException);
var InvalidRequestException$ = [
  -3,
  n0,
  _IRE,
  { [_e]: _c },
  [_M],
  [0]
];
n0_registry.registerError(InvalidRequestException$, InvalidRequestException);
var LimitExceededException$ = [
  -3,
  n0,
  _LEE,
  { [_e]: _c },
  [_M],
  [0]
];
n0_registry.registerError(LimitExceededException$, LimitExceededException);
var MalformedPolicyDocumentException$ = [
  -3,
  n0,
  _MPDE,
  { [_e]: _c },
  [_M],
  [0]
];
n0_registry.registerError(MalformedPolicyDocumentException$, MalformedPolicyDocumentException);
var PreconditionNotMetException$ = [
  -3,
  n0,
  _PNME,
  { [_e]: _c },
  [_M],
  [0]
];
n0_registry.registerError(PreconditionNotMetException$, PreconditionNotMetException);
var PublicPolicyException$ = [
  -3,
  n0,
  _PPE,
  { [_e]: _c },
  [_M],
  [0]
];
n0_registry.registerError(PublicPolicyException$, PublicPolicyException);
var ResourceExistsException$ = [
  -3,
  n0,
  _REE,
  { [_e]: _c },
  [_M],
  [0]
];
n0_registry.registerError(ResourceExistsException$, ResourceExistsException);
var ResourceNotFoundException$ = [
  -3,
  n0,
  _RNFE,
  { [_e]: _c },
  [_M],
  [0]
];
n0_registry.registerError(ResourceNotFoundException$, ResourceNotFoundException);
var errorTypeRegistries = [
  _s_registry,
  n0_registry
];
var RotationTokenType = [0, n0, _RTT, 8, 0];
var SecretBinaryType = [0, n0, _SBT, 8, 21];
var SecretStringType = [0, n0, _SST, 8, 0];
var BatchGetSecretValueRequest$ = [
  3,
  n0,
  _BGSVR,
  0,
  [_SIL, _F, _MR, _NT],
  [64 | 0, () => FiltersListType, 1, 0]
];
var DescribeSecretResponse$ = [
  3,
  n0,
  _DSResc,
  0,
  [_ARN, _N, _Ty, _D, _KKI, _RE, _RLARN, _RR, _ESRM, _ESRRA, _LRD, _LCD, _LAD, _DDe, _NRD, _T, _VITS, _OS, _CD, _PR, _RS],
  [0, 0, 0, 0, 0, 2, 0, () => RotationRulesType$, () => ExternalSecretRotationMetadataType, 0, 4, 4, 4, 4, 4, () => TagListType, [2, n0, _SVTSMT, 0, 0, 64 | 0], 0, 4, 0, () => ReplicationStatusListType]
];
var ExternalSecretRotationMetadataItem$ = [
  3,
  n0,
  _ESRMI,
  0,
  [_K, _V],
  [0, 0]
];
var Filter$ = [
  3,
  n0,
  _Fi,
  0,
  [_K, _Va],
  [0, 64 | 0]
];
var GetSecretValueRequest$ = [
  3,
  n0,
  _GSVR,
  0,
  [_SI, _VI, _VS],
  [0, 0, 0],
  1
];
var GetSecretValueResponse$ = [
  3,
  n0,
  _GSVRe,
  0,
  [_ARN, _N, _VI, _SB, _SS, _VSe, _CD],
  [0, 0, 0, [() => SecretBinaryType, 0], [() => SecretStringType, 0], 64 | 0, 4]
];
var PutSecretValueRequest$ = [
  3,
  n0,
  _PSVR,
  0,
  [_SI, _CRT, _SB, _SS, _VSe, _RT],
  [0, [0, 4], [() => SecretBinaryType, 0], [() => SecretStringType, 0], 64 | 0, [() => RotationTokenType, 0]],
  1
];
var PutSecretValueResponse$ = [
  3,
  n0,
  _PSVRu,
  0,
  [_ARN, _N, _VI, _VSe],
  [0, 0, 0, 64 | 0]
];
var RemoveRegionsFromReplicationRequest$ = [
  3,
  n0,
  _RRFRR,
  0,
  [_SI, _RRR],
  [0, 64 | 0],
  2
];
var ReplicationStatusType$ = [
  3,
  n0,
  _RST,
  0,
  [_R, _KKI, _S, _SM, _LAD],
  [0, 0, 0, 0, 4]
];
var RotationRulesType$ = [
  3,
  n0,
  _RRTo,
  0,
  [_AAD, _Du, _SE],
  [1, 0, 0]
];
var SecretListEntry$ = [
  3,
  n0,
  _SLE,
  0,
  [_ARN, _N, _Ty, _D, _KKI, _RE, _RLARN, _RR, _ESRM, _ESRRA, _LRD, _LCD, _LAD, _DDe, _NRD, _T, _SVTS, _OS, _CD, _PR],
  [0, 0, 0, 0, 0, 2, 0, () => RotationRulesType$, () => ExternalSecretRotationMetadataType, 0, 4, 4, 4, 4, 4, () => TagListType, [2, n0, _SVTSMT, 0, 0, 64 | 0], 0, 4, 0]
];
var SecretValueEntry$ = [
  3,
  n0,
  _SVE,
  0,
  [_ARN, _N, _VI, _SB, _SS, _VSe, _CD],
  [0, 0, 0, [() => SecretBinaryType, 0], [() => SecretStringType, 0], 64 | 0, 4]
];
var SecretVersionsListEntry$ = [
  3,
  n0,
  _SVLE,
  0,
  [_VI, _VSe, _LAD, _CD, _KKIm],
  [0, 64 | 0, 4, 4, 64 | 0]
];
var Tag$ = [
  3,
  n0,
  _Ta,
  0,
  [_K, _V],
  [0, 0]
];
var UntagResourceRequest$ = [
  3,
  n0,
  _URR,
  0,
  [_SI, _TK],
  [0, 64 | 0],
  2
];
var ExternalSecretRotationMetadataType = [
  1,
  n0,
  _ESRMT,
  0,
  () => ExternalSecretRotationMetadataItem$
];
var FiltersListType = [
  1,
  n0,
  _FLT,
  0,
  () => Filter$
];
var FilterValuesStringList = 64 | 0;
var KmsKeyIdListType = 64 | 0;
var RemoveReplicaRegionListType = 64 | 0;
var ReplicationStatusListType = [
  1,
  n0,
  _RSLT,
  0,
  () => ReplicationStatusType$
];
var SecretIdListType = 64 | 0;
var SecretVersionStagesType = 64 | 0;
var TagKeyListType = 64 | 0;
var TagListType = [
  1,
  n0,
  _TLT,
  0,
  () => Tag$
];
var SecretVersionsToStagesMapType = [
  2,
  n0,
  _SVTSMT,
  0,
  0,
  64 | 0
];
var GetSecretValue$ = [
  9,
  n0,
  _GSV,
  0,
  () => GetSecretValueRequest$,
  () => GetSecretValueResponse$
];

// node_modules/@aws-sdk/client-secrets-manager/dist-es/runtimeConfig.shared.js
var getRuntimeConfig = (config) => {
  return {
    apiVersion: "2017-10-17",
    base64Decoder: config?.base64Decoder ?? fromBase64,
    base64Encoder: config?.base64Encoder ?? toBase64,
    disableHostPrefix: config?.disableHostPrefix ?? false,
    endpointProvider: config?.endpointProvider ?? defaultEndpointResolver,
    extensions: config?.extensions ?? [],
    httpAuthSchemeProvider: config?.httpAuthSchemeProvider ?? defaultSecretsManagerHttpAuthSchemeProvider,
    httpAuthSchemes: config?.httpAuthSchemes ?? [
      {
        schemeId: "aws.auth#sigv4",
        identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4"),
        signer: new AwsSdkSigV4Signer()
      }
    ],
    logger: config?.logger ?? new NoOpLogger(),
    protocol: config?.protocol ?? AwsJson1_1Protocol,
    protocolSettings: config?.protocolSettings ?? {
      defaultNamespace: "com.amazonaws.secretsmanager",
      errorTypeRegistries,
      version: "2017-10-17",
      serviceTarget: "secretsmanager"
    },
    serviceId: config?.serviceId ?? "Secrets Manager",
    sha256: config?.sha256 ?? Sha256WebCrypto,
    urlParser: config?.urlParser ?? parseUrl,
    utf8Decoder: config?.utf8Decoder ?? fromUtf8,
    utf8Encoder: config?.utf8Encoder ?? toUtf8
  };
};

// node_modules/@aws-sdk/client-secrets-manager/dist-es/runtimeConfig.browser.js
var getRuntimeConfig2 = (config) => {
  const defaultsMode = resolveDefaultsModeConfig(config);
  const defaultConfigProvider = () => defaultsMode().then(loadConfigsForDefaultMode);
  const clientSharedValues = getRuntimeConfig(config);
  return {
    ...clientSharedValues,
    ...config,
    runtime: "browser",
    defaultsMode,
    bodyLengthChecker: config?.bodyLengthChecker ?? calculateBodyLength,
    credentialDefaultProvider: config?.credentialDefaultProvider ?? ((_) => () => Promise.reject(new Error("Credential is missing"))),
    defaultUserAgentProvider: config?.defaultUserAgentProvider ?? createDefaultUserAgentProvider({ serviceId: clientSharedValues.serviceId, clientVersion: package_default.version }),
    maxAttempts: config?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
    region: config?.region ?? invalidProvider("Region is missing"),
    requestHandler: FetchHttpHandler.create(config?.requestHandler ?? defaultConfigProvider),
    retryMode: config?.retryMode ?? (async () => (await defaultConfigProvider()).retryMode || DEFAULT_RETRY_MODE),
    streamCollector: config?.streamCollector ?? streamCollector,
    useDualstackEndpoint: config?.useDualstackEndpoint ?? (() => Promise.resolve(DEFAULT_USE_DUALSTACK_ENDPOINT)),
    useFipsEndpoint: config?.useFipsEndpoint ?? (() => Promise.resolve(DEFAULT_USE_FIPS_ENDPOINT))
  };
};

// node_modules/@aws-sdk/client-secrets-manager/dist-es/auth/httpAuthExtensionConfiguration.js
var getHttpAuthExtensionConfiguration = (runtimeConfig) => {
  const _httpAuthSchemes = runtimeConfig.httpAuthSchemes;
  let _httpAuthSchemeProvider = runtimeConfig.httpAuthSchemeProvider;
  let _credentials = runtimeConfig.credentials;
  return {
    setHttpAuthScheme(httpAuthScheme) {
      const index = _httpAuthSchemes.findIndex((scheme) => scheme.schemeId === httpAuthScheme.schemeId);
      if (index === -1) {
        _httpAuthSchemes.push(httpAuthScheme);
      } else {
        _httpAuthSchemes.splice(index, 1, httpAuthScheme);
      }
    },
    httpAuthSchemes() {
      return _httpAuthSchemes;
    },
    setHttpAuthSchemeProvider(httpAuthSchemeProvider) {
      _httpAuthSchemeProvider = httpAuthSchemeProvider;
    },
    httpAuthSchemeProvider() {
      return _httpAuthSchemeProvider;
    },
    setCredentials(credentials) {
      _credentials = credentials;
    },
    credentials() {
      return _credentials;
    }
  };
};
var resolveHttpAuthRuntimeConfig = (config) => {
  return {
    httpAuthSchemes: config.httpAuthSchemes(),
    httpAuthSchemeProvider: config.httpAuthSchemeProvider(),
    credentials: config.credentials()
  };
};

// node_modules/@aws-sdk/client-secrets-manager/dist-es/runtimeExtensions.js
var resolveRuntimeExtensions = (runtimeConfig, extensions) => {
  const extensionConfiguration = Object.assign(getAwsRegionExtensionConfiguration(runtimeConfig), getDefaultExtensionConfiguration(runtimeConfig), getHttpHandlerExtensionConfiguration(runtimeConfig), getHttpAuthExtensionConfiguration(runtimeConfig));
  extensions.forEach((extension) => extension.configure(extensionConfiguration));
  return Object.assign(runtimeConfig, resolveAwsRegionExtensionConfiguration(extensionConfiguration), resolveDefaultRuntimeConfig2(extensionConfiguration), resolveHttpHandlerRuntimeConfig(extensionConfiguration), resolveHttpAuthRuntimeConfig(extensionConfiguration));
};

// node_modules/@aws-sdk/client-secrets-manager/dist-es/SecretsManagerClient.js
var SecretsManagerClient = class extends Client {
  constructor(...[configuration]) {
    const _config_0 = getRuntimeConfig2(configuration || {});
    super(_config_0);
    __publicField(this, "config");
    this.initConfig = _config_0;
    const _config_1 = resolveClientEndpointParameters(_config_0);
    const _config_2 = resolveUserAgentConfig(_config_1);
    const _config_3 = resolveRetryConfig(_config_2);
    const _config_4 = resolveRegionConfig(_config_3);
    const _config_5 = resolveHostHeaderConfig(_config_4);
    const _config_6 = resolveEndpointConfig(_config_5);
    const _config_7 = resolveHttpAuthSchemeConfig(_config_6);
    const _config_8 = resolveRuntimeExtensions(_config_7, configuration?.extensions || []);
    this.config = _config_8;
    this.middlewareStack.use(getSchemaSerdePlugin(this.config));
    this.middlewareStack.use(getUserAgentPlugin(this.config));
    this.middlewareStack.use(getRetryPlugin(this.config));
    this.middlewareStack.use(getContentLengthPlugin(this.config));
    this.middlewareStack.use(getHostHeaderPlugin(this.config));
    this.middlewareStack.use(getLoggerPlugin(this.config));
    this.middlewareStack.use(getRecursionDetectionPlugin(this.config));
    this.middlewareStack.use(getHttpAuthSchemeEndpointRuleSetPlugin(this.config, {
      httpAuthSchemeParametersProvider: defaultSecretsManagerHttpAuthSchemeParametersProvider,
      identityProviderConfigProvider: async (config) => new DefaultIdentityProviderConfig({
        "aws.auth#sigv4": config.credentials
      })
    }));
    this.middlewareStack.use(getHttpSigningPlugin(this.config));
  }
  destroy() {
    super.destroy();
  }
};

// node_modules/@aws-sdk/client-secrets-manager/dist-es/commandBuilder.js
init_index_browser();
var command = makeBuilder(commonParams, "secretsmanager", "SecretsManagerClient", getEndpointPlugin);
var _ep0 = {};
var _mw0 = (Command2, cs, config, o) => [];

// node_modules/@aws-sdk/client-secrets-manager/dist-es/commands/GetSecretValueCommand.js
var GetSecretValueCommand = class extends command(_ep0, _mw0, "GetSecretValue", GetSecretValue$) {
};

// node_modules/@aws-sdk/client-lambda/dist-es/LambdaClient.js
init_index_browser();
init_index_browser4();
init_schema();

// node_modules/@aws-sdk/client-lambda/dist-es/auth/httpAuthSchemeProvider.js
var defaultLambdaHttpAuthSchemeParametersProvider = async (config, context, input) => {
  return {
    operation: getSmithyContext(context).operation,
    region: await normalizeProvider(config.region)() || (() => {
      throw new Error("expected `region` to be configured for `aws.auth#sigv4`");
    })()
  };
};
function createAwsAuthSigv4HttpAuthOption2(authParameters) {
  return {
    schemeId: "aws.auth#sigv4",
    signingProperties: {
      name: "lambda",
      region: authParameters.region
    },
    propertiesExtractor: (config, context) => ({
      signingProperties: {
        config,
        context
      }
    })
  };
}
var defaultLambdaHttpAuthSchemeProvider = (authParameters) => {
  const options = [];
  switch (authParameters.operation) {
    default: {
      options.push(createAwsAuthSigv4HttpAuthOption2(authParameters));
    }
  }
  return options;
};
var resolveHttpAuthSchemeConfig2 = (config) => {
  const config_0 = resolveAwsSdkSigV4Config(config);
  return Object.assign(config_0, {
    authSchemePreference: normalizeProvider(config.authSchemePreference ?? [])
  });
};

// node_modules/@aws-sdk/client-lambda/dist-es/endpoint/EndpointParameters.js
var resolveClientEndpointParameters2 = (options) => {
  return Object.assign(options, {
    useDualstackEndpoint: options.useDualstackEndpoint ?? false,
    useFipsEndpoint: options.useFipsEndpoint ?? false,
    defaultSigningName: "lambda"
  });
};
var commonParams2 = {
  UseFIPS: { type: "builtInParams", name: "useFipsEndpoint" },
  Endpoint: { type: "builtInParams", name: "endpoint" },
  Region: { type: "builtInParams", name: "region" },
  UseDualStack: { type: "builtInParams", name: "useDualstackEndpoint" }
};

// node_modules/@aws-sdk/client-lambda/package.json
var package_default2 = {
  name: "@aws-sdk/client-lambda",
  version: "3.1148.0",
  description: "AWS SDK for JavaScript Lambda Client for Node.js, Browser and React Native",
  homepage: "https://github.com/aws/aws-sdk-js-v3/tree/main/clients/client-lambda",
  license: "Apache-2.0",
  author: {
    name: "AWS SDK for JavaScript Team",
    url: "https://aws.amazon.com/sdk-for-javascript/"
  },
  repository: {
    type: "git",
    url: "https://github.com/aws/aws-sdk-js-v3.git",
    directory: "clients/client-lambda"
  },
  files: [
    "dist-*/**"
  ],
  sideEffects: false,
  main: "./dist-cjs/index.js",
  module: "./dist-es/index.js",
  browser: {
    "./dist-es/runtimeConfig": "./dist-es/runtimeConfig.browser"
  },
  types: "./dist-types/index.d.ts",
  typesVersions: {
    "<4.5": {
      "dist-types/*": [
        "dist-types/ts3.4/*"
      ]
    }
  },
  "react-native": {
    "./dist-es/runtimeConfig": "./dist-es/runtimeConfig.native"
  },
  scripts: {
    build: "concurrently 'yarn:build:types' 'yarn:build:es' && yarn build:cjs",
    "build:cjs": "node ../../scripts/compilation/inline",
    "build:es": "premove dist-es && tsc -p tsconfig.es.json",
    "build:include:deps": 'yarn g:turbo run build -F="$npm_package_name"',
    "build:types": "premove dist-types && tsc -p tsconfig.types.json",
    "build:types:downlevel": "downlevel-dts dist-types dist-types/ts3.4",
    clean: "premove dist-cjs dist-es dist-types",
    "extract:docs": "api-extractor run --local",
    "generate:client": "node ../../scripts/generate-clients/single-service",
    test: "yarn g:vitest run --passWithNoTests",
    "test:watch": "yarn g:vitest watch --passWithNoTests",
    "test:integration": "yarn g:vitest run --passWithNoTests -c vitest.config.integ.mts",
    "test:integration:watch": "yarn g:vitest watch --passWithNoTests -c vitest.config.integ.mts",
    "test:e2e": "yarn g:vitest run -c vitest.config.e2e.mts",
    "test:e2e:watch": "yarn g:vitest watch -c vitest.config.e2e.mts",
    "test:index": "tsc -p tsconfig.test.json && node ./test/index-objects.spec.mjs"
  },
  dependencies: {
    "@aws-sdk/core": "^3.978.1",
    "@aws-sdk/credential-provider-node": "^3.972.84",
    "@aws-sdk/types": "^3.974.6",
    "@smithy/core": "^3.35.0",
    "@smithy/fetch-http-handler": "^5.8.0",
    "@smithy/node-http-handler": "^4.12.1",
    "@smithy/types": "^4.19.0",
    tslib: "^2.6.2"
  },
  devDependencies: {
    "@smithy/snapshot-testing": "^2.3.2",
    "@tsconfig/node20": "20.1.8",
    "@types/node": "^20.14.8",
    concurrently: "7.0.0",
    "downlevel-dts": "0.10.1",
    premove: "4.0.0",
    typescript: "~7.0.2",
    vitest: "^4.0.17"
  },
  engines: {
    node: ">=20.0.0"
  }
};

// node_modules/@aws-sdk/client-lambda/dist-es/runtimeConfig.browser.js
init_index_browser4();
init_index_browser2();

// node_modules/@aws-sdk/client-lambda/dist-es/runtimeConfig.shared.js
init_index_browser3();
init_index_browser2();

// node_modules/@aws-sdk/client-lambda/dist-es/endpoint/endpointResolver.js
init_index_browser();

// node_modules/@aws-sdk/client-lambda/dist-es/endpoint/bdd.js
init_index_browser();
var k2 = "ref";
var a2 = -1;
var b2 = true;
var c2 = "isSet";
var d2 = "PartitionResult";
var e2 = "booleanEquals";
var f2 = "getAttr";
var g2 = { [k2]: "Endpoint" };
var h2 = { [k2]: d2 };
var i2 = {};
var j2 = [{ [k2]: "Region" }];
var _data2 = {
  conditions: [
    [c2, [g2]],
    [c2, j2],
    ["aws.partition", j2, d2],
    [e2, [{ [k2]: "UseFIPS" }, b2]],
    [e2, [{ [k2]: "UseDualStack" }, b2]],
    [e2, [{ fn: f2, argv: [h2, "supportsDualStack"] }, b2]],
    [e2, [{ fn: f2, argv: [h2, "supportsFIPS"] }, b2]]
  ],
  results: [
    [a2],
    [a2, "Invalid Configuration: FIPS and custom endpoint are not supported"],
    [a2, "Invalid Configuration: Dualstack and custom endpoint are not supported"],
    [g2, i2],
    ["https://lambda-fips.{Region}.{PartitionResult#dualStackDnsSuffix}", i2],
    [a2, "FIPS and DualStack are enabled, but this partition does not support one or both"],
    ["https://lambda-fips.{Region}.{PartitionResult#dnsSuffix}", i2],
    [a2, "FIPS is enabled but this partition does not support FIPS"],
    ["https://lambda.{Region}.{PartitionResult#dualStackDnsSuffix}", i2],
    [a2, "DualStack is enabled but this partition does not support DualStack"],
    ["https://lambda.{Region}.{PartitionResult#dnsSuffix}", i2],
    [a2, "Invalid Configuration: Missing Region"]
  ]
};
var root2 = 2;
var r2 = 1e8;
var nodes2 = new Int32Array([
  -1,
  1,
  -1,
  0,
  12,
  3,
  1,
  4,
  r2 + 11,
  2,
  5,
  r2 + 11,
  3,
  8,
  6,
  4,
  7,
  r2 + 10,
  5,
  r2 + 8,
  r2 + 9,
  4,
  10,
  9,
  6,
  r2 + 6,
  r2 + 7,
  5,
  11,
  r2 + 5,
  6,
  r2 + 4,
  r2 + 5,
  3,
  r2 + 1,
  13,
  4,
  r2 + 2,
  r2 + 3
]);
var bdd2 = BinaryDecisionDiagram.from(nodes2, root2, _data2.conditions, _data2.results);

// node_modules/@aws-sdk/client-lambda/dist-es/endpoint/endpointResolver.js
var cache2 = new EndpointCache({
  size: 50,
  params: ["Endpoint", "Region", "UseDualStack", "UseFIPS"]
});
var defaultEndpointResolver2 = (endpointParams, context = {}) => {
  return cache2.get(endpointParams, () => decideEndpoint(bdd2, {
    endpointParams,
    logger: context.logger
  }));
};
customEndpointFunctions.aws = awsEndpointFunctions;

// node_modules/@aws-sdk/client-lambda/dist-es/schemas/schemas_0.js
init_schema();

// node_modules/@aws-sdk/client-lambda/dist-es/models/LambdaServiceException.js
var LambdaServiceException = class _LambdaServiceException extends ServiceException {
  constructor(options) {
    super(options);
    Object.setPrototypeOf(this, _LambdaServiceException.prototype);
  }
};

// node_modules/@aws-sdk/client-lambda/dist-es/models/errors.js
var InvalidParameterValueException = class _InvalidParameterValueException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "InvalidParameterValueException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "InvalidParameterValueException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    Object.setPrototypeOf(this, _InvalidParameterValueException.prototype);
    this.Type = opts.Type;
  }
};
var PolicyLengthExceededException = class _PolicyLengthExceededException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "PolicyLengthExceededException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "PolicyLengthExceededException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    Object.setPrototypeOf(this, _PolicyLengthExceededException.prototype);
    this.Type = opts.Type;
  }
};
var PreconditionFailedException = class _PreconditionFailedException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "PreconditionFailedException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "PreconditionFailedException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    Object.setPrototypeOf(this, _PreconditionFailedException.prototype);
    this.Type = opts.Type;
  }
};
var ResourceConflictException = class _ResourceConflictException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "ResourceConflictException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "ResourceConflictException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    Object.setPrototypeOf(this, _ResourceConflictException.prototype);
    this.Type = opts.Type;
  }
};
var ResourceNotFoundException2 = class _ResourceNotFoundException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "ResourceNotFoundException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "ResourceNotFoundException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _ResourceNotFoundException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var ServiceException2 = class _ServiceException2 extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "ServiceException",
      $fault: "server",
      ...opts
    });
    __publicField(this, "name", "ServiceException");
    __publicField(this, "$fault", "server");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _ServiceException2.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var TooManyRequestsException = class _TooManyRequestsException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "TooManyRequestsException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "TooManyRequestsException");
    __publicField(this, "$fault", "client");
    __publicField(this, "retryAfterSeconds");
    __publicField(this, "Type");
    __publicField(this, "Reason");
    Object.setPrototypeOf(this, _TooManyRequestsException.prototype);
    this.retryAfterSeconds = opts.retryAfterSeconds;
    this.Type = opts.Type;
    this.Reason = opts.Reason;
  }
};
var PublicPolicyException2 = class _PublicPolicyException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "PublicPolicyException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "PublicPolicyException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _PublicPolicyException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var AliasLimitExceededException = class _AliasLimitExceededException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "AliasLimitExceededException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "AliasLimitExceededException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    Object.setPrototypeOf(this, _AliasLimitExceededException.prototype);
    this.Type = opts.Type;
  }
};
var CapacityProviderLimitExceededException = class _CapacityProviderLimitExceededException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "CapacityProviderLimitExceededException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "CapacityProviderLimitExceededException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    Object.setPrototypeOf(this, _CapacityProviderLimitExceededException.prototype);
    this.Type = opts.Type;
  }
};
var KMSAccessDeniedException = class _KMSAccessDeniedException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "KMSAccessDeniedException",
      $fault: "server",
      ...opts
    });
    __publicField(this, "name", "KMSAccessDeniedException");
    __publicField(this, "$fault", "server");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _KMSAccessDeniedException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var KMSDisabledException = class _KMSDisabledException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "KMSDisabledException",
      $fault: "server",
      ...opts
    });
    __publicField(this, "name", "KMSDisabledException");
    __publicField(this, "$fault", "server");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _KMSDisabledException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var KMSInvalidStateException = class _KMSInvalidStateException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "KMSInvalidStateException",
      $fault: "server",
      ...opts
    });
    __publicField(this, "name", "KMSInvalidStateException");
    __publicField(this, "$fault", "server");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _KMSInvalidStateException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var KMSNotFoundException = class _KMSNotFoundException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "KMSNotFoundException",
      $fault: "server",
      ...opts
    });
    __publicField(this, "name", "KMSNotFoundException");
    __publicField(this, "$fault", "server");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _KMSNotFoundException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var ResourceInUseException = class _ResourceInUseException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "ResourceInUseException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "ResourceInUseException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _ResourceInUseException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var CodeSigningConfigNotFoundException = class _CodeSigningConfigNotFoundException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "CodeSigningConfigNotFoundException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "CodeSigningConfigNotFoundException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _CodeSigningConfigNotFoundException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var CodeStorageExceededException = class _CodeStorageExceededException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "CodeStorageExceededException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "CodeStorageExceededException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    Object.setPrototypeOf(this, _CodeStorageExceededException.prototype);
    this.Type = opts.Type;
  }
};
var CodeVerificationFailedException = class _CodeVerificationFailedException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "CodeVerificationFailedException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "CodeVerificationFailedException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _CodeVerificationFailedException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var FunctionVersionsPerCapacityProviderLimitExceededException = class _FunctionVersionsPerCapacityProviderLimitExceededException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "FunctionVersionsPerCapacityProviderLimitExceededException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "FunctionVersionsPerCapacityProviderLimitExceededException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    Object.setPrototypeOf(this, _FunctionVersionsPerCapacityProviderLimitExceededException.prototype);
    this.Type = opts.Type;
  }
};
var InvalidCodeSignatureException = class _InvalidCodeSignatureException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "InvalidCodeSignatureException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "InvalidCodeSignatureException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _InvalidCodeSignatureException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var CodeArtifactUserDeletedException = class _CodeArtifactUserDeletedException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "CodeArtifactUserDeletedException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "CodeArtifactUserDeletedException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    Object.setPrototypeOf(this, _CodeArtifactUserDeletedException.prototype);
    this.Type = opts.Type;
  }
};
var CodeArtifactUserFailedException = class _CodeArtifactUserFailedException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "CodeArtifactUserFailedException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "CodeArtifactUserFailedException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    Object.setPrototypeOf(this, _CodeArtifactUserFailedException.prototype);
    this.Type = opts.Type;
  }
};
var CodeArtifactUserPendingException = class _CodeArtifactUserPendingException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "CodeArtifactUserPendingException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "CodeArtifactUserPendingException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    Object.setPrototypeOf(this, _CodeArtifactUserPendingException.prototype);
    this.Type = opts.Type;
  }
};
var DurableExecutionAlreadyStartedException = class _DurableExecutionAlreadyStartedException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "DurableExecutionAlreadyStartedException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "DurableExecutionAlreadyStartedException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _DurableExecutionAlreadyStartedException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var EC2AccessDeniedException = class _EC2AccessDeniedException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "EC2AccessDeniedException",
      $fault: "server",
      ...opts
    });
    __publicField(this, "name", "EC2AccessDeniedException");
    __publicField(this, "$fault", "server");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _EC2AccessDeniedException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var EC2ThrottledException = class _EC2ThrottledException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "EC2ThrottledException",
      $fault: "server",
      ...opts
    });
    __publicField(this, "name", "EC2ThrottledException");
    __publicField(this, "$fault", "server");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _EC2ThrottledException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var EC2UnexpectedException = class _EC2UnexpectedException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "EC2UnexpectedException",
      $fault: "server",
      ...opts
    });
    __publicField(this, "name", "EC2UnexpectedException");
    __publicField(this, "$fault", "server");
    __publicField(this, "Type");
    __publicField(this, "Message");
    __publicField(this, "EC2ErrorCode");
    Object.setPrototypeOf(this, _EC2UnexpectedException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
    this.EC2ErrorCode = opts.EC2ErrorCode;
  }
};
var EFSIOException = class _EFSIOException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "EFSIOException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "EFSIOException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _EFSIOException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var EFSMountConnectivityException = class _EFSMountConnectivityException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "EFSMountConnectivityException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "EFSMountConnectivityException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _EFSMountConnectivityException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var EFSMountFailureException = class _EFSMountFailureException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "EFSMountFailureException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "EFSMountFailureException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _EFSMountFailureException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var EFSMountTimeoutException = class _EFSMountTimeoutException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "EFSMountTimeoutException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "EFSMountTimeoutException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _EFSMountTimeoutException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var ENILimitReachedException = class _ENILimitReachedException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "ENILimitReachedException",
      $fault: "server",
      ...opts
    });
    __publicField(this, "name", "ENILimitReachedException");
    __publicField(this, "$fault", "server");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _ENILimitReachedException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var ENINotReadyException = class _ENINotReadyException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "ENINotReadyException",
      $fault: "server",
      ...opts
    });
    __publicField(this, "name", "ENINotReadyException");
    __publicField(this, "$fault", "server");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _ENINotReadyException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var InvalidRequestContentException = class _InvalidRequestContentException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "InvalidRequestContentException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "InvalidRequestContentException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    Object.setPrototypeOf(this, _InvalidRequestContentException.prototype);
    this.Type = opts.Type;
  }
};
var InvalidRuntimeException = class _InvalidRuntimeException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "InvalidRuntimeException",
      $fault: "server",
      ...opts
    });
    __publicField(this, "name", "InvalidRuntimeException");
    __publicField(this, "$fault", "server");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _InvalidRuntimeException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var InvalidSecurityGroupIDException = class _InvalidSecurityGroupIDException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "InvalidSecurityGroupIDException",
      $fault: "server",
      ...opts
    });
    __publicField(this, "name", "InvalidSecurityGroupIDException");
    __publicField(this, "$fault", "server");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _InvalidSecurityGroupIDException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var InvalidSubnetIDException = class _InvalidSubnetIDException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "InvalidSubnetIDException",
      $fault: "server",
      ...opts
    });
    __publicField(this, "name", "InvalidSubnetIDException");
    __publicField(this, "$fault", "server");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _InvalidSubnetIDException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var InvalidZipFileException = class _InvalidZipFileException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "InvalidZipFileException",
      $fault: "server",
      ...opts
    });
    __publicField(this, "name", "InvalidZipFileException");
    __publicField(this, "$fault", "server");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _InvalidZipFileException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var ModeNotSupportedException = class _ModeNotSupportedException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "ModeNotSupportedException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "ModeNotSupportedException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    Object.setPrototypeOf(this, _ModeNotSupportedException.prototype);
    this.Type = opts.Type;
  }
};
var NoPublishedVersionException = class _NoPublishedVersionException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "NoPublishedVersionException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "NoPublishedVersionException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _NoPublishedVersionException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var RecursiveInvocationException = class _RecursiveInvocationException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "RecursiveInvocationException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "RecursiveInvocationException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _RecursiveInvocationException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var RequestTooLargeException = class _RequestTooLargeException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "RequestTooLargeException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "RequestTooLargeException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    Object.setPrototypeOf(this, _RequestTooLargeException.prototype);
    this.Type = opts.Type;
  }
};
var ResourceNotReadyException = class _ResourceNotReadyException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "ResourceNotReadyException",
      $fault: "server",
      ...opts
    });
    __publicField(this, "name", "ResourceNotReadyException");
    __publicField(this, "$fault", "server");
    __publicField(this, "Type");
    Object.setPrototypeOf(this, _ResourceNotReadyException.prototype);
    this.Type = opts.Type;
  }
};
var S3FilesMountConnectivityException = class _S3FilesMountConnectivityException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "S3FilesMountConnectivityException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "S3FilesMountConnectivityException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _S3FilesMountConnectivityException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var S3FilesMountFailureException = class _S3FilesMountFailureException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "S3FilesMountFailureException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "S3FilesMountFailureException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _S3FilesMountFailureException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var S3FilesMountTimeoutException = class _S3FilesMountTimeoutException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "S3FilesMountTimeoutException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "S3FilesMountTimeoutException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _S3FilesMountTimeoutException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var SerializedRequestEntityTooLargeException = class _SerializedRequestEntityTooLargeException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "SerializedRequestEntityTooLargeException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "SerializedRequestEntityTooLargeException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    Object.setPrototypeOf(this, _SerializedRequestEntityTooLargeException.prototype);
    this.Type = opts.Type;
  }
};
var ServiceQuotaExceededException = class _ServiceQuotaExceededException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "ServiceQuotaExceededException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "ServiceQuotaExceededException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _ServiceQuotaExceededException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var SnapStartException = class _SnapStartException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "SnapStartException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "SnapStartException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _SnapStartException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var SnapStartNotReadyException = class _SnapStartNotReadyException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "SnapStartNotReadyException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "SnapStartNotReadyException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _SnapStartNotReadyException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var SnapStartRegenerationFailureException = class _SnapStartRegenerationFailureException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "SnapStartRegenerationFailureException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "SnapStartRegenerationFailureException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _SnapStartRegenerationFailureException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var SnapStartTimeoutException = class _SnapStartTimeoutException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "SnapStartTimeoutException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "SnapStartTimeoutException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _SnapStartTimeoutException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var SubnetIPAddressLimitReachedException = class _SubnetIPAddressLimitReachedException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "SubnetIPAddressLimitReachedException",
      $fault: "server",
      ...opts
    });
    __publicField(this, "name", "SubnetIPAddressLimitReachedException");
    __publicField(this, "$fault", "server");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _SubnetIPAddressLimitReachedException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};
var UnsupportedMediaTypeException = class _UnsupportedMediaTypeException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "UnsupportedMediaTypeException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "UnsupportedMediaTypeException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    Object.setPrototypeOf(this, _UnsupportedMediaTypeException.prototype);
    this.Type = opts.Type;
  }
};
var ProvisionedConcurrencyConfigNotFoundException = class _ProvisionedConcurrencyConfigNotFoundException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "ProvisionedConcurrencyConfigNotFoundException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "ProvisionedConcurrencyConfigNotFoundException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    Object.setPrototypeOf(this, _ProvisionedConcurrencyConfigNotFoundException.prototype);
    this.Type = opts.Type;
  }
};
var CallbackTimeoutException = class _CallbackTimeoutException extends LambdaServiceException {
  constructor(opts) {
    super({
      name: "CallbackTimeoutException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "CallbackTimeoutException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Type");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _CallbackTimeoutException.prototype);
    this.Type = opts.Type;
    this.Message = opts.Message;
  }
};

// node_modules/@aws-sdk/client-lambda/dist-es/schemas/schemas_0.js
var _A = "Action";
var _AA = "AliasArn";
var _AC = "AliasConfiguration";
var _ACc = "AccessConfigs";
var _ACl = "AllowCredentials";
var _AFSC = "AppliedFunctionScalingConfig";
var _AH = "AllowHeaders";
var _AIT = "AllowedInstanceTypes";
var _AL = "AccountLimit";
var _ALEE = "AliasLimitExceededException";
var _ALL = "ApplicationLogLevel";
var _ALVP = "AddLayerVersionPermission";
var _ALVPR = "AddLayerVersionPermissionRequest";
var _ALVPRd = "AddLayerVersionPermissionResponse";
var _ALl = "AliasList";
var _AM = "AllowMethods";
var _AMKESC = "AmazonManagedKafkaEventSourceConfig";
var _AO = "AllowOrigins";
var _AOp = "ApplyOn";
var _AP = "AllowedPublishers";
var _APCE = "AvailableProvisionedConcurrentExecutions";
var _APCEl = "AllocatedProvisionedConcurrentExecutions";
var _APR = "AddPermissionRequest";
var _APRd = "AddPermissionResponse";
var _APd = "AddPermission";
var _ARC = "AliasRoutingConfiguration";
var _AT = "AuthType";
var _AU = "AccountUsage";
var _AVW = "AdditionalVersionWeights";
var _Al = "Aliases";
var _Ar = "Architectures";
var _Arn = "Arn";
var _At = "Attribute";
var _Att = "Attempt";
var _B = "Blob";
var _BBOFE = "BisectBatchOnFunctionError";
var _BOP = "BinaryOperationPayload";
var _BS = "BlobStream";
var _BSa = "BatchSize";
var _C = "Concurrency";
var _CA = "CompatibleArchitectures";
var _CAR = "CreateAliasRequest";
var _CAUDE = "CodeArtifactUserDeletedException";
var _CAUFE = "CodeArtifactUserFailedException";
var _CAUPE = "CodeArtifactUserPendingException";
var _CAo = "CompatibleArchitecture";
var _CAr = "CreateAlias";
var _CAu = "CurrentAttempt";
var _CC = "ClientContext";
var _CCP = "CreateCapacityProvider";
var _CCPR = "CreateCapacityProviderRequest";
var _CCPRr = "CreateCapacityProviderResponse";
var _CCSC = "CreateCodeSigningConfig";
var _CCSCR = "CreateCodeSigningConfigRequest";
var _CCSCRr = "CreateCodeSigningConfigResponse";
var _CD2 = "CallbackDetails";
var _CDE = "CheckpointDurableExecution";
var _CDER = "CheckpointDurableExecutionRequest";
var _CDERh = "CheckpointDurableExecutionResponse";
var _CDo = "ContextDetails";
var _CDr = "CreatedDate";
var _CE = "ConcurrentExecutions";
var _CESM = "CreateEventSourceMapping";
var _CESMR = "CreateEventSourceMappingRequest";
var _CF = "CreateFunction";
var _CFD = "CallbackFailedDetails";
var _CFDo = "ContextFailedDetails";
var _CFR = "CreateFunctionRequest";
var _CFUC = "CreateFunctionUrlConfig";
var _CFUCR = "CreateFunctionUrlConfigRequest";
var _CFUCRr = "CreateFunctionUrlConfigResponse";
var _CGI = "ConsumerGroupId";
var _CI = "CallbackId";
var _CID = "ChainedInvokeDetails";
var _CIFD = "ChainedInvokeFailedDetails";
var _CIO = "ChainedInvokeOptions";
var _CISD = "ChainedInvokeStartedDetails";
var _CISDh = "ChainedInvokeStoppedDetails";
var _CISDha = "ChainedInvokeSucceededDetails";
var _CITOD = "ChainedInvokeTimedOutDetails";
var _CN = "CollectionName";
var _CO = "CallbackOptions";
var _COo = "ContextOptions";
var _CP = "CapacityProvider";
var _CPA = "CapacityProviderArn";
var _CPC = "CapacityProviderConfig";
var _CPL = "CapacityProvidersList";
var _CPLC = "CapacityProviderLoggingConfig";
var _CPLEE = "CapacityProviderLimitExceededException";
var _CPN = "CapacityProviderName";
var _CPORA = "CapacityProviderOperatorRoleArn";
var _CPPC = "CapacityProviderPermissionsConfig";
var _CPSC = "CapacityProviderScalingConfig";
var _CPSPL = "CapacityProviderScalingPoliciesList";
var _CPTC = "CapacityProviderTelemetryConfig";
var _CPVC = "CapacityProviderVpcConfig";
var _CPa = "CapacityProviders";
var _CR = "CompatibleRuntimes";
var _CRo = "CompatibleRuntime";
var _CS = "CodeSize";
var _CSC = "CodeSigningConfig";
var _CSCA = "CodeSigningConfigArn";
var _CSCI = "CodeSigningConfigId";
var _CSCL = "CodeSigningConfigList";
var _CSCNFE = "CodeSigningConfigNotFoundException";
var _CSCo = "CodeSigningConfigs";
var _CSD = "CallbackStartedDetails";
var _CSDa = "CallbackSucceededDetails";
var _CSDo = "ContextStartedDetails";
var _CSDon = "ContextSucceededDetails";
var _CSEE = "CodeStorageExceededException";
var _CSP = "CodeSigningPolicies";
var _CSU = "CodeSizeUnzipped";
var _CSZ = "CodeSizeZipped";
var _CSo = "CodeSha256";
var _CSon = "ConfigSha256";
var _CT = "CheckpointToken";
var _CTE = "CallbackTimeoutException";
var _CTOD = "CallbackTimedOutDetails";
var _CT_ = "Content-Type";
var _CTl = "ClientToken";
var _CTr = "CreationTime";
var _CUES = "CheckpointUpdatedExecutionState";
var _CVFE = "CodeVerificationFailedException";
var _Co = "Cors";
var _Cod = "Code";
var _Com = "Command";
var _Con = "Configuration";
var _Cont = "Content";
var _D2 = "Description";
var _DA = "DeleteAlias";
var _DAR = "DeleteAliasRequest";
var _DC = "DestinationConfig";
var _DCP = "DeleteCapacityProvider";
var _DCPR = "DeleteCapacityProviderRequest";
var _DCPRe = "DeleteCapacityProviderResponse";
var _DCSC = "DeleteCodeSigningConfig";
var _DCSCR = "DeleteCodeSigningConfigRequest";
var _DCSCRe = "DeleteCodeSigningConfigResponse";
var _DCu = "DurableConfig";
var _DDBESC = "DocumentDBEventSourceConfig";
var _DE = "DurableExecutions";
var _DEA = "DurableExecutionArn";
var _DEASE = "DurableExecutionAlreadyStartedException";
var _DEN = "DurableExecutionName";
var _DESM = "DeleteEventSourceMapping";
var _DESMR = "DeleteEventSourceMappingRequest";
var _DF2 = "DeleteFunction";
var _DFC = "DeleteFunctionConcurrency";
var _DFCR = "DeleteFunctionConcurrencyRequest";
var _DFCSC = "DeleteFunctionCodeSigningConfig";
var _DFCSCR = "DeleteFunctionCodeSigningConfigRequest";
var _DFEIC = "DeleteFunctionEventInvokeConfig";
var _DFEICR = "DeleteFunctionEventInvokeConfigRequest";
var _DFR = "DeleteFunctionRequest";
var _DFRe = "DeleteFunctionResponse";
var _DFUC = "DeleteFunctionUrlConfig";
var _DFUCR = "DeleteFunctionUrlConfigRequest";
var _DLC = "DeadLetterConfig";
var _DLV = "DeleteLayerVersion";
var _DLVR = "DeleteLayerVersionRequest";
var _DN = "DatabaseName";
var _DPCC = "DeleteProvisionedConcurrencyConfig";
var _DPCCR = "DeleteProvisionedConcurrencyConfigRequest";
var _DR = "DryRun";
var _DRP = "DeleteResourcePolicy";
var _DRPR = "DeleteResourcePolicyRequest";
var _DSR = "DirectS3Read";
var _De = "Destination";
var _Du2 = "Duration";
var _E = "Error";
var _EC = "ErrorCode";
var _ECADE = "EC2AccessDeniedException";
var _ECEC = "EC2ErrorCode";
var _ECTE = "EC2ThrottledException";
var _ECUE = "EC2UnexpectedException";
var _ED = "ErrorData";
var _EDI = "ExecutionDataIncluded";
var _EDr = "ErrorDetails";
var _EDx = "ExecutionDetails";
var _EE = "EnvironmentError";
var _EEMGBPVC = "ExecutionEnvironmentMemoryGiBPerVCpu";
var _EEv = "EventError";
var _EFD = "ExecutionFailedDetails";
var _EFSIOE = "EFSIOException";
var _EFSMCE = "EFSMountConnectivityException";
var _EFSMFE = "EFSMountFailureException";
var _EFSMTE = "EFSMountTimeoutException";
var _EH = "ExposeHeaders";
var _EI = "EventId";
var _EIT = "ExcludedInstanceTypes";
var _EIv = "EventInput";
var _EM = "ErrorMessage";
var _ENILRE = "ENILimitReachedException";
var _ENINRE = "ENINotReadyException";
var _EO = "ErrorObject";
var _EP = "EntryPoint";
var _ER = "EnvironmentResponse";
var _ERF = "EventRecordFormat";
var _ERv = "EventResult";
var _ES = "EphemeralStorage";
var _ESA = "EventSourceArn";
var _ESD = "ExecutionStartedDetails";
var _ESDx = "ExecutionSucceededDetails";
var _ESDxe = "ExecutionStoppedDetails";
var _ESM = "EventSourceMappings";
var _ESMA = "EventSourceMappingArn";
var _ESMC = "EventSourceMappingConfiguration";
var _ESML = "EventSourceMappingsList";
var _ESMLC = "EventSourceMappingLoggingConfig";
var _ESMMC = "EventSourceMappingMetricsConfig";
var _EST = "EventSourceToken";
var _ESv = "EventStream";
var _ET = "ErrorType";
var _ETOD = "ExecutionTimedOutDetails";
var _ETn = "EndTimestamp";
var _ETv = "EventType";
var _ETve = "EventTimestamp";
var _ETx = "ExecutionTimeout";
var _ETxp = "ExplicitTags";
var _EV = "ExecutedVersion";
var _EVN = "EnvironmentVariableName";
var _EVV = "EnvironmentVariableValue";
var _EVn = "EnvironmentVariables";
var _En = "Enabled";
var _End = "Endpoints";
var _Env = "Environment";
var _Ev = "Event";
var _Eve = "Events";
var _Ex = "Execution";
var _F2 = "Filter";
var _FA = "FunctionArn";
var _FAu = "FunctionArns";
var _FC = "FunctionCount";
var _FCE = "FilterCriteriaError";
var _FCL = "FunctionCodeLocation";
var _FCLE = "FunctionCodeLocationError";
var _FCi = "FilterCriteria";
var _FCu = "FunctionCode";
var _FCun = "FunctionConfiguration";
var _FD = "FullDocument";
var _FE = "FunctionError";
var _FEIC = "FunctionEventInvokeConfig";
var _FEICL = "FunctionEventInvokeConfigList";
var _FEICu = "FunctionEventInvokeConfigs";
var _FL = "FilterList";
var _FLu = "FunctionList";
var _FN = "FunctionName";
var _FRT = "FunctionResponseTypes";
var _FS = "FunctionState";
var _FSC = "FileSystemConfigs";
var _FSCL = "FileSystemConfigList";
var _FSCi = "FileSystemConfig";
var _FSCu = "FunctionScalingConfig";
var _FU = "FunctionUrl";
var _FUAT = "FunctionUrlAuthType";
var _FUC = "FunctionUrlConfig";
var _FUCL = "FunctionUrlConfigList";
var _FUCu = "FunctionUrlConfigs";
var _FV = "FunctionVersion";
var _FVBCPL = "FunctionVersionsByCapacityProviderList";
var _FVBCPLI = "FunctionVersionsByCapacityProviderListItem";
var _FVPCPLEE = "FunctionVersionsPerCapacityProviderLimitExceededException";
var _FVu = "FunctionVersions";
var _Fi2 = "Filters";
var _Fu = "Functions";
var _GA = "GetAlias";
var _GAR = "GetAliasRequest";
var _GAS = "GetAccountSettings";
var _GASR = "GetAccountSettingsRequest";
var _GASRe = "GetAccountSettingsResponse";
var _GCP = "GetCapacityProvider";
var _GCPR = "GetCapacityProviderRequest";
var _GCPRe = "GetCapacityProviderResponse";
var _GCSC = "GetCodeSigningConfig";
var _GCSCR = "GetCodeSigningConfigRequest";
var _GCSCRe = "GetCodeSigningConfigResponse";
var _GDE = "GetDurableExecution";
var _GDEH = "GetDurableExecutionHistory";
var _GDEHR = "GetDurableExecutionHistoryRequest";
var _GDEHRe = "GetDurableExecutionHistoryResponse";
var _GDER = "GetDurableExecutionRequest";
var _GDERe = "GetDurableExecutionResponse";
var _GDES = "GetDurableExecutionState";
var _GDESR = "GetDurableExecutionStateRequest";
var _GDESRe = "GetDurableExecutionStateResponse";
var _GESM = "GetEventSourceMapping";
var _GESMR = "GetEventSourceMappingRequest";
var _GF = "GetFunction";
var _GFC = "GetFunctionConcurrency";
var _GFCR = "GetFunctionConcurrencyRequest";
var _GFCRe = "GetFunctionConcurrencyResponse";
var _GFCRet = "GetFunctionConfigurationRequest";
var _GFCSC = "GetFunctionCodeSigningConfig";
var _GFCSCR = "GetFunctionCodeSigningConfigRequest";
var _GFCSCRe = "GetFunctionCodeSigningConfigResponse";
var _GFCe = "GetFunctionConfiguration";
var _GFEIC = "GetFunctionEventInvokeConfig";
var _GFEICR = "GetFunctionEventInvokeConfigRequest";
var _GFR = "GetFunctionRequest";
var _GFRC = "GetFunctionRecursionConfig";
var _GFRCR = "GetFunctionRecursionConfigRequest";
var _GFRCRe = "GetFunctionRecursionConfigResponse";
var _GFRe = "GetFunctionResponse";
var _GFSC = "GetFunctionScalingConfig";
var _GFSCR = "GetFunctionScalingConfigRequest";
var _GFSCRe = "GetFunctionScalingConfigResponse";
var _GFUC = "GetFunctionUrlConfig";
var _GFUCR = "GetFunctionUrlConfigRequest";
var _GFUCRe = "GetFunctionUrlConfigResponse";
var _GLV = "GetLayerVersion";
var _GLVBA = "GetLayerVersionByArn";
var _GLVBAR = "GetLayerVersionByArnRequest";
var _GLVP = "GetLayerVersionPolicy";
var _GLVPR = "GetLayerVersionPolicyRequest";
var _GLVPRe = "GetLayerVersionPolicyResponse";
var _GLVR = "GetLayerVersionRequest";
var _GLVRe = "GetLayerVersionResponse";
var _GP = "GetPolicy";
var _GPCC = "GetProvisionedConcurrencyConfig";
var _GPCCR = "GetProvisionedConcurrencyConfigRequest";
var _GPCCRe = "GetProvisionedConcurrencyConfigResponse";
var _GPR = "GetPolicyRequest";
var _GPRe = "GetPolicyResponse";
var _GRMC = "GetRuntimeManagementConfig";
var _GRMCR = "GetRuntimeManagementConfigRequest";
var _GRMCRe = "GetRuntimeManagementConfigResponse";
var _GRP = "GetResourcePolicy";
var _GRPR = "GetResourcePolicyRequest";
var _GRPRe = "GetResourcePolicyResponse";
var _H = "Handler";
var _HT = "HeartbeatTimeout";
var _HTS = "HeartbeatTimeoutSeconds";
var _I = "Input";
var _IA = "InvokeArgs";
var _IAFDS = "Ipv6AllowedForDualStack";
var _IAR = "InvokeAsyncRequest";
var _IARn = "InvokeAsyncResponse";
var _IAn = "InvokeAsync";
var _IC = "ImageConfig";
var _ICD = "InvocationCompletedDetails";
var _ICE = "ImageConfigError";
var _ICR = "ImageConfigResponse";
var _ICSE = "InvalidCodeSignatureException";
var _ICn = "InvokeComplete";
var _IED = "IncludeExecutionData";
var _IM = "InvokeMode";
var _IP = "InputPayload";
var _IPVE = "InvalidParameterValueException";
var _IR = "InstanceRequirements";
var _IRCE = "InvalidRequestContentException";
var _IRE2 = "InvalidRuntimeException";
var _IRSU = "InvokeResponseStreamUpdate";
var _IRn = "InvocationRequest";
var _IRnv = "InvocationResponse";
var _ISGIDE = "InvalidSecurityGroupIDException";
var _ISIDE = "InvalidSubnetIDException";
var _IT = "InvocationType";
var _IU = "ImageUri";
var _IVFU = "InvokedViaFunctionUrl";
var _IWRS = "InvokeWithResponseStream";
var _IWRSCE = "InvokeWithResponseStreamCompleteEvent";
var _IWRSR = "InvokeWithResponseStreamRequest";
var _IWRSRE = "InvokeWithResponseStreamResponseEvent";
var _IWRSRn = "InvokeWithResponseStreamResponse";
var _IZFE = "InvalidZipFileException";
var _Id = "Id";
var _In = "Invoke";
var _K2 = "Key";
var _KKA = "KmsKeyArn";
var _KMSADE = "KMSAccessDeniedException";
var _KMSDE = "KMSDisabledException";
var _KMSISE = "KMSInvalidStateException";
var _KMSKA = "KMSKeyArn";
var _KMSNFE = "KMSNotFoundException";
var _KSRAC = "KafkaSchemaRegistryAccessConfig";
var _KSRACL = "KafkaSchemaRegistryAccessConfigList";
var _KSRC = "KafkaSchemaRegistryConfig";
var _KSVC = "KafkaSchemaValidationConfig";
var _KSVCL = "KafkaSchemaValidationConfigList";
var _L = "Layers";
var _LA = "LayerArn";
var _LAR = "ListAliasesRequest";
var _LARi = "ListAliasesResponse";
var _LAi = "ListAliases";
var _LC = "LoggingConfig";
var _LCP = "ListCapacityProviders";
var _LCPR = "ListCapacityProvidersRequest";
var _LCPRi = "ListCapacityProvidersResponse";
var _LCSC = "ListCodeSigningConfigs";
var _LCSCR = "ListCodeSigningConfigsRequest";
var _LCSCRi = "ListCodeSigningConfigsResponse";
var _LDEBF = "ListDurableExecutionsByFunction";
var _LDEBFR = "ListDurableExecutionsByFunctionRequest";
var _LDEBFRi = "ListDurableExecutionsByFunctionResponse";
var _LESM = "ListEventSourceMappings";
var _LESMR = "ListEventSourceMappingsRequest";
var _LESMRi = "ListEventSourceMappingsResponse";
var _LF = "LogFormat";
var _LFBCSC = "ListFunctionsByCodeSigningConfig";
var _LFBCSCR = "ListFunctionsByCodeSigningConfigRequest";
var _LFBCSCRi = "ListFunctionsByCodeSigningConfigResponse";
var _LFEIC = "ListFunctionEventInvokeConfigs";
var _LFEICR = "ListFunctionEventInvokeConfigsRequest";
var _LFEICRi = "ListFunctionEventInvokeConfigsResponse";
var _LFR = "ListFunctionsRequest";
var _LFRi = "ListFunctionsResponse";
var _LFUC = "ListFunctionUrlConfigs";
var _LFUCR = "ListFunctionUrlConfigsRequest";
var _LFUCRi = "ListFunctionUrlConfigsResponse";
var _LFVBCP = "ListFunctionVersionsByCapacityProvider";
var _LFVBCPR = "ListFunctionVersionsByCapacityProviderRequest";
var _LFVBCPRi = "ListFunctionVersionsByCapacityProviderResponse";
var _LFi = "ListFunctions";
var _LG = "LogGroup";
var _LI = "LicenseInfo";
var _LL = "LayersList";
var _LLI = "LayersListItem";
var _LLR = "ListLayersRequest";
var _LLRi = "ListLayersResponse";
var _LLV = "ListLayerVersions";
var _LLVR = "ListLayerVersionsRequest";
var _LLVRi = "ListLayerVersionsResponse";
var _LLi = "ListLayers";
var _LM = "LastModified";
var _LMICPC = "LambdaManagedInstancesCapacityProviderConfig";
var _LMP = "LocalMountPath";
var _LMT = "LastModifiedTime";
var _LMV = "LatestMatchingVersion";
var _LN = "LayerName";
var _LPCC = "ListProvisionedConcurrencyConfigs";
var _LPCCR = "ListProvisionedConcurrencyConfigsRequest";
var _LPCCRi = "ListProvisionedConcurrencyConfigsResponse";
var _LPR = "LastProcessingResult";
var _LR = "LogResult";
var _LRL = "LayersReferenceList";
var _LT = "LogType";
var _LTR = "ListTagsRequest";
var _LTRi = "ListTagsResponse";
var _LTi = "ListTags";
var _LUS = "LastUpdateStatus";
var _LUSR = "LastUpdateStatusReason";
var _LUSRC = "LastUpdateStatusReasonCode";
var _LV = "LayerVersions";
var _LVA = "LayerVersionArn";
var _LVBF = "ListVersionsByFunction";
var _LVBFR = "ListVersionsByFunctionRequest";
var _LVBFRi = "ListVersionsByFunctionResponse";
var _LVCI = "LayerVersionContentInput";
var _LVCO = "LayerVersionContentOutput";
var _LVL = "LayerVersionsList";
var _LVLI = "LayerVersionsListItem";
var _La = "Layer";
var _Lo = "Location";
var _M2 = "Message";
var _MA = "MaxAge";
var _MAa = "MasterArn";
var _MBWIS = "MaximumBatchingWindowInSeconds";
var _MC = "MetricsConfig";
var _MCa = "MaximumConcurrency";
var _MEAIS = "MaximumEventAgeInSeconds";
var _MEE = "MinExecutionEnvironments";
var _MEEa = "MaxExecutionEnvironments";
var _MI = "MaxItems";
var _MNSE = "ModeNotSupportedException";
var _MP = "MinimumPollers";
var _MPa = "MaximumPollers";
var _MR2 = "MasterRegion";
var _MRA = "MaximumRetryAttempts";
var _MRAIS = "MaximumRecordAgeInSeconds";
var _MS = "MemorySize";
var _MVCC = "MaxVCpuCount";
var _Ma = "Marker";
var _Me = "Metrics";
var _Mo = "Mode";
var _N2 = "Name";
var _NADS = "NextAttemptDelaySeconds";
var _NAT = "NextAttemptTimestamp";
var _NES = "NewExecutionState";
var _NM = "NextMarker";
var _NPVE = "NoPublishedVersionException";
var _O = "Operations";
var _OF = "OnFailure";
var _OI = "OrganizationId";
var _OP = "OperationPayload";
var _OPu = "OutputPayload";
var _OS2 = "OnSuccess";
var _OSp = "OptimizationStatus";
var _OU = "OperationUpdate";
var _OUp = "OperationUpdates";
var _Op = "Operation";
var _P = "Principal";
var _PC = "PermissionsConfig";
var _PCC = "ProvisionedConcurrencyConfigs";
var _PCCL = "ProvisionedConcurrencyConfigList";
var _PCCLI = "ProvisionedConcurrencyConfigListItem";
var _PCCNFE = "ProvisionedConcurrencyConfigNotFoundException";
var _PCE = "ProvisionedConcurrentExecutions";
var _PCa = "PayloadChunk";
var _PEEMC = "PerExecutionEnvironmentMaxConcurrency";
var _PF = "ParallelizationFactor";
var _PFC = "PutFunctionConcurrency";
var _PFCR = "PutFunctionConcurrencyRequest";
var _PFCSC = "PutFunctionCodeSigningConfig";
var _PFCSCR = "PutFunctionCodeSigningConfigRequest";
var _PFCSCRu = "PutFunctionCodeSigningConfigResponse";
var _PFE = "PreconditionFailedException";
var _PFEIC = "PutFunctionEventInvokeConfig";
var _PFEICR = "PutFunctionEventInvokeConfigRequest";
var _PFRC = "PutFunctionRecursionConfig";
var _PFRCR = "PutFunctionRecursionConfigRequest";
var _PFRCRu = "PutFunctionRecursionConfigResponse";
var _PFSC = "PutFunctionScalingConfig";
var _PFSCR = "PutFunctionScalingConfigRequest";
var _PFSCRu = "PutFunctionScalingConfigResponse";
var _PGN = "PollerGroupName";
var _PI = "ParentId";
var _PLEE = "PolicyLengthExceededException";
var _PLV = "PublishLayerVersion";
var _PLVR = "PublishLayerVersionRequest";
var _PLVRu = "PublishLayerVersionResponse";
var _PMT = "PredefinedMetricType";
var _POID = "PrincipalOrgID";
var _PPC = "ProvisionedPollerConfig";
var _PPCC = "PutProvisionedConcurrencyConfig";
var _PPCCR = "PutProvisionedConcurrencyConfigRequest";
var _PPCCRu = "PutProvisionedConcurrencyConfigResponse";
var _PPE2 = "PublicPolicyException";
var _PRMC = "PutRuntimeManagementConfig";
var _PRMCR = "PutRuntimeManagementConfigRequest";
var _PRMCRu = "PutRuntimeManagementConfigResponse";
var _PRP = "PutResourcePolicy";
var _PRPR = "PutResourcePolicyRequest";
var _PRPRu = "PutResourcePolicyResponse";
var _PT = "PropagateTags";
var _PTa = "PackageType";
var _PTu = "PublishTo";
var _PV = "PublishVersion";
var _PVR = "PublishVersionRequest";
var _Pa = "Payload";
var _Pat = "Pattern";
var _Po = "Policy";
var _Pu = "Publish";
var _Q = "Qualifier";
var _Qu = "Queues";
var _R2 = "Reason";
var _RA = "Retry-After";
var _RAe = "ResourceArn";
var _RC = "RoutingConfig";
var _RCE = "ResourceConflictException";
var _RCEe = "ReservedConcurrentExecutions";
var _RCe = "ReplayChildren";
var _RD = "RetryDetails";
var _RFSC = "RequestedFunctionScalingConfig";
var _RI = "RevisionId";
var _RIE = "RecursiveInvocationException";
var _RIU = "ResolvedImageUri";
var _RIUE = "ResourceInUseException";
var _RIe = "RequestId";
var _RL = "RecursiveLoop";
var _RLVP = "RemoveLayerVersionPermission";
var _RLVPR = "RemoveLayerVersionPermissionRequest";
var _RNFE2 = "ResourceNotFoundException";
var _RNRE = "ResourceNotReadyException";
var _RO = "ReverseOrder";
var _RP = "RemovePermission";
var _RPCE = "RequestedProvisionedConcurrentExecutions";
var _RPID = "RetentionPeriodInDays";
var _RPR = "RemovePermissionRequest";
var _RSCT = "ResponseStreamContentType";
var _RSO = "ResolvedS3Object";
var _RT2 = "RepositoryType";
var _RTLE = "RequestTooLargeException";
var _RVA = "RuntimeVersionArn";
var _RVC = "RuntimeVersionConfig";
var _RVE = "RuntimeVersionError";
var _Re = "Result";
var _Res = "Resource";
var _Ro = "Role";
var _Ru = "Runtime";
var _S2 = "Statement";
var _SA = "SourceArn";
var _SAC = "SourceAccessConfigurations";
var _SACo = "SourceAccessConfiguration";
var _SAo = "SourceAccount";
var _SAt = "StartedAfter";
var _SB2 = "S3Bucket";
var _SBt = "StartedBefore";
var _SC = "ScalingConfig";
var _SCt = "StatusCode";
var _SD = "StepDetails";
var _SDE = "StopDurableExecution";
var _SDECF = "SendDurableExecutionCallbackFailure";
var _SDECFR = "SendDurableExecutionCallbackFailureRequest";
var _SDECFRe = "SendDurableExecutionCallbackFailureResponse";
var _SDECH = "SendDurableExecutionCallbackHeartbeat";
var _SDECHR = "SendDurableExecutionCallbackHeartbeatRequest";
var _SDECHRe = "SendDurableExecutionCallbackHeartbeatResponse";
var _SDECS = "SendDurableExecutionCallbackSuccess";
var _SDECSR = "SendDurableExecutionCallbackSuccessRequest";
var _SDECSRe = "SendDurableExecutionCallbackSuccessResponse";
var _SDER = "StopDurableExecutionRequest";
var _SDERt = "StopDurableExecutionResponse";
var _SE2 = "ServiceException";
var _SET = "ScheduledEndTimestamp";
var _SFC = "S3FilesConfig";
var _SFD = "StepFailedDetails";
var _SFMCE = "S3FilesMountConnectivityException";
var _SFMFE = "S3FilesMountFailureException";
var _SFMTE = "S3FilesMountTimeoutException";
var _SGI = "SecurityGroupIds";
var _SI2 = "StatementId";
var _SIPALRE = "SubnetIPAddressLimitReachedException";
var _SIu = "SubnetIds";
var _SJA = "SigningJobArn";
var _SK = "S3Key";
var _SKMSKA = "SourceKMSKeyArn";
var _SLL = "SystemLogLevel";
var _SM2 = "ScalingMode";
var _SMES = "SelfManagedEventSource";
var _SMKESC = "SelfManagedKafkaEventSourceConfig";
var _SO = "StepOptions";
var _SOSM = "S3ObjectStorageMode";
var _SOV = "S3ObjectVersion";
var _SP = "ScalingPolicies";
var _SPT = "StartingPositionTimestamp";
var _SPVA = "SigningProfileVersionArns";
var _SPVAi = "SigningProfileVersionArn";
var _SPt = "StartingPosition";
var _SQEE = "ServiceQuotaExceededException";
var _SR = "StateReason";
var _SRC = "SchemaRegistryConfig";
var _SRCt = "StateReasonCode";
var _SRETLE = "SerializedRequestEntityTooLargeException";
var _SRURI = "SchemaRegistryURI";
var _SRt = "StatusReason";
var _SS2 = "SensitiveString";
var _SSD = "StepStartedDetails";
var _SSDt = "StepSucceededDetails";
var _SSE = "SnapStartException";
var _SSNRE = "SnapStartNotReadyException";
var _SSR = "SnapStartResponse";
var _SSRFE = "SnapStartRegenerationFailureException";
var _SSTE = "SnapStartTimeoutException";
var _SSn = "SnapStart";
var _ST = "StackTrace";
var _STE = "StackTraceEntry";
var _STEt = "StackTraceEntries";
var _STR = "StateTransitionReason";
var _STt = "StartTimestamp";
var _STto = "StopTimestamp";
var _STu = "SubType";
var _SVC = "SchemaValidationConfigs";
var _Si = "Size";
var _St = "State";
var _Sta = "Status";
var _Stat = "Statuses";
var _T2 = "Type";
var _TA = "TargetArn";
var _TC = "TelemetryConfig";
var _TCR = "TracingConfigResponse";
var _TCS = "TotalCodeSize";
var _TCe = "TenancyConfig";
var _TCr = "TracingConfig";
var _TE = "TagsError";
var _TH = "TraceHeader";
var _TI = "TenantId";
var _TIM = "TenantIsolationMode";
var _TK2 = "TagKeys";
var _TKL = "TagKeyList";
var _TMRE = "TooManyRequestsException";
var _TR = "TagResource";
var _TRR = "TagResourceRequest";
var _TS = "TimeoutSeconds";
var _TTSP = "TargetTrackingScalingPolicy";
var _TV = "TargetValue";
var _TWIS = "TumblingWindowInSeconds";
var _Ta2 = "Tags";
var _Ti = "Timeout";
var _To = "Topics";
var _Tr = "Truncated";
var _U = "Updates";
var _UA = "UpdateAlias";
var _UAOD = "UntrustedArtifactOnDeployment";
var _UAR = "UpdateAliasRequest";
var _UCE = "UnreservedConcurrentExecutions";
var _UCP = "UpdateCapacityProvider";
var _UCPR = "UpdateCapacityProviderRequest";
var _UCPRp = "UpdateCapacityProviderResponse";
var _UCSC = "UpdateCodeSigningConfig";
var _UCSCR = "UpdateCodeSigningConfigRequest";
var _UCSCRp = "UpdateCodeSigningConfigResponse";
var _UESM = "UpdateEventSourceMapping";
var _UESMR = "UpdateEventSourceMappingRequest";
var _UFC = "UpdateFunctionCode";
var _UFCR = "UpdateFunctionCodeRequest";
var _UFCRp = "UpdateFunctionConfigurationRequest";
var _UFCp = "UpdateFunctionConfiguration";
var _UFEIC = "UpdateFunctionEventInvokeConfig";
var _UFEICR = "UpdateFunctionEventInvokeConfigRequest";
var _UFUC = "UpdateFunctionUrlConfig";
var _UFUCR = "UpdateFunctionUrlConfigRequest";
var _UFUCRp = "UpdateFunctionUrlConfigResponse";
var _UMTE = "UnsupportedMediaTypeException";
var _UR = "UntagResource";
var _URI = "URI";
var _URO = "UpdateRuntimeOn";
var _URR2 = "UntagResourceRequest";
var _UUID = "UUID";
var _V2 = "Variables";
var _VC = "VpcConfig";
var _VCR = "VpcConfigResponse";
var _VI2 = "VpcId";
var _VN = "VersionNumber";
var _Ve = "Version";
var _Ver = "Versions";
var _WCD = "WaitCancelledDetails";
var _WD = "WorkingDirectory";
var _WDa = "WaitDetails";
var _WO = "WaitOptions";
var _WS = "WaitSeconds";
var _WSD = "WaitStartedDetails";
var _WSDa = "WaitSucceededDetails";
var _XACC = "X-Amz-Client-Context";
var _XADEA = "X-Amz-Durable-Execution-Arn";
var _XADEN = "X-Amz-Durable-Execution-Name";
var _XAEV = "X-Amz-Executed-Version";
var _XAFE = "X-Amz-Function-Error";
var _XAIT = "X-Amz-Invocation-Type";
var _XALR = "X-Amz-Log-Result";
var _XALT = "X-Amz-Log-Type";
var _XATI = "X-Amz-Tenant-Id";
var _XATIm = "XAmznTraceId";
var _ZF = "ZipFile";
var _c2 = "client";
var _e2 = "error";
var _eP = "eventPayload";
var _h = "http";
var _hE = "httpError";
var _hH = "httpHeader";
var _hQ = "httpQuery";
var _m = "message";
var _rAS = "retryAfterSeconds";
var _s2 = "smithy.ts.sdk.synthetic.com.amazonaws.lambda";
var _se2 = "server";
var _st = "streaming";
var _tK = "tagKeys";
var _xN = "xmlName";
var n02 = "com.amazonaws.lambda";
var _s_registry2 = new TypeRegistry(_s2);
var LambdaServiceException$ = [-3, _s2, "LambdaServiceException", 0, [], []];
_s_registry2.registerError(LambdaServiceException$, LambdaServiceException);
var n0_registry2 = new TypeRegistry(n02);
var AliasLimitExceededException$ = [
  -3,
  n02,
  _ALEE,
  { [_e2]: _c2, [_hE]: 400 },
  [_T2, _m],
  [0, 0]
];
n0_registry2.registerError(AliasLimitExceededException$, AliasLimitExceededException);
var CallbackTimeoutException$ = [
  -3,
  n02,
  _CTE,
  { [_e2]: _c2, [_hE]: 400 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(CallbackTimeoutException$, CallbackTimeoutException);
var CapacityProviderLimitExceededException$ = [
  -3,
  n02,
  _CPLEE,
  { [_e2]: _c2, [_hE]: 400 },
  [_T2, _m],
  [0, 0]
];
n0_registry2.registerError(CapacityProviderLimitExceededException$, CapacityProviderLimitExceededException);
var CodeArtifactUserDeletedException$ = [
  -3,
  n02,
  _CAUDE,
  { [_e2]: _c2, [_hE]: 409 },
  [_T2, _m],
  [0, 0]
];
n0_registry2.registerError(CodeArtifactUserDeletedException$, CodeArtifactUserDeletedException);
var CodeArtifactUserFailedException$ = [
  -3,
  n02,
  _CAUFE,
  { [_e2]: _c2, [_hE]: 409 },
  [_T2, _m],
  [0, 0]
];
n0_registry2.registerError(CodeArtifactUserFailedException$, CodeArtifactUserFailedException);
var CodeArtifactUserPendingException$ = [
  -3,
  n02,
  _CAUPE,
  { [_e2]: _c2, [_hE]: 409 },
  [_T2, _m],
  [0, 0]
];
n0_registry2.registerError(CodeArtifactUserPendingException$, CodeArtifactUserPendingException);
var CodeSigningConfigNotFoundException$ = [
  -3,
  n02,
  _CSCNFE,
  { [_e2]: _c2, [_hE]: 404 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(CodeSigningConfigNotFoundException$, CodeSigningConfigNotFoundException);
var CodeStorageExceededException$ = [
  -3,
  n02,
  _CSEE,
  { [_e2]: _c2, [_hE]: 400 },
  [_T2, _m],
  [0, 0]
];
n0_registry2.registerError(CodeStorageExceededException$, CodeStorageExceededException);
var CodeVerificationFailedException$ = [
  -3,
  n02,
  _CVFE,
  { [_e2]: _c2, [_hE]: 400 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(CodeVerificationFailedException$, CodeVerificationFailedException);
var DurableExecutionAlreadyStartedException$ = [
  -3,
  n02,
  _DEASE,
  { [_e2]: _c2, [_hE]: 409 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(DurableExecutionAlreadyStartedException$, DurableExecutionAlreadyStartedException);
var EC2AccessDeniedException$ = [
  -3,
  n02,
  _ECADE,
  { [_e2]: _se2, [_hE]: 502 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(EC2AccessDeniedException$, EC2AccessDeniedException);
var EC2ThrottledException$ = [
  -3,
  n02,
  _ECTE,
  { [_e2]: _se2, [_hE]: 502 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(EC2ThrottledException$, EC2ThrottledException);
var EC2UnexpectedException$ = [
  -3,
  n02,
  _ECUE,
  { [_e2]: _se2, [_hE]: 502 },
  [_T2, _M2, _ECEC],
  [0, 0, 0]
];
n0_registry2.registerError(EC2UnexpectedException$, EC2UnexpectedException);
var EFSIOException$ = [
  -3,
  n02,
  _EFSIOE,
  { [_e2]: _c2, [_hE]: 410 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(EFSIOException$, EFSIOException);
var EFSMountConnectivityException$ = [
  -3,
  n02,
  _EFSMCE,
  { [_e2]: _c2, [_hE]: 408 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(EFSMountConnectivityException$, EFSMountConnectivityException);
var EFSMountFailureException$ = [
  -3,
  n02,
  _EFSMFE,
  { [_e2]: _c2, [_hE]: 403 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(EFSMountFailureException$, EFSMountFailureException);
var EFSMountTimeoutException$ = [
  -3,
  n02,
  _EFSMTE,
  { [_e2]: _c2, [_hE]: 408 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(EFSMountTimeoutException$, EFSMountTimeoutException);
var ENILimitReachedException$ = [
  -3,
  n02,
  _ENILRE,
  { [_e2]: _se2, [_hE]: 502 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(ENILimitReachedException$, ENILimitReachedException);
var ENINotReadyException$ = [
  -3,
  n02,
  _ENINRE,
  { [_e2]: _se2, [_hE]: 502 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(ENINotReadyException$, ENINotReadyException);
var FunctionVersionsPerCapacityProviderLimitExceededException$ = [
  -3,
  n02,
  _FVPCPLEE,
  { [_e2]: _c2, [_hE]: 400 },
  [_T2, _m],
  [0, 0]
];
n0_registry2.registerError(FunctionVersionsPerCapacityProviderLimitExceededException$, FunctionVersionsPerCapacityProviderLimitExceededException);
var InvalidCodeSignatureException$ = [
  -3,
  n02,
  _ICSE,
  { [_e2]: _c2, [_hE]: 400 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(InvalidCodeSignatureException$, InvalidCodeSignatureException);
var InvalidParameterValueException$ = [
  -3,
  n02,
  _IPVE,
  { [_e2]: _c2, [_hE]: 400 },
  [_T2, _m],
  [0, 0]
];
n0_registry2.registerError(InvalidParameterValueException$, InvalidParameterValueException);
var InvalidRequestContentException$ = [
  -3,
  n02,
  _IRCE,
  { [_e2]: _c2, [_hE]: 400 },
  [_T2, _m],
  [0, 0]
];
n0_registry2.registerError(InvalidRequestContentException$, InvalidRequestContentException);
var InvalidRuntimeException$ = [
  -3,
  n02,
  _IRE2,
  { [_e2]: _se2, [_hE]: 502 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(InvalidRuntimeException$, InvalidRuntimeException);
var InvalidSecurityGroupIDException$ = [
  -3,
  n02,
  _ISGIDE,
  { [_e2]: _se2, [_hE]: 502 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(InvalidSecurityGroupIDException$, InvalidSecurityGroupIDException);
var InvalidSubnetIDException$ = [
  -3,
  n02,
  _ISIDE,
  { [_e2]: _se2, [_hE]: 502 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(InvalidSubnetIDException$, InvalidSubnetIDException);
var InvalidZipFileException$ = [
  -3,
  n02,
  _IZFE,
  { [_e2]: _se2, [_hE]: 502 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(InvalidZipFileException$, InvalidZipFileException);
var KMSAccessDeniedException$ = [
  -3,
  n02,
  _KMSADE,
  { [_e2]: _se2, [_hE]: 502 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(KMSAccessDeniedException$, KMSAccessDeniedException);
var KMSDisabledException$ = [
  -3,
  n02,
  _KMSDE,
  { [_e2]: _se2, [_hE]: 502 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(KMSDisabledException$, KMSDisabledException);
var KMSInvalidStateException$ = [
  -3,
  n02,
  _KMSISE,
  { [_e2]: _se2, [_hE]: 502 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(KMSInvalidStateException$, KMSInvalidStateException);
var KMSNotFoundException$ = [
  -3,
  n02,
  _KMSNFE,
  { [_e2]: _se2, [_hE]: 502 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(KMSNotFoundException$, KMSNotFoundException);
var ModeNotSupportedException$ = [
  -3,
  n02,
  _MNSE,
  { [_e2]: _c2, [_hE]: 400 },
  [_T2, _m],
  [0, 0]
];
n0_registry2.registerError(ModeNotSupportedException$, ModeNotSupportedException);
var NoPublishedVersionException$ = [
  -3,
  n02,
  _NPVE,
  { [_e2]: _c2, [_hE]: 400 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(NoPublishedVersionException$, NoPublishedVersionException);
var PolicyLengthExceededException$ = [
  -3,
  n02,
  _PLEE,
  { [_e2]: _c2, [_hE]: 400 },
  [_T2, _m],
  [0, 0]
];
n0_registry2.registerError(PolicyLengthExceededException$, PolicyLengthExceededException);
var PreconditionFailedException$ = [
  -3,
  n02,
  _PFE,
  { [_e2]: _c2, [_hE]: 412 },
  [_T2, _m],
  [0, 0]
];
n0_registry2.registerError(PreconditionFailedException$, PreconditionFailedException);
var ProvisionedConcurrencyConfigNotFoundException$ = [
  -3,
  n02,
  _PCCNFE,
  { [_e2]: _c2, [_hE]: 404 },
  [_T2, _m],
  [0, 0]
];
n0_registry2.registerError(ProvisionedConcurrencyConfigNotFoundException$, ProvisionedConcurrencyConfigNotFoundException);
var PublicPolicyException$2 = [
  -3,
  n02,
  _PPE2,
  { [_e2]: _c2, [_hE]: 400 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(PublicPolicyException$2, PublicPolicyException2);
var RecursiveInvocationException$ = [
  -3,
  n02,
  _RIE,
  { [_e2]: _c2, [_hE]: 400 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(RecursiveInvocationException$, RecursiveInvocationException);
var RequestTooLargeException$ = [
  -3,
  n02,
  _RTLE,
  { [_e2]: _c2, [_hE]: 413 },
  [_T2, _m],
  [0, 0]
];
n0_registry2.registerError(RequestTooLargeException$, RequestTooLargeException);
var ResourceConflictException$ = [
  -3,
  n02,
  _RCE,
  { [_e2]: _c2, [_hE]: 409 },
  [_T2, _m],
  [0, 0]
];
n0_registry2.registerError(ResourceConflictException$, ResourceConflictException);
var ResourceInUseException$ = [
  -3,
  n02,
  _RIUE,
  { [_e2]: _c2, [_hE]: 400 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(ResourceInUseException$, ResourceInUseException);
var ResourceNotFoundException$2 = [
  -3,
  n02,
  _RNFE2,
  { [_e2]: _c2, [_hE]: 404 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(ResourceNotFoundException$2, ResourceNotFoundException2);
var ResourceNotReadyException$ = [
  -3,
  n02,
  _RNRE,
  { [_e2]: _se2, [_hE]: 502 },
  [_T2, _m],
  [0, 0]
];
n0_registry2.registerError(ResourceNotReadyException$, ResourceNotReadyException);
var S3FilesMountConnectivityException$ = [
  -3,
  n02,
  _SFMCE,
  { [_e2]: _c2, [_hE]: 408 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(S3FilesMountConnectivityException$, S3FilesMountConnectivityException);
var S3FilesMountFailureException$ = [
  -3,
  n02,
  _SFMFE,
  { [_e2]: _c2, [_hE]: 403 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(S3FilesMountFailureException$, S3FilesMountFailureException);
var S3FilesMountTimeoutException$ = [
  -3,
  n02,
  _SFMTE,
  { [_e2]: _c2, [_hE]: 408 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(S3FilesMountTimeoutException$, S3FilesMountTimeoutException);
var SerializedRequestEntityTooLargeException$ = [
  -3,
  n02,
  _SRETLE,
  { [_e2]: _c2, [_hE]: 413 },
  [_T2, _m],
  [0, 0]
];
n0_registry2.registerError(SerializedRequestEntityTooLargeException$, SerializedRequestEntityTooLargeException);
var ServiceException$ = [
  -3,
  n02,
  _SE2,
  { [_e2]: _se2, [_hE]: 500 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(ServiceException$, ServiceException2);
var ServiceQuotaExceededException$ = [
  -3,
  n02,
  _SQEE,
  { [_e2]: _c2, [_hE]: 402 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(ServiceQuotaExceededException$, ServiceQuotaExceededException);
var SnapStartException$ = [
  -3,
  n02,
  _SSE,
  { [_e2]: _c2, [_hE]: 400 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(SnapStartException$, SnapStartException);
var SnapStartNotReadyException$ = [
  -3,
  n02,
  _SSNRE,
  { [_e2]: _c2, [_hE]: 409 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(SnapStartNotReadyException$, SnapStartNotReadyException);
var SnapStartRegenerationFailureException$ = [
  -3,
  n02,
  _SSRFE,
  { [_e2]: _c2, [_hE]: 409 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(SnapStartRegenerationFailureException$, SnapStartRegenerationFailureException);
var SnapStartTimeoutException$ = [
  -3,
  n02,
  _SSTE,
  { [_e2]: _c2, [_hE]: 408 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(SnapStartTimeoutException$, SnapStartTimeoutException);
var SubnetIPAddressLimitReachedException$ = [
  -3,
  n02,
  _SIPALRE,
  { [_e2]: _se2, [_hE]: 502 },
  [_T2, _M2],
  [0, 0]
];
n0_registry2.registerError(SubnetIPAddressLimitReachedException$, SubnetIPAddressLimitReachedException);
var TooManyRequestsException$ = [
  -3,
  n02,
  _TMRE,
  { [_e2]: _c2, [_hE]: 429 },
  [_rAS, _T2, _m, _R2],
  [[0, { [_hH]: _RA }], 0, 0, 0]
];
n0_registry2.registerError(TooManyRequestsException$, TooManyRequestsException);
var UnsupportedMediaTypeException$ = [
  -3,
  n02,
  _UMTE,
  { [_e2]: _c2, [_hE]: 415 },
  [_T2, _m],
  [0, 0]
];
n0_registry2.registerError(UnsupportedMediaTypeException$, UnsupportedMediaTypeException);
var errorTypeRegistries2 = [
  _s_registry2,
  n0_registry2
];
var BinaryOperationPayload = [0, n02, _BOP, 8, 21];
var _Blob = [0, n02, _B, 8, 21];
var BlobStream = [0, n02, _BS, { [_st]: 1 }, 42];
var EnvironmentVariableName = [0, n02, _EVN, 8, 0];
var EnvironmentVariableValue = [0, n02, _EVV, 8, 0];
var ErrorData = [0, n02, _ED, 8, 0];
var ErrorMessage = [0, n02, _EM, 8, 0];
var ErrorType = [0, n02, _ET, 8, 0];
var InputPayload = [0, n02, _IP, 8, 0];
var OperationPayload = [0, n02, _OP, 8, 0];
var OutputPayload = [0, n02, _OPu, 8, 0];
var SensitiveString = [0, n02, _SS2, 8, 0];
var StackTraceEntry = [0, n02, _STE, 8, 0];
var AccountLimit$ = [
  3,
  n02,
  _AL,
  0,
  [_TCS, _CSU, _CSZ, _CE, _UCE],
  [1, 1, 1, 1, 1]
];
var AccountUsage$ = [
  3,
  n02,
  _AU,
  0,
  [_TCS, _FC],
  [1, 1]
];
var AddLayerVersionPermissionRequest$ = [
  3,
  n02,
  _ALVPR,
  0,
  [_LN, _VN, _SI2, _A, _P, _OI, _RI],
  [[0, 1], [1, 1], 0, 0, 0, 0, [0, { [_hQ]: _RI }]],
  5
];
var AddLayerVersionPermissionResponse$ = [
  3,
  n02,
  _ALVPRd,
  0,
  [_S2, _RI],
  [0, 0]
];
var AddPermissionRequest$ = [
  3,
  n02,
  _APR,
  0,
  [_FN, _SI2, _A, _P, _SA, _FUAT, _IVFU, _SAo, _EST, _Q, _RI, _POID],
  [[0, 1], 0, 0, 0, 0, 0, 2, 0, 0, [0, { [_hQ]: _Q }], 0, 0],
  4
];
var AddPermissionResponse$ = [
  3,
  n02,
  _APRd,
  0,
  [_S2],
  [0]
];
var AliasConfiguration$ = [
  3,
  n02,
  _AC,
  0,
  [_AA, _N2, _FV, _D2, _RC, _RI],
  [0, 0, 0, 0, () => AliasRoutingConfiguration$, 0]
];
var AliasRoutingConfiguration$ = [
  3,
  n02,
  _ARC,
  0,
  [_AVW],
  [128 | 1]
];
var AllowedPublishers$ = [
  3,
  n02,
  _AP,
  0,
  [_SPVA],
  [64 | 0],
  1
];
var AmazonManagedKafkaEventSourceConfig$ = [
  3,
  n02,
  _AMKESC,
  0,
  [_CGI, _SRC],
  [0, () => KafkaSchemaRegistryConfig$]
];
var CallbackDetails$ = [
  3,
  n02,
  _CD2,
  0,
  [_CI, _Re, _E],
  [0, [() => OperationPayload, 0], [() => ErrorObject$, 0]]
];
var CallbackFailedDetails$ = [
  3,
  n02,
  _CFD,
  0,
  [_E],
  [[() => EventError$, 0]],
  1
];
var CallbackOptions$ = [
  3,
  n02,
  _CO,
  0,
  [_TS, _HTS],
  [1, 1]
];
var CallbackStartedDetails$ = [
  3,
  n02,
  _CSD,
  0,
  [_CI, _HT, _Ti],
  [0, 1, 1],
  1
];
var CallbackSucceededDetails$ = [
  3,
  n02,
  _CSDa,
  0,
  [_Re],
  [[() => EventResult$, 0]],
  1
];
var CallbackTimedOutDetails$ = [
  3,
  n02,
  _CTOD,
  0,
  [_E],
  [[() => EventError$, 0]],
  1
];
var CapacityProvider$ = [
  3,
  n02,
  _CP,
  0,
  [_CPA, _St, _VC, _PC, _IR, _CPSC, _KKA, _LM, _PT, _TC],
  [0, 0, () => CapacityProviderVpcConfig$, () => CapacityProviderPermissionsConfig$, () => InstanceRequirements$, () => CapacityProviderScalingConfig$, 0, 0, () => PropagateTags$, () => CapacityProviderTelemetryConfig$],
  4
];
var CapacityProviderConfig$ = [
  3,
  n02,
  _CPC,
  0,
  [_LMICPC],
  [() => LambdaManagedInstancesCapacityProviderConfig$],
  1
];
var CapacityProviderLoggingConfig$ = [
  3,
  n02,
  _CPLC,
  0,
  [_SLL, _LG],
  [0, 0]
];
var CapacityProviderPermissionsConfig$ = [
  3,
  n02,
  _CPPC,
  0,
  [_CPORA],
  [0],
  1
];
var CapacityProviderScalingConfig$ = [
  3,
  n02,
  _CPSC,
  0,
  [_MVCC, _SM2, _SP],
  [1, 0, () => CapacityProviderScalingPoliciesList]
];
var CapacityProviderTelemetryConfig$ = [
  3,
  n02,
  _CPTC,
  0,
  [_LC],
  [() => CapacityProviderLoggingConfig$]
];
var CapacityProviderVpcConfig$ = [
  3,
  n02,
  _CPVC,
  0,
  [_SIu, _SGI],
  [64 | 0, 64 | 0],
  2
];
var ChainedInvokeDetails$ = [
  3,
  n02,
  _CID,
  0,
  [_Re, _E],
  [[() => OperationPayload, 0], [() => ErrorObject$, 0]]
];
var ChainedInvokeFailedDetails$ = [
  3,
  n02,
  _CIFD,
  0,
  [_E],
  [[() => EventError$, 0]],
  1
];
var ChainedInvokeOptions$ = [
  3,
  n02,
  _CIO,
  0,
  [_FN, _TI],
  [0, 0],
  1
];
var ChainedInvokeStartedDetails$ = [
  3,
  n02,
  _CISD,
  0,
  [_FN, _TI, _I, _EV, _DEA],
  [0, 0, [() => EventInput$, 0], 0, 0],
  1
];
var ChainedInvokeStoppedDetails$ = [
  3,
  n02,
  _CISDh,
  0,
  [_E],
  [[() => EventError$, 0]],
  1
];
var ChainedInvokeSucceededDetails$ = [
  3,
  n02,
  _CISDha,
  0,
  [_Re],
  [[() => EventResult$, 0]],
  1
];
var ChainedInvokeTimedOutDetails$ = [
  3,
  n02,
  _CITOD,
  0,
  [_E],
  [[() => EventError$, 0]],
  1
];
var CheckpointDurableExecutionRequest$ = [
  3,
  n02,
  _CDER,
  0,
  [_DEA, _CT, _U, _CTl],
  [[0, 1], 0, [() => OperationUpdates, 0], [0, 4]],
  2
];
var CheckpointDurableExecutionResponse$ = [
  3,
  n02,
  _CDERh,
  0,
  [_NES, _CT],
  [[() => CheckpointUpdatedExecutionState$, 0], 0],
  1
];
var CheckpointUpdatedExecutionState$ = [
  3,
  n02,
  _CUES,
  0,
  [_O, _NM],
  [[() => Operations, 0], 0]
];
var CodeSigningConfig$ = [
  3,
  n02,
  _CSC,
  0,
  [_CSCI, _CSCA, _AP, _CSP, _LM, _D2],
  [0, 0, () => AllowedPublishers$, () => CodeSigningPolicies$, 0, 0],
  5
];
var CodeSigningPolicies$ = [
  3,
  n02,
  _CSP,
  0,
  [_UAOD],
  [0]
];
var Concurrency$ = [
  3,
  n02,
  _C,
  0,
  [_RCEe],
  [1]
];
var ContextDetails$ = [
  3,
  n02,
  _CDo,
  0,
  [_RCe, _Re, _E],
  [2, [() => OperationPayload, 0], [() => ErrorObject$, 0]]
];
var ContextFailedDetails$ = [
  3,
  n02,
  _CFDo,
  0,
  [_E],
  [[() => EventError$, 0]],
  1
];
var ContextOptions$ = [
  3,
  n02,
  _COo,
  0,
  [_RCe],
  [2]
];
var ContextStartedDetails$ = [
  3,
  n02,
  _CSDo,
  0,
  [],
  []
];
var ContextSucceededDetails$ = [
  3,
  n02,
  _CSDon,
  0,
  [_Re],
  [[() => EventResult$, 0]],
  1
];
var Cors$ = [
  3,
  n02,
  _Co,
  0,
  [_ACl, _AH, _AM, _AO, _EH, _MA],
  [2, 64 | 0, 64 | 0, 64 | 0, 64 | 0, 1]
];
var CreateAliasRequest$ = [
  3,
  n02,
  _CAR,
  0,
  [_FN, _N2, _FV, _D2, _RC],
  [[0, 1], 0, 0, 0, () => AliasRoutingConfiguration$],
  3
];
var CreateCapacityProviderRequest$ = [
  3,
  n02,
  _CCPR,
  0,
  [_CPN, _VC, _PC, _IR, _CPSC, _KKA, _Ta2, _PT, _TC],
  [0, () => CapacityProviderVpcConfig$, () => CapacityProviderPermissionsConfig$, () => InstanceRequirements$, () => CapacityProviderScalingConfig$, 0, 128 | 0, () => PropagateTags$, () => CapacityProviderTelemetryConfig$],
  3
];
var CreateCapacityProviderResponse$ = [
  3,
  n02,
  _CCPRr,
  0,
  [_CP],
  [() => CapacityProvider$],
  1
];
var CreateCodeSigningConfigRequest$ = [
  3,
  n02,
  _CCSCR,
  0,
  [_AP, _D2, _CSP, _Ta2],
  [() => AllowedPublishers$, 0, () => CodeSigningPolicies$, 128 | 0],
  1
];
var CreateCodeSigningConfigResponse$ = [
  3,
  n02,
  _CCSCRr,
  0,
  [_CSC],
  [() => CodeSigningConfig$],
  1
];
var CreateEventSourceMappingRequest$ = [
  3,
  n02,
  _CESMR,
  0,
  [_FN, _ESA, _En, _BSa, _FCi, _KMSKA, _MC, _LC, _SC, _MBWIS, _PF, _SPt, _SPT, _DC, _MRAIS, _BBOFE, _MRA, _Ta2, _TWIS, _To, _Qu, _SAC, _SMES, _FRT, _AMKESC, _SMKESC, _DDBESC, _PPC],
  [0, 0, 2, 1, () => FilterCriteria$, 0, () => EventSourceMappingMetricsConfig$, () => EventSourceMappingLoggingConfig$, () => ScalingConfig$, 1, 1, 0, 4, () => DestinationConfig$, 1, 2, 1, 128 | 0, 1, 64 | 0, 64 | 0, () => SourceAccessConfigurations, () => SelfManagedEventSource$, 64 | 0, () => AmazonManagedKafkaEventSourceConfig$, () => SelfManagedKafkaEventSourceConfig$, () => DocumentDBEventSourceConfig$, () => ProvisionedPollerConfig$],
  1
];
var CreateFunctionRequest$ = [
  3,
  n02,
  _CFR,
  0,
  [_FN, _Ro, _Cod, _Ru, _H, _D2, _Ti, _MS, _Pu, _PTu, _VC, _PTa, _DLC, _Env, _KMSKA, _TCr, _Ta2, _L, _FSC, _CSCA, _IC, _Ar, _ES, _SSn, _LC, _TCe, _CPC, _DCu],
  [0, 0, [() => FunctionCode$, 0], 0, 0, 0, 1, 1, 2, 0, () => VpcConfig$, 0, () => DeadLetterConfig$, [() => Environment$, 0], 0, () => TracingConfig$, 128 | 0, 64 | 0, () => FileSystemConfigList, 0, () => ImageConfig$, 64 | 0, () => EphemeralStorage$, () => SnapStart$, () => LoggingConfig$, () => TenancyConfig$, () => CapacityProviderConfig$, () => DurableConfig$],
  3
];
var CreateFunctionUrlConfigRequest$ = [
  3,
  n02,
  _CFUCR,
  0,
  [_FN, _AT, _Q, _Co, _IM],
  [[0, 1], 0, [0, { [_hQ]: _Q }], () => Cors$, 0],
  2
];
var CreateFunctionUrlConfigResponse$ = [
  3,
  n02,
  _CFUCRr,
  0,
  [_FU, _FA, _AT, _CTr, _Co, _IM],
  [0, 0, 0, 0, () => Cors$, 0],
  4
];
var DeadLetterConfig$ = [
  3,
  n02,
  _DLC,
  0,
  [_TA],
  [0]
];
var DeleteAliasRequest$ = [
  3,
  n02,
  _DAR,
  0,
  [_FN, _N2],
  [[0, 1], [0, 1]],
  2
];
var DeleteCapacityProviderRequest$ = [
  3,
  n02,
  _DCPR,
  0,
  [_CPN],
  [[0, 1]],
  1
];
var DeleteCapacityProviderResponse$ = [
  3,
  n02,
  _DCPRe,
  0,
  [_CP],
  [() => CapacityProvider$],
  1
];
var DeleteCodeSigningConfigRequest$ = [
  3,
  n02,
  _DCSCR,
  0,
  [_CSCA],
  [[0, 1]],
  1
];
var DeleteCodeSigningConfigResponse$ = [
  3,
  n02,
  _DCSCRe,
  0,
  [],
  []
];
var DeleteEventSourceMappingRequest$ = [
  3,
  n02,
  _DESMR,
  0,
  [_UUID],
  [[0, 1]],
  1
];
var DeleteFunctionCodeSigningConfigRequest$ = [
  3,
  n02,
  _DFCSCR,
  0,
  [_FN],
  [[0, 1]],
  1
];
var DeleteFunctionConcurrencyRequest$ = [
  3,
  n02,
  _DFCR,
  0,
  [_FN],
  [[0, 1]],
  1
];
var DeleteFunctionEventInvokeConfigRequest$ = [
  3,
  n02,
  _DFEICR,
  0,
  [_FN, _Q],
  [[0, 1], [0, { [_hQ]: _Q }]],
  1
];
var DeleteFunctionRequest$ = [
  3,
  n02,
  _DFR,
  0,
  [_FN, _Q],
  [[0, 1], [0, { [_hQ]: _Q }]],
  1
];
var DeleteFunctionResponse$ = [
  3,
  n02,
  _DFRe,
  0,
  [_SCt],
  [[1, 32]]
];
var DeleteFunctionUrlConfigRequest$ = [
  3,
  n02,
  _DFUCR,
  0,
  [_FN, _Q],
  [[0, 1], [0, { [_hQ]: _Q }]],
  1
];
var DeleteLayerVersionRequest$ = [
  3,
  n02,
  _DLVR,
  0,
  [_LN, _VN],
  [[0, 1], [1, 1]],
  2
];
var DeleteProvisionedConcurrencyConfigRequest$ = [
  3,
  n02,
  _DPCCR,
  0,
  [_FN, _Q],
  [[0, 1], [0, { [_hQ]: _Q }]],
  2
];
var DeleteResourcePolicyRequest$ = [
  3,
  n02,
  _DRPR,
  0,
  [_RAe, _RI],
  [[0, 1], [0, { [_hQ]: _RI }]],
  1
];
var DestinationConfig$ = [
  3,
  n02,
  _DC,
  0,
  [_OS2, _OF],
  [() => OnSuccess$, () => OnFailure$]
];
var DocumentDBEventSourceConfig$ = [
  3,
  n02,
  _DDBESC,
  0,
  [_DN, _CN, _FD],
  [0, 0, 0]
];
var DurableConfig$ = [
  3,
  n02,
  _DCu,
  0,
  [_KMSKA, _RPID, _ETx],
  [0, 1, 1]
];
var Environment$ = [
  3,
  n02,
  _Env,
  0,
  [_V2],
  [[() => EnvironmentVariables, 0]]
];
var EnvironmentError$ = [
  3,
  n02,
  _EE,
  0,
  [_EC, _M2],
  [0, [() => SensitiveString, 0]]
];
var EnvironmentResponse$ = [
  3,
  n02,
  _ER,
  0,
  [_V2, _E],
  [[() => EnvironmentVariables, 0], [() => EnvironmentError$, 0]]
];
var EphemeralStorage$ = [
  3,
  n02,
  _ES,
  0,
  [_Si],
  [1],
  1
];
var ErrorObject$ = [
  3,
  n02,
  _EO,
  0,
  [_EM, _ET, _ED, _ST],
  [[() => ErrorMessage, 0], [() => ErrorType, 0], [() => ErrorData, 0], [() => StackTraceEntries, 0]]
];
var Event$ = [
  3,
  n02,
  _Ev,
  0,
  [_ETv, _STu, _EI, _Id, _N2, _ETve, _PI, _ESD, _ESDx, _EFD, _ETOD, _ESDxe, _CSDo, _CSDon, _CFDo, _WSD, _WSDa, _WCD, _SSD, _SSDt, _SFD, _CISD, _CISDha, _CIFD, _CITOD, _CISDh, _CSD, _CSDa, _CFD, _CTOD, _ICD],
  [0, 0, 1, 0, 0, 4, 0, [() => ExecutionStartedDetails$, 0], [() => ExecutionSucceededDetails$, 0], [() => ExecutionFailedDetails$, 0], [() => ExecutionTimedOutDetails$, 0], [() => ExecutionStoppedDetails$, 0], () => ContextStartedDetails$, [() => ContextSucceededDetails$, 0], [() => ContextFailedDetails$, 0], () => WaitStartedDetails$, () => WaitSucceededDetails$, [() => WaitCancelledDetails$, 0], () => StepStartedDetails$, [() => StepSucceededDetails$, 0], [() => StepFailedDetails$, 0], [() => ChainedInvokeStartedDetails$, 0], [() => ChainedInvokeSucceededDetails$, 0], [() => ChainedInvokeFailedDetails$, 0], [() => ChainedInvokeTimedOutDetails$, 0], [() => ChainedInvokeStoppedDetails$, 0], () => CallbackStartedDetails$, [() => CallbackSucceededDetails$, 0], [() => CallbackFailedDetails$, 0], [() => CallbackTimedOutDetails$, 0], [() => InvocationCompletedDetails$, 0]]
];
var EventError$ = [
  3,
  n02,
  _EEv,
  0,
  [_Pa, _Tr],
  [[() => ErrorObject$, 0], 2]
];
var EventInput$ = [
  3,
  n02,
  _EIv,
  0,
  [_Pa, _Tr],
  [[() => InputPayload, 0], 2]
];
var EventResult$ = [
  3,
  n02,
  _ERv,
  0,
  [_Pa, _Tr],
  [[() => OperationPayload, 0], 2]
];
var EventSourceMappingConfiguration$ = [
  3,
  n02,
  _ESMC,
  0,
  [_UUID, _SPt, _SPT, _BSa, _MBWIS, _PF, _ESA, _FCi, _FCE, _KMSKA, _MC, _LC, _SC, _FA, _LM, _LPR, _St, _STR, _DC, _To, _Qu, _SAC, _SMES, _MRAIS, _BBOFE, _MRA, _TWIS, _FRT, _AMKESC, _SMKESC, _DDBESC, _ESMA, _PPC],
  [0, 0, 4, 1, 1, 1, 0, () => FilterCriteria$, () => FilterCriteriaError$, 0, () => EventSourceMappingMetricsConfig$, () => EventSourceMappingLoggingConfig$, () => ScalingConfig$, 0, 4, 0, 0, 0, () => DestinationConfig$, 64 | 0, 64 | 0, () => SourceAccessConfigurations, () => SelfManagedEventSource$, 1, 2, 1, 1, 64 | 0, () => AmazonManagedKafkaEventSourceConfig$, () => SelfManagedKafkaEventSourceConfig$, () => DocumentDBEventSourceConfig$, 0, () => ProvisionedPollerConfig$]
];
var EventSourceMappingLoggingConfig$ = [
  3,
  n02,
  _ESMLC,
  0,
  [_SLL],
  [0]
];
var EventSourceMappingMetricsConfig$ = [
  3,
  n02,
  _ESMMC,
  0,
  [_Me],
  [64 | 0]
];
var Execution$ = [
  3,
  n02,
  _Ex,
  0,
  [_DEA, _DEN, _FA, _Sta, _STt, _ETn, _KMSKA],
  [0, 0, 0, 0, 4, 4, 0],
  5
];
var ExecutionDetails$ = [
  3,
  n02,
  _EDx,
  0,
  [_IP],
  [[() => InputPayload, 0]]
];
var ExecutionFailedDetails$ = [
  3,
  n02,
  _EFD,
  0,
  [_E],
  [[() => EventError$, 0]],
  1
];
var ExecutionStartedDetails$ = [
  3,
  n02,
  _ESD,
  0,
  [_I, _ETx],
  [[() => EventInput$, 0], 1],
  2
];
var ExecutionStoppedDetails$ = [
  3,
  n02,
  _ESDxe,
  0,
  [_E],
  [[() => EventError$, 0]],
  1
];
var ExecutionSucceededDetails$ = [
  3,
  n02,
  _ESDx,
  0,
  [_Re],
  [[() => EventResult$, 0]],
  1
];
var ExecutionTimedOutDetails$ = [
  3,
  n02,
  _ETOD,
  0,
  [_E],
  [[() => EventError$, 0]]
];
var FileSystemConfig$ = [
  3,
  n02,
  _FSCi,
  0,
  [_Arn, _LMP, _SFC],
  [0, 0, () => S3FilesConfig$],
  2
];
var Filter$2 = [
  3,
  n02,
  _F2,
  0,
  [_Pat],
  [0]
];
var FilterCriteria$ = [
  3,
  n02,
  _FCi,
  0,
  [_Fi2],
  [() => FilterList]
];
var FilterCriteriaError$ = [
  3,
  n02,
  _FCE,
  0,
  [_EC, _M2],
  [0, 0]
];
var FunctionCode$ = [
  3,
  n02,
  _FCu,
  0,
  [_ZF, _SB2, _SK, _SOV, _SOSM, _IU, _SKMSKA],
  [[() => _Blob, 0], 0, 0, 0, 0, 0, 0]
];
var FunctionCodeLocation$ = [
  3,
  n02,
  _FCL,
  0,
  [_RT2, _Lo, _IU, _RIU, _RSO, _SKMSKA, _E],
  [0, 0, 0, 0, () => ResolvedS3Object$, 0, [() => FunctionCodeLocationError$, 0]]
];
var FunctionCodeLocationError$ = [
  3,
  n02,
  _FCLE,
  0,
  [_EC, _M2],
  [0, [() => SensitiveString, 0]]
];
var FunctionConfiguration$ = [
  3,
  n02,
  _FCun,
  0,
  [_FN, _FA, _Ru, _Ro, _H, _CS, _D2, _Ti, _MS, _LM, _CSo, _Ve, _VC, _DLC, _Env, _KMSKA, _TCr, _MAa, _RI, _L, _St, _SR, _SRCt, _LUS, _LUSR, _LUSRC, _FSC, _SPVAi, _SJA, _PTa, _ICR, _Ar, _ES, _SSn, _RVC, _LC, _TCe, _CPC, _CSon, _DCu],
  [0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, () => VpcConfigResponse$, () => DeadLetterConfig$, [() => EnvironmentResponse$, 0], 0, () => TracingConfigResponse$, 0, 0, () => LayersReferenceList, 0, 0, 0, 0, 0, 0, () => FileSystemConfigList, 0, 0, 0, [() => ImageConfigResponse$, 0], 64 | 0, () => EphemeralStorage$, () => SnapStartResponse$, [() => RuntimeVersionConfig$, 0], () => LoggingConfig$, () => TenancyConfig$, () => CapacityProviderConfig$, 0, () => DurableConfig$]
];
var FunctionEventInvokeConfig$ = [
  3,
  n02,
  _FEIC,
  0,
  [_LM, _FA, _MRA, _MEAIS, _DC],
  [4, 0, 1, 1, () => DestinationConfig$]
];
var FunctionScalingConfig$ = [
  3,
  n02,
  _FSCu,
  0,
  [_MEE, _MEEa],
  [1, 1]
];
var FunctionUrlConfig$ = [
  3,
  n02,
  _FUC,
  0,
  [_FU, _FA, _CTr, _LMT, _AT, _Co, _IM],
  [0, 0, 0, 0, 0, () => Cors$, 0],
  5
];
var FunctionVersionsByCapacityProviderListItem$ = [
  3,
  n02,
  _FVBCPLI,
  0,
  [_FA, _St],
  [0, 0],
  2
];
var GetAccountSettingsRequest$ = [
  3,
  n02,
  _GASR,
  0,
  [],
  []
];
var GetAccountSettingsResponse$ = [
  3,
  n02,
  _GASRe,
  0,
  [_AL, _AU],
  [() => AccountLimit$, () => AccountUsage$]
];
var GetAliasRequest$ = [
  3,
  n02,
  _GAR,
  0,
  [_FN, _N2],
  [[0, 1], [0, 1]],
  2
];
var GetCapacityProviderRequest$ = [
  3,
  n02,
  _GCPR,
  0,
  [_CPN],
  [[0, 1]],
  1
];
var GetCapacityProviderResponse$ = [
  3,
  n02,
  _GCPRe,
  0,
  [_CP],
  [() => CapacityProvider$],
  1
];
var GetCodeSigningConfigRequest$ = [
  3,
  n02,
  _GCSCR,
  0,
  [_CSCA],
  [[0, 1]],
  1
];
var GetCodeSigningConfigResponse$ = [
  3,
  n02,
  _GCSCRe,
  0,
  [_CSC],
  [() => CodeSigningConfig$],
  1
];
var GetDurableExecutionHistoryRequest$ = [
  3,
  n02,
  _GDEHR,
  0,
  [_DEA, _IED, _MI, _Ma, _RO],
  [[0, 1], [2, { [_hQ]: _IED }], [1, { [_hQ]: _MI }], [0, { [_hQ]: _Ma }], [2, { [_hQ]: _RO }]],
  1
];
var GetDurableExecutionHistoryResponse$ = [
  3,
  n02,
  _GDEHRe,
  0,
  [_Eve, _NM],
  [[() => Events, 0], 0],
  1
];
var GetDurableExecutionRequest$ = [
  3,
  n02,
  _GDER,
  0,
  [_DEA, _IED],
  [[0, 1], [2, { [_hQ]: _IED }]],
  1
];
var GetDurableExecutionResponse$ = [
  3,
  n02,
  _GDERe,
  0,
  [_DEA, _DEN, _FA, _STt, _Sta, _IP, _Re, _E, _ETn, _Ve, _TH, _EDI, _DCu],
  [0, 0, 0, 4, 0, [() => InputPayload, 0], [() => OutputPayload, 0], [() => ErrorObject$, 0], 4, 0, () => TraceHeader$, 2, () => DurableConfig$],
  5
];
var GetDurableExecutionStateRequest$ = [
  3,
  n02,
  _GDESR,
  0,
  [_DEA, _CT, _Ma, _MI],
  [[0, 1], [0, { [_hQ]: _CT }], [0, { [_hQ]: _Ma }], [1, { [_hQ]: _MI }]],
  2
];
var GetDurableExecutionStateResponse$ = [
  3,
  n02,
  _GDESRe,
  0,
  [_O, _NM],
  [[() => Operations, 0], 0],
  1
];
var GetEventSourceMappingRequest$ = [
  3,
  n02,
  _GESMR,
  0,
  [_UUID],
  [[0, 1]],
  1
];
var GetFunctionCodeSigningConfigRequest$ = [
  3,
  n02,
  _GFCSCR,
  0,
  [_FN],
  [[0, 1]],
  1
];
var GetFunctionCodeSigningConfigResponse$ = [
  3,
  n02,
  _GFCSCRe,
  0,
  [_CSCA, _FN],
  [0, 0],
  2
];
var GetFunctionConcurrencyRequest$ = [
  3,
  n02,
  _GFCR,
  0,
  [_FN],
  [[0, 1]],
  1
];
var GetFunctionConcurrencyResponse$ = [
  3,
  n02,
  _GFCRe,
  0,
  [_RCEe],
  [1]
];
var GetFunctionConfigurationRequest$ = [
  3,
  n02,
  _GFCRet,
  0,
  [_FN, _Q],
  [[0, 1], [0, { [_hQ]: _Q }]],
  1
];
var GetFunctionEventInvokeConfigRequest$ = [
  3,
  n02,
  _GFEICR,
  0,
  [_FN, _Q],
  [[0, 1], [0, { [_hQ]: _Q }]],
  1
];
var GetFunctionRecursionConfigRequest$ = [
  3,
  n02,
  _GFRCR,
  0,
  [_FN],
  [[0, 1]],
  1
];
var GetFunctionRecursionConfigResponse$ = [
  3,
  n02,
  _GFRCRe,
  0,
  [_RL],
  [0]
];
var GetFunctionRequest$ = [
  3,
  n02,
  _GFR,
  0,
  [_FN, _Q],
  [[0, 1], [0, { [_hQ]: _Q }]],
  1
];
var GetFunctionResponse$ = [
  3,
  n02,
  _GFRe,
  0,
  [_Con, _Cod, _Ta2, _TE, _C],
  [[() => FunctionConfiguration$, 0], [() => FunctionCodeLocation$, 0], 128 | 0, () => TagsError$, () => Concurrency$]
];
var GetFunctionScalingConfigRequest$ = [
  3,
  n02,
  _GFSCR,
  0,
  [_FN, _Q],
  [[0, 1], [0, { [_hQ]: _Q }]],
  2
];
var GetFunctionScalingConfigResponse$ = [
  3,
  n02,
  _GFSCRe,
  0,
  [_FA, _AFSC, _RFSC],
  [0, () => FunctionScalingConfig$, () => FunctionScalingConfig$]
];
var GetFunctionUrlConfigRequest$ = [
  3,
  n02,
  _GFUCR,
  0,
  [_FN, _Q],
  [[0, 1], [0, { [_hQ]: _Q }]],
  1
];
var GetFunctionUrlConfigResponse$ = [
  3,
  n02,
  _GFUCRe,
  0,
  [_FU, _FA, _AT, _CTr, _LMT, _Co, _IM],
  [0, 0, 0, 0, 0, () => Cors$, 0],
  5
];
var GetLayerVersionByArnRequest$ = [
  3,
  n02,
  _GLVBAR,
  0,
  [_Arn],
  [[0, { [_hQ]: _Arn }]],
  1
];
var GetLayerVersionPolicyRequest$ = [
  3,
  n02,
  _GLVPR,
  0,
  [_LN, _VN],
  [[0, 1], [1, 1]],
  2
];
var GetLayerVersionPolicyResponse$ = [
  3,
  n02,
  _GLVPRe,
  0,
  [_Po, _RI],
  [0, 0]
];
var GetLayerVersionRequest$ = [
  3,
  n02,
  _GLVR,
  0,
  [_LN, _VN],
  [[0, 1], [1, 1]],
  2
];
var GetLayerVersionResponse$ = [
  3,
  n02,
  _GLVRe,
  0,
  [_Cont, _LA, _LVA, _D2, _CDr, _Ve, _CA, _CR, _LI],
  [() => LayerVersionContentOutput$, 0, 0, 0, 0, 1, 64 | 0, 64 | 0, 0]
];
var GetPolicyRequest$ = [
  3,
  n02,
  _GPR,
  0,
  [_FN, _Q],
  [[0, 1], [0, { [_hQ]: _Q }]],
  1
];
var GetPolicyResponse$ = [
  3,
  n02,
  _GPRe,
  0,
  [_Po, _RI],
  [0, 0]
];
var GetProvisionedConcurrencyConfigRequest$ = [
  3,
  n02,
  _GPCCR,
  0,
  [_FN, _Q],
  [[0, 1], [0, { [_hQ]: _Q }]],
  2
];
var GetProvisionedConcurrencyConfigResponse$ = [
  3,
  n02,
  _GPCCRe,
  0,
  [_RPCE, _APCE, _APCEl, _Sta, _SRt, _LM],
  [1, 1, 1, 0, 0, 0]
];
var GetResourcePolicyRequest$ = [
  3,
  n02,
  _GRPR,
  0,
  [_RAe],
  [[0, 1]],
  1
];
var GetResourcePolicyResponse$ = [
  3,
  n02,
  _GRPRe,
  0,
  [_Po, _RI],
  [0, 0]
];
var GetRuntimeManagementConfigRequest$ = [
  3,
  n02,
  _GRMCR,
  0,
  [_FN, _Q],
  [[0, 1], [0, { [_hQ]: _Q }]],
  1
];
var GetRuntimeManagementConfigResponse$ = [
  3,
  n02,
  _GRMCRe,
  0,
  [_URO, _FA, _RVA],
  [0, 0, 0]
];
var ImageConfig$ = [
  3,
  n02,
  _IC,
  0,
  [_EP, _Com, _WD],
  [64 | 0, 64 | 0, 0]
];
var ImageConfigError$ = [
  3,
  n02,
  _ICE,
  0,
  [_EC, _M2],
  [0, [() => SensitiveString, 0]]
];
var ImageConfigResponse$ = [
  3,
  n02,
  _ICR,
  0,
  [_IC, _E],
  [() => ImageConfig$, [() => ImageConfigError$, 0]]
];
var InstanceRequirements$ = [
  3,
  n02,
  _IR,
  0,
  [_Ar, _AIT, _EIT],
  [64 | 0, 64 | 0, 64 | 0]
];
var InvocationCompletedDetails$ = [
  3,
  n02,
  _ICD,
  0,
  [_STt, _ETn, _RIe, _E],
  [4, 4, 0, [() => EventError$, 0]],
  3
];
var InvocationRequest$ = [
  3,
  n02,
  _IRn,
  0,
  [_FN, _IT, _LT, _CC, _DEN, _Pa, _Q, _TI],
  [[0, 1], [0, { [_hH]: _XAIT }], [0, { [_hH]: _XALT }], [0, { [_hH]: _XACC }], [0, { [_hH]: _XADEN }], [() => _Blob, 16], [0, { [_hQ]: _Q }], [0, { [_hH]: _XATI }]],
  1
];
var InvocationResponse$ = [
  3,
  n02,
  _IRnv,
  0,
  [_SCt, _FE, _LR, _Pa, _EV, _DEA],
  [[1, 32], [0, { [_hH]: _XAFE }], [0, { [_hH]: _XALR }], [() => _Blob, 16], [0, { [_hH]: _XAEV }], [0, { [_hH]: _XADEA }]]
];
var InvokeAsyncRequest$ = [
  3,
  n02,
  _IAR,
  0,
  [_FN, _IA],
  [[0, 1], [() => BlobStream, 16]],
  2
];
var InvokeAsyncResponse$ = [
  3,
  n02,
  _IARn,
  0,
  [_Sta],
  [[1, 32]]
];
var InvokeResponseStreamUpdate$ = [
  3,
  n02,
  _IRSU,
  0,
  [_Pa],
  [[() => _Blob, { [_eP]: 1 }]]
];
var InvokeWithResponseStreamCompleteEvent$ = [
  3,
  n02,
  _IWRSCE,
  0,
  [_EC, _EDr, _LR],
  [0, 0, 0]
];
var InvokeWithResponseStreamRequest$ = [
  3,
  n02,
  _IWRSR,
  0,
  [_FN, _LT, _CC, _Q, _Pa, _TI, _IT],
  [[0, 1], [0, { [_hH]: _XALT }], [0, { [_hH]: _XACC }], [0, { [_hQ]: _Q }], [() => _Blob, 16], [0, { [_hH]: _XATI }], [0, { [_hH]: _XAIT }]],
  1
];
var InvokeWithResponseStreamResponse$ = [
  3,
  n02,
  _IWRSRn,
  0,
  [_SCt, _EV, _ESv, _RSCT],
  [[1, 32], [0, { [_hH]: _XAEV }], [() => InvokeWithResponseStreamResponseEvent$, 16], [0, { [_hH]: _CT_ }]]
];
var KafkaSchemaRegistryAccessConfig$ = [
  3,
  n02,
  _KSRAC,
  0,
  [_T2, _URI],
  [0, 0]
];
var KafkaSchemaRegistryConfig$ = [
  3,
  n02,
  _KSRC,
  0,
  [_SRURI, _ERF, _ACc, _SVC],
  [0, 0, () => KafkaSchemaRegistryAccessConfigList, () => KafkaSchemaValidationConfigList]
];
var KafkaSchemaValidationConfig$ = [
  3,
  n02,
  _KSVC,
  0,
  [_At],
  [0]
];
var LambdaManagedInstancesCapacityProviderConfig$ = [
  3,
  n02,
  _LMICPC,
  0,
  [_CPA, _PEEMC, _EEMGBPVC],
  [0, 1, 1],
  1
];
var Layer$ = [
  3,
  n02,
  _La,
  0,
  [_Arn, _CS, _SPVAi, _SJA],
  [0, 1, 0, 0]
];
var LayersListItem$ = [
  3,
  n02,
  _LLI,
  0,
  [_LN, _LA, _LMV],
  [0, 0, () => LayerVersionsListItem$]
];
var LayerVersionContentInput$ = [
  3,
  n02,
  _LVCI,
  0,
  [_SB2, _SK, _SOV, _SOSM, _ZF],
  [0, 0, 0, 0, [() => _Blob, 0]]
];
var LayerVersionContentOutput$ = [
  3,
  n02,
  _LVCO,
  0,
  [_Lo, _CSo, _CS, _SPVAi, _SJA, _RSO],
  [0, 0, 1, 0, 0, () => ResolvedS3Object$]
];
var LayerVersionsListItem$ = [
  3,
  n02,
  _LVLI,
  0,
  [_LVA, _Ve, _D2, _CDr, _CA, _CR, _LI],
  [0, 1, 0, 0, 64 | 0, 64 | 0, 0]
];
var ListAliasesRequest$ = [
  3,
  n02,
  _LAR,
  0,
  [_FN, _FV, _Ma, _MI],
  [[0, 1], [0, { [_hQ]: _FV }], [0, { [_hQ]: _Ma }], [1, { [_hQ]: _MI }]],
  1
];
var ListAliasesResponse$ = [
  3,
  n02,
  _LARi,
  0,
  [_NM, _Al],
  [0, () => AliasList]
];
var ListCapacityProvidersRequest$ = [
  3,
  n02,
  _LCPR,
  0,
  [_St, _Ma, _MI],
  [[0, { [_hQ]: _St }], [0, { [_hQ]: _Ma }], [1, { [_hQ]: _MI }]]
];
var ListCapacityProvidersResponse$ = [
  3,
  n02,
  _LCPRi,
  0,
  [_CPa, _NM],
  [() => CapacityProvidersList, 0],
  1
];
var ListCodeSigningConfigsRequest$ = [
  3,
  n02,
  _LCSCR,
  0,
  [_Ma, _MI],
  [[0, { [_hQ]: _Ma }], [1, { [_hQ]: _MI }]]
];
var ListCodeSigningConfigsResponse$ = [
  3,
  n02,
  _LCSCRi,
  0,
  [_NM, _CSCo],
  [0, () => CodeSigningConfigList]
];
var ListDurableExecutionsByFunctionRequest$ = [
  3,
  n02,
  _LDEBFR,
  0,
  [_FN, _Q, _DEN, _Stat, _SAt, _SBt, _RO, _Ma, _MI],
  [[0, 1], [0, { [_hQ]: _Q }], [0, { [_hQ]: _DEN }], [64 | 0, { [_hQ]: _Stat }], [4, { [_hQ]: _SAt }], [4, { [_hQ]: _SBt }], [2, { [_hQ]: _RO }], [0, { [_hQ]: _Ma }], [1, { [_hQ]: _MI }]],
  1
];
var ListDurableExecutionsByFunctionResponse$ = [
  3,
  n02,
  _LDEBFRi,
  0,
  [_DE, _NM],
  [() => DurableExecutions, 0]
];
var ListEventSourceMappingsRequest$ = [
  3,
  n02,
  _LESMR,
  0,
  [_ESA, _FN, _Ma, _MI],
  [[0, { [_hQ]: _ESA }], [0, { [_hQ]: _FN }], [0, { [_hQ]: _Ma }], [1, { [_hQ]: _MI }]]
];
var ListEventSourceMappingsResponse$ = [
  3,
  n02,
  _LESMRi,
  0,
  [_NM, _ESM],
  [0, () => EventSourceMappingsList]
];
var ListFunctionEventInvokeConfigsRequest$ = [
  3,
  n02,
  _LFEICR,
  0,
  [_FN, _Ma, _MI],
  [[0, 1], [0, { [_hQ]: _Ma }], [1, { [_hQ]: _MI }]],
  1
];
var ListFunctionEventInvokeConfigsResponse$ = [
  3,
  n02,
  _LFEICRi,
  0,
  [_FEICu, _NM],
  [() => FunctionEventInvokeConfigList, 0]
];
var ListFunctionsByCodeSigningConfigRequest$ = [
  3,
  n02,
  _LFBCSCR,
  0,
  [_CSCA, _Ma, _MI],
  [[0, 1], [0, { [_hQ]: _Ma }], [1, { [_hQ]: _MI }]],
  1
];
var ListFunctionsByCodeSigningConfigResponse$ = [
  3,
  n02,
  _LFBCSCRi,
  0,
  [_NM, _FAu],
  [0, 64 | 0]
];
var ListFunctionsRequest$ = [
  3,
  n02,
  _LFR,
  0,
  [_MR2, _FV, _Ma, _MI],
  [[0, { [_hQ]: _MR2 }], [0, { [_hQ]: _FV }], [0, { [_hQ]: _Ma }], [1, { [_hQ]: _MI }]]
];
var ListFunctionsResponse$ = [
  3,
  n02,
  _LFRi,
  0,
  [_NM, _Fu],
  [0, [() => FunctionList, 0]]
];
var ListFunctionUrlConfigsRequest$ = [
  3,
  n02,
  _LFUCR,
  0,
  [_FN, _Ma, _MI],
  [[0, 1], [0, { [_hQ]: _Ma }], [1, { [_hQ]: _MI }]],
  1
];
var ListFunctionUrlConfigsResponse$ = [
  3,
  n02,
  _LFUCRi,
  0,
  [_FUCu, _NM],
  [() => FunctionUrlConfigList, 0],
  1
];
var ListFunctionVersionsByCapacityProviderRequest$ = [
  3,
  n02,
  _LFVBCPR,
  0,
  [_CPN, _Ma, _MI],
  [[0, 1], [0, { [_hQ]: _Ma }], [1, { [_hQ]: _MI }]],
  1
];
var ListFunctionVersionsByCapacityProviderResponse$ = [
  3,
  n02,
  _LFVBCPRi,
  0,
  [_CPA, _FVu, _NM],
  [0, () => FunctionVersionsByCapacityProviderList, 0],
  2
];
var ListLayersRequest$ = [
  3,
  n02,
  _LLR,
  0,
  [_CAo, _CRo, _Ma, _MI],
  [[0, { [_hQ]: _CAo }], [0, { [_hQ]: _CRo }], [0, { [_hQ]: _Ma }], [1, { [_hQ]: _MI }]]
];
var ListLayersResponse$ = [
  3,
  n02,
  _LLRi,
  0,
  [_NM, _L],
  [0, () => LayersList]
];
var ListLayerVersionsRequest$ = [
  3,
  n02,
  _LLVR,
  0,
  [_LN, _CAo, _CRo, _Ma, _MI],
  [[0, 1], [0, { [_hQ]: _CAo }], [0, { [_hQ]: _CRo }], [0, { [_hQ]: _Ma }], [1, { [_hQ]: _MI }]],
  1
];
var ListLayerVersionsResponse$ = [
  3,
  n02,
  _LLVRi,
  0,
  [_NM, _LV],
  [0, () => LayerVersionsList]
];
var ListProvisionedConcurrencyConfigsRequest$ = [
  3,
  n02,
  _LPCCR,
  0,
  [_FN, _Ma, _MI],
  [[0, 1], [0, { [_hQ]: _Ma }], [1, { [_hQ]: _MI }]],
  1
];
var ListProvisionedConcurrencyConfigsResponse$ = [
  3,
  n02,
  _LPCCRi,
  0,
  [_PCC, _NM],
  [() => ProvisionedConcurrencyConfigList, 0]
];
var ListTagsRequest$ = [
  3,
  n02,
  _LTR,
  0,
  [_Res],
  [[0, 1]],
  1
];
var ListTagsResponse$ = [
  3,
  n02,
  _LTRi,
  0,
  [_Ta2],
  [128 | 0]
];
var ListVersionsByFunctionRequest$ = [
  3,
  n02,
  _LVBFR,
  0,
  [_FN, _Ma, _MI],
  [[0, 1], [0, { [_hQ]: _Ma }], [1, { [_hQ]: _MI }]],
  1
];
var ListVersionsByFunctionResponse$ = [
  3,
  n02,
  _LVBFRi,
  0,
  [_NM, _Ver],
  [0, [() => FunctionList, 0]]
];
var LoggingConfig$ = [
  3,
  n02,
  _LC,
  0,
  [_LF, _ALL, _SLL, _LG],
  [0, 0, 0, 0]
];
var OnFailure$ = [
  3,
  n02,
  _OF,
  0,
  [_De],
  [0]
];
var OnSuccess$ = [
  3,
  n02,
  _OS2,
  0,
  [_De],
  [0]
];
var Operation$ = [
  3,
  n02,
  _Op,
  0,
  [_Id, _T2, _STt, _Sta, _PI, _N2, _STu, _ETn, _EDx, _CDo, _SD, _WDa, _CD2, _CID],
  [0, 0, 4, 0, 0, 0, 0, 4, [() => ExecutionDetails$, 0], [() => ContextDetails$, 0], [() => StepDetails$, 0], () => WaitDetails$, [() => CallbackDetails$, 0], [() => ChainedInvokeDetails$, 0]],
  4
];
var OperationUpdate$ = [
  3,
  n02,
  _OU,
  0,
  [_Id, _T2, _A, _PI, _N2, _STu, _Pa, _E, _COo, _SO, _WO, _CO, _CIO],
  [0, 0, 0, 0, 0, 0, [() => OperationPayload, 0], [() => ErrorObject$, 0], () => ContextOptions$, () => StepOptions$, () => WaitOptions$, () => CallbackOptions$, () => ChainedInvokeOptions$],
  3
];
var PropagateTags$ = [
  3,
  n02,
  _PT,
  0,
  [_Mo, _ETxp],
  [0, 128 | 0]
];
var ProvisionedConcurrencyConfigListItem$ = [
  3,
  n02,
  _PCCLI,
  0,
  [_FA, _RPCE, _APCE, _APCEl, _Sta, _SRt, _LM],
  [0, 1, 1, 1, 0, 0, 0]
];
var ProvisionedPollerConfig$ = [
  3,
  n02,
  _PPC,
  0,
  [_MP, _MPa, _PGN],
  [1, 1, 0]
];
var PublishLayerVersionRequest$ = [
  3,
  n02,
  _PLVR,
  0,
  [_LN, _Cont, _D2, _CA, _CR, _LI],
  [[0, 1], [() => LayerVersionContentInput$, 0], 0, 64 | 0, 64 | 0, 0],
  2
];
var PublishLayerVersionResponse$ = [
  3,
  n02,
  _PLVRu,
  0,
  [_Cont, _LA, _LVA, _D2, _CDr, _Ve, _CA, _CR, _LI],
  [() => LayerVersionContentOutput$, 0, 0, 0, 0, 1, 64 | 0, 64 | 0, 0]
];
var PublishVersionRequest$ = [
  3,
  n02,
  _PVR,
  0,
  [_FN, _CSo, _D2, _RI, _PTu],
  [[0, 1], 0, 0, 0, 0],
  1
];
var PutFunctionCodeSigningConfigRequest$ = [
  3,
  n02,
  _PFCSCR,
  0,
  [_CSCA, _FN],
  [0, [0, 1]],
  2
];
var PutFunctionCodeSigningConfigResponse$ = [
  3,
  n02,
  _PFCSCRu,
  0,
  [_CSCA, _FN],
  [0, 0],
  2
];
var PutFunctionConcurrencyRequest$ = [
  3,
  n02,
  _PFCR,
  0,
  [_FN, _RCEe],
  [[0, 1], 1],
  2
];
var PutFunctionEventInvokeConfigRequest$ = [
  3,
  n02,
  _PFEICR,
  0,
  [_FN, _Q, _MRA, _MEAIS, _DC],
  [[0, 1], [0, { [_hQ]: _Q }], 1, 1, () => DestinationConfig$],
  1
];
var PutFunctionRecursionConfigRequest$ = [
  3,
  n02,
  _PFRCR,
  0,
  [_FN, _RL],
  [[0, 1], 0],
  2
];
var PutFunctionRecursionConfigResponse$ = [
  3,
  n02,
  _PFRCRu,
  0,
  [_RL],
  [0]
];
var PutFunctionScalingConfigRequest$ = [
  3,
  n02,
  _PFSCR,
  0,
  [_FN, _Q, _FSCu],
  [[0, 1], [0, { [_hQ]: _Q }], () => FunctionScalingConfig$],
  2
];
var PutFunctionScalingConfigResponse$ = [
  3,
  n02,
  _PFSCRu,
  0,
  [_FS],
  [0]
];
var PutProvisionedConcurrencyConfigRequest$ = [
  3,
  n02,
  _PPCCR,
  0,
  [_FN, _Q, _PCE],
  [[0, 1], [0, { [_hQ]: _Q }], 1],
  3
];
var PutProvisionedConcurrencyConfigResponse$ = [
  3,
  n02,
  _PPCCRu,
  0,
  [_RPCE, _APCEl, _APCE, _Sta, _SRt, _LM],
  [1, 1, 1, 0, 0, 0]
];
var PutResourcePolicyRequest$ = [
  3,
  n02,
  _PRPR,
  0,
  [_RAe, _Po, _RI],
  [[0, 1], 0, 0],
  2
];
var PutResourcePolicyResponse$ = [
  3,
  n02,
  _PRPRu,
  0,
  [_Po, _RI],
  [0, 0]
];
var PutRuntimeManagementConfigRequest$ = [
  3,
  n02,
  _PRMCR,
  0,
  [_FN, _URO, _Q, _RVA],
  [[0, 1], 0, [0, { [_hQ]: _Q }], 0],
  2
];
var PutRuntimeManagementConfigResponse$ = [
  3,
  n02,
  _PRMCRu,
  0,
  [_URO, _FA, _RVA],
  [0, 0, 0],
  2
];
var RemoveLayerVersionPermissionRequest$ = [
  3,
  n02,
  _RLVPR,
  0,
  [_LN, _VN, _SI2, _RI],
  [[0, 1], [1, 1], [0, 1], [0, { [_hQ]: _RI }]],
  3
];
var RemovePermissionRequest$ = [
  3,
  n02,
  _RPR,
  0,
  [_FN, _SI2, _Q, _RI],
  [[0, 1], [0, 1], [0, { [_hQ]: _Q }], [0, { [_hQ]: _RI }]],
  2
];
var ResolvedS3Object$ = [
  3,
  n02,
  _RSO,
  0,
  [_SB2, _SK, _SOV],
  [0, 0, 0]
];
var RetryDetails$ = [
  3,
  n02,
  _RD,
  0,
  [_CAu, _NADS],
  [1, 1]
];
var RuntimeVersionConfig$ = [
  3,
  n02,
  _RVC,
  0,
  [_RVA, _E],
  [0, [() => RuntimeVersionError$, 0]]
];
var RuntimeVersionError$ = [
  3,
  n02,
  _RVE,
  0,
  [_EC, _M2],
  [0, [() => SensitiveString, 0]]
];
var S3FilesConfig$ = [
  3,
  n02,
  _SFC,
  0,
  [_DSR],
  [0]
];
var ScalingConfig$ = [
  3,
  n02,
  _SC,
  0,
  [_MCa],
  [1]
];
var SelfManagedEventSource$ = [
  3,
  n02,
  _SMES,
  0,
  [_End],
  [[2, n02, _End, 0, 0, 64 | 0]]
];
var SelfManagedKafkaEventSourceConfig$ = [
  3,
  n02,
  _SMKESC,
  0,
  [_CGI, _SRC],
  [0, () => KafkaSchemaRegistryConfig$]
];
var SendDurableExecutionCallbackFailureRequest$ = [
  3,
  n02,
  _SDECFR,
  0,
  [_CI, _E],
  [[0, 1], [() => ErrorObject$, 16]],
  1
];
var SendDurableExecutionCallbackFailureResponse$ = [
  3,
  n02,
  _SDECFRe,
  0,
  [],
  []
];
var SendDurableExecutionCallbackHeartbeatRequest$ = [
  3,
  n02,
  _SDECHR,
  0,
  [_CI],
  [[0, 1]],
  1
];
var SendDurableExecutionCallbackHeartbeatResponse$ = [
  3,
  n02,
  _SDECHRe,
  0,
  [],
  []
];
var SendDurableExecutionCallbackSuccessRequest$ = [
  3,
  n02,
  _SDECSR,
  0,
  [_CI, _Re],
  [[0, 1], [() => BinaryOperationPayload, 16]],
  1
];
var SendDurableExecutionCallbackSuccessResponse$ = [
  3,
  n02,
  _SDECSRe,
  0,
  [],
  []
];
var SnapStart$ = [
  3,
  n02,
  _SSn,
  0,
  [_AOp],
  [0]
];
var SnapStartResponse$ = [
  3,
  n02,
  _SSR,
  0,
  [_AOp, _OSp],
  [0, 0]
];
var SourceAccessConfiguration$ = [
  3,
  n02,
  _SACo,
  0,
  [_T2, _URI],
  [0, 0]
];
var StepDetails$ = [
  3,
  n02,
  _SD,
  0,
  [_Att, _NAT, _Re, _E],
  [1, 4, [() => OperationPayload, 0], [() => ErrorObject$, 0]]
];
var StepFailedDetails$ = [
  3,
  n02,
  _SFD,
  0,
  [_E, _RD],
  [[() => EventError$, 0], () => RetryDetails$],
  2
];
var StepOptions$ = [
  3,
  n02,
  _SO,
  0,
  [_NADS],
  [1]
];
var StepStartedDetails$ = [
  3,
  n02,
  _SSD,
  0,
  [],
  []
];
var StepSucceededDetails$ = [
  3,
  n02,
  _SSDt,
  0,
  [_Re, _RD],
  [[() => EventResult$, 0], () => RetryDetails$],
  2
];
var StopDurableExecutionRequest$ = [
  3,
  n02,
  _SDER,
  0,
  [_DEA, _E],
  [[0, 1], [() => ErrorObject$, 16]],
  1
];
var StopDurableExecutionResponse$ = [
  3,
  n02,
  _SDERt,
  0,
  [_STto],
  [4],
  1
];
var TagResourceRequest$ = [
  3,
  n02,
  _TRR,
  0,
  [_Res, _Ta2],
  [[0, 1], 128 | 0],
  2
];
var TagsError$ = [
  3,
  n02,
  _TE,
  0,
  [_EC, _M2],
  [0, 0],
  2
];
var TargetTrackingScalingPolicy$ = [
  3,
  n02,
  _TTSP,
  0,
  [_PMT, _TV],
  [0, 1],
  2
];
var TenancyConfig$ = [
  3,
  n02,
  _TCe,
  0,
  [_TIM],
  [0],
  1
];
var TraceHeader$ = [
  3,
  n02,
  _TH,
  0,
  [_XATIm],
  [0]
];
var TracingConfig$ = [
  3,
  n02,
  _TCr,
  0,
  [_Mo],
  [0]
];
var TracingConfigResponse$ = [
  3,
  n02,
  _TCR,
  0,
  [_Mo],
  [0]
];
var UntagResourceRequest$2 = [
  3,
  n02,
  _URR2,
  0,
  [_Res, _TK2],
  [[0, 1], [() => TagKeyList, { [_hQ]: _tK }]],
  2
];
var UpdateAliasRequest$ = [
  3,
  n02,
  _UAR,
  0,
  [_FN, _N2, _FV, _D2, _RC, _RI],
  [[0, 1], [0, 1], 0, 0, () => AliasRoutingConfiguration$, 0],
  2
];
var UpdateCapacityProviderRequest$ = [
  3,
  n02,
  _UCPR,
  0,
  [_CPN, _CPSC, _PT, _TC],
  [[0, 1], () => CapacityProviderScalingConfig$, () => PropagateTags$, () => CapacityProviderTelemetryConfig$],
  1
];
var UpdateCapacityProviderResponse$ = [
  3,
  n02,
  _UCPRp,
  0,
  [_CP],
  [() => CapacityProvider$],
  1
];
var UpdateCodeSigningConfigRequest$ = [
  3,
  n02,
  _UCSCR,
  0,
  [_CSCA, _D2, _AP, _CSP],
  [[0, 1], 0, () => AllowedPublishers$, () => CodeSigningPolicies$],
  1
];
var UpdateCodeSigningConfigResponse$ = [
  3,
  n02,
  _UCSCRp,
  0,
  [_CSC],
  [() => CodeSigningConfig$],
  1
];
var UpdateEventSourceMappingRequest$ = [
  3,
  n02,
  _UESMR,
  0,
  [_UUID, _FN, _En, _BSa, _FCi, _KMSKA, _MC, _LC, _SC, _MBWIS, _PF, _DC, _MRAIS, _BBOFE, _MRA, _TWIS, _SAC, _FRT, _AMKESC, _SMKESC, _DDBESC, _PPC],
  [[0, 1], 0, 2, 1, () => FilterCriteria$, 0, () => EventSourceMappingMetricsConfig$, () => EventSourceMappingLoggingConfig$, () => ScalingConfig$, 1, 1, () => DestinationConfig$, 1, 2, 1, 1, () => SourceAccessConfigurations, 64 | 0, () => AmazonManagedKafkaEventSourceConfig$, () => SelfManagedKafkaEventSourceConfig$, () => DocumentDBEventSourceConfig$, () => ProvisionedPollerConfig$],
  1
];
var UpdateFunctionCodeRequest$ = [
  3,
  n02,
  _UFCR,
  0,
  [_FN, _ZF, _SB2, _SK, _SOV, _SOSM, _IU, _Ar, _Pu, _PTu, _DR, _RI, _SKMSKA],
  [[0, 1], [() => _Blob, 0], 0, 0, 0, 0, 0, 64 | 0, 2, 0, 2, 0, 0],
  1
];
var UpdateFunctionConfigurationRequest$ = [
  3,
  n02,
  _UFCRp,
  0,
  [_FN, _Ro, _H, _D2, _Ti, _MS, _VC, _Env, _Ru, _DLC, _KMSKA, _TCr, _RI, _L, _FSC, _IC, _ES, _SSn, _LC, _CPC, _DCu],
  [[0, 1], 0, 0, 0, 1, 1, () => VpcConfig$, [() => Environment$, 0], 0, () => DeadLetterConfig$, 0, () => TracingConfig$, 0, 64 | 0, () => FileSystemConfigList, () => ImageConfig$, () => EphemeralStorage$, () => SnapStart$, () => LoggingConfig$, () => CapacityProviderConfig$, () => DurableConfig$],
  1
];
var UpdateFunctionEventInvokeConfigRequest$ = [
  3,
  n02,
  _UFEICR,
  0,
  [_FN, _Q, _MRA, _MEAIS, _DC],
  [[0, 1], [0, { [_hQ]: _Q }], 1, 1, () => DestinationConfig$],
  1
];
var UpdateFunctionUrlConfigRequest$ = [
  3,
  n02,
  _UFUCR,
  0,
  [_FN, _Q, _AT, _Co, _IM],
  [[0, 1], [0, { [_hQ]: _Q }], 0, () => Cors$, 0],
  1
];
var UpdateFunctionUrlConfigResponse$ = [
  3,
  n02,
  _UFUCRp,
  0,
  [_FU, _FA, _AT, _CTr, _LMT, _Co, _IM],
  [0, 0, 0, 0, 0, () => Cors$, 0],
  5
];
var VpcConfig$ = [
  3,
  n02,
  _VC,
  0,
  [_SIu, _SGI, _IAFDS],
  [64 | 0, 64 | 0, 2]
];
var VpcConfigResponse$ = [
  3,
  n02,
  _VCR,
  0,
  [_SIu, _SGI, _VI2, _IAFDS],
  [64 | 0, 64 | 0, 0, 2]
];
var WaitCancelledDetails$ = [
  3,
  n02,
  _WCD,
  0,
  [_E],
  [[() => EventError$, 0]]
];
var WaitDetails$ = [
  3,
  n02,
  _WDa,
  0,
  [_SET],
  [4]
];
var WaitOptions$ = [
  3,
  n02,
  _WO,
  0,
  [_WS],
  [1]
];
var WaitStartedDetails$ = [
  3,
  n02,
  _WSD,
  0,
  [_Du2, _SET],
  [1, 4],
  2
];
var WaitSucceededDetails$ = [
  3,
  n02,
  _WSDa,
  0,
  [_Du2],
  [1]
];
var __Unit = "unit";
var AliasList = [
  1,
  n02,
  _ALl,
  0,
  () => AliasConfiguration$
];
var AllowMethodsList = 64 | 0;
var AllowOriginsList = 64 | 0;
var ArchitecturesList = 64 | 0;
var CapacityProviderScalingPoliciesList = [
  1,
  n02,
  _CPSPL,
  0,
  () => TargetTrackingScalingPolicy$
];
var CapacityProviderSecurityGroupIds = 64 | 0;
var CapacityProvidersList = [
  1,
  n02,
  _CPL,
  0,
  () => CapacityProvider$
];
var CapacityProviderSubnetIds = 64 | 0;
var CodeSigningConfigList = [
  1,
  n02,
  _CSCL,
  0,
  () => CodeSigningConfig$
];
var CompatibleArchitectures = 64 | 0;
var CompatibleRuntimes = 64 | 0;
var DurableExecutions = [
  1,
  n02,
  _DE,
  0,
  () => Execution$
];
var EndpointLists = 64 | 0;
var Events = [
  1,
  n02,
  _Eve,
  0,
  [
    () => Event$,
    0
  ]
];
var EventSourceMappingMetricList = 64 | 0;
var EventSourceMappingsList = [
  1,
  n02,
  _ESML,
  0,
  () => EventSourceMappingConfiguration$
];
var ExecutionStatusList = 64 | 0;
var FileSystemConfigList = [
  1,
  n02,
  _FSCL,
  0,
  () => FileSystemConfig$
];
var FilterList = [
  1,
  n02,
  _FL,
  0,
  () => Filter$2
];
var FunctionArnList = 64 | 0;
var FunctionEventInvokeConfigList = [
  1,
  n02,
  _FEICL,
  0,
  () => FunctionEventInvokeConfig$
];
var FunctionList = [
  1,
  n02,
  _FLu,
  0,
  [
    () => FunctionConfiguration$,
    0
  ]
];
var FunctionResponseTypeList = 64 | 0;
var FunctionUrlConfigList = [
  1,
  n02,
  _FUCL,
  0,
  () => FunctionUrlConfig$
];
var FunctionVersionsByCapacityProviderList = [
  1,
  n02,
  _FVBCPL,
  0,
  () => FunctionVersionsByCapacityProviderListItem$
];
var HeadersList = 64 | 0;
var InstanceTypeSet = 64 | 0;
var KafkaSchemaRegistryAccessConfigList = [
  1,
  n02,
  _KSRACL,
  0,
  () => KafkaSchemaRegistryAccessConfig$
];
var KafkaSchemaValidationConfigList = [
  1,
  n02,
  _KSVCL,
  0,
  () => KafkaSchemaValidationConfig$
];
var LayerList = 64 | 0;
var LayersList = [
  1,
  n02,
  _LL,
  0,
  () => LayersListItem$
];
var LayersReferenceList = [
  1,
  n02,
  _LRL,
  0,
  () => Layer$
];
var LayerVersionsList = [
  1,
  n02,
  _LVL,
  0,
  () => LayerVersionsListItem$
];
var Operations = [
  1,
  n02,
  _O,
  0,
  [
    () => Operation$,
    0
  ]
];
var OperationUpdates = [
  1,
  n02,
  _OUp,
  0,
  [
    () => OperationUpdate$,
    0
  ]
];
var ProvisionedConcurrencyConfigList = [
  1,
  n02,
  _PCCL,
  0,
  () => ProvisionedConcurrencyConfigListItem$
];
var Queues = 64 | 0;
var SecurityGroupIds = 64 | 0;
var SigningProfileVersionArns = 64 | 0;
var SourceAccessConfigurations = [
  1,
  n02,
  _SAC,
  0,
  () => SourceAccessConfiguration$
];
var StackTraceEntries = [
  1,
  n02,
  _STEt,
  0,
  [
    () => StackTraceEntry,
    0
  ]
];
var StringList = 64 | 0;
var SubnetIds = 64 | 0;
var TagKeyList = [
  1,
  n02,
  _TKL,
  0,
  [
    0,
    { [_xN]: _K2 }
  ]
];
var Topics = 64 | 0;
var AdditionalVersionWeights = 128 | 1;
var Endpoints = [
  2,
  n02,
  _End,
  0,
  0,
  64 | 0
];
var EnvironmentVariables = [
  2,
  n02,
  _EVn,
  8,
  [
    () => EnvironmentVariableName,
    0
  ],
  [
    () => EnvironmentVariableValue,
    0
  ]
];
var Tags = 128 | 0;
var InvokeWithResponseStreamResponseEvent$ = [
  4,
  n02,
  _IWRSRE,
  { [_st]: 1 },
  [_PCa, _ICn],
  [[() => InvokeResponseStreamUpdate$, 0], () => InvokeWithResponseStreamCompleteEvent$]
];
var AddLayerVersionPermission$ = [
  9,
  n02,
  _ALVP,
  { [_h]: ["POST", "/2018-10-31/layers/{LayerName}/versions/{VersionNumber}/policy", 201] },
  () => AddLayerVersionPermissionRequest$,
  () => AddLayerVersionPermissionResponse$
];
var AddPermission$ = [
  9,
  n02,
  _APd,
  { [_h]: ["POST", "/2015-03-31/functions/{FunctionName}/policy", 201] },
  () => AddPermissionRequest$,
  () => AddPermissionResponse$
];
var CheckpointDurableExecution$ = [
  9,
  n02,
  _CDE,
  { [_h]: ["POST", "/2025-12-01/durable-executions/{DurableExecutionArn}/checkpoint", 200] },
  () => CheckpointDurableExecutionRequest$,
  () => CheckpointDurableExecutionResponse$
];
var CreateAlias$ = [
  9,
  n02,
  _CAr,
  { [_h]: ["POST", "/2015-03-31/functions/{FunctionName}/aliases", 201] },
  () => CreateAliasRequest$,
  () => AliasConfiguration$
];
var CreateCapacityProvider$ = [
  9,
  n02,
  _CCP,
  { [_h]: ["POST", "/2025-11-30/capacity-providers", 202] },
  () => CreateCapacityProviderRequest$,
  () => CreateCapacityProviderResponse$
];
var CreateCodeSigningConfig$ = [
  9,
  n02,
  _CCSC,
  { [_h]: ["POST", "/2020-04-22/code-signing-configs", 201] },
  () => CreateCodeSigningConfigRequest$,
  () => CreateCodeSigningConfigResponse$
];
var CreateEventSourceMapping$ = [
  9,
  n02,
  _CESM,
  { [_h]: ["POST", "/2015-03-31/event-source-mappings", 202] },
  () => CreateEventSourceMappingRequest$,
  () => EventSourceMappingConfiguration$
];
var CreateFunction$ = [
  9,
  n02,
  _CF,
  { [_h]: ["POST", "/2015-03-31/functions", 201] },
  () => CreateFunctionRequest$,
  () => FunctionConfiguration$
];
var CreateFunctionUrlConfig$ = [
  9,
  n02,
  _CFUC,
  { [_h]: ["POST", "/2021-10-31/functions/{FunctionName}/url", 201] },
  () => CreateFunctionUrlConfigRequest$,
  () => CreateFunctionUrlConfigResponse$
];
var DeleteAlias$ = [
  9,
  n02,
  _DA,
  { [_h]: ["DELETE", "/2015-03-31/functions/{FunctionName}/aliases/{Name}", 204] },
  () => DeleteAliasRequest$,
  () => __Unit
];
var DeleteCapacityProvider$ = [
  9,
  n02,
  _DCP,
  { [_h]: ["DELETE", "/2025-11-30/capacity-providers/{CapacityProviderName}", 202] },
  () => DeleteCapacityProviderRequest$,
  () => DeleteCapacityProviderResponse$
];
var DeleteCodeSigningConfig$ = [
  9,
  n02,
  _DCSC,
  { [_h]: ["DELETE", "/2020-04-22/code-signing-configs/{CodeSigningConfigArn}", 204] },
  () => DeleteCodeSigningConfigRequest$,
  () => DeleteCodeSigningConfigResponse$
];
var DeleteEventSourceMapping$ = [
  9,
  n02,
  _DESM,
  { [_h]: ["DELETE", "/2015-03-31/event-source-mappings/{UUID}", 202] },
  () => DeleteEventSourceMappingRequest$,
  () => EventSourceMappingConfiguration$
];
var DeleteFunction$ = [
  9,
  n02,
  _DF2,
  { [_h]: ["DELETE", "/2015-03-31/functions/{FunctionName}", 200] },
  () => DeleteFunctionRequest$,
  () => DeleteFunctionResponse$
];
var DeleteFunctionCodeSigningConfig$ = [
  9,
  n02,
  _DFCSC,
  { [_h]: ["DELETE", "/2020-06-30/functions/{FunctionName}/code-signing-config", 204] },
  () => DeleteFunctionCodeSigningConfigRequest$,
  () => __Unit
];
var DeleteFunctionConcurrency$ = [
  9,
  n02,
  _DFC,
  { [_h]: ["DELETE", "/2017-10-31/functions/{FunctionName}/concurrency", 204] },
  () => DeleteFunctionConcurrencyRequest$,
  () => __Unit
];
var DeleteFunctionEventInvokeConfig$ = [
  9,
  n02,
  _DFEIC,
  { [_h]: ["DELETE", "/2019-09-25/functions/{FunctionName}/event-invoke-config", 204] },
  () => DeleteFunctionEventInvokeConfigRequest$,
  () => __Unit
];
var DeleteFunctionUrlConfig$ = [
  9,
  n02,
  _DFUC,
  { [_h]: ["DELETE", "/2021-10-31/functions/{FunctionName}/url", 204] },
  () => DeleteFunctionUrlConfigRequest$,
  () => __Unit
];
var DeleteLayerVersion$ = [
  9,
  n02,
  _DLV,
  { [_h]: ["DELETE", "/2018-10-31/layers/{LayerName}/versions/{VersionNumber}", 204] },
  () => DeleteLayerVersionRequest$,
  () => __Unit
];
var DeleteProvisionedConcurrencyConfig$ = [
  9,
  n02,
  _DPCC,
  { [_h]: ["DELETE", "/2019-09-30/functions/{FunctionName}/provisioned-concurrency", 204] },
  () => DeleteProvisionedConcurrencyConfigRequest$,
  () => __Unit
];
var DeleteResourcePolicy$ = [
  9,
  n02,
  _DRP,
  { [_h]: ["DELETE", "/2026-07-09/resource-policy/{ResourceArn}", 204] },
  () => DeleteResourcePolicyRequest$,
  () => __Unit
];
var GetAccountSettings$ = [
  9,
  n02,
  _GAS,
  { [_h]: ["GET", "/2016-08-19/account-settings", 200] },
  () => GetAccountSettingsRequest$,
  () => GetAccountSettingsResponse$
];
var GetAlias$ = [
  9,
  n02,
  _GA,
  { [_h]: ["GET", "/2015-03-31/functions/{FunctionName}/aliases/{Name}", 200] },
  () => GetAliasRequest$,
  () => AliasConfiguration$
];
var GetCapacityProvider$ = [
  9,
  n02,
  _GCP,
  { [_h]: ["GET", "/2025-11-30/capacity-providers/{CapacityProviderName}", 200] },
  () => GetCapacityProviderRequest$,
  () => GetCapacityProviderResponse$
];
var GetCodeSigningConfig$ = [
  9,
  n02,
  _GCSC,
  { [_h]: ["GET", "/2020-04-22/code-signing-configs/{CodeSigningConfigArn}", 200] },
  () => GetCodeSigningConfigRequest$,
  () => GetCodeSigningConfigResponse$
];
var GetDurableExecution$ = [
  9,
  n02,
  _GDE,
  { [_h]: ["GET", "/2025-12-01/durable-executions/{DurableExecutionArn}", 200] },
  () => GetDurableExecutionRequest$,
  () => GetDurableExecutionResponse$
];
var GetDurableExecutionHistory$ = [
  9,
  n02,
  _GDEH,
  { [_h]: ["GET", "/2025-12-01/durable-executions/{DurableExecutionArn}/history", 200] },
  () => GetDurableExecutionHistoryRequest$,
  () => GetDurableExecutionHistoryResponse$
];
var GetDurableExecutionState$ = [
  9,
  n02,
  _GDES,
  { [_h]: ["GET", "/2025-12-01/durable-executions/{DurableExecutionArn}/state", 200] },
  () => GetDurableExecutionStateRequest$,
  () => GetDurableExecutionStateResponse$
];
var GetEventSourceMapping$ = [
  9,
  n02,
  _GESM,
  { [_h]: ["GET", "/2015-03-31/event-source-mappings/{UUID}", 200] },
  () => GetEventSourceMappingRequest$,
  () => EventSourceMappingConfiguration$
];
var GetFunction$ = [
  9,
  n02,
  _GF,
  { [_h]: ["GET", "/2015-03-31/functions/{FunctionName}", 200] },
  () => GetFunctionRequest$,
  () => GetFunctionResponse$
];
var GetFunctionCodeSigningConfig$ = [
  9,
  n02,
  _GFCSC,
  { [_h]: ["GET", "/2020-06-30/functions/{FunctionName}/code-signing-config", 200] },
  () => GetFunctionCodeSigningConfigRequest$,
  () => GetFunctionCodeSigningConfigResponse$
];
var GetFunctionConcurrency$ = [
  9,
  n02,
  _GFC,
  { [_h]: ["GET", "/2019-09-30/functions/{FunctionName}/concurrency", 200] },
  () => GetFunctionConcurrencyRequest$,
  () => GetFunctionConcurrencyResponse$
];
var GetFunctionConfiguration$ = [
  9,
  n02,
  _GFCe,
  { [_h]: ["GET", "/2015-03-31/functions/{FunctionName}/configuration", 200] },
  () => GetFunctionConfigurationRequest$,
  () => FunctionConfiguration$
];
var GetFunctionEventInvokeConfig$ = [
  9,
  n02,
  _GFEIC,
  { [_h]: ["GET", "/2019-09-25/functions/{FunctionName}/event-invoke-config", 200] },
  () => GetFunctionEventInvokeConfigRequest$,
  () => FunctionEventInvokeConfig$
];
var GetFunctionRecursionConfig$ = [
  9,
  n02,
  _GFRC,
  { [_h]: ["GET", "/2024-08-31/functions/{FunctionName}/recursion-config", 200] },
  () => GetFunctionRecursionConfigRequest$,
  () => GetFunctionRecursionConfigResponse$
];
var GetFunctionScalingConfig$ = [
  9,
  n02,
  _GFSC,
  { [_h]: ["GET", "/2025-11-30/functions/{FunctionName}/function-scaling-config", 200] },
  () => GetFunctionScalingConfigRequest$,
  () => GetFunctionScalingConfigResponse$
];
var GetFunctionUrlConfig$ = [
  9,
  n02,
  _GFUC,
  { [_h]: ["GET", "/2021-10-31/functions/{FunctionName}/url", 200] },
  () => GetFunctionUrlConfigRequest$,
  () => GetFunctionUrlConfigResponse$
];
var GetLayerVersion$ = [
  9,
  n02,
  _GLV,
  { [_h]: ["GET", "/2018-10-31/layers/{LayerName}/versions/{VersionNumber}", 200] },
  () => GetLayerVersionRequest$,
  () => GetLayerVersionResponse$
];
var GetLayerVersionByArn$ = [
  9,
  n02,
  _GLVBA,
  { [_h]: ["GET", "/2018-10-31/layers?find=LayerVersion", 200] },
  () => GetLayerVersionByArnRequest$,
  () => GetLayerVersionResponse$
];
var GetLayerVersionPolicy$ = [
  9,
  n02,
  _GLVP,
  { [_h]: ["GET", "/2018-10-31/layers/{LayerName}/versions/{VersionNumber}/policy", 200] },
  () => GetLayerVersionPolicyRequest$,
  () => GetLayerVersionPolicyResponse$
];
var GetPolicy$ = [
  9,
  n02,
  _GP,
  { [_h]: ["GET", "/2015-03-31/functions/{FunctionName}/policy", 200] },
  () => GetPolicyRequest$,
  () => GetPolicyResponse$
];
var GetProvisionedConcurrencyConfig$ = [
  9,
  n02,
  _GPCC,
  { [_h]: ["GET", "/2019-09-30/functions/{FunctionName}/provisioned-concurrency", 200] },
  () => GetProvisionedConcurrencyConfigRequest$,
  () => GetProvisionedConcurrencyConfigResponse$
];
var GetResourcePolicy$ = [
  9,
  n02,
  _GRP,
  { [_h]: ["GET", "/2026-07-09/resource-policy/{ResourceArn}", 200] },
  () => GetResourcePolicyRequest$,
  () => GetResourcePolicyResponse$
];
var GetRuntimeManagementConfig$ = [
  9,
  n02,
  _GRMC,
  { [_h]: ["GET", "/2021-07-20/functions/{FunctionName}/runtime-management-config", 200] },
  () => GetRuntimeManagementConfigRequest$,
  () => GetRuntimeManagementConfigResponse$
];
var Invoke$ = [
  9,
  n02,
  _In,
  { [_h]: ["POST", "/2015-03-31/functions/{FunctionName}/invocations", 200] },
  () => InvocationRequest$,
  () => InvocationResponse$
];
var InvokeAsync$ = [
  9,
  n02,
  _IAn,
  { [_h]: ["POST", "/2014-11-13/functions/{FunctionName}/invoke-async", 202] },
  () => InvokeAsyncRequest$,
  () => InvokeAsyncResponse$
];
var InvokeWithResponseStream$ = [
  9,
  n02,
  _IWRS,
  { [_h]: ["POST", "/2021-11-15/functions/{FunctionName}/response-streaming-invocations", 200] },
  () => InvokeWithResponseStreamRequest$,
  () => InvokeWithResponseStreamResponse$
];
var ListAliases$ = [
  9,
  n02,
  _LAi,
  { [_h]: ["GET", "/2015-03-31/functions/{FunctionName}/aliases", 200] },
  () => ListAliasesRequest$,
  () => ListAliasesResponse$
];
var ListCapacityProviders$ = [
  9,
  n02,
  _LCP,
  { [_h]: ["GET", "/2025-11-30/capacity-providers", 200] },
  () => ListCapacityProvidersRequest$,
  () => ListCapacityProvidersResponse$
];
var ListCodeSigningConfigs$ = [
  9,
  n02,
  _LCSC,
  { [_h]: ["GET", "/2020-04-22/code-signing-configs", 200] },
  () => ListCodeSigningConfigsRequest$,
  () => ListCodeSigningConfigsResponse$
];
var ListDurableExecutionsByFunction$ = [
  9,
  n02,
  _LDEBF,
  { [_h]: ["GET", "/2025-12-01/functions/{FunctionName}/durable-executions", 200] },
  () => ListDurableExecutionsByFunctionRequest$,
  () => ListDurableExecutionsByFunctionResponse$
];
var ListEventSourceMappings$ = [
  9,
  n02,
  _LESM,
  { [_h]: ["GET", "/2015-03-31/event-source-mappings", 200] },
  () => ListEventSourceMappingsRequest$,
  () => ListEventSourceMappingsResponse$
];
var ListFunctionEventInvokeConfigs$ = [
  9,
  n02,
  _LFEIC,
  { [_h]: ["GET", "/2019-09-25/functions/{FunctionName}/event-invoke-config/list", 200] },
  () => ListFunctionEventInvokeConfigsRequest$,
  () => ListFunctionEventInvokeConfigsResponse$
];
var ListFunctions$ = [
  9,
  n02,
  _LFi,
  { [_h]: ["GET", "/2015-03-31/functions", 200] },
  () => ListFunctionsRequest$,
  () => ListFunctionsResponse$
];
var ListFunctionsByCodeSigningConfig$ = [
  9,
  n02,
  _LFBCSC,
  { [_h]: ["GET", "/2020-04-22/code-signing-configs/{CodeSigningConfigArn}/functions", 200] },
  () => ListFunctionsByCodeSigningConfigRequest$,
  () => ListFunctionsByCodeSigningConfigResponse$
];
var ListFunctionUrlConfigs$ = [
  9,
  n02,
  _LFUC,
  { [_h]: ["GET", "/2021-10-31/functions/{FunctionName}/urls", 200] },
  () => ListFunctionUrlConfigsRequest$,
  () => ListFunctionUrlConfigsResponse$
];
var ListFunctionVersionsByCapacityProvider$ = [
  9,
  n02,
  _LFVBCP,
  { [_h]: ["GET", "/2025-11-30/capacity-providers/{CapacityProviderName}/function-versions", 200] },
  () => ListFunctionVersionsByCapacityProviderRequest$,
  () => ListFunctionVersionsByCapacityProviderResponse$
];
var ListLayers$ = [
  9,
  n02,
  _LLi,
  { [_h]: ["GET", "/2018-10-31/layers", 200] },
  () => ListLayersRequest$,
  () => ListLayersResponse$
];
var ListLayerVersions$ = [
  9,
  n02,
  _LLV,
  { [_h]: ["GET", "/2018-10-31/layers/{LayerName}/versions", 200] },
  () => ListLayerVersionsRequest$,
  () => ListLayerVersionsResponse$
];
var ListProvisionedConcurrencyConfigs$ = [
  9,
  n02,
  _LPCC,
  { [_h]: ["GET", "/2019-09-30/functions/{FunctionName}/provisioned-concurrency?List=ALL", 200] },
  () => ListProvisionedConcurrencyConfigsRequest$,
  () => ListProvisionedConcurrencyConfigsResponse$
];
var ListTags$ = [
  9,
  n02,
  _LTi,
  { [_h]: ["GET", "/2017-03-31/tags/{Resource}", 200] },
  () => ListTagsRequest$,
  () => ListTagsResponse$
];
var ListVersionsByFunction$ = [
  9,
  n02,
  _LVBF,
  { [_h]: ["GET", "/2015-03-31/functions/{FunctionName}/versions", 200] },
  () => ListVersionsByFunctionRequest$,
  () => ListVersionsByFunctionResponse$
];
var PublishLayerVersion$ = [
  9,
  n02,
  _PLV,
  { [_h]: ["POST", "/2018-10-31/layers/{LayerName}/versions", 201] },
  () => PublishLayerVersionRequest$,
  () => PublishLayerVersionResponse$
];
var PublishVersion$ = [
  9,
  n02,
  _PV,
  { [_h]: ["POST", "/2015-03-31/functions/{FunctionName}/versions", 201] },
  () => PublishVersionRequest$,
  () => FunctionConfiguration$
];
var PutFunctionCodeSigningConfig$ = [
  9,
  n02,
  _PFCSC,
  { [_h]: ["PUT", "/2020-06-30/functions/{FunctionName}/code-signing-config", 200] },
  () => PutFunctionCodeSigningConfigRequest$,
  () => PutFunctionCodeSigningConfigResponse$
];
var PutFunctionConcurrency$ = [
  9,
  n02,
  _PFC,
  { [_h]: ["PUT", "/2017-10-31/functions/{FunctionName}/concurrency", 200] },
  () => PutFunctionConcurrencyRequest$,
  () => Concurrency$
];
var PutFunctionEventInvokeConfig$ = [
  9,
  n02,
  _PFEIC,
  { [_h]: ["PUT", "/2019-09-25/functions/{FunctionName}/event-invoke-config", 200] },
  () => PutFunctionEventInvokeConfigRequest$,
  () => FunctionEventInvokeConfig$
];
var PutFunctionRecursionConfig$ = [
  9,
  n02,
  _PFRC,
  { [_h]: ["PUT", "/2024-08-31/functions/{FunctionName}/recursion-config", 200] },
  () => PutFunctionRecursionConfigRequest$,
  () => PutFunctionRecursionConfigResponse$
];
var PutFunctionScalingConfig$ = [
  9,
  n02,
  _PFSC,
  { [_h]: ["PUT", "/2025-11-30/functions/{FunctionName}/function-scaling-config", 202] },
  () => PutFunctionScalingConfigRequest$,
  () => PutFunctionScalingConfigResponse$
];
var PutProvisionedConcurrencyConfig$ = [
  9,
  n02,
  _PPCC,
  { [_h]: ["PUT", "/2019-09-30/functions/{FunctionName}/provisioned-concurrency", 202] },
  () => PutProvisionedConcurrencyConfigRequest$,
  () => PutProvisionedConcurrencyConfigResponse$
];
var PutResourcePolicy$ = [
  9,
  n02,
  _PRP,
  { [_h]: ["PUT", "/2026-07-09/resource-policy/{ResourceArn}", 200] },
  () => PutResourcePolicyRequest$,
  () => PutResourcePolicyResponse$
];
var PutRuntimeManagementConfig$ = [
  9,
  n02,
  _PRMC,
  { [_h]: ["PUT", "/2021-07-20/functions/{FunctionName}/runtime-management-config", 200] },
  () => PutRuntimeManagementConfigRequest$,
  () => PutRuntimeManagementConfigResponse$
];
var RemoveLayerVersionPermission$ = [
  9,
  n02,
  _RLVP,
  { [_h]: ["DELETE", "/2018-10-31/layers/{LayerName}/versions/{VersionNumber}/policy/{StatementId}", 204] },
  () => RemoveLayerVersionPermissionRequest$,
  () => __Unit
];
var RemovePermission$ = [
  9,
  n02,
  _RP,
  { [_h]: ["DELETE", "/2015-03-31/functions/{FunctionName}/policy/{StatementId}", 204] },
  () => RemovePermissionRequest$,
  () => __Unit
];
var SendDurableExecutionCallbackFailure$ = [
  9,
  n02,
  _SDECF,
  { [_h]: ["POST", "/2025-12-01/durable-execution-callbacks/{CallbackId}/fail", 200] },
  () => SendDurableExecutionCallbackFailureRequest$,
  () => SendDurableExecutionCallbackFailureResponse$
];
var SendDurableExecutionCallbackHeartbeat$ = [
  9,
  n02,
  _SDECH,
  { [_h]: ["POST", "/2025-12-01/durable-execution-callbacks/{CallbackId}/heartbeat", 200] },
  () => SendDurableExecutionCallbackHeartbeatRequest$,
  () => SendDurableExecutionCallbackHeartbeatResponse$
];
var SendDurableExecutionCallbackSuccess$ = [
  9,
  n02,
  _SDECS,
  { [_h]: ["POST", "/2025-12-01/durable-execution-callbacks/{CallbackId}/succeed", 200] },
  () => SendDurableExecutionCallbackSuccessRequest$,
  () => SendDurableExecutionCallbackSuccessResponse$
];
var StopDurableExecution$ = [
  9,
  n02,
  _SDE,
  { [_h]: ["POST", "/2025-12-01/durable-executions/{DurableExecutionArn}/stop", 200] },
  () => StopDurableExecutionRequest$,
  () => StopDurableExecutionResponse$
];
var TagResource$ = [
  9,
  n02,
  _TR,
  { [_h]: ["POST", "/2017-03-31/tags/{Resource}", 204] },
  () => TagResourceRequest$,
  () => __Unit
];
var UntagResource$ = [
  9,
  n02,
  _UR,
  { [_h]: ["DELETE", "/2017-03-31/tags/{Resource}", 204] },
  () => UntagResourceRequest$2,
  () => __Unit
];
var UpdateAlias$ = [
  9,
  n02,
  _UA,
  { [_h]: ["PUT", "/2015-03-31/functions/{FunctionName}/aliases/{Name}", 200] },
  () => UpdateAliasRequest$,
  () => AliasConfiguration$
];
var UpdateCapacityProvider$ = [
  9,
  n02,
  _UCP,
  { [_h]: ["PUT", "/2025-11-30/capacity-providers/{CapacityProviderName}", 202] },
  () => UpdateCapacityProviderRequest$,
  () => UpdateCapacityProviderResponse$
];
var UpdateCodeSigningConfig$ = [
  9,
  n02,
  _UCSC,
  { [_h]: ["PUT", "/2020-04-22/code-signing-configs/{CodeSigningConfigArn}", 200] },
  () => UpdateCodeSigningConfigRequest$,
  () => UpdateCodeSigningConfigResponse$
];
var UpdateEventSourceMapping$ = [
  9,
  n02,
  _UESM,
  { [_h]: ["PUT", "/2015-03-31/event-source-mappings/{UUID}", 202] },
  () => UpdateEventSourceMappingRequest$,
  () => EventSourceMappingConfiguration$
];
var UpdateFunctionCode$ = [
  9,
  n02,
  _UFC,
  { [_h]: ["PUT", "/2015-03-31/functions/{FunctionName}/code", 200] },
  () => UpdateFunctionCodeRequest$,
  () => FunctionConfiguration$
];
var UpdateFunctionConfiguration$ = [
  9,
  n02,
  _UFCp,
  { [_h]: ["PUT", "/2015-03-31/functions/{FunctionName}/configuration", 200] },
  () => UpdateFunctionConfigurationRequest$,
  () => FunctionConfiguration$
];
var UpdateFunctionEventInvokeConfig$ = [
  9,
  n02,
  _UFEIC,
  { [_h]: ["POST", "/2019-09-25/functions/{FunctionName}/event-invoke-config", 200] },
  () => UpdateFunctionEventInvokeConfigRequest$,
  () => FunctionEventInvokeConfig$
];
var UpdateFunctionUrlConfig$ = [
  9,
  n02,
  _UFUC,
  { [_h]: ["PUT", "/2021-10-31/functions/{FunctionName}/url", 200] },
  () => UpdateFunctionUrlConfigRequest$,
  () => UpdateFunctionUrlConfigResponse$
];

// node_modules/@aws-sdk/client-lambda/dist-es/runtimeConfig.shared.js
var getRuntimeConfig3 = (config) => {
  return {
    apiVersion: "2015-03-31",
    base64Decoder: config?.base64Decoder ?? fromBase64,
    base64Encoder: config?.base64Encoder ?? toBase64,
    disableHostPrefix: config?.disableHostPrefix ?? false,
    endpointProvider: config?.endpointProvider ?? defaultEndpointResolver2,
    extensions: config?.extensions ?? [],
    httpAuthSchemeProvider: config?.httpAuthSchemeProvider ?? defaultLambdaHttpAuthSchemeProvider,
    httpAuthSchemes: config?.httpAuthSchemes ?? [
      {
        schemeId: "aws.auth#sigv4",
        identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4"),
        signer: new AwsSdkSigV4Signer()
      }
    ],
    logger: config?.logger ?? new NoOpLogger(),
    protocol: config?.protocol ?? AwsRestJsonProtocol,
    protocolSettings: config?.protocolSettings ?? {
      defaultNamespace: "com.amazonaws.lambda",
      errorTypeRegistries: errorTypeRegistries2,
      version: "2015-03-31",
      serviceTarget: "AWSGirApiService"
    },
    serviceId: config?.serviceId ?? "Lambda",
    sha256: config?.sha256 ?? Sha256WebCrypto,
    urlParser: config?.urlParser ?? parseUrl,
    utf8Decoder: config?.utf8Decoder ?? fromUtf8,
    utf8Encoder: config?.utf8Encoder ?? toUtf8
  };
};

// node_modules/@aws-sdk/client-lambda/dist-es/runtimeConfig.browser.js
var getRuntimeConfig4 = (config) => {
  const defaultsMode = resolveDefaultsModeConfig(config);
  const defaultConfigProvider = () => defaultsMode().then(loadConfigsForDefaultMode);
  const clientSharedValues = getRuntimeConfig3(config);
  return {
    ...clientSharedValues,
    ...config,
    runtime: "browser",
    defaultsMode,
    bodyLengthChecker: config?.bodyLengthChecker ?? calculateBodyLength,
    credentialDefaultProvider: config?.credentialDefaultProvider ?? ((_) => () => Promise.reject(new Error("Credential is missing"))),
    defaultUserAgentProvider: config?.defaultUserAgentProvider ?? createDefaultUserAgentProvider({ serviceId: clientSharedValues.serviceId, clientVersion: package_default2.version }),
    eventStreamSerdeProvider: config?.eventStreamSerdeProvider ?? eventStreamSerdeProvider2,
    maxAttempts: config?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
    region: config?.region ?? invalidProvider("Region is missing"),
    requestHandler: FetchHttpHandler.create(config?.requestHandler ?? defaultConfigProvider),
    retryMode: config?.retryMode ?? (async () => (await defaultConfigProvider()).retryMode || DEFAULT_RETRY_MODE),
    streamCollector: config?.streamCollector ?? streamCollector,
    useDualstackEndpoint: config?.useDualstackEndpoint ?? (() => Promise.resolve(DEFAULT_USE_DUALSTACK_ENDPOINT)),
    useFipsEndpoint: config?.useFipsEndpoint ?? (() => Promise.resolve(DEFAULT_USE_FIPS_ENDPOINT))
  };
};

// node_modules/@aws-sdk/client-lambda/dist-es/auth/httpAuthExtensionConfiguration.js
var getHttpAuthExtensionConfiguration2 = (runtimeConfig) => {
  const _httpAuthSchemes = runtimeConfig.httpAuthSchemes;
  let _httpAuthSchemeProvider = runtimeConfig.httpAuthSchemeProvider;
  let _credentials = runtimeConfig.credentials;
  return {
    setHttpAuthScheme(httpAuthScheme) {
      const index = _httpAuthSchemes.findIndex((scheme) => scheme.schemeId === httpAuthScheme.schemeId);
      if (index === -1) {
        _httpAuthSchemes.push(httpAuthScheme);
      } else {
        _httpAuthSchemes.splice(index, 1, httpAuthScheme);
      }
    },
    httpAuthSchemes() {
      return _httpAuthSchemes;
    },
    setHttpAuthSchemeProvider(httpAuthSchemeProvider) {
      _httpAuthSchemeProvider = httpAuthSchemeProvider;
    },
    httpAuthSchemeProvider() {
      return _httpAuthSchemeProvider;
    },
    setCredentials(credentials) {
      _credentials = credentials;
    },
    credentials() {
      return _credentials;
    }
  };
};
var resolveHttpAuthRuntimeConfig2 = (config) => {
  return {
    httpAuthSchemes: config.httpAuthSchemes(),
    httpAuthSchemeProvider: config.httpAuthSchemeProvider(),
    credentials: config.credentials()
  };
};

// node_modules/@aws-sdk/client-lambda/dist-es/runtimeExtensions.js
var resolveRuntimeExtensions2 = (runtimeConfig, extensions) => {
  const extensionConfiguration = Object.assign(getAwsRegionExtensionConfiguration(runtimeConfig), getDefaultExtensionConfiguration(runtimeConfig), getHttpHandlerExtensionConfiguration(runtimeConfig), getHttpAuthExtensionConfiguration2(runtimeConfig));
  extensions.forEach((extension) => extension.configure(extensionConfiguration));
  return Object.assign(runtimeConfig, resolveAwsRegionExtensionConfiguration(extensionConfiguration), resolveDefaultRuntimeConfig2(extensionConfiguration), resolveHttpHandlerRuntimeConfig(extensionConfiguration), resolveHttpAuthRuntimeConfig2(extensionConfiguration));
};

// node_modules/@aws-sdk/client-lambda/dist-es/LambdaClient.js
var LambdaClient = class extends Client {
  constructor(...[configuration]) {
    const _config_0 = getRuntimeConfig4(configuration || {});
    super(_config_0);
    __publicField(this, "config");
    this.initConfig = _config_0;
    const _config_1 = resolveClientEndpointParameters2(_config_0);
    const _config_2 = resolveUserAgentConfig(_config_1);
    const _config_3 = resolveRetryConfig(_config_2);
    const _config_4 = resolveRegionConfig(_config_3);
    const _config_5 = resolveHostHeaderConfig(_config_4);
    const _config_6 = resolveEndpointConfig(_config_5);
    const _config_7 = resolveEventStreamSerdeConfig(_config_6);
    const _config_8 = resolveHttpAuthSchemeConfig2(_config_7);
    const _config_9 = resolveRuntimeExtensions2(_config_8, configuration?.extensions || []);
    this.config = _config_9;
    this.middlewareStack.use(getSchemaSerdePlugin(this.config));
    this.middlewareStack.use(getUserAgentPlugin(this.config));
    this.middlewareStack.use(getRetryPlugin(this.config));
    this.middlewareStack.use(getContentLengthPlugin(this.config));
    this.middlewareStack.use(getHostHeaderPlugin(this.config));
    this.middlewareStack.use(getLoggerPlugin(this.config));
    this.middlewareStack.use(getRecursionDetectionPlugin(this.config));
    this.middlewareStack.use(getHttpAuthSchemeEndpointRuleSetPlugin(this.config, {
      httpAuthSchemeParametersProvider: defaultLambdaHttpAuthSchemeParametersProvider,
      identityProviderConfigProvider: async (config) => new DefaultIdentityProviderConfig({
        "aws.auth#sigv4": config.credentials
      })
    }));
    this.middlewareStack.use(getHttpSigningPlugin(this.config));
  }
  destroy() {
    super.destroy();
  }
};

// node_modules/@aws-sdk/client-lambda/dist-es/commandBuilder.js
init_index_browser();
var command2 = makeBuilder(commonParams2, "AWSGirApiService", "LambdaClient", getEndpointPlugin);
var _ep02 = {};
var _mw02 = (Command2, cs, config, o) => [];

// node_modules/@aws-sdk/client-lambda/dist-es/commands/InvokeCommand.js
var InvokeCommand = class extends command2(_ep02, _mw02, "Invoke", Invoke$) {
};

// provision_gva.js
var LAMBDA_TARGETS = {
  dev: { name: "k8s-dev-gva-provisioning-service", region: "us-west-2" }
};
var GVA_TYPES = ["CHAT", "PHONE", "OA", "EA"];
var REQUIRED_STRINGS = [
  "env",
  "client_name",
  "language_country",
  "bot_category",
  "gva_type",
  "cms_base_customer_name",
  "atlas_existing_customer",
  "domain",
  "gva_generation",
  "account_id",
  "site_id"
];
var BOOLEAN_FLAGS = ["big_enabled", "use_template_content", "copy_instance_usergoals"];
var cachedCreds = null;
var cachedAt = 0;
var CACHE_MS = 10 * 60 * 1e3;
async function onInvoke(request, env) {
  const started = Date.now();
  try {
    let envelope = {};
    try {
      envelope = await request.json();
    } catch (e3) {
      return Response.json({ success: false, error: "Failed to parse request body" });
    }
    let payload = {};
    try {
      payload = typeof envelope.payload === "string" ? JSON.parse(envelope.payload) : envelope.payload || {};
    } catch (e3) {
      return Response.json({ success: false, error: "Failed to parse inner payload string" });
    }
    const { issueKey, params } = payload;
    if (envelope.invoker) console.log("Invoked by:", JSON.stringify(envelope.invoker));
    console.log(`Provisioning request for ticket: ${issueKey}`);
    const validationError = validateParams(issueKey, params);
    if (validationError) {
      return Response.json({ success: false, error: validationError, durationMs: Date.now() - started });
    }
    const target = LAMBDA_TARGETS[params.env];
    const jobId = crypto.randomUUID();
    const lambdaPayload = buildLambdaPayload(params, issueKey, jobId);
    console.log(`Job ${jobId}: invoking ${target.name} (${target.region}) with`, JSON.stringify(lambdaPayload));
    const credentials = await getProvisioningCreds(env);
    const lambda = new LambdaClient({ region: target.region, credentials });
    const result = await lambda.send(new InvokeCommand({
      FunctionName: target.name,
      InvocationType: "Event",
      Payload: new TextEncoder().encode(JSON.stringify(lambdaPayload))
    }));
    if (result.StatusCode !== 202) {
      throw new Error(`Unexpected Lambda status code ${result.StatusCode}`);
    }
    console.log(`Job ${jobId}: accepted by ${target.name}`);
    return Response.json({
      success: true,
      jobId,
      lambda: target.name,
      statusCode: result.StatusCode,
      durationMs: Date.now() - started
    });
  } catch (error) {
    console.error("Orchestrator Error:", error);
    return Response.json({
      success: false,
      error: `${error.name}: ${error.message}`,
      durationMs: Date.now() - started
    });
  }
}
function validateParams(issueKey, params) {
  if (!issueKey || typeof issueKey !== "string") return "Missing issueKey";
  if (!params || typeof params !== "object") return "Missing params";
  for (const field of REQUIRED_STRINGS) {
    if (typeof params[field] !== "string" || !params[field].trim()) return `Missing or empty param "${field}"`;
  }
  for (const flag of BOOLEAN_FLAGS) {
    if (typeof params[flag] !== "boolean") return `Param "${flag}" must be true or false`;
  }
  if (!LAMBDA_TARGETS[params.env]) {
    return `Environment "${params.env}" is not allowed. Allowed: ${Object.keys(LAMBDA_TARGETS).join(", ")}`;
  }
  if (!GVA_TYPES.includes(params.gva_type)) return `Invalid gva_type "${params.gva_type}"`;
  return null;
}
function buildLambdaPayload(params, issueKey, jobId) {
  const payload = {};
  for (const field of REQUIRED_STRINGS) {
    if (field !== "env") payload[field] = params[field].trim();
  }
  payload.big_enabled = params.big_enabled ? "true" : "false";
  payload.use_template_content = params.use_template_content;
  payload.copy_instance_usergoals = params.copy_instance_usergoals;
  payload.job_id = jobId;
  payload.ticket = issueKey;
  return payload;
}
async function getProvisioningCreds(env) {
  if (cachedCreds && Date.now() - cachedAt < CACHE_MS) {
    console.log("Using cached provisioning credentials.");
    return cachedCreds;
  }
  for (const key of ["aws:accessKeyId", "aws:secretAccessKey", "AWS_REGION", "GVA_DEV_SECRET_ID"]) {
    if (!env[key]) throw new Error(`Missing env var ${key}`);
  }
  console.log("Fetching provisioning credentials from AWS Secrets Manager...");
  const sm = new SecretsManagerClient({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env["aws:accessKeyId"],
      secretAccessKey: env["aws:secretAccessKey"]
    }
  });
  const res = await sm.send(new GetSecretValueCommand({ SecretId: env.GVA_DEV_SECRET_ID }));
  const secret = JSON.parse(res.SecretString);
  if (!secret.AWS_ACCESS_KEY_ID || !secret.AWS_SECRET_ACCESS_KEY) {
    throw new Error("The provisioning secret does not contain AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY");
  }
  cachedCreds = {
    accessKeyId: secret.AWS_ACCESS_KEY_ID,
    secretAccessKey: secret.AWS_SECRET_ACCESS_KEY
  };
  cachedAt = Date.now();
  return cachedCreds;
}
export {
  onInvoke
};
