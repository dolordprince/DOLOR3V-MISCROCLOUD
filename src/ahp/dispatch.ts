import {
  AHP_PROTOCOL_VERSION,
  error,
  ok,
  parseRpc,
  type JsonRpcResponse,
} from "./protocol";
import type { MicrocloudAgentState, VisualPlan } from "../agent-state";

type AgentLike = {
  state: MicrocloudAgentState;
  setState: (state: MicrocloudAgentState) => void;
};

function update(
  agent: AgentLike,
  patch: Partial<MicrocloudAgentState>,
) {
  agent.setState({
    ...agent.state,
    ...patch,
    updatedAt: Date.now(),
  });
}

export async function dispatchAHP(
  agent: AgentLike,
  raw: unknown,
): Promise<JsonRpcResponse> {
  let request;

  try {
    request = parseRpc(raw);
  } catch (e) {
    return error(
      null,
      -32600,
      e instanceof Error ? e.message : "Invalid request",
    );
  }

  const id = request.id;
  const params = request.params ?? {};

  try {
    switch (request.method) {
      case "initialize":
        return ok(id, {
          protocolVersion: AHP_PROTOCOL_VERSION,
          serverInfo: {
            name: "DOLOR3V Microcloud",
            version: "1.0.0",
          },
          capabilities: {
            sessions: true,
            subscriptions: true,
            reconnect: true,
            visualBuild: true,
            websocket: true,
          },
        });

      case "ping":
        return ok(id, {
          pong: true,
          protocolVersion: AHP_PROTOCOL_VERSION,
          timestamp: Date.now(),
        });

      case "session/create": {
        const sessionId =
          typeof params.sessionId === "string"
            ? params.sessionId
            : crypto.randomUUID();

        update(agent, {
          status: "idle",
          sessionId,
          lastAction: "session/create",
          lastError: null,
        });

        return ok(id, {
          sessionId,
          status: "created",
        });
      }

      case "session/dispose":
      case "session/disposeSession":
        update(agent, {
          sessionId: null,
          status: "idle",
          lastAction: request.method,
        });

        return ok(id, {
          disposed: true,
        });

      case "session/reconnect":
      case "reconnect":
        return ok(id, {
          sessionId: agent.state.sessionId,
          reconnected: Boolean(agent.state.sessionId),
          state: agent.state,
        });

      case "subscribe":
        return ok(id, {
          subscribed: true,
          sessionId: agent.state.sessionId,
          topics: params.topics ?? [],
        });

      case "state/get":
        return ok(id, {
          state: agent.state,
        });

      case "visualPlan/set": {
        const visualPlan = (params.visualPlan ?? params.plan) as VisualPlan;

        if (!visualPlan || typeof visualPlan !== "object") {
          return error(id, -32602, "visualPlan must be an object");
        }

        update(agent, {
          status: "planning",
          visualPlan,
          lastAction: "visualPlan/set",
          lastError: null,
        });

        return ok(id, {
          accepted: true,
          sourceOfTruth: "visualPlan",
          visualPlan,
        });
      }

      case "visualPlan/get":
        return ok(id, {
          visualPlan: agent.state.visualPlan,
        });

      case "build/status":
        return ok(id, {
          status: agent.state.status,
          lastAction: agent.state.lastAction,
          lastError: agent.state.lastError,
          updatedAt: agent.state.updatedAt,
        });

      default:
        return error(id, -32601, `Method not found: ${request.method}`);
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);

    update(agent, {
      status: "error",
      lastError: message,
      lastAction: request.method,
    });

    return error(id, -32000, message);
  }
}
