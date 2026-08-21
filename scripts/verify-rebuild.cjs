"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const webRoot = path.join(root, "www");
let passed = 0;

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function check(condition, message) {
  if (!condition) throw new Error(message);
  passed += 1;
  console.log(`PASS ${message}`);
}

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function listFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(absolute) : [absolute];
  });
}

const checksumLines = read("checksums/www.sha256").trim().split(/\r?\n/);
const expectedFiles = new Map(checksumLines.map((line) => {
  const match = line.match(/^([a-f0-9]{64})  (.+)$/);
  if (!match) throw new Error(`Invalid checksum line: ${line}`);
  return [match[2], match[1]];
}));
const actualFiles = listFiles(webRoot)
  .map((file) => path.relative(webRoot, file).split(path.sep).join("/"))
  .sort();

check(actualFiles.length === expectedFiles.size, "every Beta 0.11.4 web source file is checksummed");
check(actualFiles.every((file) => expectedFiles.has(file)), "checksum manifest covers the complete web payload");
for (const [relativePath, expectedHash] of expectedFiles) {
  const actualHash = sha256(path.join(webRoot, ...relativePath.split("/")));
  check(actualHash === expectedHash, `web source integrity: ${relativePath}`);
}

const packageJson = JSON.parse(read("package.json"));
const capacitorConfig = JSON.parse(read("capacitor.config.json"));
const appSource = read("www/app.js");
const appConfig = read("www/config.js");
const appGradle = read("android/app/build.gradle");
const variablesGradle = read("android/variables.gradle");
const manifest = read("android/app/src/main/AndroidManifest.xml");
const mainActivity = read("android/app/src/main/java/com/fittracklabs/mobile/MainActivity.java");
const strings = read("android/app/src/main/res/values/strings.xml");
const styles = read("android/app/src/main/res/values/styles.xml");
const colors = read("android/app/src/main/res/values/colors.xml");
const fittrackAppIcon = read("android/app/src/main/res/drawable/fittrack_app_icon.xml");
const fittrackSplash = read("android/app/src/main/res/drawable/fittrack_splash.xml");
const adaptiveIcon = read("android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml");
const adaptiveRoundIcon = read("android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml");

check(packageJson.version === "0.11.4", "package version is 0.11.4");
check(appSource.includes('var VERSION = "0.11.4";'), "in-app version is 0.11.4");
check(appConfig.includes('appVersion: "0.11.4"'), "runtime config version is 0.11.4");
check(appGradle.includes("versionCode 21"), "Android versionCode is 21");
check(appGradle.includes('versionName "0.11.4"'), "Android versionName is 0.11.4");
check(variablesGradle.includes("minSdkVersion = 24"), "Android minSdk is 24");
check(variablesGradle.includes("compileSdkVersion = 36"), "Android compileSdk is 36");
check(variablesGradle.includes("targetSdkVersion = 36"), "Android targetSdk is 36");

check(capacitorConfig.appId === "com.fittracklabs.mobile", "Capacitor appId matches the reference APK");
check(capacitorConfig.webDir === "www", "Capacitor webDir points to the preserved payload");
check(capacitorConfig.server.androidScheme === "https", "Capacitor Android scheme is https");
check(capacitorConfig.android.backgroundColor === "#080b10", "native background color matches the reference APK");
check(capacitorConfig.android.allowMixedContent === false, "mixed content remains disabled");
check(capacitorConfig.android.webContentsDebuggingEnabled === false, "release WebView debugging is disabled");
check(capacitorConfig.plugins.LocalNotifications.iconColor === "#8fffb1", "notification icon color matches the reference APK");

check(manifest.includes('android:allowBackup="false"'), "Android backup remains disabled");
check(manifest.includes('android:enableOnBackInvokedCallback="true"'), "Android predictive-back callback is enabled");
check(manifest.includes('android:icon="@drawable/fittrack_app_icon"'), "launcher icon uses the original FitTrack drawable");
check(manifest.includes('android:roundIcon="@drawable/fittrack_app_icon"'), "round launcher icon uses the original FitTrack drawable");
check(manifest.includes('android:launchMode="singleTask"'), "MainActivity launchMode remains singleTask");
check(manifest.includes('android:scheme="com.fittracklabs.mobile"'), "Auth callback scheme is declared");
check(manifest.includes('android:host="auth-callback"'), "Auth callback host is declared");
check(manifest.includes("android.permission.SCHEDULE_EXACT_ALARM"), "exact-alarm permission is declared");

check(strings.includes('<string name="app_name">FitTrack</string>'), "application name spelling remains FitTrack");
check(strings.includes('<string name="title_activity_main">FitTrack</string>'), "main activity label remains FitTrack");
check(colors.includes('<color name="fittrack_background">#FF080B10</color>'), "original opaque splash background color is preserved");
check(fittrackAppIcon.includes('android:width="108dp"') && fittrackAppIcon.includes('android:height="108dp"'), "original FitTrack icon dimensions are preserved");
check(fittrackAppIcon.includes('android:viewportWidth="512"') && fittrackAppIcon.includes('android:viewportHeight="512"'), "original FitTrack icon viewport is preserved");
check(fittrackAppIcon.includes('android:fillColor="#FF0B0F16"') && fittrackAppIcon.includes('android:fillColor="#FFF3F7F3"') && fittrackAppIcon.includes('android:fillColor="#FF8FFFB1"'), "original FitTrack icon colors and alpha are preserved");
check(fittrackAppIcon.includes('M124,126H388V196H205V254H355V322H205V434H124Z') && fittrackAppIcon.includes('M369,324A43,43 0,1 0,369 410A43,43 0,1 0,369 324'), "original FitTrack icon geometry is preserved");
check(fittrackSplash.includes('android:drawable="@color/fittrack_background"'), "original splash background drawable is preserved");
check(fittrackSplash.includes('android:drawable="@drawable/fittrack_app_icon"') && fittrackSplash.includes('android:width="132dp"') && fittrackSplash.includes('android:height="132dp"'), "original centered 132dp splash icon is preserved");
check(styles.includes('<item name="android:background">@drawable/fittrack_splash</item>'), "launch theme uses the original FitTrack splash drawable");
check(styles.includes('<item name="windowSplashScreenAnimatedIcon">@drawable/fittrack_app_icon</item>'), "Android splash API uses the original FitTrack icon");
check(styles.includes('<item name="windowSplashScreenBackground">@color/fittrack_background</item>'), "Android splash API uses the original FitTrack background");
check(styles.includes('<item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>'), "post-splash theme matches the original APK");
check(adaptiveIcon.includes('android:drawable="@color/ic_launcher_background"') && adaptiveIcon.includes('android:drawable="@mipmap/ic_launcher_foreground"'), "adaptive icon foreground/background references match the original APK");
check(adaptiveRoundIcon.includes('android:drawable="@color/ic_launcher_background"') && adaptiveRoundIcon.includes('android:drawable="@mipmap/ic_launcher_foreground"'), "round adaptive icon foreground/background references match the original APK");

check(mainActivity.includes("window.FitTrackNativeBack&&window.FitTrackNativeBack()"), "native back bridge calls FitTrackNativeBack");
check(mainActivity.includes("getOnBackPressedDispatcher().addCallback"), "AndroidX back dispatcher callback is registered");
check(mainActivity.includes('if (!"true".equals(handled))'), "unhandled back moves the task to background");
check(mainActivity.includes("moveTaskToBack(true)"), "reference APK task-background fallback is retained");

check(appSource.includes("var SCHEMA = 14;"), "app.js schema is 14");
check(appConfig.includes("schemaVersion: 14"), "runtime schemaVersion is aligned to 14");

const gifIds = [
  "bench-press", "goblet-squat", "lat-pulldown", "push-up", "bodyweight-squat", "seated-cable-row",
  "incline-db-press", "pec-deck", "cable-crossover", "overhead-press", "lateral-raise", "face-pull",
  "triceps-pushdown", "dips", "barbell-row", "one-arm-row", "pull-up", "biceps-curl", "hammer-curl",
  "back-squat", "leg-press", "romanian-deadlift", "leg-curl", "leg-extension", "calf-raise", "hip-thrust",
  "walking-lunge", "deadlift", "glute-bridge", "plank", "crunch", "hanging-leg-raise", "russian-twist",
  "mountain-climber", "kettlebell-swing", "burpee"
];
gifIds.forEach((id) => {
  const gifPath = path.join(webRoot, "assets", "gifs", `${id}.gif`);
  check(fs.existsSync(gifPath) && fs.readFileSync(gifPath, { encoding: "ascii", flag: "r" }).slice(0, 6).startsWith("GIF8"), `exercise animation exists: ${id}`);
});
check(fs.existsSync(path.join(webRoot, "assets", "fonts", "InterVariable.woff2")), "bundled Inter variable font exists");
check(fs.existsSync(path.join(webRoot, "assets", "fonts", "Inter-OFL-1.1.txt")), "Inter font license is included");

check(appSource.includes('data-action="studio-cancel-selection">Vazgeç</button>') && appSource.includes('data-action="studio-finish-selection">Seçimi uygula</button>'), "Program Builder uses explicit apply/cancel selection");
check(appSource.includes("STUDIO_RECOVERY_PREFIX") && appSource.includes("Kaydedilmemiş değişiklikler var."), "Program Builder draft recovery and dirty-exit warning are present");
check(appSource.includes("studio-remove-day-confirmed") && appSource.includes("showUndo"), "destructive editor actions have confirmation and undo support");
check(appSource.includes("isGymAdmin() ? renderAdminHome()") && appSource.includes("isGymAdmin() ? renderAdminProgress()"), "gym-admin routes use member operations and progress screens");
check(appSource.includes("migrateProgramRevisionAssignments") && appSource.includes("Eski sürümde bırak"), "published program revisions preserve an explicit assignment migration choice");
check(appSource.includes("trainerAssignmentNote") && appSource.includes("GENEL ÜYE NOTU"), "assignment note and general member note are separate fields");
check(appSource.includes("exerciseElapsedMs") && appSource.includes("durationMinutes"), "per-exercise elapsed time is recorded for new workouts");
check(appSource.includes("graphite") && appSource.includes("porcelain") && appSource.includes("aurora") && appSource.includes("plum"), "four premium theme variants are registered");
check(appSource.includes("./assets/gifs/\" + id + \".gif"), "built-in exercise catalog resolves generated GIFs by id");

const cloudSource = read("www/cloud.js");
check(cloudSource.includes("detectSessionInUrl: !isNative()"), "native auth client does not parse stale URL sessions");
check(cloudSource.includes("Oturumun korunuyor; bulut bağlantısı yeniden denenecek."), "bootstrap failures preserve the local authenticated experience");
check(cloudSource.includes('from("member_coach_notes").upsert') && cloudSource.includes('from("gym_exercises").upsert'), "admin notes and gym movements have queued cloud persistence");

const beta114Migration = read("www/supabase/fittrack_beta_0114_gym_exercises.sql");
check(beta114Migration.includes("enable row level security") && beta114Migration.includes("gym_exercises_insert_admin"), "gym exercise migration enables admin-scoped RLS");
check(beta114Migration.includes("member_coach_notes") && beta114Migration.includes("member_coach_notes_select_staff"), "general member notes have separate staff-scoped RLS");

const nativePluginsPath = path.join(root, "android/app/src/main/assets/capacitor.plugins.json");
check(fs.existsSync(nativePluginsPath), "Capacitor native plugin registry was generated");
const nativePlugins = JSON.parse(fs.readFileSync(nativePluginsPath, "utf8"));
const pluginPackages = nativePlugins.map((plugin) => plugin.pkg).sort();
check(JSON.stringify(pluginPackages) === JSON.stringify([
  "@capacitor/app",
  "@capacitor/filesystem",
  "@capacitor/local-notifications",
  "@capacitor/share"
]), "native plugin set matches the reference APK");

const copiedWebRoot = path.join(root, "android/app/src/main/assets/public");
for (const [relativePath, expectedHash] of expectedFiles) {
  const copiedPath = path.join(copiedWebRoot, ...relativePath.split("/"));
  check(fs.existsSync(copiedPath) && sha256(copiedPath) === expectedHash, `Capacitor copied source hash: ${relativePath}`);
}

console.log(`\nAll ${passed} reproducible-build checks passed.`);
