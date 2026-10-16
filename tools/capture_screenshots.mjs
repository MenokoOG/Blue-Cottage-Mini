#!/usr/bin/env node
/**
 * Captures the marketing screenshots in marketing/screenshots/.
 *
 *   npm run build && npx next start -p 3100     (in another terminal)
 *   node tools/capture_screenshots.mjs [baseUrl] [chromePath]
 *
 * Drives Chrome over the DevTools protocol with real device emulation. The
 * plain `--screenshot` flag cannot do phones: headless Chrome enforces a
 * minimum window width of about 500px, which crops a 390px layout.
 */
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.argv[2] ?? "http://localhost:3100";
const CHROME =
  process.argv[3] ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUT = fileURLToPath(new URL("../marketing/screenshots/", import.meta.url));
const PORT = 9333;

/** fit: size the image to the whole page; otherwise `height` is the viewport. */
const SHOTS = [
  { name: "desktop-01-home", path: "/", w: 1440, h: 900, dpr: 2 },
  { name: "desktop-02-agents", path: "/agents", w: 1440, fit: true, dpr: 2 },
  { name: "desktop-03-pattern-chon-ji", path: "/patterns/chon-ji", w: 1440, fit: true, dpr: 2 },
  { name: "desktop-04-pattern-yul-gok", path: "/patterns/yul-gok", w: 1440, fit: true, dpr: 2 },
  { name: "desktop-05-belt-yellow", path: "/belts/yellow", w: 1440, h: 900, dpr: 2 },
  { name: "desktop-06-quiz", path: "/quiz/dan-gun", w: 1440, h: 900, dpr: 2 },
  { name: "desktop-07-sources", path: "/sources", w: 1440, h: 1900, dpr: 2 },
  { name: "desktop-08-about", path: "/about", w: 1440, fit: true, dpr: 2 },
  { name: "mobile-01-home", path: "/", w: 390, h: 844, dpr: 3, mobile: true },
  { name: "mobile-02-agents", path: "/agents", w: 390, h: 1500, dpr: 3, mobile: true },
  { name: "mobile-03-pattern-chon-ji", path: "/patterns/chon-ji", w: 390, fit: true, dpr: 3, mobile: true },
  { name: "mobile-04-quiz", path: "/quiz/dan-gun", w: 390, h: 844, dpr: 3, mobile: true },
  // The shipped Open Graph card (src/app/opengraph-image.tsx), 1200x630.
  { name: "og-card-1200x630", path: "/opengraph-image", w: 1200, h: 630, dpr: 1 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

mkdirSync(OUT, { recursive: true });
const profile = mkdtempSync(join(tmpdir(), "bcm-shots-"));
const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

try {
  let targets;
  for (let i = 0; i < 40 && !targets; i++) {
    try {
      targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    } catch {
      await sleep(250);
    }
  }
  const page = targets?.find((t) => t.type === "page");
  if (!page) throw new Error("could not reach Chrome's DevTools endpoint");

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });
  let id = 0;
  const pending = new Map();
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    const p = msg.id !== undefined ? pending.get(msg.id) : undefined;
    if (p) {
      pending.delete(msg.id);
      if (msg.error) p.rej(new Error(msg.error.message));
      else p.res(msg.result);
    }
  };
  const cdp = (method, params = {}) =>
    new Promise((res, rej) => {
      const n = ++id;
      pending.set(n, { res, rej });
      ws.send(JSON.stringify({ id: n, method, params }));
    });
  const evaluate = async (expression) =>
    (await cdp("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result
      .value;

  await cdp("Page.enable");

  for (const s of SHOTS) {
    const device = (height) =>
      cdp("Emulation.setDeviceMetricsOverride", {
        width: s.w,
        height,
        deviceScaleFactor: s.dpr,
        mobile: Boolean(s.mobile),
      });
    await device(s.h ?? 900);
    await cdp("Page.navigate", { url: BASE + s.path });
    // Wait for load, then for every image (the video poster) to finish.
    await sleep(600);
    await evaluate(
      `new Promise(r => { const t = Date.now(); (function w(){ const im=[...document.images];
        if (document.readyState==='complete' && im.every(i=>i.complete) || Date.now()-t>8000) r(true);
        else setTimeout(w,100) })() })`,
    );
    await sleep(500);
    if (s.fit) {
      const h = await evaluate("document.documentElement.scrollHeight");
      await device(h);
      await sleep(300);
    }
    const { data } = await cdp("Page.captureScreenshot", { format: "png" });
    writeFileSync(join(OUT, `${s.name}.png`), Buffer.from(data, "base64"));
    console.log(`${s.name}.png`);
  }
  ws.close();
} finally {
  chrome.kill();
}
