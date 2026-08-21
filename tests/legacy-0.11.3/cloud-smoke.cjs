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
  await page.addInitScript(() => { window.FITTRACK_FORCE_CLOUD = true; });
  const mockSource = fs.readFileSync(path.join(__dirname, "mock-supabase.js"), "utf8");
  await page.route("**/vendor/supabase.min.js*", (route) => route.fulfill({ status: 200, contentType: "application/javascript", body: mockSource }));

  try {
    await page.goto(baseUrl, { waitUntil: "load" });
    await page.getByRole("heading", { name: "Kaldığın yer her cihazda." }).waitFor();

    await page.getByRole("button", { name: "Kayıt" }).click();
    await page.locator("#authName").fill("Bulut Antrenör");
    await page.locator("#authEmail").fill("trainer@fittrack.test");
    await page.locator("#authPassword").fill("FitTrack-010!");
    await page.locator("#authConsent").check();
    await page.getByRole("button", { name: "Hesap oluştur" }).click();

    await page.getByRole("heading", { name: "Seni doğru alana yerleştirelim." }).waitFor();
    await page.locator('input[name="setupRole"][value="trainer"]').check();
    await page.locator("#setupConsent").check();
    await page.getByRole("button", { name: "Devam et" }).click();

    await page.getByRole("heading", { name: "Salonunu kur veya ekibine katıl." }).waitFor();
    await page.locator("#gymName").fill("Nova Bulut Fitness");
    await page.getByRole("button", { name: "Salonu oluştur" }).click();
    await page.getByText("FT-MOCK0001", { exact: true }).waitFor();
    await page.getByRole("button", { name: "Panele devam et" }).click();
    await page.locator("#authLayer").waitFor({ state: "hidden" });

    await page.locator('.bottom-nav [data-tab="profile"]').click();
    await page.locator('[data-action="profile-edit"]').click();
    await page.locator('[data-profile-wizard="firstName"]').fill("BulutTrainer");
    await page.locator('[data-action="profile-wizard-next"]').click();
    await page.locator('[data-action="profile-wizard-next"]').click();
    await page.locator('[data-action="profile-wizard-next"]').click();
    await page.locator('[data-action="profile-wizard-next"]').click();
    await page.locator('[data-action="profile-wizard-next"]').click();
    await page.locator('[data-action="profile-wizard-next"]').click();
    const trainerKey = "fittrack-beta-010-user-aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa";
    await page.waitForFunction((key) => Boolean(localStorage.getItem(key)), trainerKey);
    await page.waitForFunction(() => window.__fittrackMock.profiles["aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa"].display_name === "BulutTrainer Antrenör");

    const offlineRestartPage = await context.newPage();
    await offlineRestartPage.addInitScript(() => { window.FITTRACK_FORCE_CLOUD = true; Object.defineProperty(Navigator.prototype, "onLine", { configurable: true, get: () => false }); });
    await offlineRestartPage.route("**/vendor/supabase.min.js*", (route) => route.fulfill({ status: 200, contentType: "application/javascript", body: mockSource }));
    await offlineRestartPage.goto(baseUrl, { waitUntil: "load" });
    await offlineRestartPage.locator("#authLayer").waitFor({ state: "hidden" });
    const offlineRestart = await offlineRestartPage.evaluate(() => JSON.parse(localStorage.getItem("fittrack-beta-010-state")));
    assert(offlineRestart.cloud.userId === "aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa", "Çevrimdışı yeniden açılış kayıtlı hesabı etkinleştirmedi.");
    assert(offlineRestart.profile.firstName === "BulutTrainer", "Çevrimdışı yeniden açılış yerel profili korumadı.");
    await offlineRestartPage.close();

    await page.waitForFunction(() => window.__fittrackMock.snapshotCalls >= 1);
    await context.setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new CustomEvent("fittrack:state-saved", { detail: { remote: false } })));
    await page.waitForTimeout(1400);
    await page.evaluate(() => window.dispatchEvent(new CustomEvent("fittrack:state-saved", { detail: { remote: false } })));
    await page.waitForTimeout(1400);
    const offlineQueue = await page.evaluate(() => JSON.parse(localStorage.getItem("fittrack-beta-010-queue-aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa") || "[]"));
    assert(offlineQueue.length === 1 && offlineQueue[0].type === "snapshot", "Çevrimdışı snapshot kuyruğu kararlı kimlikle tekilleştirilmedi.");
    await context.setOffline(false);
    await page.waitForFunction(() => JSON.parse(localStorage.getItem("fittrack-beta-010-queue-aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa") || "[]").length === 0);
    assert(await page.evaluate(() => window.__fittrackMock.realtimeAddErrors === 0), "Realtime kanalı tekrar abone olurken callback çoğalttı.");

    await page.locator('[data-action="theme-edit"]').click();
    await page.locator('[data-action="select-theme"][data-theme="light"]').click();
    await page.locator('[data-cloud-action="account-manager"]').first().click();
    const lightAccountColors = await page.evaluate(() => {
      const action = document.querySelector(".account-actions button");
      return {
        theme: document.documentElement.dataset.theme,
        background: getComputedStyle(action).backgroundColor,
        color: getComputedStyle(action).color
      };
    });
    assert(lightAccountColors.theme === "light", "Hesap ve bulut ekranında açık tema korunmadı.");
    assert(lightAccountColors.background === "rgb(255, 255, 255)", `Açık temada hesap eylemi beyaz değil: ${lightAccountColors.background}`);
    assert(lightAccountColors.color === "rgb(16, 32, 25)", `Açık temada hesap metni okunaklı değil: ${lightAccountColors.color}`);
    await page.locator('.account-actions [data-cloud-action="sign-out"]').click();
    await page.getByRole("heading", { name: "Kaldığın yer her cihazda." }).waitFor();
    await page.locator("#authEmail").fill("member@fittrack.test");
    await page.locator("#authPassword").fill("FitTrack-010!");
    await page.getByRole("button", { name: "Giriş yap" }).click();
    await page.getByRole("heading", { name: "Antrenörüne bağlan." }).waitFor();
    await page.locator("#inviteCode").fill("FT-MOCK0001");
    await page.getByRole("button", { name: "Salona bağlan" }).click();
    await page.locator("#authLayer").waitFor({ state: "hidden" });

    const isolation = await page.evaluate((key) => ({
      current: JSON.parse(localStorage.getItem("fittrack-beta-010-state")),
      trainer: JSON.parse(localStorage.getItem(key))
    }), trainerKey);
    assert(isolation.current.cloud.userId === "bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb", "İkinci hesap etkinleşmedi.");
    assert(isolation.current.profile.firstName === "Bulut", "Üye profili bulut verisinden kurulmadı.");
    assert(isolation.current.profile.firstName !== isolation.trainer.profile.firstName && isolation.trainer.profile.firstName === "BulutTrainer", "Hesaplara özel yerel veriler birbirine karıştı.");
    assert(isolation.current.cloud.role === "member" && isolation.current.gym.name === "Nova Bulut Fitness", "Davetle üye rolü ve salon bağlantısı kurulmadı.");

    await page.locator('.bottom-nav [data-tab="home"]').click();
    await page.locator('[data-action="coach"]').click();
    await page.getByRole("button", { name: /Antrenörüne mesaj gönder/i }).click();
    await page.locator("#chatInput").fill("Bulut sohbet testi");
    await page.locator('[data-action="send-message"]').click();
    await page.waitForFunction(() => window.__fittrackMock.messages.some((item) => item.body === "Bulut sohbet testi"));
    await page.waitForFunction(() => {
      const current = JSON.parse(localStorage.getItem("fittrack-beta-010-state"));
      const message = current.messages.find((item) => item.body === "Bulut sohbet testi");
      return Boolean(message && message.pending === false);
    });
    assert(await page.locator(".chat-bubble.own").filter({ hasText: "Bulut sohbet testi" }).count() === 1, "Buluta gönderilen mesaj sohbette görünmüyor.");
    assert(errors.length === 0, `Bulut istemci sayfa hataları: ${errors.join(" | ")}`);
    console.log("FitTrack Beta 0.11 cloud/account/offline smoke test: PASS");
  } finally {
    await context.close();
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
