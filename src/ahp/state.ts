export interface AhpMessage {
  id: string;
  role: "system" | "user" | "assistant" | "tool";
  content: unknown;
  createdAt: string;
}

export interface AhpTurn {
  id: string;
  status: "queued" | "running" | "completed" | "failed";
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export interface AhpChatState {
  uri: string;
  messages: AhpMessage[];
  turns: AhpTurn[];
}

export interface AhpSessionState {
  uri: string;
  createdAt: string;
  updatedAt: string;
  status: "active" | "completed" | "disposed";
  chats: Record<string, AhpChatState>;
}

export interface AhpRootState {
  protocolVersion: string;
  service: "DOLOR3V Microcloud";
  sessions: Record<string, AhpSessionState>;
  visual: {
    version: number;
    nodes: unknown[];
    lights: unknown[];
    camera: Record<string, unknown>;
  };
}

export interface AhpRuntimeState extends AhpRootState {
  revision: number;
  updatedAt: string;
}

export function makeSessionUri(sessionId: string): string {
  return `ahp-session://${encodeURIComponent(sessionId)}`;
}

export function makeChatUri(
  sessionId: string,
  chatId: string
): string {
  return `ahp-chat://${encodeURIComponent(sessionId)}/${encodeURIComponent(chatId)}`;
}

export function createInitialState(): AhpRuntimeState {
  const now = new Date().toISOString();

  return {
    protocolVersion: "0.9.0",
    service: "DOLOR3V Microcloud",
    sessions: {},
    visual: {
      version: 0,
      nodes: [],
      lights: [],
      camera: {}
    },
    revision: 0,
    updatedAt: now
  };
}

export function rootSnapshot(
  state: AhpRuntimeState
): AhpRootState & {
  revision: number;
  updatedAt: string;
} {
  return {
    protocolVersion: state.protocolVersion,
    service: state.service,
    sessions: state.sessions,
    visual: state.visual,
    revision: state.revision,
    updatedAt: state.updatedAt
  };
}
