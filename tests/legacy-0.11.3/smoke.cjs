"use strict";

const { chromium } = require("playwright");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function startWorkout(page) {
  await page.getByRole("button", { name: /Hemen başla/i }).first().click();
  await page.getByRole("button", { name: /Seti tamamla/i }).waitFor({ timeout: 7000 });
}

async function completeAndSkipRest(page) {
  await page.getByRole("button", { name: /Seti (tamamla|güncelle)/i }).click();
  const rest = page.getByRole("button", { name: /Dinlenmeyi geç/i });
  if (await rest.count()) await rest.click();
}

async function assertPosition(page, exercise, set) {
  await page.getByRole("heading", { name: exercise }).waitFor();
  const status = await page.locator(".player-status small").textContent();
  assert(status.includes(`SET ${set}/3`), `${exercise} Set ${set}/3 bekleniyordu, görülen: ${status}`);
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

  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await startWorkout(page);
    await assertPosition(page, "Bench Press", 1);

    const actionBox = await page.getByRole("button", { name: /Seti tamamla/i }).boundingBox();
    assert(actionBox && actionBox.y >= 0 && actionBox.y + actionBox.height <= 844, "Set tamamlama düğmesi ekranda görünür değil.");
    assert(await page.getByText("OPSİYONEL", { exact: true }).count() >= 1, "Opsiyonel kayıt etiketi bulunamadı.");

    await page.locator('[data-log-field="weight"]').fill("42.5");
    await page.locator('[data-log-field="reps"]').fill("10");
    await page.getByRole("button", { name: /^Seti tamamla/ }).click();
    assert((await page.locator(".next-card strong").textContent()).includes("Bench Press · Set 2/3"), "Dinlenme aynı hareketin ikinci setini göstermiyor.");
    await page.getByRole("button", { name: "+30 sn" }).click();
    await page.getByRole("button", { name: /Dinlenmeyi geç/i }).click();
    await assertPosition(page, "Bench Press", 2);
    assert((await page.locator('[data-log-field="weight"]').inputValue()) === "42.5", "Kilo sonraki sete taşınmadı.");
    assert((await page.locator('[data-log-field="reps"]').inputValue()) === "10", "Tekrar sonraki sete taşınmadı.");
    await completeAndSkipRest(page);
    await assertPosition(page, "Bench Press", 3);

    await page.locator('[data-action="close-flow"]').click();
    assert(await page.getByText(/Bench Press · Set 3\/3/i).count() === 1, "Ana sayfa kaldığı seti göstermiyor.");
    await page.getByRole("button", { name: /Antrenmana dön/i }).click();
    await assertPosition(page, "Bench Press", 3);

    await page.locator('[data-action="previous-set"]').click();
    await assertPosition(page, "Bench Press", 2);
    await page.locator('[data-log-field="reps"]').fill("9");
    await page.getByRole("button", { name: /Seti güncelle/i }).click();
    await page.getByRole("button", { name: /Dinlenmeyi geç/i }).click();
    await assertPosition(page, "Bench Press", 3);
    await completeAndSkipRest(page);
    await assertPosition(page, "Goblet Squat", 1);

    await page.getByRole("button", { name: "Değiştir" }).click();
    await page.locator('[data-action="choose-swap"][data-id="bodyweight-squat"]').click();
    await assertPosition(page, "Vücut Ağırlığı Squat", 1);
    assert(await page.locator('[data-log-field="weight"]').count() === 0, "Vücut ağırlığı hareketinde kilo alanı gösteriliyor.");

    await page.locator('[data-action="workout-menu"]').click();
    await page.locator('[data-action="pause-workout"]').click();
    assert(await page.getByText("ANTRENMAN DURAKLATILDI", { exact: true }).count() === 1, "Duraklatma ekranı açılmadı.");
    await page.getByRole("button", { name: /Antrenmana devam et/i }).click();
    await assertPosition(page, "Vücut Ağırlığı Squat", 1);

    await completeAndSkipRest(page);
    await assertPosition(page, "Vücut Ağırlığı Squat", 2);
    await completeAndSkipRest(page);
    await assertPosition(page, "Vücut Ağırlığı Squat", 3);
    await completeAndSkipRest(page);
    await assertPosition(page, "Lat Pulldown", 1);
    await completeAndSkipRest(page);
    await assertPosition(page, "Lat Pulldown", 2);
    await completeAndSkipRest(page);
    await assertPosition(page, "Lat Pulldown", 3);
    await page.getByRole("button", { name: /Seti tamamla ve bitir/i }).click();
    await page.getByRole("heading", { name: "Antrenman tamamlandı." }).waitFor();
    assert(await page.getByText("9", { exact: true }).count() >= 1, "Özet dokuz tamamlanan seti göstermiyor.");

    await page.getByRole("button", { name: /Ana sayfaya dön/i }).click();
    await page.locator('.bottom-nav [data-action="nav"][data-tab="progress"]').click();
    assert(await page.getByText("3", { exact: true }).count() >= 1, "Tam antrenman metriği güncellenmedi.");
    const firstHistory = page.locator(".history-item").first();
    assert((await firstHistory.textContent()).includes("9 set"), "Yeni geçmiş kaydı set sayısını göstermiyor.");
    await firstHistory.click();
    assert(await page.locator(".history-set-row").count() === 9, "Geçmişte dokuz set ayrı düzenlenemiyor.");
    assert(await page.locator("#historyName, #historyDate, #historyDuration").count() === 0, "Program adı, tarih veya süre geçmişte değiştirilebilir olmamalı.");
    await page.locator('[data-history-exercise="0"][data-history-set="0"][data-history-field="reps"]').fill("10.5");
    await page.getByRole("button", { name: /Değişiklikleri kaydet/i }).click();
    await page.getByText(/tam sayı/i).waitFor();
    assert(await page.locator(".history-edit-flow").count() === 1, "Geçersiz geçmiş değeri düzenleme ekranını kapattı.");
    await page.locator('[data-history-exercise="0"][data-history-set="0"][data-history-field="reps"]').fill("11");
    await page.getByRole("button", { name: /Değişiklikleri kaydet/i }).click();

    await page.getByRole("button", { name: "4 hafta" }).click();
    assert((await page.locator(".range-tabs button.active").textContent()) === "4 hafta", "Haftalık grafik seçilemedi.");
    await page.getByRole("button", { name: "6 ay" }).click();
    assert(await page.locator(".lift-chart").count() === 1, "Hareket gelişim grafiği bulunamadı.");

    await page.locator('.bottom-nav [data-action="nav"][data-tab="profile"]').click();
    await page.locator('[data-action="profile-edit"]').click();
    assert(await page.locator('[data-profile-wizard="firstName"]').count() === 1 && await page.locator('[data-profile-wizard="lastName"]').count() === 1, "Profil sihirbazında isim alanları eksik.");
    await page.locator('[data-action="profile-wizard-next"]').click();
    assert(await page.locator('[data-profile-wizard="age"][inputmode="numeric"]').count() === 1, "Profil yaş adımı veya sayısal klavyesi eksik.");
    await page.locator('[data-action="profile-wizard-next"]').click();
    assert(await page.locator('[data-profile-wizard="height"][inputmode="numeric"]').count() === 1, "Profil boy adımı veya sayısal klavyesi eksik.");
    await page.locator('[data-action="profile-wizard-next"]').click();
    assert(await page.locator('[data-profile-wizard="currentWeight"][inputmode="decimal"]').count() === 1, "Profil mevcut kilo adımı eksik.");
    await page.locator('[data-action="profile-unit"][data-unit="lb"]').click();
    assert(Math.abs(Number(await page.locator('[data-profile-wizard="currentWeight"]').inputValue()) - 172) < 0.2, "kg → lb profil dönüşümü yanlış.");
    await page.locator('[data-action="profile-wizard-next"]').click();
    assert(await page.locator('[data-profile-wizard="targetWeight"][inputmode="decimal"]').count() === 1, "Profil hedef kilo adımı eksik.");
    await page.locator('[data-action="profile-wizard-next"]').click();
    assert(await page.locator('.wizard-goals [data-action="profile-goal"]').count() === 3, "Profil hedef seçimi üç seçenek göstermiyor.");
    await page.locator('[data-action="profile-wizard-next"]').click();
    let convertedState = await page.evaluate(() => JSON.parse(localStorage.getItem("fittrack-beta-010-state")));
    assert(convertedState.profile.units === "lb" && Math.abs(Number(convertedState.history[0].exercises[0].sets[0].weight) - 93.7) < 0.2, "Geçmiş kilo değerleri lb birimine çevrilmedi.");
    await page.locator('[data-action="profile-edit"]').click();
    await page.locator('[data-action="profile-wizard-next"]').click();
    await page.locator('[data-action="profile-wizard-next"]').click();
    await page.locator('[data-action="profile-wizard-next"]').click();
    await page.locator('[data-action="profile-unit"][data-unit="kg"]').click();
    await page.locator('[data-action="profile-wizard-next"]').click();
    await page.locator('[data-action="profile-wizard-next"]').click();
    await page.locator('[data-action="profile-wizard-next"]').click();
    convertedState = await page.evaluate(() => JSON.parse(localStorage.getItem("fittrack-beta-010-state")));
    assert(convertedState.profile.units === "kg" && Math.abs(Number(convertedState.history[0].exercises[0].sets[0].weight) - 42.5) < 0.2, "lb → kg geçmiş dönüşümü yanlış.");

    await page.locator('[data-action="trainer-panel"]').click();
    assert(await page.locator(".trainer-member-card").count() === 4, "Antrenör paneli dört pilot üyeyi göstermiyor.");
    await page.locator("[data-trainer-search]").fill("Can");
    assert(await page.locator(".trainer-member-card").count() === 1, "Üye araması sonucu daraltmadı.");
    await page.locator("[data-trainer-search]").fill("");
    await page.locator('[data-action="trainer-filter"][data-filter="followup"]').click();
    assert(await page.locator(".trainer-member-card").count() >= 1, "Takip filtresi üye göstermedi.");
    await page.locator('[data-action="trainer-filter"][data-filter="all"]').click();
    await page.locator('[data-action="trainer-member"][data-member-id="member-self"]').click();
    await page.locator("#trainerProgram").selectOption("lower");
    await page.locator('[data-action="assign-program"]').click();
    assert(await page.getByRole("heading", { name: "Alt Vücut & Core" }).count() === 1, "Program ataması üye ayrıntısına yansımadı.");
    await page.locator("#memberNote").fill("Diz çizgisini koru ve son sette acele etme.");
    await page.locator('[data-action="save-member-note"]').click();
    await page.locator('[data-action="trainer-dashboard"]').click();
    await page.locator('[data-action="close-trainer"]').click();
    await page.locator('.bottom-nav [data-tab="home"]').click();
    assert(await page.getByRole("heading", { name: "Alt Vücut & Core" }).count() === 1, "Atanan program sporcu ana sayfasına gelmedi.");
    await startWorkout(page);
    await assertPosition(page, "Goblet Squat", 1);
    await page.locator('[data-action="close-flow"]').click();
    await page.locator('.bottom-nav [data-tab="profile"]').click();
    await page.locator('[data-action="trainer-panel"]').click();
    await page.locator('[data-action="trainer-member"][data-member-id="member-self"]').click();
    await page.locator("#trainerProgram").selectOption("upper");
    await page.locator('[data-action="assign-program"]').click();
    await page.getByText(/Aktif antrenman bitmeden/i).waitFor();
    const lockedAssignment = await page.evaluate(() => JSON.parse(localStorage.getItem("fittrack-beta-010-state")).assignment.programId);
    assert(lockedAssignment === "lower", "Aktif antrenman sırasında program ataması değişti.");
    await page.locator('[data-action="trainer-dashboard"]').click();
    await page.locator('[data-action="close-trainer"]').click();
    await page.locator('.bottom-nav [data-tab="home"]').click();
    await page.getByRole("button", { name: /Antrenmana dön/i }).click();
    await assertPosition(page, "Goblet Squat", 1);
    await page.locator('[data-action="workout-menu"]').click();
    await page.locator('[data-action="confirm-cancel"]').click();
    await page.locator('[data-action="cancel-workout"]').click();
    await page.locator('.bottom-nav [data-tab="programs"]').click();
    await page.locator('[data-action="assigned-program-detail"][data-program-id="upper"]').click();
    assert(await page.locator(".assigned-exercise-list article").count() === 3, "Program ayrıntısı üç hareketi göstermiyor.");
    await page.locator('[data-action="close-program-detail"]').click();
    await page.locator('.bottom-nav [data-tab="profile"]').click();

    for (const theme of ["light", "rose", "ocean", "amber", "midnight"]) {
      await page.locator('.setting-row[data-action="theme-edit"]').click();
      await page.locator(`[data-action="select-theme"][data-theme="${theme}"]`).click();
      assert((await page.locator("html").getAttribute("data-theme")) === theme, `Tema uygulanamadı: ${theme}`);
    }

    await page.locator('.setting-row[data-action="reminders"]').click();
    await page.locator(".toggle-row").click();
    await page.locator("#reminderTime").fill("19:15");
    await page.getByRole("button", { name: /Hatırlatmayı kaydet/i }).click();
    const reminderState = await page.evaluate(() => JSON.parse(localStorage.getItem("fittrack-beta-010-state")).reminder);
    assert(reminderState.enabled === true && reminderState.time === "19:15", "Hatırlatma ayarı kaydedilmedi.");

    await page.locator('[data-action="privacy"]').click();
    const downloadPromise = page.waitForEvent("download");
    await page.locator('[data-action="export-data"]').click();
    const download = await downloadPromise;
    assert(download.suggestedFilename().startsWith("FitTrack-Yedek-"), "JSON yedek dosya adı yanlış.");
    await page.setInputFiles("#backupInput", { name: "bozuk.json", mimeType: "application/json", buffer: Buffer.from('{"bad":true}') });
    await page.getByText(/Yedek okunamadı/i).waitFor();
    assert((await page.evaluate(() => JSON.parse(localStorage.getItem("fittrack-beta-010-state")).history.length)) === 3, "Hatalı yedek mevcut geçmişi değiştirdi.");
    assert(pageErrors.length === 0, `Ana akış sayfa hataları: ${pageErrors.join(" | ")}`);

    const partialPage = await browser.newPage({ viewport: { width: 360, height: 740 } });
    const partialErrors = [];
    partialPage.on("pageerror", (error) => partialErrors.push(error.message));
    await partialPage.goto(baseUrl, { waitUntil: "networkidle" });
    await partialPage.evaluate(() => { localStorage.clear(); location.reload(); });
    await partialPage.waitForLoadState("networkidle");
    await startWorkout(partialPage);
    await partialPage.getByRole("button", { name: /^Seti tamamla/ }).click();
    await partialPage.getByRole("button", { name: /Dinlenmeyi geç/i }).click();
    await partialPage.locator('[data-action="workout-menu"]').click();
    await partialPage.locator('[data-action="confirm-finish-early"]').click();
    await partialPage.locator('[data-action="finish-early"]').click();
    await partialPage.getByRole("heading", { name: "Antrenman erken bitirildi." }).waitFor();
    await partialPage.getByRole("button", { name: /Ana sayfaya dön/i }).click();
    assert(await partialPage.locator(".week-row .day.today.done").count() === 0, "Yarım antrenman haftalık tamamlanma işareti aldı.");
    await partialPage.locator('.bottom-nav [data-action="nav"][data-tab="progress"]').click();
    assert((await partialPage.locator(".history-item").first().textContent()).includes("Yarım"), "Erken biten kayıt yarım işaretlenmedi.");
    assert(partialErrors.length === 0, `Yarım akış sayfa hataları: ${partialErrors.join(" | ")}`);

    const migrationPage = await browser.newPage({ viewport: { width: 412, height: 915 } });
    const migrationErrors = [];
    migrationPage.on("pageerror", (error) => migrationErrors.push(error.message));
    await migrationPage.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem("fittrack-beta-06-state", JSON.stringify({
        version: 6,
        theme: "ocean",
        profile: { firstName: "Berk", lastName: "Test", age: 24, height: 176, currentWeight: 105, targetWeight: 85, units: "kg" },
        history: [{ id: "old", date: "2026-08-01", name: "Eski Antrenman", duration: 32, moves: 1, exercises: [{ name: "Bench Press", weight: "40", reps: "10", requiresWeight: true }] }],
        currentWorkout: { id: "active-v06", programId: "starter", index: 1, startedAt: new Date().toISOString(), completed: [0], logs: { 0: { weight: "40", reps: "10" } }, swaps: {}, restEnd: null, summarySaved: false }
      }));
    });
    await migrationPage.goto(baseUrl, { waitUntil: "networkidle" });
    assert((await migrationPage.locator(".hello-row h1").textContent()).includes("Berk"), "Beta 0.6 profili taşınmadı.");
    assert(await migrationPage.getByText(/Goblet Squat · Set 1\/3/i).count() === 1, "Beta 0.6 aktif konumu taşınmadı.");
    const migrated = await migrationPage.evaluate(() => JSON.parse(localStorage.getItem("fittrack-beta-010-state")));
    assert(migrated.version === 11, "Taşınan veri şema 11 olarak kaydedilmedi.");
    assert(Object.keys(migrated.currentWorkout.logs[0]).length === 3, "Tamamlanan Beta 0.6 hareketi üç set olarak korunmadı.");
    assert(migrationErrors.length === 0, `Veri taşıma sayfa hataları: ${migrationErrors.join(" | ")}`);

    const v07Page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const v07Errors = [];
    v07Page.on("pageerror", (error) => v07Errors.push(error.message));
    await v07Page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem("fittrack-beta-07-state", JSON.stringify({
        version: 7,
        profile: { firstName: "Berk", lastName: "V07", age: 24, height: 176, currentWeight: 105, targetWeight: 85, units: "kg" },
        history: [],
        currentWorkout: { id: "v07-upper", programId: "upper", exerciseIndex: 0, setIndex: 0, startedAt: new Date().toISOString(), logs: { 0: { 0: null } }, swaps: {}, skipped: [], status: "active" }
      }));
    });
    await v07Page.goto(baseUrl, { waitUntil: "networkidle" });
    assert(await v07Page.getByText(/Lat Pulldown · Set 1\/3/i).count() === 1, "Beta 0.7 aktif program kimliği uygulanmadı.");
    const migratedV07 = await v07Page.evaluate(() => JSON.parse(localStorage.getItem("fittrack-beta-010-state")));
    assert(migratedV07.version === 11 && migratedV07.currentWorkout.programId === "upper", "Beta 0.7 → 0.10.3 veri geçişi tamamlanmadı.");
    assert(migratedV07.currentWorkout.logs[0][0].completedAt === null, "Bozuk aktif set kaydı güvenli biçimde normalize edilmedi.");
    assert(v07Errors.length === 0, `Beta 0.7 geçiş sayfa hataları: ${v07Errors.join(" | ")}`);

    const backupPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const backupErrors = [];
    backupPage.on("pageerror", (error) => backupErrors.push(error.message));
    await backupPage.goto(baseUrl, { waitUntil: "networkidle" });
    await backupPage.evaluate(() => { localStorage.clear(); location.reload(); });
    await backupPage.waitForLoadState("networkidle");
    await backupPage.locator('.bottom-nav [data-tab="profile"]').click();
    await backupPage.locator('[data-action="privacy"]').click();
    const compatibleBackup = { format: "fittrack-backup", schema: 8, appVersion: "0.8.0", state: { profile: { firstName: "Berk", lastName: "Yedek", age: 24, height: 176, currentWeight: 105, targetWeight: 85, units: "kg" }, history: [], currentWorkout: { id: "bad-active", programId: "starter", exerciseIndex: 1.5, setIndex: 99, startedAt: "bozuk", logs: { 0: { 0: null, 99: { reps: "8" } } }, swaps: { 0: { id: "yok" } }, skipped: [99] } } };
    await backupPage.setInputFiles("#backupInput", { name: "uyumlu-bozuk.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(compatibleBackup)) });
    await backupPage.getByText(/geri yüklendi/i).waitFor();
    const normalizedBackup = await backupPage.evaluate(() => JSON.parse(localStorage.getItem("fittrack-beta-010-state")));
    assert(normalizedBackup.currentWorkout.exerciseIndex === 0 && normalizedBackup.currentWorkout.setIndex === 0, "Yedek aktif konumu güvenli sınıra çekilmedi.");
    assert(Object.keys(normalizedBackup.currentWorkout.logs[0]).length === 1, "Yedekteki geçersiz set dizini temizlenmedi.");
    await backupPage.locator('[data-action="privacy"]').click();
    await backupPage.locator('[data-action="confirm-clear-data"]').click();
    await backupPage.locator('[data-action="clear-data"]').click();
    const cleared = await backupPage.evaluate(() => JSON.parse(localStorage.getItem("fittrack-beta-010-state")));
    assert(cleared.history.length === 0 && cleared.currentWorkout === null && cleared.trainer.members.length === 1, "Tüm verileri sil akışı temiz başlangıç oluşturmadı.");
    assert(backupErrors.length === 0, `Yedek normalizasyon sayfa hataları: ${backupErrors.join(" | ")}`);

    const offlineContext = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: "allow" });
    const offlinePage = await offlineContext.newPage();
    const offlineErrors = [];
    offlinePage.on("pageerror", (error) => offlineErrors.push(error.message));
    await offlinePage.goto(baseUrl, { waitUntil: "networkidle" });
    await offlinePage.evaluate(() => navigator.serviceWorker.ready);
    await offlinePage.waitForTimeout(300);
    await offlineContext.setOffline(true);
    await offlinePage.reload({ waitUntil: "load" });
    assert(await offlinePage.locator(".hello-row h1").count() === 1, "Uygulama çevrimdışı yeniden açılamadı.");
    assert(offlineErrors.length === 0, `Çevrimdışı açılış sayfa hataları: ${offlineErrors.join(" | ")}`);
    await offlineContext.setOffline(false);
    await offlineContext.close();

    const nativeContext = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: "block" });
    const nativePage = await nativeContext.newPage();
    await nativePage.route("**/cloud.js*", (route) => route.fulfill({ status: 200, contentType: "application/javascript", body: "/* Native eklenti testi: bulut akışı ayrı doğrulanır. */" }));
    await nativePage.addInitScript(() => {
      window.__fittrackScheduled = null;
      window.__fittrackWritten = null;
      window.__fittrackShared = null;
      window.Capacitor = {
        isNativePlatform: () => true,
        Plugins: {
          LocalNotifications: {
            requestPermissions: async () => ({ display: "granted" }),
            cancel: async () => ({}),
            schedule: async (options) => { window.__fittrackScheduled = options; return options; }
          },
          Filesystem: { writeFile: async (options) => { window.__fittrackWritten = options; return { uri: "content://fittrack/backup.json" }; } },
          Share: { share: async (options) => { window.__fittrackShared = options; return options; } }
        }
      };
    });
    await nativePage.goto(baseUrl, { waitUntil: "load" });
    await nativePage.locator('.bottom-nav [data-tab="profile"]').click();
    await nativePage.locator('.setting-row[data-action="reminders"]').click();
    await nativePage.locator(".toggle-row").click();
    await nativePage.locator('[data-action="save-reminders"]').click();
    await nativePage.waitForFunction(() => Boolean(window.__fittrackScheduled));
    const scheduled = await nativePage.evaluate(() => window.__fittrackScheduled.notifications);
    assert(scheduled.length === 3, "Yerel bildirim seçili üç gün için planlanmadı.");
    assert(scheduled[0].schedule.on.weekday === 2 && scheduled[0].schedule.on.hour === 18, "Android bildirim gün/saat eşlemesi yanlış.");

    await nativePage.locator('[data-action="privacy"]').click();
    await nativePage.locator('[data-action="export-data"]').click();
    await nativePage.waitForFunction(() => Boolean(window.__fittrackShared));
    const nativeBackup = await nativePage.evaluate(() => ({ written: window.__fittrackWritten, shared: window.__fittrackShared }));
    assert(nativeBackup.written.path.startsWith("FitTrack-Yedek-") && nativeBackup.shared.url.startsWith("content://"), "Android yerel yedek paylaşımı çalışmadı.");
    await nativeContext.close();

    console.log("FitTrack Beta 0.11 comprehensive smoke test: PASS");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
