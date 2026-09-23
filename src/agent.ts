import {
  Agent,
  type Connection,
  type ConnectionContext,
  type WSMessage,
} from "agents";

import {
  dispatchAHP,
} from "./ahp/dispatch";

import {
  AHP_PROTOCOL_VERSION,
  error,
  protocolInfo,
} from "./ahp/protocol";

import {
  INITIAL_AGENT_STATE,
  type MicrocloudAgentState,
} from "./agent-state";

import {
  generatePollinationsText,
} from "./pollinations";

export class MicrocloudAgentDO extends Agent<Env, MicrocloudAgentState> {
  initialState: MicrocloudAgentState = {
    ...INITIAL_AGENT_STATE,
    updatedAt: Date.now(),
  };

  async onStart() {
    if (!this.state.protocolVersion) {
      this.setState({
        ...INITIAL_AGENT_STATE,
        updatedAt: Date.now(),
      });
    }
  }

  async onRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.endsWith("/health")) {
      return Response.json({
        ok: true,
        service: "dolor3v-microcloud-agent",
        agent: "MicrocloudAgentDO",
        protocol: AHP_PROTOCOL_VERSION,
        instance: this.name,
        state: this.state.status,
        timestamp: Date.now(),
      });
    }

    if (url.pathname.endsWith("/state")) {
      return Response.json({
        ok: true,
        state: this.state,
      });
    }

    if (
      url.pathname.endsWith("/ahp") &&
      request.method === "POST"
    ) {
      let body: unknown;

      try {
        body = await request.json();
      } catch {
        return Response.json(
          error(null, -32700, "Invalid JSON"),
          { status: 400 },
        );
      }

      const result = await dispatchAHP(this, body);

      return Response.json(result, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    }

    if (url.pathname.endsWith("/protocol")) {
      return Response.json(protocolInfo());
    }

    return Response.json({
      ok: true,
      service: "dolor3v-microcloud-agent",
      endpoints: [
        "/health",
        "/state",
        "/protocol",
        "/ahp",
      ],
    });
  }

  async onConnect(
    connection: Connection,
    _ctx: ConnectionContext,
  ) {
    connection.send(
      JSON.stringify({
        type: "microcloud.connected",
        agent: "MicrocloudAgentDO",
        protocol: AHP_PROTOCOL_VERSION,
        connectionId: connection.id,
        timestamp: Date.now(),
      }),
    );
  }

  async onMessage(
    connection: Connection,
    message: WSMessage,
  ) {
    if (typeof message !== "string") {
      connection.send(
        JSON.stringify(
          error(null, -32600, "Binary messages are not supported"),
        ),
      );
      return;
    }

    let payload: unknown;

    try {
      payload = JSON.parse(message);
    } catch {
      connection.send(
        JSON.stringify(
          error(null, -32700, "Invalid JSON"),
        ),
      );
      return;
    }

    const result = await dispatchAHP(this, payload);

    connection.send(JSON.stringify(result));

    /*
     * Real Agent -> Pollinations execution path.
     *
     * AHP remains the protocol layer.
     * Cloudflare Agent remains the runtime/session layer.
     * Pollinations remains the existing AI provider.
     */
    if (
      typeof payload === "object" &&
      payload !== null
    ) {
      const message = payload as Record<string, unknown>;

      const method =
        typeof message.method === "string"
          ? message.method
          : "";

      if (
        method === "chat/turn" ||
        method === "chat/send" ||
        method === "chat/message"
      ) {
        const params =
          message.params &&
          typeof message.params === "object"
            ? message.params as Record<string, unknown>
            : {};

        const prompt =
          typeof params.prompt === "string"
            ? params.prompt
            : typeof params.text === "string"
              ? params.text
              : typeof params.message === "string"
                ? params.message
                : "";

        if (prompt.trim()) {
          try {
            const answer =
              await generatePollinationsText(
                prompt.trim(),
                this.env,
              );

            connection.send(
              JSON.stringify({
                jsonrpc: "2.0",
                method: "chat/message",
                params: {
                  role: "assistant",
                  content: answer,
                  provider: "pollinations",
                  timestamp: Date.now(),
                },
              }),
            );
          } catch (error) {
            connection.send(
              JSON.stringify({
                jsonrpc: "2.0",
                method: "chat/error",
                params: {
                  provider: "pollinations",
                  error:
                    error instanceof Error
                      ? error.message
                      : String(error),
                },
              }),
            );
          }
        }
      }
    }

    this.broadcast(
      JSON.stringify({
        type: "microcloud.state",
        state: this.state,
        timestamp: Date.now(),
      }),
      [connection.id],
    );
  }

  async onClose() {
    // Cloudflare Agents manages connection lifecycle.
  }
}
