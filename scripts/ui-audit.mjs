import fs from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";

const routes = ["/", "/intake", "/dashboard", "/simulate", "/coverage", "/decode", "/claim", "/newcomer-guide"];
const desktopViewport = { width: 1440, height: 1200 };
const mobileViewport = { width: 390, height: 844 };
const outDir = path.join(process.cwd(), ".tmp", "playwright-ui-audit");
const baseUrl = process.env.UI_AUDIT_BASE_URL ?? "http://127.0.0.1:3000";

const profile = {
  visaStatus: "F1",
  hasSsn: false,
  drives: true,
  rents: true,
  zip: "85281",
  city: "Tempe",
  state: "AZ",
  monthlyIncome: 2800,
  checklist: [],
};

function routeLabel(route) {
  return route === "/" ? "home" : route.slice(1);
}

async function collectPageMetrics(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const candidates = Array.from(document.querySelectorAll("*"))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        const className =
          typeof element.className === "string"
            ? element.className
            : element.className?.baseVal ?? "";

        return {
          tag: element.tagName.toLowerCase(),
          className,
          text: element.textContent?.trim().slice(0, 80) ?? "",
          width: Math.round(rect.width),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          scrollWidth: element.scrollWidth,
          clientWidth: element.clientWidth,
          position: style.position,
        };
      })
      .filter(
        (item) =>
          item.right > window.innerWidth + 2 ||
          item.left < -2 ||
          item.scrollWidth > item.clientWidth + 2,
      )
      .slice(0, 30);

    return {
      title: document.title,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      docClientWidth: doc.clientWidth,
      docScrollWidth: doc.scrollWidth,
      bodyScrollWidth: body.scrollWidth,
      hasHorizontalOverflow: doc.scrollWidth > doc.clientWidth + 2,
      overflowing: candidates,
    };
  });
}

async function applyStorage(page, mode) {
  await page.addInitScript(
    ({ savedProfile, savedMode }) => {
      window.localStorage.setItem("arrivesafe-view-mode", savedMode);
      window.localStorage.setItem("arrivesafe-dashboard-built", JSON.stringify(true));
      window.localStorage.setItem("arrivesafe-profile", JSON.stringify(savedProfile));
    },
    { savedProfile: profile, savedMode: mode },
  );
}

async function runViewportAudit(browser, label, viewport, mode) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  await applyStorage(page, mode);

  const report = [];
  const consoleMessages = [];
  const pageErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleMessages.push(message.text());
    }
  });

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  for (const route of routes) {
    const url = `${baseUrl}${route}`;
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForSelector(".sf-topbar", { timeout: 5000 }).catch(() => null);
    await page.waitForTimeout(300);
    const fileName = `${label}-${routeLabel(route)}.png`;
    await page.screenshot({
      path: path.join(outDir, fileName),
      fullPage: true,
    });
    const metrics = await collectPageMetrics(page);
    report.push({
      route,
      viewport: label,
      mode,
      screenshot: fileName,
      consoleErrors: [...consoleMessages],
      pageErrors: [...pageErrors],
      ...metrics,
    });
    consoleMessages.length = 0;
    pageErrors.length = 0;
  }

  await context.close();
  return report;
}

await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const report = [
  ...(await runViewportAudit(browser, "desktop", desktopViewport, "website")),
  ...(await runViewportAudit(browser, "mobile", mobileViewport, "website")),
];
await browser.close();

await fs.writeFile(path.join(outDir, "report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
