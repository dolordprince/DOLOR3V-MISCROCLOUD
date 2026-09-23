import puppeteer from "@cloudflare/puppeteer";

export interface BrowserRunRequest {
  url?: string;
  action?: string;
  selector?: string;
  value?: string;
  script?: string;
  screenshot?: boolean;
  waitUntil?: "load" | "domcontentloaded" | "networkidle0" | "networkidle2";
}

function parseInput(input: string): BrowserRunRequest {
  try {
    const value = JSON.parse(input);

    if (!value || typeof value !== "object") {
      throw new Error("Browser request must be an object");
    }

    return value as BrowserRunRequest;
  } catch (error) {
    throw new Error(
      `Invalid browser request JSON: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function runBrowserAutomation(
  browserBinding: Parameters<typeof puppeteer.launch>[0],
  input: string
): Promise<unknown> {
  const request = parseInput(input);

  if (!request.url) {
    throw new Error("Browser Run requires url");
  }

  const browser = await puppeteer.launch(browserBinding);

  try {
    const page = await browser.newPage();

    const waitUntil = request.waitUntil ?? "domcontentloaded";

    await page.goto(request.url, {
      waitUntil
    });

    if (request.action === "click") {
      if (!request.selector) {
        throw new Error("click requires selector");
      }

      await page.click(request.selector);
    }

    if (request.action === "type") {
      if (!request.selector) {
        throw new Error("type requires selector");
      }

      if (request.value === undefined) {
        throw new Error("type requires value");
      }

      await page.type(request.selector, request.value);
    }

    if (request.action === "evaluate") {
      if (!request.script) {
        throw new Error("evaluate requires script");
      }

      const result = await page.evaluate(request.script);
      return {
        ok: true,
        url: page.url(),
        title: await page.title(),
        result
      };
    }

    const result: Record<string, unknown> = {
      ok: true,
      url: page.url(),
      title: await page.title()
    };

    if (request.screenshot) {
      const screenshot = await page.screenshot({
        type: "png",
        encoding: "base64"
      });

      result.screenshot = screenshot;
      result.screenshotEncoding = "base64";
    }

    return result;
  } finally {
    await browser.close();
  }
}
