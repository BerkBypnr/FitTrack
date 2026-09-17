"use strict";

const { chromium } = require("playwright");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function launchOptions() {
  const options = { headless: true };
  if (process.env.FITTRACK_CHROME) {
    options.executablePath = process.env.FITTRACK_CHROME;
    options.env = Object.assign({}, process.env, { LD_LIBRARY_PATH: process.env.FITTRACK_CHROME_LIB || "" });
  }
  return options;
}

async function noGlobalOverflow(page, label) {
  const sizes = await page.evaluate(() => ({
    width: window.innerWidth,
    html: document.documentElement.scrollWidth,
    body: document.body.scrollWidth
  }));
  assert(Math.max(sizes.html, sizes.body) <= sizes.width + 1, `${label}: yatay taşma ${Math.max(sizes.html, sizes.body)}px > ${sizes.width}px.`);
}

async function fullyVisible(page, locator, label) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  const viewport = page.viewportSize();
  assert(box, `${label}: öğe görünür değil.`);
  assert(box.x >= -1 && box.y >= -1 && box.x + box.width <= viewport.width + 1 && box.y + box.height <= viewport.height + 1,
    `${label}: görünür alan dışında (${JSON.stringify(box)} / ${JSON.stringify(viewport)}).`);
}

async function fullFlowFits(page, label) {
  await page.waitForTimeout(380);
  const box = await page.locator(".flow-layer.active .full-flow").boundingBox();
  const viewport = page.viewportSize();
  assert(box && box.x >= -1 && box.y >= -1 && box.width <= viewport.width + 1 && box.height <= viewport.height + 1,
    `${label}: tam ekran akış cihaz sınırlarını aşıyor.`);
  await noGlobalOverflow(page, label);
}

(async () => {
  const baseUrl = process.env.FITTRACK_TEST_URL || "http://127.0.0.1:4173";
  const browser = await chromium.launch(await launchOptions());
  const viewports = [
    { width: 320, height: 568, label: "320×568" },
    { width: 360, height: 640, label: "360×640" },
    { width: 390, height: 844, label: "390×844" },
    { width: 412, height: 915, label: "412×915" },
    { width: 768, height: 1024, label: "768×1024" }
  ];

  try {
    for (const viewport of viewports) {
      const page = await browser.newPage({ viewport });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(baseUrl, { waitUntil: "networkidle" });
      await noGlobalOverflow(page, `${viewport.label} ana sayfa`);
      await fullyVisible(page, page.locator(".bottom-nav"), `${viewport.label} alt menü`);

      await page.locator('.bottom-nav [data-tab="programs"]').click();
      await noGlobalOverflow(page, `${viewport.label} programlar`);
      await page.locator('.assigned-program-card.equal[data-program-id="lower"] [data-action="assigned-program-detail"]').click();
      await fullFlowFits(page, `${viewport.label} program ayrıntısı`);
      await fullyVisible(page, page.locator('.detail-action-bar [data-action="start-assigned-program"]'), `${viewport.label} program başlat düğmesi`);
      await page.locator(".assigned-detail-scroll").evaluate((node) => { node.scrollTop = node.scrollHeight; });
      await fullyVisible(page, page.locator('.detail-action-bar [data-action="start-assigned-program"]'), `${viewport.label} kaydırma sonrası program başlat düğmesi`);
      await page.locator('[data-action="close-program-detail"]').click();

      await page.locator('.bottom-nav [data-tab="profile"]').click();
      await page.locator('[data-action="profile-edit"]').click();
      for (let step = 1; step <= 6; step += 1) {
        await fullFlowFits(page, `${viewport.label} profil ${step}/6`);
        await fullyVisible(page, page.locator('.profile-wizard > footer [data-action="profile-wizard-next"]'), `${viewport.label} profil ${step}/6 devam düğmesi`);
        if (step < 6) await page.locator('[data-action="profile-wizard-next"]').click();
      }
      if (viewport.width === 320) {
        await page.setViewportSize({ width: 320, height: 420 });
        await fullFlowFits(page, "320×420 klavye benzetimi");
        await fullyVisible(page, page.locator('.profile-wizard > footer [data-action="profile-wizard-next"]'), "klavye açıkken profil düğmesi");
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
      }
      await page.locator('[data-action="close-profile-wizard"]').click();

      await page.locator('[data-action="trainer-panel"]').click();
      await fullFlowFits(page, `${viewport.label} üyeler`);
      await fullyVisible(page, page.locator('[data-action="trainer-member"][data-member-id="member-self"]'), `${viewport.label} üye satırı`);
      await page.locator('[data-action="trainer-member"][data-member-id="member-self"]').click();
      await fullFlowFits(page, `${viewport.label} üye ayrıntısı`);
      await fullyVisible(page, page.locator('[data-action="assign-program"]'), `${viewport.label} program ata düğmesi`);
      await fullyVisible(page, page.locator('[data-action="save-member-note"]'), `${viewport.label} üye notu kaydet düğmesi`);
      await page.locator('[data-action="trainer-dashboard"]').click();
      await page.locator('[data-action="close-trainer"]').click();

      await page.locator('[data-action="program-studio"]').click();
      await fullFlowFits(page, `${viewport.label} program stüdyosu`);
      await fullyVisible(page, page.locator('[data-action="studio-new"]'), `${viewport.label} yeni program düğmesi`);
      await page.locator('[data-action="studio-new"]').click();
      await fullFlowFits(page, `${viewport.label} program düzenleyici`);
      await fullyVisible(page, page.locator('.studio-save-bar [data-action="studio-save-draft"]'), `${viewport.label} taslak düğmesi`);
      await fullyVisible(page, page.locator('.studio-save-bar [data-action="studio-publish"]'), `${viewport.label} yayınla düğmesi`);
      await page.locator('[data-action="studio-dashboard"]').click();
      await page.locator('[data-action="close-trainer"]').click();

      await page.locator('.bottom-nav [data-tab="progress"]').click();
      await page.locator(".history-item").first().click();
      await fullFlowFits(page, `${viewport.label} geçmiş düzenleyici`);
      await fullyVisible(page, page.locator('.history-edit-flow .detail-action-bar [data-action="save-history"]'), `${viewport.label} geçmiş kaydet düğmesi`);
      await page.locator(".history-edit-scroll").evaluate((node) => { node.scrollTop = node.scrollHeight; });
      await fullyVisible(page, page.locator('[data-action="ask-delete-history"]'), `${viewport.label} geçmiş sil düğmesi`);
      await fullyVisible(page, page.locator('.history-edit-flow .detail-action-bar [data-action="save-history"]'), `${viewport.label} geçmiş alt kaydet düğmesi`);
      await page.locator('[data-action="close-history-editor"]').click();

      await page.locator('.bottom-nav [data-tab="home"]').click();
      await page.getByRole("button", { name: /Hemen başla/i }).first().click();
      await page.getByRole("button", { name: /Seti tamamla/i }).waitFor({ timeout: 7000 });
      await fullFlowFits(page, `${viewport.label} antrenman`);
      await fullyVisible(page, page.locator('[data-action="complete-set"]'), `${viewport.label} set tamamlama düğmesi`);

      assert(errors.length === 0, `${viewport.label}: sayfa hataları: ${errors.join(" | ")}`);
      await page.close();
    }
    console.log("FitTrack Beta 0.11 full interface overflow/button audit: PASS");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
