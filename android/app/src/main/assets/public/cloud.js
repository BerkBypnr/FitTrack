(function () {
  "use strict";

  var config = window.FITTRACK_CONFIG || {};
  var client = null;
  var bridge = null;
  var session = null;
  var profile = null;
  var membership = null;
  var gym = null;
  var realtimeChannel = null;
  var realtimeTopic = "";
  var offlineSessionOnly = false;
  var flushPromise = null;
  var stateTimer = null;
  var bootstrapTimer = null;
  var authLayer = null;
  var lastInvite = "";
  var appUrlListener = null;
  var DEVICE_KEY = "fittrack-beta-010-device-id";
  var ACTIVE_GYM_KEY = "fittrack-beta-010-active-gym";
  var LAST_INVITE_KEY = "fittrack-beta-010-last-invite";
  var QUEUE_PREFIX = "fittrack-beta-010-queue-";
  var SNAPSHOT_PREFIX = "fittrack-beta-010-snapshot-version-";

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>'"]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char];
    });
  }

  function uuid() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
    var bytes = new Uint8Array(16);
    if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(bytes);
    else for (var index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    var hex = Array.from(bytes).map(function (byte) { return byte.toString(16).padStart(2, "0"); }).join("");
    return hex.slice(0, 8) + "-" + hex.slice(8, 12) + "-" + hex.slice(12, 16) + "-" + hex.slice(16, 20) + "-" + hex.slice(20);
  }

  function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || "null") || fallback; }
    catch (_) { return fallback; }
  }

  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (error) { console.warn("FitTrack bulut kuyruğu kaydedilemedi", error); }
  }

  function deviceId() {
    var key = DEVICE_KEY + "-" + (session && session.user ? session.user.id : "signed-out");
    var value = localStorage.getItem(key);
    if (!/^[0-9a-f-]{36}$/i.test(value || "")) {
      value = uuid();
      localStorage.setItem(key, value);
    }
    return value;
  }

  function isNative() {
    try {
      return Boolean(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
    } catch (_) { return false; }
  }

  function isLocalPreview() {
    if (window.FITTRACK_FORCE_CLOUD) return false;
    var localHost = location.hostname === "127.0.0.1" || location.hostname === "localhost";
    return Boolean(config.localPreviewOnDesktop && localHost && !isNative());
  }

  function queueKey() {
    return QUEUE_PREFIX + (session && session.user ? session.user.id : "signed-out");
  }

  function snapshotKey() {
    return SNAPSHOT_PREFIX + (session && session.user ? session.user.id : "signed-out") + "-" + (gym ? gym.id : "none");
  }

  function activeGymKey() {
    return ACTIVE_GYM_KEY + "-" + (session && session.user ? session.user.id : "signed-out");
  }

  function lastInviteKey() {
    return LAST_INVITE_KEY + "-" + (session && session.user ? session.user.id : "signed-out") + "-" + (gym ? gym.id : "none");
  }

  function queue() { return readJson(queueKey(), []); }
  function saveQueue(items) { writeJson(queueKey(), items.slice(-250)); updateStatus(); }

  function enqueue(type, payload, stableId) {
    var items = queue();
    var id = stableId || type + ":" + uuid();
    var existing = items.findIndex(function (item) { return item.id === id; });
    var next = { id: id, type: type, payload: payload, attempts: existing >= 0 ? items[existing].attempts : 0, createdAt: new Date().toISOString() };
    if (existing >= 0) items[existing] = next;
    else items.push(next);
    saveQueue(items);
    return id;
  }

  function removeQueueItem(id) {
    saveQueue(queue().filter(function (item) { return item.id !== id; }));
  }

  function ensureLayer() {
    authLayer = document.getElementById("authLayer");
    if (!authLayer) {
      authLayer = document.createElement("section");
      authLayer.id = "authLayer";
      authLayer.className = "auth-layer";
      authLayer.setAttribute("aria-live", "polite");
      document.body.appendChild(authLayer);
    }
    return authLayer;
  }

  function showLayer(content, modal) {
    ensureLayer();
    authLayer.className = "auth-layer active" + (modal ? " modal" : "");
    authLayer.innerHTML = content;
    var focus = authLayer.querySelector("input:not([type=hidden]), button");
    if (focus) window.setTimeout(function () { focus.focus(); }, 80);
  }

  function hideLayer() {
    ensureLayer();
    authLayer.className = "auth-layer";
    authLayer.innerHTML = "";
  }

  function shell(kicker, title, copy, body) {
    return '<div class="auth-scroll"><main class="auth-card"><div class="auth-brand"><span>⚡</span><b>FITT<em>RACK</em></b></div>' +
      '<p class="eyebrow">' + esc(kicker) + '</p><h1>' + esc(title) + '</h1><p class="auth-copy">' + esc(copy) + '</p>' + body + '</main></div>';
  }

  function field(id, label, type, placeholder, autocomplete) {
    return '<div class="field"><label for="' + id + '">' + esc(label) + '</label><input id="' + id + '" name="' + id + '" type="' + type + '" placeholder="' + esc(placeholder) + '" autocomplete="' + esc(autocomplete || "off") + '" required></div>';
  }

  function authError(error) {
    var message = String(error && error.message || error || "");
    if (/invalid login credentials/i.test(message)) return "E-posta veya şifre hatalı.";
    if (/email not confirmed/i.test(message)) return "Önce e-postana gelen doğrulama bağlantısını aç.";
    if (/user already registered/i.test(message)) return "Kayıt isteği tamamlanamadı. Giriş yapmayı veya şifre yenilemeyi dene.";
    if (/password/i.test(message) && /characters|length|weak/i.test(message)) return "Şifre en az 8 karakter olmalı.";
    if (/network|fetch|offline/i.test(message)) return "İnternet bağlantısı kurulamadı. Yerel verilerin güvende.";
    if (/INVITE_NOT_AVAILABLE|INVALID_INVITE/i.test(message)) return "Davet kodu geçersiz, süresi dolmuş veya kullanım hakkı bitmiş.";
    if (/NOT_GYM|ADMIN_REQUIRED|MEMBER_NOT_IN_GYM/i.test(message)) return "Bu işlem için salon yetkin bulunmuyor.";
    return message || "İşlem tamamlanamadı. Tekrar dene.";
  }

  function renderAuth(mode, notice) {
    mode = mode || "login";
    var signup = mode === "signup";
    var body = '<div class="auth-tabs"><button data-cloud-action="auth-tab" data-mode="login" class="' + (!signup ? "active" : "") + '">Giriş</button><button data-cloud-action="auth-tab" data-mode="signup" class="' + (signup ? "active" : "") + '">Kayıt</button></div>' +
      (notice ? '<p class="auth-notice">' + esc(notice) + '</p>' : '') +
      '<form data-cloud-form="' + (signup ? "signup" : "login") + '">' +
      (signup ? field("authName", "AD SOYAD", "text", "Adın ve soyadın", "name") : "") +
      field("authEmail", "E-POSTA", "email", "ornek@email.com", "email") +
      field("authPassword", "ŞİFRE", "password", "En az 8 karakter", signup ? "new-password" : "current-password") +
      (signup ? '<label class="auth-consent"><input id="authConsent" type="checkbox" required><span>Beta gizlilik ve kullanım koşullarını okudum. Rol ve sağlık verisi izni e-posta doğrulamasından sonra sorulacak.</span></label>' : "") +
      '<button class="primary-btn" type="submit">' + (signup ? "Hesap oluştur" : "Giriş yap") + '</button></form>' +
      (!signup ? '<button class="auth-link" data-cloud-action="forgot-password">Şifremi unuttum</button>' : '') +
      '<p class="auth-security">Oturum Supabase Auth ile korunur. Salon verileri rol ve salon üyeliğine göre veritabanında ayrılır.</p>';
    showLayer(shell("BETA 0.11 · GÜVENLİ BULUT", signup ? "Gerçek hesabını oluştur." : "Kaldığın yer her cihazda.", signup ? "Önce e-postanı doğrula; rolünü ve salon bağlantını ardından seç." : "Antrenmanların, mesajların ve çevrimdışı kayıtların hesabınla eşleşir.", body));
  }

  function renderConfirmation(email) {
    showLayer(shell("E-POSTANI KONTROL ET", "İsteğin alındı.", email + " adresi yeni ise doğrulama bağlantısı gönderildi. Daha önce kayıt olduysan giriş yap veya şifreni yenile.", '<div class="auth-success">✓</div><button class="primary-btn" data-cloud-action="auth-tab" data-mode="login">Giriş ekranına dön</button>'));
  }

  function validEmail(value) {
    var email = String(value || "").trim();
    return email.length <= 254 && /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i.test(email);
  }

  function renderPasswordUpdate(message) {
    var body = (message ? '<p class="auth-notice">' + esc(message) + '</p>' : '') +
      '<form data-cloud-form="update-password">' +
      field("newPassword", "YENİ ŞİFRE", "password", "En az 8 karakter", "new-password") +
      field("confirmPassword", "YENİ ŞİFRE TEKRAR", "password", "Şifreni tekrar yaz", "new-password") +
      '<button class="primary-btn" type="submit">Şifreyi güncelle</button></form>';
    showLayer(shell("ŞİFRE YENİLEME", "Yeni şifreni belirle.", "Bağlantı doğrulandı. Yeni şifreni yalnız bu ekrandan kaydet.", body));
  }

  function authParamsFromUrl(value) {
    var parsed = new URL(String(value || ""));
    var params = new URLSearchParams(parsed.search || "");
    new URLSearchParams((parsed.hash || "").replace(/^#/, "")).forEach(function (item, key) {
      if (!params.has(key)) params.set(key, item);
    });
    return params;
  }

  async function handleAuthCallbackUrl(value) {
    if (!client || !value || String(value).indexOf(config.authRedirectTo) !== 0) return false;
    var params = authParamsFromUrl(value);
    var callbackError = params.get("error_description") || params.get("error");
    if (callbackError) throw new Error(callbackError);

    var authResult;
    if (params.get("code") && typeof client.auth.exchangeCodeForSession === "function") {
      authResult = await client.auth.exchangeCodeForSession(params.get("code"));
    } else if (params.get("access_token") && params.get("refresh_token")) {
      authResult = await client.auth.setSession({
        access_token: params.get("access_token"),
        refresh_token: params.get("refresh_token")
      });
    } else {
      authResult = await client.auth.getSession();
    }
    if (authResult.error) throw authResult.error;
    var nextSession = authResult.data && authResult.data.session;
    if (!nextSession) throw new Error("Doğrulama bağlantısında geçerli oturum bulunamadı.");
    session = nextSession;
    if (params.get("type") === "recovery") {
      renderPasswordUpdate();
      return true;
    }
    await handleSession(nextSession);
    return true;
  }

  async function registerAuthDeepLinks() {
    var appPlugin = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
    if (!isNative() || !appPlugin) return false;
    if (!appUrlListener && typeof appPlugin.addListener === "function") {
      appUrlListener = await appPlugin.addListener("appUrlOpen", function (event) {
        handleAuthCallbackUrl(event && event.url).catch(function (error) {
          renderAuth("login", authError(error));
        });
      });
    }
    if (typeof appPlugin.getLaunchUrl !== "function") return false;
    var launch = await appPlugin.getLaunchUrl();
    return Boolean(launch && launch.url && await handleAuthCallbackUrl(launch.url));
  }

  function renderProfileSetup(existing) {
    var name = existing && existing.display_name !== "FitTrack Kullanıcısı" ? existing.display_name : "";
    var role = existing && existing.role_preference === "trainer" ? "trainer" : "member";
    var body = '<form data-cloud-form="profile"><div class="field"><label for="setupName">AD SOYAD</label><input id="setupName" type="text" maxlength="80" value="' + esc(name) + '" placeholder="Adın ve soyadın" required></div>' +
      '<div class="auth-role"><span>ROLÜN</span><label><input type="radio" name="setupRole" value="member" ' + (role === "member" ? "checked" : "") + '><i>Üye</i><small>Programımı uygularım</small></label><label><input type="radio" name="setupRole" value="trainer" ' + (role === "trainer" ? "checked" : "") + '><i>Antrenör</i><small>Salonumu yönetirim</small></label></div>' +
      '<label class="auth-consent"><input id="setupConsent" type="checkbox" required><span>Beta gizlilik, kullanım ve sağlık verisi işleme koşullarını kabul ediyorum.</span></label>' +
      '<button class="primary-btn" type="submit">Devam et</button></form>';
    showLayer(shell("HESAP KURULUMU", "Seni doğru alana yerleştirelim.", "Rol, görünümü belirler; gerçek yetki salon üyeliğiyle veritabanında atanır.", body));
  }

  function renderGymSetup(role, notice) {
    var trainer = role === "trainer";
    var body = notice ? '<p class="auth-notice">' + esc(notice) + '</p>' : '';
    if (trainer) {
      body += '<section class="auth-choice"><h2>Yeni salon oluştur</h2><p>İlk yönetici sen olursun; üyeler için davet kodu üretilir.</p><form data-cloud-form="create-gym">' + field("gymName", "SALON ADI", "text", "Örn. Nova Fitness", "organization") + '<button class="primary-btn" type="submit">Salonu oluştur</button></form></section><div class="auth-or"><span>veya</span></div>';
    }
    body += '<section class="auth-choice"><h2>Davet koduyla katıl</h2><p>' + (trainer ? "Salon yöneticisinin antrenör davet kodunu" : "Antrenörünün veya salonunun davet kodunu") + ' gir.</p><form data-cloud-form="join-gym">' + field("inviteCode", "DAVET KODU", "text", "FT-XXXXXXXX", "one-time-code") + '<button class="secondary-btn" type="submit">Salona bağlan</button></form></section><button class="auth-link danger" data-cloud-action="sign-out">Farklı hesapla giriş yap</button>';
    showLayer(shell("SALON BAĞLANTISI", trainer ? "Salonunu kur veya ekibine katıl." : "Antrenörüne bağlan.", "Salon bağlantısı olmadan hiçbir üye, program veya antrenman verisi paylaşılmaz.", body));
  }

  function renderInviteResult(code, gymName) {
    lastInvite = code;
    localStorage.setItem(lastInviteKey(), code);
    var body = '<div class="invite-result"><small>ÜYE DAVET KODU</small><strong>' + esc(code) + '</strong><p>' + esc(gymName) + ' üyeleri bu kodla salona katılabilir.</p></div><button class="primary-btn" data-cloud-action="copy-invite" data-code="' + esc(code) + '">Kodu kopyala</button><button class="secondary-btn" data-cloud-action="continue-bootstrap">Panele devam et</button>';
    showLayer(shell("SALON HAZIR", "İlk bağlantı kodun oluşturuldu.", "Kodu yalnız salona katılmasını istediğin kişilerle paylaş.", body), true);
  }

  function renderInviteManager(message) {
    if (!membership || ["admin", "trainer"].indexOf(membership.role) === -1) return;
    var saved = lastInvite || localStorage.getItem(lastInviteKey()) || "";
    var body = (message ? '<p class="auth-notice">' + esc(message) + '</p>' : '') +
      (saved ? '<div class="invite-result compact"><small>SON ÜYE KODU</small><strong>' + esc(saved) + '</strong></div>' : '') +
      '<form data-cloud-form="create-invite"><div class="form-grid"><div class="field"><label for="inviteUses">KULLANIM</label><input id="inviteUses" type="number" min="1" max="100" value="10" required></div><div class="field"><label for="inviteDays">GEÇERLİ GÜN</label><input id="inviteDays" type="number" min="1" max="90" value="7" required></div></div><button class="primary-btn" type="submit">Yeni üye kodu üret</button></form>' +
      (saved ? '<button class="secondary-btn" data-cloud-action="copy-invite" data-code="' + esc(saved) + '">Son kodu kopyala</button>' : '') + '<button class="auth-link" data-cloud-action="close-auth-modal">Kapat</button>';
    showLayer(shell("SALON DAVETİ", "Üyeyi güvenli kodla bağla.", "Kod süre ve kullanım sınırına sahiptir; başka salon verisine erişim vermez.", body), true);
  }

  function renderAccountManager(message) {
    if (!session || !session.user) return renderAuth("login");
    var role = membership ? ({ admin: "Salon yöneticisi", trainer: "Antrenör", member: "Üye" }[membership.role] || membership.role) : "Salon bağlantısı yok";
    var body = (message ? '<p class="auth-notice">' + esc(message) + '</p>' : '') + '<div class="account-summary"><span>' + esc((profile && profile.display_name || session.user.email || "FT").split(/\s+/).map(function (part) { return part.charAt(0); }).slice(0, 2).join("").toUpperCase()) + '</span><div><strong>' + esc(profile && profile.display_name || "FitTrack Kullanıcısı") + '</strong><small>' + esc(session.user.email || "") + '</small><em>' + esc(role + (gym ? " · " + gym.name : "")) + '</em></div></div>' +
      '<div class="account-actions"><button data-cloud-action="sync-now"><b>↻</b><span><strong>Şimdi senkronize et</strong><small>Bekleyen ' + queue().length + ' işlem</small></span></button><button data-cloud-action="export-cloud"><b>⇩</b><span><strong>Bulut verilerimi dışa aktar</strong><small>JSON dosyası olarak indir</small></span></button>' +
      (membership && ["admin", "trainer"].indexOf(membership.role) !== -1 ? '<button data-cloud-action="invite-manager"><b>＋</b><span><strong>Davet kodu oluştur</strong><small>Üyeyi salona bağla</small></span></button>' : '') +
      '<button data-cloud-action="sign-out"><b>↪</b><span><strong>Bu cihazdan çıkış yap</strong><small>Diğer cihazlar açık kalır</small></span></button><button data-cloud-action="sign-out-all"><b>⊘</b><span><strong>Tüm cihazlardan çıkış yap</strong><small>Bütün yenileme oturumlarını kapat</small></span></button><button class="danger" data-cloud-action="delete-account"><b>×</b><span><strong>Hesabı ve verileri sil</strong><small>Geri alınamaz</small></span></button></div><button class="auth-link" data-cloud-action="close-auth-modal">Kapat</button>';
    showLayer(shell("HESAP VE BULUT", "Oturum kontrolü sende.", "Cihaz, senkronizasyon ve veri haklarını buradan yönetebilirsin.", body), true);
  }

  function renderDeleteConfirm(message) {
    var body = (message ? '<p class="auth-error">' + esc(message) + '</p>' : '') + '<div class="delete-warning"><strong>Bu işlem geri alınamaz.</strong><p>Profil, salon üyelikleri, program atamaları ve antrenman kayıtların kalıcı olarak silinir.</p></div><form data-cloud-form="delete-account"><div class="field"><label for="deletePhrase">ONAY İÇİN SİL YAZ</label><input id="deletePhrase" autocomplete="off" required></div><button class="primary-btn danger-btn" type="submit">Hesabımı kalıcı sil</button></form><button class="auth-link" data-cloud-action="account-manager">Vazgeç</button>';
    showLayer(shell("HESAP SİLME", "Emin misin?", "Veri silme talebi kullanıcı oturumunla doğrulanır.", body), true);
  }

  function setBusy(form, busy) {
    if (!form) return;
    Array.from(form.querySelectorAll("button, input, select")).forEach(function (control) { control.disabled = busy; });
    var button = form.querySelector('button[type="submit"]');
    if (button) {
      if (busy) { button.dataset.label = button.textContent; button.textContent = "İşleniyor…"; }
      else if (button.dataset.label) button.textContent = button.dataset.label;
    }
  }

  function waitForBridge() {
    if (window.FitTrackBridge) return Promise.resolve(window.FitTrackBridge);
    return new Promise(function (resolve) {
      window.addEventListener("fittrack:bridge-ready", function () { resolve(window.FitTrackBridge); }, { once: true });
    });
  }

  function setStatus(status, detail) {
    if (bridge && bridge.setCloudStatus) bridge.setCloudStatus(status, detail || "", queue().length);
  }

  function updateStatus() {
    if (!session) return setStatus("signed-out", "Giriş gerekli");
    if (!navigator.onLine) return setStatus("offline", queue().length ? queue().length + " işlem bekliyor" : "Çevrimdışı");
    if (flushPromise) return setStatus("syncing", "Senkronize ediliyor");
    setStatus(queue().length ? "pending" : "synced", queue().length ? queue().length + " işlem bekliyor" : "Güncel");
  }

  function pendingProfileName() {
    var item = queue().slice().reverse().find(function (entry) { return entry.type === "profile" && entry.payload && entry.payload.displayName; });
    return item ? item.payload.displayName : "";
  }

  function resumeOfflineAccount() {
    var cached = bridge && bridge.getCachedAccountContext ? bridge.getCachedAccountContext() : null;
    if (!cached || !cached.userId) return false;
    offlineSessionOnly = true;
    session = { user: { id: cached.userId, email: cached.email || "" } };
    membership = cached.gymId ? { gym_id: cached.gymId, user_id: cached.userId, role: cached.role || "member", active: true } : null;
    gym = cached.gymId ? { id: cached.gymId, name: cached.gymName || "" } : null;
    if (bridge.activateAccount) bridge.activateAccount(cached.userId, cached.email || "");
    hideLayer();
    setStatus("offline", queue().length ? queue().length + " işlem bağlantı bekliyor" : "Çevrimdışı kullanım · yerel veriler hazır");
    return true;
  }

  async function revalidateOfflineSession() {
    if (!offlineSessionOnly || !client || !navigator.onLine) return false;
    var result = await client.auth.getSession();
    if (result.error) { setStatus("error", "Bağlantı doğrulanamadı; yerel veriler açık"); return false; }
    if (!result.data || !result.data.session) { setStatus("error", "Oturum doğrulanamadı; yerel verilerin açık"); return false; }
    offlineSessionOnly = false;
    await handleSession(result.data.session);
    return true;
  }

  async function fetchProfile() {
    var result = await client.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
    if (result.error) throw result.error;
    return result.data;
  }

  async function fetchMemberships() {
    var result = await client.from("gym_memberships").select("gym_id,user_id,role,trainer_id,active,joined_at").eq("user_id", session.user.id).eq("active", true).order("joined_at", { ascending: true });
    if (result.error) throw result.error;
    return result.data || [];
  }

  async function chooseMembership(items) {
    if (!items.length) return null;
    var preferred = localStorage.getItem(activeGymKey());
    var selected = items.find(function (item) { return item.gym_id === preferred; }) || items[0];
    var gymResult = await client.from("gyms").select("id,name,created_by,created_at").eq("id", selected.gym_id).single();
    if (gymResult.error) throw gymResult.error;
    membership = selected;
    gym = gymResult.data;
    localStorage.setItem(activeGymKey(), gym.id);
    return selected;
  }

  async function handleSession(nextSession) {
    offlineSessionOnly = false;
    session = nextSession || null;
    lastInvite = "";
    unsubscribeRealtime();
    if (!session || !session.user) {
      profile = null; membership = null; gym = null;
      if (bridge && bridge.deactivateAccount) bridge.deactivateAccount();
      renderAuth("login");
      updateStatus();
      return;
    }

    if (bridge && bridge.activateAccount) bridge.activateAccount(session.user.id, session.user.email || "");
    if (!navigator.onLine) {
      hideLayer();
      setStatus("offline", "Çevrimdışı kullanım · bağlantı gelince eşitlenecek");
      return;
    }
    showLayer(shell("BULUT BAĞLANTISI", "Hesabın yükleniyor.", "Salon, program ve çevrimdışı kayıtların güvenli biçimde eşleştiriliyor.", '<div class="auth-loader"><i></i><i></i><i></i></div>'));
    try {
      profile = await fetchProfile();
      if (!profile || !profile.onboarding_complete) return renderProfileSetup(profile);
      var memberships = await fetchMemberships();
      if (!memberships.length) return renderGymSetup(profile.role_preference);
      await chooseMembership(memberships);
      await bootstrap();
    } catch (error) {
      if (!navigator.onLine || /network|fetch|offline|failed to fetch/i.test(String(error && error.message || error))) {
        hideLayer();
        setStatus("offline", "Bağlantı kurulamadı; yerel veriler açık");
        return;
      }
      console.error("FitTrack bootstrap failed while session is still present", error);
      hideLayer();
      setStatus("error", "Bulut verileri alınamadı; yerel verilerin açık");
      if (bridge && bridge.notify) bridge.notify("Oturumun korunuyor; bulut bağlantısı yeniden denenecek.");
    }
  }

  async function bootstrap() {
    if (!session || !membership || !gym) return;
    setStatus("syncing", "Bulut verileri alınıyor");
    var staff = ["admin", "trainer"].indexOf(membership.role) !== -1;
    var programsPromise = client.from("programs").select("*").eq("gym_id", gym.id).order("updated_at", { ascending: false });
    var assignmentsPromise = client.from("program_assignments").select("*").eq("gym_id", gym.id).eq("active", true).order("assigned_at", { ascending: false });
    var snapshotsPromise = client.from("member_snapshots").select("*").eq("gym_id", gym.id);
    var workoutsPromise = client.from("workout_sessions").select("*").eq("gym_id", gym.id).order("finished_at", { ascending: false }).limit(staff ? 1000 : 300);
    var membersPromise = staff ? client.from("gym_memberships").select("gym_id,user_id,role,trainer_id,joined_at").eq("gym_id", gym.id).eq("role", "member").eq("active", true) : Promise.resolve({ data: [], error: null });
    var messagesPromise = client.from("chat_messages").select("*").eq("gym_id", gym.id).order("created_at", { ascending: true }).limit(staff ? 2000 : 500);
    var gymExercisesPromise = staff ? client.from("gym_exercises").select("*").eq("gym_id", gym.id).eq("active", true).order("name", { ascending: true }).then(function (result) { if (result.error && /gym_exercises|does not exist|schema cache/i.test(String(result.error.message || result.error.details || ""))) return { data: [], error: null }; return result; }) : Promise.resolve({ data: [], error: null });
    var memberNotesPromise = staff ? client.from("member_coach_notes").select("*").eq("gym_id", gym.id).then(function (result) { if (result.error && /member_coach_notes|does not exist|schema cache/i.test(String(result.error.message || result.error.details || ""))) return { data: [], error: null }; return result; }) : Promise.resolve({ data: [], error: null });
    var values = await Promise.all([programsPromise, assignmentsPromise, snapshotsPromise, workoutsPromise, membersPromise, messagesPromise, gymExercisesPromise, memberNotesPromise]);
    values.forEach(function (result) { if (result.error) throw result.error; });

    var members = values[4].data || [];
    var profileIds = members.map(function (item) { return item.user_id; });
    (values[1].data || []).forEach(function (item) { if (item.trainer_id) profileIds.push(item.trainer_id); });
    if (membership.trainer_id) profileIds.push(membership.trainer_id);
    if (gym.created_by) profileIds.push(gym.created_by);
    profileIds = profileIds.filter(function (id, index, list) { return id && list.indexOf(id) === index; });
    var relatedProfiles = [];
    if (profileIds.length) {
      var profileResult = await client.from("profiles").select("id,display_name,role_preference").in("id", profileIds);
      if (profileResult.error) throw profileResult.error;
      relatedProfiles = profileResult.data || [];
    }

    var ownSnapshot = (values[2].data || []).find(function (item) { return item.user_id === session.user.id; });
    if (ownSnapshot) localStorage.setItem(snapshotKey(), String(ownSnapshot.state_version));
    bridge.applyCloudBootstrap({
      user: { id: session.user.id, email: session.user.email || "" },
      profile: profile,
      membership: membership,
      gym: gym,
      profiles: relatedProfiles,
      members: members,
      programs: values[0].data || [],
      assignments: values[1].data || [],
      snapshots: values[2].data || [],
      workouts: values[3].data || [],
      messages: values[5].data || [],
      gymExercises: values[6].data || [],
      memberNotes: values[7].data || [],
      ownSnapshot: ownSnapshot || null,
      pendingProfileName: pendingProfileName()
    });

    await registerDevice();
    hideLayer();
    subscribeRealtime();
    if (!ownSnapshot) scheduleStateSync(true);
    await flushQueue();
  }

  async function registerDevice() {
    var platform = isNative() ? "android" : "web";
    var deviceName = isNative() ? "Android cihaz" : (navigator.userAgentData && navigator.userAgentData.platform || navigator.platform || "Web tarayıcı");
    var result = await client.from("user_devices").upsert({
      id: deviceId(),
      user_id: session.user.id,
      platform: platform,
      app_version: config.appVersion || "0.11.4",
      device_name: String(deviceName).slice(0, 100),
      last_seen_at: new Date().toISOString()
    }, { onConflict: "id" });
    if (result.error) throw result.error;
  }

  function subscribeRealtime() {
    if (!client || !gym || !session) return;
    var topic = "fittrack-" + gym.id + "-" + session.user.id;
    if (realtimeChannel && realtimeTopic === topic) return;
    unsubscribeRealtime();
    realtimeTopic = topic;
    realtimeChannel = client.channel(topic)
      .on("postgres_changes", { event: "*", schema: "public", table: "program_assignments", filter: "gym_id=eq." + gym.id }, scheduleBootstrap)
      .on("postgres_changes", { event: "*", schema: "public", table: "programs", filter: "gym_id=eq." + gym.id }, scheduleBootstrap)
      .on("postgres_changes", { event: "*", schema: "public", table: "member_snapshots", filter: "gym_id=eq." + gym.id }, scheduleBootstrap)
      .on("postgres_changes", { event: "*", schema: "public", table: "workout_sessions", filter: "gym_id=eq." + gym.id }, scheduleBootstrap)
      .on("postgres_changes", { event: "*", schema: "public", table: "gym_exercises", filter: "gym_id=eq." + gym.id }, scheduleBootstrap)
      .on("postgres_changes", { event: "*", schema: "public", table: "member_coach_notes", filter: "gym_id=eq." + gym.id }, scheduleBootstrap)
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_messages", filter: "gym_id=eq." + gym.id }, scheduleBootstrap)
      .subscribe(function (status) { if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setStatus("pending", "Canlı bağlantı yeniden kurulacak"); });
  }

  function unsubscribeRealtime() {
    if (client && realtimeChannel) client.removeChannel(realtimeChannel);
    realtimeChannel = null;
    realtimeTopic = "";
  }

  function scheduleBootstrap() {
    window.clearTimeout(bootstrapTimer);
    bootstrapTimer = window.setTimeout(function () { bootstrap().catch(function (error) { setStatus("error", authError(error)); }); }, 650);
  }

  function scheduleStateSync(immediate) {
    if (!session || !membership || !gym || !bridge) return;
    window.clearTimeout(stateTimer);
    stateTimer = window.setTimeout(function () {
      var snapshot = bridge.getCloudSnapshot();
      if (snapshot) {
        snapshot._cloudMeta = snapshot._cloudMeta || {};
        snapshot._cloudMeta.clientUpdatedAt = new Date().toISOString();
        enqueue("snapshot", {
          baseVersion: Number(localStorage.getItem(snapshotKey()) || 0),
          state: snapshot,
          clientUpdatedAt: snapshot._cloudMeta.clientUpdatedAt
        }, "snapshot:" + gym.id + ":" + session.user.id);
      }
      (bridge.getWorkoutRecords ? bridge.getWorkoutRecords() : []).forEach(function (record) {
        if (!record || !record.syncId || !record.needsSync) return;
        enqueue("workout", record, "workout:" + record.syncId);
      });
      flushQueue();
    }, immediate ? 0 : 1200);
  }

  function mergeAndRetrySnapshot(item, response) {
    var merged = bridge.mergeCloudSnapshot(response.server_state, response.snapshot_version);
    localStorage.setItem(snapshotKey(), String(response.snapshot_version));
    item.payload = {
      baseVersion: response.snapshot_version,
      state: merged,
      clientUpdatedAt: new Date().toISOString()
    };
    item.attempts += 1;
    var items = queue();
    var index = items.findIndex(function (candidate) { return candidate.id === item.id; });
    if (index >= 0) { items[index] = item; saveQueue(items); }
  }

  async function processSnapshot(item) {
    var result = await client.rpc("apply_member_snapshot", {
      p_gym_id: gym.id,
      p_device_id: deviceId(),
      p_base_version: Number(item.payload.baseVersion || 0),
      p_state: item.payload.state,
      p_client_updated_at: item.payload.clientUpdatedAt
    });
    if (result.error) throw result.error;
    var response = Array.isArray(result.data) ? result.data[0] : result.data;
    if (!response) throw new Error("SNAPSHOT_RESPONSE_EMPTY");
    if (response.conflict) {
      mergeAndRetrySnapshot(item, response);
      return false;
    }
    localStorage.setItem(snapshotKey(), String(response.snapshot_version));
    if (bridge.setSnapshotVersion) bridge.setSnapshotVersion(response.snapshot_version, response.server_updated_at);
    return true;
  }

  async function processWorkout(item) {
    var record = item.payload;
    var result = await client.from("workout_sessions").upsert({
      gym_id: gym.id,
      member_id: session.user.id,
      assignment_id: record.assignmentCloudId || null,
      program_id: record.programCloudId || null,
      client_mutation_id: record.syncId,
      status: record.status === "partial" ? "partial" : "completed",
      started_at: record.startedAt,
      finished_at: record.finishedAt,
      duration_minutes: Math.max(1, Math.min(1440, Math.round(Number(record.duration) || 1))),
      payload: record.payload || {}
    }, { onConflict: "member_id,client_mutation_id" }).select("id,updated_at").single();
    if (result.error) throw result.error;
    if (bridge.markWorkoutSynced) bridge.markWorkoutSynced(record.syncId, result.data.id, result.data.updated_at);
    return true;
  }

  function programRow(program) {
    var localId = String(program.id || uuid()).slice(0, 140);
    var rootKey = String(program.rootId || program.id || localId).slice(0, 140);
    return {
      gym_id: gym.id,
      client_key: localId,
      root_key: rootKey,
      version: Math.max(1, Math.min(9999, Number(program.revision) || 1)),
      status: ["draft", "published", "archived"].indexOf(program.status) !== -1 ? program.status : "published",
      name: String(program.name || "Program").slice(0, 80),
      description: String(program.description || "").slice(0, 500),
      general_note: String(program.generalNote || "").slice(0, 1000),
      payload: program,
      created_by: session.user.id
    };
  }

  async function ensureCloudProgram(program) {
    if (program.cloudId && /^[0-9a-f-]{36}$/i.test(program.cloudId)) return program.cloudId;
    var row = programRow(program);
    var existingResult = await client.from("programs").select("id,root_id").eq("gym_id", gym.id).eq("client_key", row.client_key).maybeSingle();
    if (existingResult.error) throw existingResult.error;
    if (existingResult.data) {
      row.id = existingResult.data.id;
      row.root_id = existingResult.data.root_id;
    } else {
      var rootResult = await client.from("programs").select("root_id").eq("gym_id", gym.id).eq("root_key", row.root_key).order("version", { ascending: false }).limit(1).maybeSingle();
      if (rootResult.error) throw rootResult.error;
      row.id = uuid();
      row.root_id = rootResult.data ? rootResult.data.root_id : uuid();
    }
    var result = await client.from("programs").upsert(row, { onConflict: "gym_id,client_key" }).select("id,root_id,updated_at").single();
    if (result.error) throw result.error;
    if (bridge.bindCloudProgram) bridge.bindCloudProgram(program.id, result.data.id, result.data.root_id, result.data.updated_at);
    return result.data.id;
  }

  async function processProgram(item) {
    await ensureCloudProgram(item.payload.program);
    return true;
  }

  async function processAssignment(item) {
    var programId = await ensureCloudProgram(item.payload.program);
    var result = await client.rpc("assign_program_to_member", {
      p_gym_id: gym.id,
      p_member_id: item.payload.memberId,
      p_program_id: programId,
      p_coach_note: item.payload.note || ""
    });
    if (result.error) throw result.error;
    if (bridge.bindCloudAssignment) bridge.bindCloudAssignment(item.payload.memberId, item.payload.program.id, result.data);
    return true;
  }

  async function processUnassignment(item) {
    var result = await client.rpc("archive_program_assignment", {
      p_gym_id: gym.id,
      p_member_id: item.payload.memberId,
      p_assignment_id: item.payload.assignmentId
    });
    if (result.error) throw result.error;
    return true;
  }

  async function processMessage(item) {
    var payload = item.payload || {};
    var row = {
      gym_id: gym.id,
      sender_id: session.user.id,
      recipient_id: payload.recipientId,
      client_mutation_id: payload.clientMutationId,
      body: String(payload.body || "").trim().slice(0, 1000)
    };
    var result = await client.from("chat_messages").insert(row).select("*").single();
    if (result.error && result.error.code === "23505") result = await client.from("chat_messages").select("*").eq("sender_id", session.user.id).eq("client_mutation_id", row.client_mutation_id).single();
    if (result.error) throw result.error;
    if (bridge.bindCloudMessage) bridge.bindCloudMessage(row.client_mutation_id, result.data);
    return true;
  }

  async function processMessageRead(item) {
    var result = await client.from("chat_messages").update({ read_at: new Date().toISOString() }).eq("gym_id", gym.id).eq("sender_id", item.payload.partnerId).eq("recipient_id", session.user.id).is("read_at", null);
    if (result.error) throw result.error;
    return true;
  }

  async function processNote(item) {
    var result = await client.from("member_coach_notes").upsert({
      gym_id: gym.id,
      member_id: item.payload.memberId,
      note: String(item.payload.note || "").slice(0, 180),
      updated_by: session.user.id,
      updated_at: new Date().toISOString()
    }, { onConflict: "gym_id,member_id" });
    if (result.error) throw result.error;
    return true;
  }

  async function processProfile(item) {
    var displayName = String(item.payload && item.payload.displayName || "").trim().slice(0, 80);
    if (!displayName) return true;
    var result = await client.rpc("set_profile", {
      p_display_name: displayName,
      p_role_preference: profile && profile.role_preference || (membership && membership.role === "trainer" ? "trainer" : "member"),
      p_consent_version: config.consentVersion
    });
    if (result.error) throw result.error;
    profile = result.data || Object.assign({}, profile || {}, { display_name: displayName });
    return true;
  }

  async function processGymExercise(item) {
    var exercise = item.payload && item.payload.exercise || {}; var active = item.payload && item.payload.active !== false;
    var row = {
      gym_id: gym.id,
      client_key: String(exercise.id || "").slice(0, 120),
      name: String(exercise.name || "Hareket").slice(0, 80),
      muscles: Array.isArray(exercise.muscles) ? exercise.muscles.slice(0, 2) : [],
      equipment: String(exercise.equipment || "Diğer").slice(0, 40),
      requires_weight: exercise.requiresWeight !== false,
      cues: Array.isArray(exercise.cues) ? exercise.cues.slice(0, 5) : [],
      payload: exercise,
      active: active,
      created_by: session.user.id,
      updated_at: new Date().toISOString()
    };
    var result = await client.from("gym_exercises").upsert(row, { onConflict: "gym_id,client_key" });
    if (result.error) throw result.error;
    return true;
  }

  async function processQueueItem(item) {
    if (item.type === "snapshot") return processSnapshot(item);
    if (item.type === "workout") return processWorkout(item);
    if (item.type === "program") return processProgram(item);
    if (item.type === "assignment") return processAssignment(item);
    if (item.type === "unassignment") return processUnassignment(item);
    if (item.type === "message") return processMessage(item);
    if (item.type === "message-read") return processMessageRead(item);
    if (item.type === "note") return processNote(item);
    if (item.type === "profile") return processProfile(item);
    if (item.type === "gym-exercise") return processGymExercise(item);
    return true;
  }

  async function flushQueue() {
    if (flushPromise) return flushPromise;
    if (!client || !session || !membership || !gym || !navigator.onLine) { updateStatus(); return Promise.resolve(false); }
    flushPromise = (async function () {
      setStatus("syncing", "Bekleyen işlemler gönderiliyor");
      var processed = 0;
      while (queue().length && processed < 100) {
        var item = queue()[0];
        try {
          var done = await processQueueItem(item);
          if (done) removeQueueItem(item.id);
          else break;
        } catch (error) {
          var items = queue();
          var failed = items.find(function (candidate) { return candidate.id === item.id; });
          if (failed) failed.attempts = Number(failed.attempts || 0) + 1;
          saveQueue(items);
          setStatus("error", authError(error));
          if (!navigator.onLine || failed && failed.attempts >= 5) break;
          break;
        }
        processed += 1;
      }
      return queue().length === 0;
    })();
    try { return await flushPromise; }
    finally { flushPromise = null; updateStatus(); }
  }

  async function publishProgram(program) {
    if (!session || !membership || ["admin", "trainer"].indexOf(membership.role) === -1) throw new Error("NOT_GYM_STAFF");
    enqueue("program", { program: program }, "program:" + gym.id + ":" + program.id);
    await flushQueue();
  }

  async function assignProgram(memberId, program, note) {
    if (!session || !membership || ["admin", "trainer"].indexOf(membership.role) === -1) throw new Error("NOT_GYM_STAFF");
    enqueue("assignment", { memberId: memberId, program: program, note: note || "" }, "assignment:" + gym.id + ":" + memberId + ":" + program.id);
    await flushQueue();
  }

  async function unassignProgram(memberId, assignmentId) {
    if (!session || !membership || ["admin", "trainer"].indexOf(membership.role) === -1) throw new Error("NOT_GYM_STAFF");
    enqueue("unassignment", { memberId: memberId, assignmentId: assignmentId }, "unassignment:" + gym.id + ":" + assignmentId);
    await flushQueue();
  }

  async function sendMessage(message) {
    if (!session || !session.user || !gym) throw new Error("Giriş gerekli.");
    enqueue("message", { recipientId: message.recipientId, clientMutationId: message.clientMutationId, body: message.body }, "message:" + message.clientMutationId);
    await flushQueue();
  }

  async function markMessagesRead(partnerId) {
    if (!session || !session.user || !gym || !partnerId) return false;
    enqueue("message-read", { partnerId: partnerId }, "message-read:" + gym.id + ":" + partnerId);
    return flushQueue();
  }

  async function saveCoachNote(memberId, note) {
    enqueue("note", { memberId: memberId, note: note || "" }, "note:" + gym.id + ":" + memberId);
    await flushQueue();
  }

  async function updateProfile(displayName) {
    if (!session || !session.user) throw new Error("Giriş gerekli.");
    var value = String(displayName || "").trim().slice(0, 80);
    if (!value) throw new Error("İsim ve soyisim gerekli.");
    enqueue("profile", { displayName: value }, "profile:" + session.user.id);
    return flushQueue();
  }

  async function exportCloudData() {
    if (!session || !gym) return;
    renderAccountManager("Veri paketi hazırlanıyor…");
    try {
      var tables = ["profiles", "gym_memberships", "programs", "program_assignments", "workout_sessions", "member_snapshots", "chat_messages", "gym_exercises", "member_coach_notes", "consent_records", "user_devices", "audit_events"];
      var results = await Promise.all(tables.map(function (table) { return client.from(table).select("*"); }));
      results.forEach(function (result) { if (result.error) throw result.error; });
      var data = { format: "fittrack-cloud-export", exportedAt: new Date().toISOString(), appVersion: config.appVersion, userId: session.user.id, gymId: gym.id, data: {} };
      tables.forEach(function (table, index) { data.data[table] = results[index].data || []; });
      var filename = "FitTrack-Bulut-Verileri-" + new Date().toISOString().slice(0, 10) + ".json";
      if (bridge && bridge.exportJsonFile) await bridge.exportJsonFile(filename, JSON.stringify(data, null, 2), "FitTrack bulut veri paketi");
      else {
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        var url = URL.createObjectURL(blob); var anchor = document.createElement("a");
        anchor.href = url; anchor.download = filename; document.body.appendChild(anchor); anchor.click(); anchor.remove();
        window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      }
      renderAccountManager("Bulut veri paketinin kaydetme/paylaşma işlemi başlatıldı.");
    } catch (error) { renderAccountManager(authError(error)); }
  }

  async function deleteAccount() {
    var rpc = await client.rpc("request_account_deletion", { p_reason: "Uygulama içinden kullanıcı talebi" });
    if (rpc.error) throw rpc.error;
    var response = await fetch(config.deleteAccountFunction, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + session.access_token },
      body: JSON.stringify({ confirmation: "DELETE" })
    });
    var payload = await response.json().catch(function () { return {}; });
    if (!response.ok) throw new Error(payload.error || "ACCOUNT_DELETE_FAILED");
    var localKeys = [queueKey(), snapshotKey(), DEVICE_KEY + "-" + session.user.id, activeGymKey(), lastInviteKey(), "fittrack-beta-010-auth"];
    if (bridge && bridge.clearCurrentAccountData) bridge.clearCurrentAccountData();
    localKeys.forEach(function (key) { localStorage.removeItem(key); });
    try { await client.auth.signOut({ scope: "local" }); } catch (_) { /* Kullanıcı sunucuda zaten silinmiş olabilir. */ }
    session = null; profile = null; membership = null; gym = null;
    renderAuth("login", "Hesabın ve bağlı verilerin kalıcı olarak silindi.");
  }

  async function handleForm(form) {
    var type = form.dataset.cloudForm;
    setBusy(form, true);
    try {
      if (type === "login") {
        var loginEmail = form.querySelector("#authEmail").value.trim();
        if (!validEmail(loginEmail)) throw new Error("Geçerli bir e-posta adresi yaz.");
        var loginResult = await client.auth.signInWithPassword({ email: loginEmail, password: form.querySelector("#authPassword").value });
        if (loginResult.error) throw loginResult.error;
        await handleSession(loginResult.data.session);
      } else if (type === "signup") {
        var signupEmail = form.querySelector("#authEmail").value.trim();
        if (!validEmail(signupEmail)) throw new Error("Geçerli bir e-posta adresi yaz. Örnek: ad@alanadi.com");
        var signupResult = await client.auth.signUp({
          email: signupEmail,
          password: form.querySelector("#authPassword").value,
          options: { emailRedirectTo: config.authRedirectTo, data: { display_name: form.querySelector("#authName").value.trim() } }
        });
        if (signupResult.error) throw signupResult.error;
        if (!signupResult.data.session) renderConfirmation(signupEmail);
        else { session = signupResult.data.session; await handleSession(session); }
      } else if (type === "profile") {
        var setupRole = form.querySelector('input[name="setupRole"]:checked');
        var profileResult = await client.rpc("set_profile", { p_display_name: form.querySelector("#setupName").value.trim(), p_role_preference: setupRole ? setupRole.value : "member", p_consent_version: config.consentVersion });
        if (profileResult.error) throw profileResult.error;
        profile = profileResult.data;
        renderGymSetup(profile.role_preference);
      } else if (type === "create-gym") {
        var gymResult = await client.rpc("create_gym", { p_name: form.querySelector("#gymName").value.trim() });
        if (gymResult.error) throw gymResult.error;
        var created = Array.isArray(gymResult.data) ? gymResult.data[0] : gymResult.data;
        var memberships = await fetchMemberships();
        await chooseMembership(memberships);
        renderInviteResult(created.invite_code, created.gym_name);
      } else if (type === "join-gym") {
        var joinResult = await client.rpc("join_gym_by_invite", { p_code: form.querySelector("#inviteCode").value.trim().toUpperCase() });
        if (joinResult.error) throw joinResult.error;
        var joinedMemberships = await fetchMemberships();
        await chooseMembership(joinedMemberships);
        await bootstrap();
      } else if (type === "create-invite") {
        var uses = Number(form.querySelector("#inviteUses").value);
        var days = Number(form.querySelector("#inviteDays").value);
        var inviteResult = await client.rpc("create_gym_invite", { p_gym_id: gym.id, p_role: "member", p_expires_hours: days * 24, p_max_uses: uses, p_assigned_trainer_id: session.user.id });
        if (inviteResult.error) throw inviteResult.error;
        var invite = Array.isArray(inviteResult.data) ? inviteResult.data[0] : inviteResult.data;
        lastInvite = invite.invite_code;
        localStorage.setItem(lastInviteKey(), lastInvite);
        renderInviteManager("Yeni kod oluşturuldu: " + lastInvite);
      } else if (type === "delete-account") {
        if (String(form.querySelector("#deletePhrase").value || "").trim().toLocaleUpperCase("tr-TR") !== "SİL") return renderDeleteConfirm("Onay alanına SİL yazmalısın.");
        await deleteAccount();
      } else if (type === "update-password") {
        var newPassword = form.querySelector("#newPassword").value;
        var confirmPassword = form.querySelector("#confirmPassword").value;
        if (newPassword.length < 8) throw new Error("Şifre en az 8 karakter olmalı.");
        if (newPassword !== confirmPassword) throw new Error("Şifreler birbiriyle eşleşmiyor.");
        var updateResult = await client.auth.updateUser({ password: newPassword });
        if (updateResult.error) throw updateResult.error;
        await handleSession(session);
      }
    } catch (error) {
      if (type === "login" || type === "signup") renderAuth(type === "signup" ? "signup" : "login", authError(error));
      else if (type === "create-gym" || type === "join-gym") renderGymSetup(profile && profile.role_preference || "member", authError(error));
      else if (type === "create-invite") renderInviteManager(authError(error));
      else if (type === "delete-account") renderDeleteConfirm(authError(error));
      else if (type === "update-password") renderPasswordUpdate(authError(error));
      else renderProfileSetup(profile);
    } finally { setBusy(form, false); }
  }

  async function handleClick(button) {
    var action = button.dataset.cloudAction;
    if (action === "auth-tab") return renderAuth(button.dataset.mode || "login");
    if (action === "forgot-password") {
      var email = authLayer.querySelector("#authEmail");
      if (!email || !email.value.trim()) return renderAuth("login", "Önce e-posta adresini yaz, sonra şifremi unuttum seçeneğine dokun.");
      if (!validEmail(email.value)) return renderAuth("login", "Geçerli bir e-posta adresi yaz. Örnek: ad@alanadi.com");
      var reset = await client.auth.resetPasswordForEmail(email.value.trim(), { redirectTo: config.authRedirectTo });
      return renderAuth("login", reset.error ? authError(reset.error) : "Şifre yenileme bağlantısı e-postana gönderildi.");
    }
    if (action === "copy-invite") {
      var code = button.dataset.code || lastInvite;
      try { await navigator.clipboard.writeText(code); }
      catch (_) { /* Eski WebView'da kod ekranda görünmeye devam eder. */ }
      button.textContent = "Kopyalandı: " + code;
      return;
    }
    if (action === "continue-bootstrap") return bootstrap();
    if (action === "close-auth-modal") return hideLayer();
    if (action === "account-manager") return renderAccountManager();
    if (action === "invite-manager") return renderInviteManager();
    if (action === "sync-now") { scheduleStateSync(true); await flushQueue(); return renderAccountManager(queue().length ? "Bazı işlemler bağlantı bekliyor." : "Tüm veriler güncel."); }
    if (action === "export-cloud") return exportCloudData();
    if (action === "delete-account") return renderDeleteConfirm();
    if (action === "sign-out" || action === "sign-out-all") {
      var scope = action === "sign-out-all" ? "global" : "local";
      await client.auth.signOut({ scope: scope });
      return handleSession(null);
    }
  }

  async function boot() {
    ensureLayer();
    bridge = await waitForBridge();
    if (isLocalPreview()) {
      hideLayer();
      if (bridge.setCloudStatus) bridge.setCloudStatus("preview", "Masaüstü yerel önizleme", 0);
      return;
    }
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      showLayer(shell("BAĞLANTI HATASI", "Bulut istemcisi yüklenemedi.", "Uygulama dosyası eksik veya bozuk. Yerel verilerin değiştirilmedi.", '<button class="primary-btn" onclick="location.reload()">Tekrar dene</button>'));
      return;
    }
    client = window.supabase.createClient(config.supabaseUrl, config.supabasePublishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: !isNative(), storageKey: "fittrack-beta-010-auth" },
      realtime: { params: { eventsPerSecond: 4 } }
    });
    client.auth.onAuthStateChange(function (event, nextSession) {
      if (event === "TOKEN_REFRESHED") { session = nextSession; registerDevice().catch(function () {}); }
      if (event === "SIGNED_OUT") window.setTimeout(function () { handleSession(null); }, 0);
      if (event === "PASSWORD_RECOVERY") window.setTimeout(function () { renderPasswordUpdate(); }, 0);
    });
    var deepLinkHandled = await registerAuthDeepLinks();
    if (deepLinkHandled) return;
    if (!navigator.onLine && resumeOfflineAccount()) return;
    var result = await client.auth.getSession();
    if (result.error) { if (resumeOfflineAccount()) { setStatus("error", "Oturum sunucuda doğrulanamadı; yerel verilerin açık"); return; } return renderAuth("login", authError(result.error)); }
    if ((!result.data || !result.data.session) && !navigator.onLine && resumeOfflineAccount()) return;
    await handleSession(result.data.session);
  }

  document.addEventListener("submit", function (event) {
    var form = event.target.closest("[data-cloud-form]");
    if (!form) return;
    event.preventDefault();
    handleForm(form);
  });

  document.addEventListener("click", function (event) {
    var button = event.target.closest("[data-cloud-action]");
    if (!button) return;
    event.preventDefault();
    handleClick(button).catch(function (error) {
      if (button.dataset.cloudAction === "forgot-password") renderAuth("login", authError(error));
      else renderAccountManager(authError(error));
    });
  });

  window.addEventListener("fittrack:state-saved", function (event) {
    if (event.detail && event.detail.remote) return;
    scheduleStateSync(false);
  });
  window.addEventListener("online", function () {
    updateStatus();
    if (offlineSessionOnly) { revalidateOfflineSession().catch(function () { setStatus("error", "Bağlantı doğrulanamadı; yerel veriler açık"); }); return; }
    if (!session) return;
    if (!membership || !gym) return handleSession(session);
    scheduleStateSync(true);
    flushQueue().finally(scheduleBootstrap);
  });
  window.addEventListener("offline", updateStatus);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState !== "visible" || !session || !navigator.onLine) return;
    if (offlineSessionOnly) { revalidateOfflineSession().catch(function () {}); return; }
    if (!membership || !gym) handleSession(session);
    else { registerDevice().catch(function () {}); scheduleBootstrap(); }
  });
  window.addEventListener("pageshow", function () {
    if (session && membership && gym && navigator.onLine) scheduleBootstrap();
  });

  window.FitTrackCloud = Object.freeze({
    publishProgram: publishProgram,
    assignProgram: assignProgram,
    unassignProgram: unassignProgram,
    sendMessage: sendMessage,
    markMessagesRead: markMessagesRead,
    saveCoachNote: saveCoachNote,
    updateProfile: updateProfile,
    saveGymExercise: function (exercise) { enqueue("gym-exercise", { exercise: exercise, active: true }, "gym-exercise:" + gym.id + ":" + exercise.id); return flushQueue(); },
    deleteGymExercise: function (exercise) { enqueue("gym-exercise", { exercise: exercise, active: false }, "gym-exercise:" + gym.id + ":" + exercise.id); return flushQueue(); },
    syncNow: function () { scheduleStateSync(true); return flushQueue(); },
    showAccount: renderAccountManager,
    showInviteManager: renderInviteManager,
    exportCloudData: exportCloudData,
    getContext: function () { return { session: session, profile: profile, membership: membership, gym: gym, pending: queue().length }; }
  });

  boot().catch(function (error) {
    ensureLayer();
    renderAuth("login", authError(error));
  });
})();
