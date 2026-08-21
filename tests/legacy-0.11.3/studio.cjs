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
    return options;
  }
  const chromiumModule = require("@sparticuz/chromium");
  const portableChromium = chromiumModule.default || chromiumModule;
  options.executablePath = await portableChromium.executablePath();
  options.args = portableChromium.args;
  return options;
}

(async () => {
  const baseUrl = process.env.FITTRACK_TEST_URL || "http://127.0.0.1:4173";
  const browser = await chromium.launch(await browserOptions());
  try {
    const page = await browser.newPage({ viewport: { width: 360, height: 640 } });
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto(baseUrl, { waitUntil: "networkidle" });

    await page.locator('.bottom-nav [data-tab="programs"]').click();
    const libraryImages = page.locator(".visual-library .library-thumb");
    assert(await libraryImages.count() >= 36, "Hareket kütüphanesi 36 hareketi görselli göstermiyor.");
    assert(await libraryImages.evaluateAll((images) => images.every((image) => Boolean(image.getAttribute("src")))), "Kütüphanede kaynaksız görsel var.");
    await libraryImages.first().evaluate((image) => { image.src = "./assets/missing-test-image.gif"; });
    await page.waitForFunction(() => document.querySelector(".visual-library .library-thumb").src.startsWith("data:image/svg+xml"));

    await page.locator('.bottom-nav [data-tab="profile"]').click();
    await page.locator('[data-action="program-studio"]').click();
    assert(await page.locator(".studio-flow").count() === 1 && await page.locator(".studio-flow .trainer-head").getByText("Programlar", { exact: true }).count() === 1, "Program Stüdyosu açılmadı.");
    await page.locator('[data-action="studio-new"]').click();
    await page.locator("#studioName").fill("Berk Kuvvet 0.9");
    await page.locator(".studio-optional-fields summary").click();
    await page.locator("#studioDescription").fill("Telefon test programı");
    await page.locator("#studioGeneralNote").fill("İlk turda formu koru ve acele etme.");
    await page.locator('[data-action="studio-next-step"]').click();
    await page.locator("[data-studio-day-name]").fill("Pazartesi Göğüs");
    await page.locator('[data-action="studio-add-day"]').click();
    assert(await page.locator(".studio-day-builder-card").count() === 2, "İkinci program günü eklenmedi.");
    await page.locator("[data-studio-day-name]").fill("Çarşamba Sırt");
    await page.locator("[data-studio-weekday]").selectOption("3");
    await page.locator('[data-action="studio-day-select"][data-index="0"]').click();
    await page.locator('[data-action="studio-next-step"]').click();

    async function openCatalog() {
      await page.locator('[data-action="studio-add-move"]').click();
    }
    async function selectCatalogExercise(name) {
      await page.locator("[data-studio-catalog-search]").fill(name);
      await page.locator(".sheet-layer .catalog-choice").filter({ hasText: name }).click();
    }
    await openCatalog();
    await selectCatalogExercise("Bench Press");
    await selectCatalogExercise("Goblet Squat");
    await selectCatalogExercise("Lat Pulldown");
    assert(await page.locator("#studioSelectedCount").getByText("3 hareket seçildi", { exact: true }).count() === 1, "Toplu hareket seçim sayısı güncellenmedi.");
    await page.locator('[data-action="studio-finish-selection"]').click();
    assert(await page.locator(".studio-exercise-card").count() === 3, "Üç hareket programa eklenmedi.");

    await page.locator('[data-action="studio-config"][data-index="0"]').click();
    await page.locator("#studioCoachNote").fill("Barı göğüs çizgisine kontrollü indir.");
    await page.locator('[data-config-type][data-set-index="0"]').selectOption("warmup");
    await page.locator('[data-config-reps][data-set-index="0"]').fill("12");
    await page.locator('[data-config-weight][data-set-index="0"]').fill("25");
    await page.locator('[data-config-rest][data-set-index="0"]').fill("30");
    await page.locator('[data-action="studio-add-set"]').click();
    assert(await page.locator(".studio-set-row").count() === 4, "Dördüncü set eklenmedi.");
    await page.locator('[data-action="studio-save-config"]').click();

    await page.locator('[data-action="studio-day-select"][data-index="1"]').click();
    await openCatalog();
    await selectCatalogExercise("Seated Cable Row");
    await page.locator('[data-action="studio-finish-selection"]').click();
    await page.locator('[data-action="studio-config"][data-index="0"]').click();
    await page.locator("#studioCoachNote").fill("İkinci gün hareket notu.");
    await page.locator('[data-action="studio-save-config"]').click();
    await page.locator('[data-action="studio-day-select"][data-index="0"]').click();

    await openCatalog();
    await page.locator('[data-action="studio-custom-exercise"]').click();
    await page.locator("#customExerciseName").fill("Berk Press");
    await page.locator("#customExerciseMuscle").fill("Omuz");
    await page.locator("#customExerciseSecondary").fill("Triceps");
    await page.locator("#customExerciseEquipment").fill("Kablo");
    await page.locator("#customExerciseCues").fill("Gövdeyi sabit tut.\nKolu kontrollü indir.");
    await page.locator('[data-action="save-custom-exercise"]').click();
    assert(await page.locator(".studio-exercise-card").count() === 4, "Özel hareket programa eklenmedi.");

    await page.locator('[data-action="studio-move"][data-index="3"][data-delta="-1"]').click();
    assert((await page.locator(".studio-exercise-card").nth(2).textContent()).includes("Berk Press"), "Hareket sırası değişmedi.");
    await page.locator('[data-action="studio-next-step"]').click();
    assert(await page.locator(".studio-review-hero").getByText("2", { exact: true }).count() >= 1, "Son kontrol ekranı gün toplamını göstermiyor.");
    await page.locator('[data-action="studio-publish"]').click();
    await page.getByText("Berk Kuvvet 0.9", { exact: true }).first().waitFor();

    const publishedId = await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem("fittrack-beta-010-state"));
      const program = state.customPrograms.find((item) => item.name === "Berk Kuvvet 0.9" && item.status === "published");
      return program && { id: program.id, days: program.days };
    });
    assert(publishedId && publishedId.days.length === 2, "Yayınlanan çok günlü program yerel veriye kaydedilmedi.");
    assert(publishedId.days[0].exercises[0].coachNote.includes("Barı göğüs") && publishedId.days[1].exercises[0].coachNote === "İkinci gün hareket notu.", "Hareket notları kendi günlerinde korunmadı.");

    await page.locator('[data-action="close-trainer"]').click();
    await page.locator('[data-action="trainer-panel"]').click();
    await page.locator('[data-action="trainer-member"][data-member-id="member-self"]').click();
    await page.locator("#trainerProgram").selectOption(publishedId.id);
    await page.locator('[data-action="assign-program"]').click();
    assert(await page.getByRole("heading", { name: "Berk Kuvvet 0.9" }).count() === 1, "Özel program üyeye atanmadı.");
    const assignmentState = await page.evaluate(() => JSON.parse(localStorage.getItem("fittrack-beta-010-state")));
    assert(assignmentState.assignments.length === 4, "Üçten fazla antrenman atama sınırı kaldırılmadı.");
    assert(assignmentState.assignments.some((item) => item.programId === publishedId.id), "Dördüncü antrenman atamada korunmadı.");
    assert(assignmentState.assignments.every((item) => !item.isPrimary), "Ana antrenman işareti hâlâ kullanılıyor.");
    await page.locator('[data-action="trainer-dashboard"]').click();
    await page.locator('[data-action="close-trainer"]').click();

    await page.locator('.bottom-nav [data-tab="home"]').click();
    assert(await page.locator(".home-workout-card").count() === 4, "Ana sayfada tüm antrenmanlar eşit kartlarla gösterilmedi.");
    await page.locator('[data-action="coach"]').click();
    const messageButton = page.getByRole("button", { name: /Antrenörüne mesaj gönder/i });
    assert(await messageButton.isEnabled(), "Gerçek mesajlaşma butonu etkin değil.");
    await messageButton.click();
    assert(await page.locator(".chat-flow").count() === 1, "Antrenör sohbeti açılmadı.");
    await page.locator("#chatInput").fill("Bugünkü antrenmana hazırım.");
    await page.locator('[data-action="send-message"]').click();
    assert(await page.locator(".chat-bubble.own").filter({ hasText: "Bugünkü antrenmana hazırım." }).count() === 1, "Mesaj sohbete eklenmedi.");
    await page.locator('[data-action="close-chat"]').click();

    await page.locator('.home-workout-card[data-program-id="' + publishedId.id + '"] [data-action="start-assigned-program"]').click();
    await page.getByRole("heading", { name: "Bench Press" }).waitFor({ timeout: 7000 });
    assert(await page.getByText(/Isınma · 12 tekrar · 25 kg hedef · 30 sn dinlenme/i).count() === 1, "Set hedefleri antrenman motoruna yansımadı.");
    assert(await page.getByText("Barı göğüs çizgisine kontrollü indir.", { exact: true }).count() === 1, "Harekete özel antrenör notu görünmüyor.");
    const weightInput = page.locator('[data-log-field="weight"]');
    const repsInput = page.locator('[data-log-field="reps"]');
    await weightInput.scrollIntoViewIfNeeded();
    await weightInput.fill("30");
    await repsInput.fill("12");
    const inputBox = await repsInput.boundingBox();
    assert(inputBox && inputBox.y >= 0 && inputBox.y + inputBox.height <= 640, "Küçük telefonda tekrar girişi görünür alana kaydırılamadı.");
    const actionBox = await page.locator('[data-action="complete-set"]').boundingBox();
    assert(actionBox && actionBox.y >= 0 && actionBox.y + actionBox.height <= 640, "Set tamamlama alanı safe-area içinde görünmüyor.");

    await page.locator('[data-action="workout-menu"]').click();
    await page.locator('[data-action="confirm-cancel"]').click();
    await page.locator('[data-action="cancel-workout"]').click();
    await page.locator('.bottom-nav [data-tab="profile"]').click();
    await page.locator('[data-action="program-studio"]').click();
    const publishedCard = page.locator(".studio-program-card").filter({ hasText: "Berk Kuvvet 0.9" }).filter({ hasText: "YAYINDA" });
    await publishedCard.locator('[data-action="studio-edit"]').click();
    await page.locator("#studioDescription").fill("İkinci program sürümü");
    await page.locator('[data-action="studio-next-step"]').click();
    await page.locator('[data-action="studio-next-step"]').click();
    await page.locator('[data-action="studio-next-step"]').click();
    await page.locator('[data-action="studio-publish"]').click();
    const versionState = await page.evaluate(() => JSON.parse(localStorage.getItem("fittrack-beta-010-state")));
    const versions = versionState.customPrograms.filter((item) => item.name === "Berk Kuvvet 0.9");
    assert(versions.some((item) => item.status === "archived" && item.revision === 1), "Eski program sürümü arşivlenmedi.");
    assert(versions.some((item) => item.status === "published" && item.revision === 2), "Yeni program sürümü 2 olarak yayınlanmadı.");
    assert(versionState.customExercises.some((item) => item.name === "Berk Press"), "Özel hareket kalıcı kütüphaneye yazılmadı.");
    assert(pageErrors.length === 0, `Program Stüdyosu sayfa hataları: ${pageErrors.join(" | ")}`);

    const migrationPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await migrationPage.addInitScript(() => {
      localStorage.setItem("fittrack-beta-08-state", JSON.stringify({
        version: 8,
        profile: { firstName: "Berk", lastName: "Beta08", age: 24, height: 176, currentWeight: 105, targetWeight: 85, units: "kg" },
        assignment: { programId: "upper", assignedAt: new Date().toISOString(), assignedBy: "Emre Hoca" },
        history: [], currentWorkout: null
      }));
    });
    await migrationPage.goto(baseUrl, { waitUntil: "networkidle" });
    const migrated08 = await migrationPage.evaluate(() => JSON.parse(localStorage.getItem("fittrack-beta-010-state")));
    assert(migrated08.version === 11 && migrated08.profile.lastName === "Beta08" && migrated08.assignment.programId === "upper", "Beta 0.8 → 0.10.3 veri geçişi tamamlanmadı.");
    await migrationPage.close();
    console.log("FitTrack Beta 0.11 Program Studio, unlimited assignment and chat test: PASS");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
