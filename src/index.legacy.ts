import { buildPollinationsImageUrl, generatePollinationsText } from "./pollinations";

export interface LegacyEnv {
  BROWSER: Fetcher;
  ASSETS?: Fetcher;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type",
    },
  });
}

function cors(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type",
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    if (request.method === "OPTIONS") return cors();

    // ── Health ──────────────────────────────────────────────────────────
    if (pathname === "/health") {
      return json({
        ok: true,
        service: "dolor3v-microcloud",
        version: "5.0.0",
        endpoints: [
          "POST /ai/text",
          "POST /ai/image",
          "POST /ai/build",
          "POST /browser/run",
          "POST /webmcp",
          "GET  /health",
        ],
      });
    }

    // ── AI Text ─────────────────────────────────────────────────────────
    if (pathname === "/ai/text" && request.method === "POST") {
      const body = await request.json() as { prompt?: string };
      if (!body.prompt?.trim()) return json({ ok: false, error: "prompt required" }, 400);
      const text = await generatePollinationsText(body.prompt.trim());
      return json({ ok: true, text });
    }

    // ── AI Image ────────────────────────────────────────────────────────
    if (pathname === "/ai/image" && request.method === "POST") {
      const body = await request.json() as { prompt?: string; width?: number; height?: number };
      if (!body.prompt?.trim()) return json({ ok: false, error: "prompt required" }, 400);
      const imageUrl = buildPollinationsImageUrl(
        body.prompt.trim(),
        body.width ?? 1200,
        body.height ?? 800,
      );
      return json({ ok: true, url: imageUrl });
    }

    // ── AI Build: JSON visual plan + image + 3D scene ───────────────────
    if (pathname === "/ai/build" && request.method === "POST") {
      const body = await request.json() as {
        prompt?: string;
        projectName?: string;
        style?: string;
      };
      if (!body.prompt?.trim()) return json({ ok: false, error: "prompt required" }, 400);

      const planPrompt = `
You are a senior AI product designer and engineer.
The user wants to build: ${body.prompt}
Project name: ${body.projectName ?? "DOLOR3V App"}
Visual style: ${body.style ?? "dark futuristic luxury"}

Respond ONLY with a single valid JSON object — no markdown, no explanation.

The JSON must include:
{
  "project": { "name": string, "description": string, "type": string },
  "visualIdentity": { "style": string, "mood": string, "direction": string },
  "colors": {
    "background": string, "surface": string, "elevated": string,
    "primary": string, "accent": string, "text": string,
    "muted": string, "border": string, "success": string, "error": string
  },
  "typography": {
    "display": string, "heading": string, "body": string, "label": string,
    "scale": { "display": string, "h1": string, "h2": string, "body": string }
  },
  "layout": { "type": string, "navigation": string, "sections": string[] },
  "pages": [{ "name": string, "route": string, "sections": string[] }],
  "components": [{ "name": string, "type": string, "purpose": string }],
  "imageAssets": [{ "name": string, "prompt": string, "width": number, "height": number, "purpose": string }],
  "threeD": {
    "enabled": boolean,
    "scene": string,
    "objects": [{ "name": string, "geometry": string, "material": string, "position": [number,number,number] }],
    "lights": [{ "type": string, "color": string, "intensity": number }],
    "camera": { "type": string, "position": [number,number,number], "fov": number },
    "animation": { "type": string, "speed": number }
  },
  "motion": { "entrance": string, "hover": string, "transition": string },
  "responsive": { "mobile": string, "tablet": string, "desktop": string }
}
`.trim();

      const planRaw = await generatePollinationsText(planPrompt);

      let plan: unknown;
      try {
        const match = planRaw.match(/\{[\s\S]*\}/);
        plan = match ? JSON.parse(match[0]) : JSON.parse(planRaw);
      } catch {
        return json({ ok: false, error: "AI plan parse failed", raw: planRaw.slice(0, 500) }, 502);
      }

      const p = plan as Record<string, unknown>;
      const imageAssets = (p.imageAssets as Array<{ name: string; prompt: string; width?: number; height?: number }> ?? []).map((a) => ({
        name: a.name,
        url: buildPollinationsImageUrl(a.prompt, a.width ?? 1200, a.height ?? 800),
        prompt: a.prompt,
      }));

      return json({
        ok: true,
        plan,
        imageAssets,
        threeD: p.threeD ?? null,
        colors: p.colors ?? null,
        typography: p.typography ?? null,
        ready: true,
      });
    }

    // ── Browser Run ─────────────────────────────────────────────────────
    if (pathname === "/browser/run" && request.method === "POST") {
      if (!env.BROWSER) return json({ ok: false, error: "Browser Run not bound" }, 503);
      const body = await request.json() as { url?: string; action?: string };
      if (!body.url) return json({ ok: false, error: "url required" }, 400);

      try {
        // @ts-ignore — Cloudflare Browser Run binding
        const { default: puppeteer } = await import("@cloudflare/puppeteer");
        const browser = await puppeteer.launch(env.BROWSER);
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        await page.goto(body.url, { waitUntil: "networkidle0", timeout: 30000 });
        const title = await page.title();
        const screenshot = await page.screenshot({ encoding: "base64", fullPage: false });
        const consoleErrors: string[] = [];
        page.on("console", (msg) => {
          if (msg.type() === "error") consoleErrors.push(msg.text());
        });
        await browser.close();
        return json({ ok: true, title, screenshot, consoleErrors, url: body.url });
      } catch (err) {
        return json({ ok: false, error: err instanceof Error ? err.message : String(err) }, 500);
      }
    }

    // ── WebMCP ──────────────────────────────────────────────────────────
    if (pathname === "/webmcp" && request.method === "POST") {
      const body = await request.json() as {
        tool?: string;
        input?: Record<string, unknown>;
      };
      if (!body.tool) return json({ ok: false, error: "tool required" }, 400);

      const tool = body.tool;
      const input = body.input ?? {};

      if (tool === "ai.text") {
        const prompt = input.prompt as string;
        if (!prompt) return json({ ok: false, error: "input.prompt required" }, 400);
        const text = await generatePollinationsText(prompt);
        return json({ ok: true, tool, output: { text } });
      }

      if (tool === "ai.image") {
        const prompt = input.prompt as string;
        if (!prompt) return json({ ok: false, error: "input.prompt required" }, 400);
        const url = buildPollinationsImageUrl(prompt, Number(input.width ?? 1200), Number(input.height ?? 800));
        return json({ ok: true, tool, output: { url } });
      }

      if (tool === "ai.build") {
        const buildReq = new Request(new URL("/ai/build", request.url).toString(), {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(input),
        });
        return this.fetch(buildReq, env);
      }

      if (tool === "browser.run") {
        const browserReq = new Request(new URL("/browser/run", request.url).toString(), {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(input),
        });
        return this.fetch(browserReq, env);
      }

      return json({ ok: false, error: `unknown tool: ${tool}` }, 404);
    }

    return json({ ok: false, error: "not found" }, 404);
  },
} satisfies {
  fetch(request: Request, env: Env): Promise<Response>;
};
