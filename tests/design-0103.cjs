"use strict";

const { chromium } = require("playwright");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function browserOptions() {
  const options = { headless: true };
  if (process.env.FITTRACK_CHROME) {
    options.executablePath = process.env.FITTRACK_CHROME;
    options.env = Object.assign({}, process.env, { LD_LIBRARY_PATH: process.env.FITTRACK_CHROME_LIB || "" });
  }
  return options;
}

(async () => {
  const baseUrl = process.env.FITTRACK_TEST_URL || "http://127.0.0.1:4173";
  const browser = await chromium.launch(await browserOptions());
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.locator('.bottom-nav [data-tab="programs"]').click();

    assert(await page.locator(".assigned-program-card").count() === 3, "Üyenin atanmış antrenmanları listelenmedi.");
    assert(await page.locator(".assigned-program-card.equal").count() === 3, "Atanan antrenmanlar eşit kartlarla gösterilmedi.");
    assert(await page.locator(".assigned-program-card.primary").count() === 0, "Ana antrenman kavramı arayüzden kaldırılmadı.");
    assert(await page.getByText("ANA PROGRAM", { exact: true }).count() === 0, "Ana program etiketi hâlâ görünüyor.");
    assert((await page.locator(".assigned-only-note").textContent()).includes("Yalnızca sana atanan programlar"), "Atama görünürlüğü açıklaması eksik.");

    await page.locator("[data-library-search]").fill("bench");
    assert(await page.locator("#memberExerciseLibrary .library-item").count() === 1, "Hareket araması listeyi daraltmadı.");
    assert((await page.locator("#memberExerciseLibrary").textContent()).includes("Bench Press"), "Hareket araması doğru sonucu vermedi.");
    await page.locator("[data-library-search]").fill("");
    await page.locator('[data-action="library-filter"][data-muscle="Sırt"]').click();
    assert(await page.locator("#memberExerciseLibrary .library-item").count() >= 1, "Kas grubu filtresi sonuç vermedi.");
    await page.locator("#memberExerciseLibrary .library-item").first().click();
    assert(await page.locator(".exercise-detail-flow").count() === 1, "Hareket satırı detay ekranını açmadı.");
    assert(await page.locator(".exercise-detail-cues li").count() >= 3, "Hareket detayında uygulama ipuçları eksik.");
    await page.locator('[data-action="close-exercise-detail"]').click();

    await page.locator('.assigned-program-card.equal[data-program-id="lower"] [data-action="assigned-program-detail"]').click();
    assert(await page.locator(".assigned-detail-flow").count() === 1, "Program ayrıntısı tam ekran açılmadı.");
    assert(await page.getByRole("heading", { name: "Alt Vücut & Core" }).count() === 1, "Seçilen program ayrıntısı açılmadı.");
    await page.locator('[data-action="close-program-detail"]').click();

    await page.locator('.bottom-nav [data-tab="profile"]').click();
    assert(await page.getByText("Cihaz JSON yedeği", { exact: true }).count() === 0, "Yedek işlemi ana profilde görünüyor.");
    assert(await page.getByText("Davet kodu oluştur", { exact: true }).count() === 0, "Davet kodu ana profilde görünüyor.");
    await page.locator('[data-action="profile-edit"]').click();
    assert(await page.locator(".profile-wizard").count() === 1, "Profil sihirbazı açılmadı.");
    await page.locator('[data-profile-wizard="firstName"]').fill("Berk");
    await page.locator('[data-profile-wizard="lastName"]').fill("Test");
    await page.locator('[data-action="profile-wizard-next"]').click();
    await page.locator('[data-profile-wizard="age"]').fill("24");
    await page.locator('[data-action="profile-wizard-back"]').click();
    assert(await page.locator('[data-profile-wizard="firstName"]').count() === 1, "Profil geri eylemi ana sayfaya düştü.");
    await page.locator('[data-action="profile-wizard-next"]').click();
    assert((await page.locator('[data-profile-wizard="age"]').getAttribute("inputmode")) === "numeric", "Yaş alanı numerik klavye istemiyor.");
    await page.locator('[data-action="profile-wizard-next"]').click();
    await page.locator('[data-profile-wizard="height"]').fill("176");
    assert((await page.locator('[data-profile-wizard="height"]').getAttribute("inputmode")) === "numeric", "Boy alanı klavyeyle girilemiyor.");
    await page.locator('[data-action="profile-wizard-next"]').click();
    await page.locator('[data-profile-wizard="currentWeight"]').fill("105");
    await page.locator('[data-action="profile-wizard-next"]').click();
    await page.locator('[data-profile-wizard="targetWeight"]').fill("85");
    await page.locator('[data-action="profile-wizard-next"]').click();
    await page.locator('[data-action="profile-goal"][data-goal="lose"]').click();
    await page.locator('[data-action="profile-wizard-next"]').click();
    const profile = await page.evaluate(() => JSON.parse(localStorage.getItem("fittrack-beta-010-state")).profile);
    assert(profile.firstName === "Berk" && profile.height === 176 && profile.setupComplete === true && profile.goal === "lose", "Profil sihirbazı değerleri kaydetmedi.");

    await page.locator('[data-action="program-studio"]').click();
    await page.locator('[data-action="studio-new"]').click();
    await page.locator("#studioName").fill("Silinecek Test");
    await page.locator('[data-action="studio-add-move"]').click();
    await page.locator("[data-studio-catalog-search]").fill("Bench Press");
    await page.locator(".catalog-choice").filter({ hasText: "Bench Press" }).click();
    await page.locator('[data-action="studio-publish"]').click();
    const programCard = page.locator(".studio-program-card").filter({ hasText: "Silinecek Test" });
    await programCard.locator('[data-action="studio-menu"]').click();
    await page.locator('[data-action="studio-delete-confirm"]').click();
    await page.locator('[data-action="studio-delete"]').click();
    assert(await page.getByText("Silinecek Test", { exact: true }).count() === 0, "Program kalıcı olarak silinmedi.");
    await page.locator('[data-action="close-trainer"]').click();

    await page.locator('.bottom-nav [data-tab="progress"]').click();
    await page.locator(".history-item").first().click();
    assert(await page.locator(".history-edit-flow").count() === 1, "Geçmiş düzenleyici tam ekran açılmadı.");
    assert(await page.locator(".sheet-layer.active").count() === 0, "Geçmiş düzenleyici bottom sheet içinde açıldı.");
    const beforeSets = await page.locator(".history-set-row").count();
    await page.locator('[data-action="history-add-set"][data-exercise-index="0"]').click();
    assert(await page.locator(".history-set-row").count() === beforeSets + 1, "Geçmişe set eklenemedi.");
    await page.locator('[data-action="history-remove-set"][data-exercise-index="0"]').last().click();
    assert(await page.locator(".history-set-row").count() === beforeSets, "Geçmişten set silinemedi.");
    await page.locator('[data-history-exercise="0"][data-history-set="0"][data-history-field="reps"]').fill("11");
    await page.locator('[data-action="save-history"]').last().click();
    assert(await page.locator(".history-edit-flow").count() === 0, "Geçmiş düzenleyici kayıttan sonra kapanmadı.");

    assert(errors.length === 0, `Tasarım testi sayfa hataları: ${errors.join(" | ")}`);
    console.log("FitTrack Beta 0.11 design and flow test: PASS");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
