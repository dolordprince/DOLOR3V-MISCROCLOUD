import { routeAgentRequest } from "agents";
import { MicrocloudAgentDO } from "./agent";
import { generatePollinationsText, generatePollinationsImage } from "./pollinations";
import { runBrowserAutomation } from "./browser";
import { dashboardHtml } from "./dashboard";

export { MicrocloudAgentDO };

interface Env {
  MicrocloudAgentDO: DurableObjectNamespace;
  BROWSER: Parameters<typeof import("@cloudflare/puppeteer").launch>[0];
  POLLINATIONS_API_KEY?: string;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    /*
     * Explicit application routes MUST be handled before the
     * Cloudflare Agents router. routeAgentRequest is reserved for
     * /agents/* requests.
     */

    if (request.method === "GET" && (pathname === "/" || pathname === "/dashboard")) {
      return new Response(dashboardHtml(), {
        status: 200,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store",
        },
      });
    }

    if (request.method === "GET" && pathname === "/api/health") {
      return json({
        ok: true,
        service: "dolor3v-microcloud",
        version: "4.0.0",
        runtime: "cloudflare-workers",
        agents: true,
        durableObjects: true,
        sqlite: true,
        websocket: true,
        ahp: "0.9.0",
        browserRun: true,
        pollinations: true,
        timestamp: new Date().toISOString(),
      });
    }

    if (request.method === "GET" && pathname === "/health") {
      return json({
        ok: true,
        service: "dolor3v-microcloud",
        runtime: "cloudflare-workers",
      });
    }

    if (request.method === "GET" && pathname === "/v1/models") {
      return json({
        object: "list",
        data: [
          {
            id: "openai/gpt-5.4-nano",
            object: "model",
            created: 0,
            owned_by: "pollinations",
          },
        ],
      });
    }

    if (request.method === "POST" && pathname === "/api/ai") {
      try {
        const body = (await request.json()) as {
          prompt?: string;
          messages?: Array<{
            role: string;
            content: string;
          }>;
          model?: string;
        };

        let prompt = body.prompt ?? "";

        if (!prompt && Array.isArray(body.messages)) {
          prompt = body.messages
            .map((message) => `${message.role}: ${message.content}`)
            .join("\n");
        }

        if (!prompt.trim()) {
          return json(
            {
              ok: false,
              error: "prompt or messages is required",
            },
            400,
          );
        }

        const result = await generatePollinationsText(prompt, env);

        return json({
          ok: true,
          provider: "pollinations",
          result,
        });
      } catch (error) {
        return json(
          {
            ok: false,
            error: error instanceof Error ? error.message : String(error),
          },
          500,
        );
      }
    }

    if (request.method === "POST" && pathname === "/api/image") {
      try {
        const body = (await request.json()) as {
          prompt?: string;
          model?: string;
          width?: number;
          height?: number;
        };

        if (!body.prompt?.trim()) {
          return json(
            {
              ok: false,
              error: "prompt is required",
            },
            400,
          );
        }

        const result = await generatePollinationsImage(
          body.prompt,
          body.width ?? 1024,
          body.height ?? 768,
          env,
        );

        return json({
          ok: true,
          provider: "pollinations",
          result,
        });
      } catch (error) {
        return json(
          {
            ok: false,
            error: error instanceof Error ? error.message : String(error),
          },
          500,
        );
      }
    }

    if (request.method === "POST" && pathname === "/api/browser") {
      try {
        const body = (await request.json()) as Record<string, unknown>;
        const result = await runBrowserAutomation(
          env.BROWSER,
          JSON.stringify(body),
        );

        return json({
          ok: true,
          provider: "cloudflare-browser-run",
          result,
        });
      } catch (error) {
        return json(
          {
            ok: false,
            error: error instanceof Error ? error.message : String(error),
          },
          500,
        );
      }
    }

    /*
     * Real Cloudflare Agents routing.
     *
     * Expected route:
     * /agents/MicrocloudAgentDO/<agent-name>
     *
     * The default agent used by DOLOR3V is:
     * /agents/MicrocloudAgentDO/default
     */
    if (pathname.startsWith("/agents/")) {
      const agentResponse = await routeAgentRequest(request, env);

      if (agentResponse) {
        return agentResponse;
      }

      return json(
        {
          ok: false,
          error: "agent route not found",
          path: pathname,
        },
        404,
      );
    }

    return json(
      {
        ok: false,
        error: "not found",
        path: pathname,
      },
      404,
    );
  },
};
