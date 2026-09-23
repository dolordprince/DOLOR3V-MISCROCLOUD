import * as AHP from "@microsoft/agent-host-protocol";

export const AHP_PROTOCOL_VERSION = "0.9.0";

export type JsonRpcRequest = {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
};

export type JsonRpcResponse = {
  jsonrpc: "2.0";
  id?: string | number | null;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
};

export type AHPContext = {
  sessionId: string;
  connectedAt: number;
};

export function protocolInfo() {
  const packageInfo = AHP as Record<string, unknown>;

  return {
    name: "DOLOR3V Microcloud",
    protocol: "Agent Host Protocol",
    version: AHP_PROTOCOL_VERSION,
    implementation: "dolor3v-microcloud",
    packageLoaded: typeof packageInfo === "object",
  };
}

export function ok(id: string | number | null, result: unknown): JsonRpcResponse {
  return {
    jsonrpc: "2.0",
    id,
    result,
  };
}

export function error(
  id: string | number | null,
  code: number,
  message: string,
  data?: unknown,
): JsonRpcResponse {
  return {
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message,
      ...(data === undefined ? {} : { data }),
    },
  };
}

export function parseRpc(value: unknown): JsonRpcRequest {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid JSON-RPC request");
  }

  const v = value as Record<string, unknown>;

  if (v.jsonrpc !== "2.0") {
    throw new Error("JSON-RPC version must be 2.0");
  }

  if (
    (typeof v.id !== "string" &&
      typeof v.id !== "number" &&
      v.id !== null) ||
    typeof v.method !== "string"
  ) {
    throw new Error("Invalid JSON-RPC request shape");
  }

  return {
    jsonrpc: "2.0",
    id: v.id as string | number,
    method: v.method,
    params:
      v.params && typeof v.params === "object"
        ? (v.params as Record<string, unknown>)
        : undefined,
  };
}
