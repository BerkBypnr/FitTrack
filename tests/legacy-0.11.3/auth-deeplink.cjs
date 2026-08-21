"use strict";

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

(async () => {
  const baseUrl = process.env.FITTRACK_TEST_URL || "http://127.0.0.1:4173";
  const launchOptions = { headless: true };
  if (process.env.FITTRACK_CHROME) launchOptions.executablePath = process.env.FITTRACK_CHROME;
  const browser = await chromium.launch(launchOptions);
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: "block" });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    window.FITTRACK_FORCE_CLOUD = true;
    let listener = null;
    window.Capacitor = {
      isNativePlatform: () => true,
      Plugins: {
        App: {
          addListener: async (_name, callback) => {
            listener = callback;
            window.__emitFitTrackAppUrl = (url) => listener({ url });
            return { remove: async () => { listener = null; } };
          },
          getLaunchUrl: async () => ({
            url: "com.fittracklabs.mobile://auth-callback#access_token=mock-member-access&refresh_token=mock-member-refresh&type=signup"
          })
        }
      }
    };
  });
  const mockSource = fs.readFileSync(path.join(__dirname, "mock-supabase.js"), "utf8");
  await page.route("**/vendor/supabase.min.js*", (route) => route.fulfill({ status: 200, contentType: "application/javascript", body: mockSource }));

  try {
    await page.goto(baseUrl, { waitUntil: "load" });
    await page.getByRole("heading", { name: "Antrenörüne bağlan." }).waitFor();
    const signedInId = await page.evaluate(() => window.__fittrackMock.session.user.id);
    assert(signedInId === "bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb", "Soğuk açılış doğrulama bağlantısı üyeyi oturuma almadı.");

    await page.evaluate(() => window.__emitFitTrackAppUrl("com.fittracklabs.mobile://auth-callback#access_token=mock-member-access&refresh_token=mock-member-refresh&type=recovery"));
    await page.getByRole("heading", { name: "Yeni şifreni belirle." }).waitFor();
    await page.locator("#newPassword").fill("YeniFitTrack-010!");
    await page.locator("#confirmPassword").fill("YeniFitTrack-010!");
    await page.getByRole("button", { name: "Şifreyi güncelle" }).click();
    await page.getByRole("heading", { name: "Antrenörüne bağlan." }).waitFor();
    const passwordUpdates = await page.evaluate(() => window.__fittrackMock.passwordUpdates);
    assert(passwordUpdates === 1, "Parola kurtarma bağlantısı yeni şifreyi kaydetmedi.");
    assert(errors.length === 0, `Deep-link sayfa hataları: ${errors.join(" | ")}`);
    console.log("FitTrack Beta 0.10.3 auth deep-link and recovery test: PASS");
  } finally {
    await context.close();
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
