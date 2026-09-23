const POLLINATIONS_BASE = "https://gen.pollinations.ai/v1";
const POLLINATIONS_IMAGE_BASE = "https://gen.pollinations.ai";

interface PollinationsMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface PollinationsResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
    type?: string;
    code?: string | number;
  };
}

function pollinationsKey(env?: Env): string | undefined {
  return env?.POLLINATIONS_API_KEY;
}

function requirePollinationsKey(env?: Env): string {
  const key = pollinationsKey(env);

  if (!key) {
    throw new Error("POLLINATIONS_API_KEY is not configured");
  }

  return key;
}

export async function generatePollinationsText(
  prompt: string,
  env?: Env,
): Promise<string> {
  const key = requirePollinationsKey(env);

  const messages: PollinationsMessage[] = [
    {
      role: "user",
      content: prompt,
    },
  ];

  const response = await fetch(
    `${POLLINATIONS_BASE}/chat/completions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-5.4-nano",
        messages,
        stream: false,
      }),
    },
  );

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(
      `Pollinations API ${response.status}: ${raw.slice(0, 1000)}`,
    );
  }

  let data: PollinationsResponse;

  try {
    data = JSON.parse(raw) as PollinationsResponse;
  } catch {
    throw new Error("Pollinations returned invalid JSON");
  }

  if (data.error) {
    throw new Error(
      data.error.message ?? "Pollinations API error",
    );
  }

  const content = data.choices?.[0]?.message?.content;

  if (
    typeof content !== "string" ||
    content.length === 0
  ) {
    throw new Error(
      "Pollinations response contained no assistant content",
    );
  }

  return content;
}

/*
 * Real server-side Pollinations image generation.
 *
 * The API key NEVER leaves the Worker.
 *
 * We fetch the generated image from the Worker and return a
 * data URL so the browser does not need the Pollinations key.
 */
export async function generatePollinationsImage(
  prompt: string,
  width = 1024,
  height = 768,
  env?: Env,
): Promise<string> {
  const cleanPrompt = prompt.trim();

  if (!cleanPrompt) {
    throw new Error("Image prompt is required");
  }

  const key = pollinationsKey(env);

  if (!key) {
    throw new Error("POLLINATIONS_API_KEY is not configured");
  }

  const safeWidth = Math.min(
    2048,
    Math.max(256, Math.floor(width)),
  );

  const safeHeight = Math.min(
    2048,
    Math.max(256, Math.floor(height)),
  );

  const response = await fetch(
    `${POLLINATIONS_BASE}/images/generations`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "black-forest-labs/flux.1-schnell",
        prompt: cleanPrompt,
        n: 1,
        size: `${safeWidth}x${safeHeight}`,
        response_format: "url",
      }),
    },
  );

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(
      `Pollinations Image API ${response.status}: ${raw.slice(0, 2000)}`,
    );
  }

  let data: {
    data?: Array<{
      url?: string;
      b64_json?: string;
    }>;
    error?: {
      message?: string;
      type?: string;
      code?: string | number;
    };
  };

  try {
    data = JSON.parse(raw) as typeof data;
  } catch {
    throw new Error("Pollinations Image API returned invalid JSON");
  }

  if (data.error) {
    throw new Error(
      data.error.message ?? "Pollinations Image API error",
    );
  }

  const imageUrl = data.data?.[0]?.url;

  if (typeof imageUrl !== "string" || imageUrl.length === 0) {
    throw new Error(
      "Pollinations Image API returned no image URL",
    );
  }

  return imageUrl;
}

export function buildPollinationsImageUrl(
  prompt: string,
  width = 1024,
  height = 768,
): string {
  return (
    `${POLLINATIONS_IMAGE_BASE}/prompt/` +
    `${encodeURIComponent(prompt.trim())}` +
    `?width=${Math.min(
      2048,
      Math.max(256, Math.floor(width)),
    )}` +
    `&height=${Math.min(
      2048,
      Math.max(256, Math.floor(height)),
    )}` +
    `&nologo=true`
  );
}
