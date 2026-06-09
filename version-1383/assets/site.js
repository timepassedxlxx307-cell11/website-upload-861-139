(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function initMenu() {
    var button = document.querySelector(".mobile-toggle");
    var menu = document.querySelector(".mobile-nav");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var isOpen = !menu.hasAttribute("hidden");
      if (isOpen) {
        menu.setAttribute("hidden", "");
        button.setAttribute("aria-expanded", "false");
      } else {
        menu.removeAttribute("hidden");
        button.setAttribute("aria-expanded", "true");
      }
    });
  }

  function initHero() {
    var carousel = document.querySelector(".hero-carousel");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function currentQuery() {
    try {
      return new URLSearchParams(window.location.search).get("q") || "";
    } catch (error) {
      return "";
    }
  }

  function initSearch() {
    var query = currentQuery();
    var inputs = document.querySelectorAll('input[name="q"]');
    inputs.forEach(function (input) {
      if (query) {
        input.value = query;
      }
      var grid = document.querySelector("[data-filterable]");
      if (!grid) {
        return;
      }
      input.addEventListener("input", function () {
        filterCards(input.value);
      });
    });
    if (query) {
      filterCards(query);
    }
  }

  function filterCards(query) {
    var grid = document.querySelector("[data-filterable]");
    if (!grid) {
      return;
    }
    var words = normalize(query).split(/\s+/).filter(Boolean);
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var shown = 0;
    cards.forEach(function (card) {
      var text = normalize(card.getAttribute("data-title") || card.textContent);
      var visible = words.length === 0 || words.every(function (word) {
        return text.indexOf(word) !== -1;
      });
      card.hidden = !visible;
      if (visible) {
        shown += 1;
      }
    });
    var empty = document.querySelector(".filter-empty");
    if (empty) {
      empty.hidden = shown !== 0;
    }
  }

  function initPlayer() {
    var buttons = document.querySelectorAll("[data-play-button]");
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var panel = button.closest("[data-player]");
        if (!panel) {
          return;
        }
        var video = panel.querySelector("video");
        var status = panel.querySelector(".player-status");
        var url = panel.getAttribute("data-stream");
        if (!video || !url) {
          setStatus(status, "暂时无法播放");
          return;
        }
        button.classList.add("is-hidden");
        setStatus(status, "正在载入播放");
        playVideo(video, url, status);
      });
    });
  }

  function setStatus(status, text) {
    if (status) {
      status.textContent = text || "";
    }
  }

  function playVideo(video, url, status) {
    var canNative = video.canPlayType("application/vnd.apple.mpegurl");
    if (canNative) {
      video.src = url;
      startPlayback(video, status);
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        startPlayback(video, status);
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus(status, "播放遇到问题，请稍后重试");
        }
      });
      return;
    }
    video.src = url;
    startPlayback(video, status);
  }

  function startPlayback(video, status) {
    var result = video.play();
    if (result && typeof result.then === "function") {
      result.then(function () {
        setStatus(status, "");
      }).catch(function () {
        setStatus(status, "点击视频继续播放");
      });
    } else {
      setStatus(status, "");
    }
  }

  ready(function () {
    initMenu();
    initHero();
    initSearch();
    initPlayer();
  });
})();
