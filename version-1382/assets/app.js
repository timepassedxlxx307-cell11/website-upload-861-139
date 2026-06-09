(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var active = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === active);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === active);
        });
      }

      function play() {
        clearInterval(timer);
        timer = setInterval(function () {
          show(active + 1);
        }, 5600);
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          play();
        });
      });

      show(0);
      play();
    }

    var grid = document.querySelector("[data-card-grid]");
    var search = document.querySelector("[data-card-search]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
    if (grid && (search || chips.length)) {
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
      var currentFilter = "";

      function applyFilter() {
        var query = normalize(search ? search.value : "");
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.textContent
          ].join(" "));
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesFilter = !currentFilter || haystack.indexOf(normalize(currentFilter)) !== -1;
          card.style.display = matchesQuery && matchesFilter ? "" : "none";
        });
      }

      if (search) {
        search.addEventListener("input", applyFilter);
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          chips.forEach(function (item) {
            item.classList.remove("is-active");
          });
          chip.classList.add("is-active");
          currentFilter = chip.getAttribute("data-filter-value") || "";
          applyFilter();
        });
      });
    }

    var resultBox = document.getElementById("search-results");
    var searchInput = document.getElementById("search-page-input");
    var searchTitle = document.getElementById("search-title");
    if (resultBox && searchInput && window.catalogData) {
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";
      searchInput.value = initial;

      function createCard(item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
          return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return [
          "<article class=\"movie-card\" data-title=\"" + escapeHtml(item.title) + "\" data-region=\"" + escapeHtml(item.region) + "\" data-type=\"" + escapeHtml(item.type) + "\" data-year=\"" + escapeHtml(item.year) + "\" data-genre=\"" + escapeHtml(item.genre) + "\">",
          "<a href=\"" + escapeHtml(item.link) + "\" title=\"" + escapeHtml(item.title) + "\">",
          "<span class=\"poster-box\"><img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\"><span class=\"poster-gradient\"></span><span class=\"poster-play\">▶</span></span>",
          "<span class=\"card-body\"><span class=\"card-meta\"><span>" + escapeHtml(item.category) + "</span><span>" + escapeHtml(item.year) + "</span></span>",
          "<h3 class=\"card-title\">" + escapeHtml(item.title) + "</h3>",
          "<span class=\"card-desc\">" + escapeHtml(item.oneLine || "") + "</span>",
          "<span class=\"card-tags\">" + tags + "</span></span>",
          "</a></article>"
        ].join("");
      }

      function escapeHtml(value) {
        return String(value || "").replace(/[&<>\"]/g, function (char) {
          return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;"
          }[char];
        });
      }

      function render() {
        var query = normalize(searchInput.value);
        var list = window.catalogData.filter(function (item) {
          if (!query) {
            return true;
          }
          return normalize([
            item.title,
            item.year,
            item.region,
            item.type,
            item.genre,
            item.category,
            (item.tags || []).join(" "),
            item.oneLine
          ].join(" ")).indexOf(query) !== -1;
        }).slice(0, 96);
        if (searchTitle) {
          searchTitle.textContent = query ? "搜索结果" : "热门影片";
        }
        resultBox.innerHTML = list.map(createCard).join("") || "<div class=\"article-panel\"><h2>没有找到相关影片</h2><p>可以换一个片名、类型或地区继续搜索。</p></div>";
      }

      searchInput.addEventListener("input", render);
      render();
    }
  });
})();
