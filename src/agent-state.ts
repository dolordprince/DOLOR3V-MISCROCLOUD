export type VisualPlan = {
  project?: Record<string, unknown>;
  visualIdentity?: Record<string, unknown>;
  typography?: Record<string, unknown>;
  colors?: Record<string, unknown>;
  layout?: Record<string, unknown>;
  pages?: unknown[];
  components?: unknown[];
  visualAssets?: unknown[];
  imageGeneration?: Record<string, unknown>;
  threeD?: Record<string, unknown>;
  motion?: Record<string, unknown>;
  responsive?: Record<string, unknown>;
  accessibility?: Record<string, unknown>;
  preview?: Record<string, unknown>;
  validation?: Record<string, unknown>;
  [key: string]: unknown;
};

export type MicrocloudAgentState = {
  status: "idle" | "planning" | "building" | "testing" | "complete" | "error";
  protocolVersion: string;
  sessionId: string | null;
  visualPlan: VisualPlan | null;
  lastAction: string | null;
  lastError: string | null;
  updatedAt: number;
};

export const INITIAL_AGENT_STATE: MicrocloudAgentState = {
  status: "idle",
  protocolVersion: "0.9.0",
  sessionId: null,
  visualPlan: null,
  lastAction: null,
  lastError: null,
  updatedAt: Date.now(),
};
