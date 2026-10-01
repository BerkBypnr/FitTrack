var CACHE_NAME = "fittrack-v015-final38";

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll([
        "./",
        "./index.html",
        "./styles.css",
        "./member-ui.css",
        "./design-system.css",
        "./workout-ui.css",
        "./reference-ui.css",
        "./assets/posters/bench-press.png",
        "./assets/posters/goblet-squat.png",
        "./assets/posters/lat-pulldown.png",
        "./assets/posters/push-up.png",
        "./assets/posters/bodyweight-squat.png",
        "./assets/posters/seated-cable-row.png",
        "./assets/brand/welcome-dumbbell.png",
        "./app.js",
        "./config.js",
        "./cloud.js",
        "./vendor/supabase.min.js",
        "./manifest.webmanifest",
        "./icon.svg",
        "./assets/bench-press.jpg",
        "./assets/goblet-squat.jpg",
        "./assets/lat-pulldown.jpg"
        ,"./assets/gifs/bench-press.gif"
        ,"./assets/gifs/goblet-squat.gif"
        ,"./assets/gifs/lat-pulldown.gif"
        ,"./assets/gifs/push-up.gif"
        ,"./assets/gifs/bodyweight-squat.gif"
        ,"./assets/gifs/seated-cable-row.gif"
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
