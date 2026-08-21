(function () {
  "use strict";

  if (window.FITTRACK_CONFIG) return;

  window.FITTRACK_CONFIG = Object.freeze({
    appVersion: "0.11.4",
    schemaVersion: 14,
    consentVersion: "beta-0.10-2026-08-09",
    supabaseUrl: "https://eznxeqraejmwfpwcuxxc.supabase.co",
    supabasePublishableKey: "sb_publishable_TRpm6fD2cBM1A1rNwKw7zg_wKH8xT2H",
    authRedirectTo: "com.fittracklabs.mobile://auth-callback",
    deleteAccountFunction: "https://eznxeqraejmwfpwcuxxc.supabase.co/functions/v1/delete-account",
    localPreviewOnDesktop: true
  });
})();
