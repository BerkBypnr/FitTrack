var CACHE_NAME = "fittrack-v0114";

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll([
        "./",
        "./index.html",
        "./styles.css",
        "./app.js",
        "./config.js",
        "./cloud.js",
        "./vendor/supabase.min.js",
        "./manifest.webmanifest",
        "./icon.svg",
        "./assets/fonts/InterVariable.woff2",
        "./assets/bench-press.jpg",
        "./assets/goblet-squat.jpg",
        "./assets/lat-pulldown.jpg"
        ,"./assets/gifs/bench-press.gif"
        ,"./assets/gifs/goblet-squat.gif"
        ,"./assets/gifs/lat-pulldown.gif"
        ,"./assets/gifs/push-up.gif"
        ,"./assets/gifs/bodyweight-squat.gif"
        ,"./assets/gifs/seated-cable-row.gif"
        ,"./assets/gifs/incline-db-press.gif"
        ,"./assets/gifs/pec-deck.gif"
        ,"./assets/gifs/cable-crossover.gif"
        ,"./assets/gifs/overhead-press.gif"
        ,"./assets/gifs/lateral-raise.gif"
        ,"./assets/gifs/face-pull.gif"
        ,"./assets/gifs/triceps-pushdown.gif"
        ,"./assets/gifs/dips.gif"
        ,"./assets/gifs/barbell-row.gif"
        ,"./assets/gifs/one-arm-row.gif"
        ,"./assets/gifs/pull-up.gif"
        ,"./assets/gifs/biceps-curl.gif"
        ,"./assets/gifs/hammer-curl.gif"
        ,"./assets/gifs/back-squat.gif"
        ,"./assets/gifs/leg-press.gif"
        ,"./assets/gifs/romanian-deadlift.gif"
        ,"./assets/gifs/leg-curl.gif"
        ,"./assets/gifs/leg-extension.gif"
        ,"./assets/gifs/calf-raise.gif"
        ,"./assets/gifs/hip-thrust.gif"
        ,"./assets/gifs/walking-lunge.gif"
        ,"./assets/gifs/deadlift.gif"
        ,"./assets/gifs/glute-bridge.gif"
        ,"./assets/gifs/plank.gif"
        ,"./assets/gifs/crunch.gif"
        ,"./assets/gifs/hanging-leg-raise.gif"
        ,"./assets/gifs/russian-twist.gif"
        ,"./assets/gifs/mountain-climber.gif"
        ,"./assets/gifs/kettlebell-swing.gif"
        ,"./assets/gifs/burpee.gif"
      ]);
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (key) {
        return key.indexOf("fittrack-") === 0 && key !== CACHE_NAME;
      }).map(function (key) { return caches.delete(key); }));
    })
  );
});

self.addEventListener("fetch", function (event) {
  var url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;
  event.respondWith(caches.open(CACHE_NAME).then(function (cache) {
    return cache.match(event.request, { ignoreSearch: true }).then(function (cached) {
      return cached || fetch(event.request);
    });
  }));
});
