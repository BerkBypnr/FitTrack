"use strict";

const { chromium } = require("playwright");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function auditPage(page, label) {
  const result = await page.evaluate(() => {
    const duplicateIds = Array.from(document.querySelectorAll("[id]")).map((node) => node.id).filter((id, index, list) => list.indexOf(id) !== index);
    const namelessButtons = Array.from(document.querySelectorAll("button")).filter((button) => !String(button.getAttribute("aria-label") || button.textContent || "").trim()).length;
    const unlabeledInputs = Array.from(document.querySelectorAll("input:not([type=hidden]), select, textarea")).filter((input) => {
      if (input.getAttribute("aria-label")) return false;
      if (input.id && document.querySelector(`label[for="${CSS.escape(input.id)}"]`)) return false;
      return !input.closest("label");
    }).length;
    return {
      viewport: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      duplicateIds,
      namelessButtons,
      unlabeledInputs
    };
  });
  assert(result.documentWidth <= result.viewport + 1, `${label}: yatay taşma var (${result.documentWidth}px > ${result.viewport}px).`);
  assert(result.duplicateIds.length === 0, `${label}: yinelenen id var: ${result.duplicateIds.join(", ")}`);
  assert(result.namelessButtons === 0, `${label}: erişilebilir adı olmayan ${result.namelessButtons} düğme var.`);
  assert(result.unlabeledInputs === 0, `${label}: etiketsiz ${result.unlabeledInputs} form alanı var.`);
}

(async () => {
  const baseUrl = process.env.FITTRACK_TEST_URL || "http://127.0.0.1:4173";
  const launchOptions = { headless: true };
  if (process.env.FITTRACK_CHROME) {
    launchOptions.executablePath = process.env.FITTRACK_CHROME;
    launchOptions.env = Object.assign({}, process.env, { LD_LIBRARY_PATH: process.env.FITTRACK_CHROME_LIB || "" });
  } else {
    try {
      const chromiumModule = require("@sparticuz/chromium");
      const portableChromium = chromiumModule.default || chromiumModule;
      launchOptions.executablePath = await portableChromium.executablePath();
      launchOptions.args = portableChromium.args;
    } catch (_) {
      // Standart Playwright Chromium kurulumu varsa onu kullan.
    }
  }

  const browser = await chromium.launch(launchOptions);
  const viewports = [
    { width: 320, height: 568, name: "küçük telefon" },
    { width: 360, height: 740, name: "kompakt telefon" },
    { width: 390, height: 844, name: "standart telefon" },
    { width: 412, height: 915, name: "büyük telefon" },
    { width: 768, height: 1024, name: "tablet" }
  ];

  try {
    for (const viewport of viewports) {
      const page = await browser.newPage({ viewport });
      const failures = [];
      const errors = [];
      page.on("requestfailed", (request) => failures.push(`${request.method()} ${request.url()}`));
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(baseUrl, { waitUntil: "networkidle" });
      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle" }),
        page.evaluate(() => { localStorage.clear(); location.reload(); })
      ]);

      await auditPage(page, `${viewport.name} / ana sayfa`);
      await page.locator('.bottom-nav [data-tab="programs"]').click();
      await auditPage(page, `${viewport.name} / programlar`);
      await page.locator('.bottom-nav [data-tab="progress"]').click();
      await auditPage(page, `${viewport.name} / ilerleme`);
      await page.locator('.bottom-nav [data-tab="profile"]').click();
      await auditPage(page, `${viewport.name} / profil`);
      await page.locator('[data-action="trainer-panel"]').click();
      await auditPage(page, `${viewport.name} / antrenör paneli`);
      const trainerBox = await page.locator(".trainer-flow").boundingBox();
      assert(trainerBox && trainerBox.height <= viewport.height + 1 && trainerBox.width <= Math.min(520, viewport.width) + 1, `${viewport.name}: antrenör paneli cihaz görünümüne sığmıyor.`);
      await page.locator('[data-action="trainer-member"][data-member-id="member-self"]').click();
      await auditPage(page, `${viewport.name} / üye ayrıntısı`);
      await page.locator('[data-action="trainer-dashboard"]').click();
      await page.locator('[data-action="close-trainer"]').click();
      await page.locator('[data-action="program-studio"]').click();
      await auditPage(page, `${viewport.name} / program stüdyosu`);
      await page.locator('[data-action="studio-new"]').click();
      await auditPage(page, `${viewport.name} / program düzenleyici`);
      await page.locator('[data-action="studio-add-move"]').click();
      await auditPage(page, `${viewport.name} / hareket seçici`);
      await page.locator(".sheet-layer .close-btn").click();

      if (viewport.width === 320 || viewport.width === 768) {
        await page.locator('[data-action="studio-dashboard"]').click();
        await page.locator('[data-action="close-trainer"]').click();
        await page.locator('.bottom-nav [data-tab="home"]').click();
        await page.getByRole("button", { name: /Hemen başla/i }).first().click();
        await page.getByRole("button", { name: /Seti tamamla/i }).waitFor({ timeout: 7000 });
        await auditPage(page, `${viewport.name} / antrenman`);
        const action = await page.getByRole("button", { name: /Seti tamamla/i }).boundingBox();
        assert(action && action.y >= 0 && action.y + action.height <= viewport.height, `${viewport.name}: set düğmesi görünür alanın dışında.`);
      }

      assert(failures.length === 0, `${viewport.name}: yüklenemeyen kaynaklar: ${failures.join(" | ")}`);
      assert(errors.length === 0, `${viewport.name}: sayfa hataları: ${errors.join(" | ")}`);
      await page.close();
    }
    console.log("FitTrack Beta 0.11 responsive and accessibility audit: PASS");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
