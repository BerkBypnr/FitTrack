(function () {
  // Native-hosted assets must not remain behind an old cache-first worker.
  // This also runs when an older cached index/app is still being served.
  // Never touch localStorage, IndexedDB, Auth, workout state or user files.
  if (window.__fittrackNativeCacheChecked) return;
  window.__fittrackNativeCacheChecked = true;
  var changed = false;
  var workers = navigator.serviceWorker ? navigator.serviceWorker.getRegistrations().then(function (registrations) {
    return Promise.all(registrations.filter(function (registration) {
      return registration.scope === location.origin + "/";
    }).map(function (registration) {
      changed = true;
      return registration.unregister();
    }));
  }) : Promise.resolve();
  var cacheCleanup = window.caches ? caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) { return key.indexOf("fittrack-") === 0; }).map(function (key) {
      changed = true;
      return caches.delete(key);
    }));
  }) : Promise.resolve();
  Promise.all([workers, cacheCleanup]).then(function () {
    if (changed) location.reload();
  }).catch(function () {
    // Retry next launch; do not delete user data as a fallback.
    window.__fittrackNativeCacheChecked = false;
  });
})();
