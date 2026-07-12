/**
 * Load the background video only on large screens.
 * On small screens the CSS background image (assets/image.png) is used,
 * so the heavy video is never downloaded on mobile.
 */
(function () {
  "use strict";

  var LARGE_SCREEN = window.matchMedia("(min-width: 769px)");
  var bg = document.getElementById("hero-bg");
  var video = null;

  function addVideo() {
    if (video) return;
    video = document.createElement("video");
    video.src = "assets/video.mp4";
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute("playsinline", ""); // iOS Safari
    video.setAttribute("aria-hidden", "true");
    bg.appendChild(video);
    // Some browsers need an explicit play() call after autoplay policies.
    var p = video.play();
    if (p && typeof p.catch === "function") {
      p.catch(function () {});
    }
  }

  function removeVideo() {
    if (!video) return;
    video.pause();
    video.removeAttribute("src");
    video.load();
    bg.removeChild(video);
    video = null;
  }

  function sync(mq) {
    if (mq.matches) {
      addVideo();
    } else {
      removeVideo();
    }
  }

  // Initial state
  sync(LARGE_SCREEN);

  // React to viewport changes (rotation / resize)
  if (typeof LARGE_SCREEN.addEventListener === "function") {
    LARGE_SCREEN.addEventListener("change", sync);
  } else {
    LARGE_SCREEN.addListener(sync); // older Safari
  }

  /* Mobile menu button — placeholder toggle until the menu pages exist. */
  var menuToggle = document.querySelector(".menu-toggle");
  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      var open = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!open));
    });
  }
})();
