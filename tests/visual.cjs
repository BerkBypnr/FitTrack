"use strict";

const { chromium } = require("playwright");

(async () => {
  const launchOptions = { headless: true, executablePath: process.env.FITTRACK_CHROME, env: Object.assign({}, process.env, { LD_LIBRARY_PATH: process.env.FITTRACK_CHROME_LIB || "" }) };
  const browser = await chromium.launch(launchOptions);
  const url = process.env.FITTRACK_TEST_URL;
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: "load" });
    await page.locator('.bottom-nav [data-tab="programs"]').click();
    await page.screenshot({ path: "/tmp/fittrack-v0103-programs.png", fullPage: true });
    await page.locator('.assigned-program-card.equal[data-program-id="lower"] [data-action="assigned-program-detail"]').click();
    await page.waitForTimeout(450);
    await page.screenshot({ path: "/tmp/fittrack-v0103-program-detail.png", fullPage: false });
    await page.locator('[data-action="close-program-detail"]').click();
    await page.locator('.bottom-nav [data-tab="profile"]').click();
    await page.screenshot({ path: "/tmp/fittrack-v0103-profile.png", fullPage: true });
    await page.locator('[data-action="profile-edit"]').click();
    await page.locator('[data-action="profile-wizard-next"]').click();
    await page.locator('[data-action="profile-wizard-next"]').click();
    await page.waitForTimeout(450);
    await page.screenshot({ path: "/tmp/fittrack-v0103-height.png", fullPage: false });
    await page.locator('[data-action="close-profile-wizard"]').click();
    await page.locator('[data-action="trainer-panel"]').click();
    await page.waitForTimeout(450);
    await page.screenshot({ path: "/tmp/fittrack-v0103-members.png", fullPage: false });
    await page.locator('[data-action="close-trainer"]').click();
    await page.locator('[data-action="program-studio"]').click();
    await page.waitForTimeout(450);
    await page.screenshot({ path: "/tmp/fittrack-v0103-studio.png", fullPage: false });

    const small = await browser.newPage({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 1 });
    await small.goto(url, { waitUntil: "load" });
    await small.locator('.bottom-nav [data-tab="progress"]').click();
    await small.locator(".history-item").first().click();
    await small.waitForTimeout(450);
    await small.screenshot({ path: "/tmp/fittrack-v0103-history.png", fullPage: false });
    console.log("FitTrack Beta 0.10.3 visual capture: PASS");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
