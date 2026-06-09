(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".menu-toggle");

    if (header && toggle) {
      toggle.addEventListener("click", function () {
        var opened = header.classList.toggle("open");
        toggle.setAttribute("aria-expanded", opened ? "true" : "false");
      });
    }

    document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-carousel-dot]"));
      var prev = carousel.querySelector("[data-carousel-prev]");
      var next = carousel.querySelector("[data-carousel-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) return;
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, pos) {
          slide.classList.toggle("active", pos === current);
        });
        dots.forEach(function (dot, pos) {
          dot.classList.toggle("active", pos === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }

      dots.forEach(function (dot, pos) {
        dot.addEventListener("click", function () {
          show(pos);
          start();
        });
      });

      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var root = scope.closest(".section-wrap") || document;
      var input = scope.querySelector("[data-filter-input]");
      var typeSelect = scope.querySelector("[data-filter-type]");
      var regionSelect = scope.querySelector("[data-filter-region]");
      var yearSelect = scope.querySelector("[data-filter-year]");
      var list = root.querySelector("[data-filter-list]");
      var empty = root.querySelector("[data-filter-empty]");

      function valueOf(element) {
        return element ? element.value.trim().toLowerCase() : "";
      }

      function filter() {
        if (!list) return;
        var keyword = valueOf(input);
        var type = valueOf(typeSelect);
        var region = valueOf(regionSelect);
        var year = valueOf(yearSelect);
        var shown = 0;

        list.querySelectorAll(".movie-card, .rank-item").forEach(function (card) {
          var title = (card.getAttribute("data-title") || "").toLowerCase();
          var tags = (card.getAttribute("data-tags") || "").toLowerCase();
          var cardType = (card.getAttribute("data-type") || "").toLowerCase();
          var cardRegion = (card.getAttribute("data-region") || "").toLowerCase();
          var cardYear = (card.getAttribute("data-year") || "").toLowerCase();
          var keywordMatch = !keyword || title.indexOf(keyword) > -1 || tags.indexOf(keyword) > -1 || cardRegion.indexOf(keyword) > -1 || cardType.indexOf(keyword) > -1;
          var typeMatch = !type || cardType === type;
          var regionMatch = !region || cardRegion === region;
          var yearMatch = !year || cardYear === year;
          var visible = keywordMatch && typeMatch && regionMatch && yearMatch;

          card.style.display = visible ? "" : "none";
          if (visible) shown += 1;
        });

        if (empty) {
          empty.style.display = shown ? "none" : "block";
        }
      }

      [input, typeSelect, regionSelect, yearSelect].forEach(function (element) {
        if (element) {
          element.addEventListener("input", filter);
          element.addEventListener("change", filter);
        }
      });

      filter();
    });
  });
})();

function initializeMoviePlayer(streamUrl) {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var video = document.getElementById("movieVideo");
    var button = document.getElementById("playButton");
    var hls = null;
    var attached = false;

    if (!video || !button || !streamUrl) return;

    function attach() {
      if (attached) return;
      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      attach();
      button.classList.add("hidden");
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          button.classList.remove("hidden");
        });
      }
    }

    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (!attached || video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("hidden");
    });
    video.addEventListener("pause", function () {
      if (video.currentTime === 0 || video.ended) {
        button.classList.remove("hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
}
