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

  // Only wire up the background video when a video target exists.
  // Pages without #hero-bg (e.g. the contact page) keep the static image.
  if (bg) {
    // Initial state
    sync(LARGE_SCREEN);

    // React to viewport changes (rotation / resize)
    if (typeof LARGE_SCREEN.addEventListener === "function") {
      LARGE_SCREEN.addEventListener("change", sync);
    } else {
      LARGE_SCREEN.addListener(sync); // older Safari
    }
  }

  /* Mobile menu: toggle the black dropdown panel. */
  var menuToggle = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".nav");

  function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      setMenu(!document.body.classList.contains("menu-open"));
    });
  }

  // Close the menu after tapping a link.
  if (nav) {
    nav.addEventListener("click", function (e) {
      if (e.target.closest(".nav__link")) setMenu(false);
    });
  }

  // Reset the menu when returning to large screens.
  if (typeof LARGE_SCREEN.addEventListener === "function") {
    LARGE_SCREEN.addEventListener("change", function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* ---------- Contact form (contact.html only) ---------- */
  var form = document.getElementById("contact-form");
  if (form) {
    var status = form.querySelector(".contact-form__status");
    var submitBtn = form.querySelector(".contact-form__submit");
    var keyField = form.querySelector('[name="access_key"]');

    function setStatus(msg, type) {
      status.textContent = msg;
      status.className =
        "contact-form__status" + (type ? " contact-form__status--" + type : "");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Guard against submitting before the Web3Forms key has been set up.
      if (!keyField || !keyField.value || keyField.value === "YOUR_ACCESS_KEY_HERE") {
        setStatus(
          "This form isn't connected yet — add your Web3Forms access key in contact.html.",
          "error"
        );
        return;
      }

      var data = {};
      new FormData(form).forEach(function (value, key) {
        data[key] = value;
      });

      setStatus("Sending…", "");
      submitBtn.disabled = true;

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data)
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (json) {
          if (json.success) {
            form.reset();
            setStatus("Thanks — your message has been sent. We'll be in touch.", "ok");
          } else {
            setStatus(json.message || "Something went wrong. Please try again.", "error");
          }
        })
        .catch(function () {
          setStatus("Network error. Please check your connection and try again.", "error");
        })
        .then(function () {
          submitBtn.disabled = false;
        });
    });
  }
})();
